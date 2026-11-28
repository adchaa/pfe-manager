"""Live-stack quality measurements and lockfile/history security checks."""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import urllib.error
import urllib.request
from pathlib import Path

from .core import MeasurementContext, MeasurementResult, measurement, result


def command(
    args: list[str],
    *,
    cwd: Path,
    timeout: int = 900,
    env: dict[str, str] | None = None,
) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        args,
        cwd=cwd,
        env={**os.environ, **(env or {})},
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        timeout=timeout,
        check=False,
    )


def compact_output(output: str, limit: int = 1200) -> str:
    clean = "\n".join(line for line in output.splitlines() if line.strip())
    return clean[-limit:]


def http_get(url: str, timeout: int = 8) -> tuple[int, str, str]:
    request = urllib.request.Request(url, headers={"Accept": "application/json,text/html"})
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            body = response.read(2_000_000).decode("utf-8", errors="replace")
            return response.status, response.headers.get("content-type", ""), body
    except urllib.error.HTTPError as error:
        body = error.read(200_000).decode("utf-8", errors="replace")
        return error.code, error.headers.get("content-type", ""), body


def http_post_json(url: str, payload: dict, timeout: int = 8) -> int:
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return response.status
    except urllib.error.HTTPError as error:
        return error.code


@measurement
def running_stack(context: MeasurementContext) -> MeasurementResult:
    """Check live frontend, backend API, and frontend-to-backend proxy path."""
    frontend_url = os.environ.get("MEASUREMENT_FRONTEND_URL", "http://frontend")
    backend_url = os.environ.get("MEASUREMENT_BACKEND_URL", "http://backend:3000")
    checks: dict[str, dict] = {}
    try:
        status, content_type, body = http_get(frontend_url)
        checks["frontend"] = {
            "status_code": status,
            "content_type": content_type,
            "index_served": status == 200 and "<div id=\"root\">" in body,
        }
        backend_login_status = http_post_json(f"{backend_url}/api/auth/login", {})
        checks["backend_api"] = {
            "invalid_login_payload_status": backend_login_status,
            "rejected_by_validation": backend_login_status in (400, 422),
        }
        proxy_status = http_post_json(f"{frontend_url}/api/auth/login", {})
        checks["frontend_api_proxy"] = {
            "invalid_login_payload_status": proxy_status,
            "rejected_by_validation": proxy_status in (400, 422),
        }
        passed = all([
            checks["frontend"]["index_served"],
            checks["backend_api"]["rejected_by_validation"],
            checks["frontend_api_proxy"]["rejected_by_validation"],
        ])
        return result(
            id="STACK-01",
            name="Running frontend, backend API, and API proxy",
            value=checks,
            target="Frontend 200; backend rejects invalid login payload; same rejection through frontend proxy",
            passed=passed,
            family="Product quality / integration",
            tool="Python HTTP client",
            command="GET /; POST /api/auth/login with {} directly and through frontend proxy",
            message="MongoDB readiness is enforced by the Compose health dependency before the analyzer starts.",
        )
    except (OSError, TimeoutError, urllib.error.URLError) as error:
        return result(
            id="STACK-01",
            name="Running frontend, backend API, and API proxy",
            value=checks,
            target="Frontend 200; backend rejects invalid login payload; same rejection through frontend proxy",
            status="failed",
            family="Product quality / integration",
            tool="Python HTTP client",
            command="GET /; POST /api/auth/login with {} directly and through frontend proxy",
            message=f"A live service check failed: {error}",
        )


@measurement
def npm_vulnerabilities(context: MeasurementContext) -> MeasurementResult:
    """Audit exact lockfile dependency trees and count HIGH/CRITICAL findings."""
    project_results: dict[str, dict] = {}
    total_high = 0
    total_critical = 0
    for project_name in ("backend", "frontend"):
        project = context.root / project_name
        args = ["npm", "audit", "--package-lock-only", "--audit-level=high", "--json"]
        try:
            proc = command(args, cwd=project, timeout=300)
        except (OSError, subprocess.TimeoutExpired) as error:
            project_results[project_name] = {"status": "error", "message": str(error)}
            continue
        try:
            report = json.loads(proc.stdout)
            counts = report.get("metadata", {}).get("vulnerabilities", {})
            high = int(counts.get("high", 0))
            critical = int(counts.get("critical", 0))
            total_high += high
            total_critical += critical
            project_results[project_name] = {
                "high": high,
                "critical": critical,
                "status": "passed" if high + critical == 0 else "failed",
            }
        except (json.JSONDecodeError, TypeError, ValueError):
            project_results[project_name] = {
                "status": "error",
                "message": compact_output(proc.stdout),
            }
    errors = sum(item["status"] == "error" for item in project_results.values())
    failed = total_high + total_critical > 0
    status = "error" if errors else "failed" if failed else "passed"
    return result(
        id="SE-14",
        name="High and critical npm dependency vulnerabilities",
        value={"high": total_high, "critical": total_critical, "projects": project_results},
        unit="reported vulnerabilities",
        target="0 high and 0 critical",
        status=status,
        family="Security (ISO/IEC 25010 integrity)",
        tool="npm audit",
        command="npm audit --package-lock-only --audit-level=high --json (backend and frontend)",
        message="Uses each committed lockfile; registry advisories may change between runs.",
    )


@measurement
def git_history_secrets(context: MeasurementContext) -> MeasurementResult:
    """Run Gitleaks over all refs and redact secrets from tool output."""
    if not shutil.which("gitleaks"):
        return result(
            id="SE-01",
            name="Secrets in Git history",
            value=None,
            target="0 findings across all refs",
            status="skipped",
            family="Security (ISO/IEC 25010 confidentiality)",
            tool="Gitleaks",
            message="Gitleaks is missing from the analyzer image.",
        )
    report_path = context.workspace / "gitleaks-report.json"
    args = [
        "gitleaks", "git", str(context.root),
        "--log-opts=--all",
        "--report-format=json",
        f"--report-path={report_path}",
        "--redact",
    ]
    proc = command(args, cwd=context.root, timeout=600)
    if proc.returncode not in (0, 1):
        return result(
            id="SE-01",
            name="Secrets in Git history",
            value=None,
            target="0 findings across all refs",
            status="error",
            family="Security (ISO/IEC 25010 confidentiality)",
            tool="Gitleaks",
            command="gitleaks git --log-opts=--all --report-format=json --redact <repository>",
            message=compact_output(proc.stdout),
        )
    try:
        findings = json.loads(report_path.read_text(encoding="utf-8")) if report_path.exists() else []
    except (json.JSONDecodeError, OSError) as error:
        return result(
            id="SE-01",
            name="Secrets in Git history",
            value=None,
            target="0 findings across all refs",
            status="error",
            family="Security (ISO/IEC 25010 confidentiality)",
            tool="Gitleaks",
            command="gitleaks git --log-opts=--all --report-format=json --redact <repository>",
            message=f"Could not read Gitleaks report: {error}",
        )
    summary = [
        {"rule": item.get("RuleID"), "file": item.get("File"), "line": item.get("StartLine"), "commit": item.get("Commit")}
        for item in findings
    ]
    return result(
        id="SE-01",
        name="Secrets in Git history",
        value={"finding_count": len(findings), "findings": summary},
        unit="findings",
        target="0 findings across all refs",
        passed=not findings,
        family="Security (ISO/IEC 25010 confidentiality)",
        tool="Gitleaks",
        command="gitleaks git --log-opts=--all --report-format=json --redact <repository>",
        message="Scans Git patches reachable from all refs using Gitleaks default rules; findings are redacted.",
    )


@measurement
def browser_quality(context: MeasurementContext) -> MeasurementResult:
    """Exercise login form and WCAG/responsive/performance checks on live frontend."""
    frontend_url = os.environ.get("MEASUREMENT_FRONTEND_URL", "http://frontend")
    browser_script = Path(__file__).parent / "browser_measurement.mjs"
    try:
        proc = command(
            ["node", str(browser_script)],
            cwd=context.root,
            timeout=180,
            env={"MEASUREMENT_BASE_URL": frontend_url},
        )
        # The script is installed with the analyzer image and reads the service URL.
        if proc.returncode != 0:
            return result(
                id="WEB-01",
                name="Login journey, accessibility, responsiveness, and LCP",
                value=None,
                target="Journey passes; 0 serious/critical axe violations; no overflow at 320px; LCP ≤ 2500ms",
                status="error",
                family="Interaction capability / web quality",
                tool="Playwright + axe-core",
                command="Playwright Chromium against MEASUREMENT_FRONTEND_URL",
                message=compact_output(proc.stdout),
            )
        value = json.loads(proc.stdout)
        passed = (
            value["journey"]["passed"]
            and value["accessibility"]["serious_critical_violations"] == 0
            and not value["responsive"]["horizontal_overflow_320px"]
            and value["performance"]["lcp_ms"] is not None
            and value["performance"]["lcp_ms"] <= 2500
        )
        return result(
            id="WEB-01",
            name="Login journey, accessibility, responsiveness, and LCP",
            value=value,
            target="Journey passes; 0 serious/critical axe violations; no overflow at 320px; LCP ≤ 2500ms",
            passed=passed,
            family="Interaction capability / web quality",
            tool="Playwright + axe-core",
            command=f"Playwright Chromium against {frontend_url}",
            message="Tests the live frontend container. Protected workflows need a seeded test account and are not covered yet.",
        )
    except (OSError, subprocess.TimeoutExpired, json.JSONDecodeError) as error:
        return result(
            id="WEB-01",
            name="Login journey, accessibility, responsiveness, and LCP",
            value=None,
            target="Journey passes; 0 serious/critical axe violations; no overflow at 320px; LCP ≤ 2500ms",
            status="error",
            family="Interaction capability / web quality",
            tool="Playwright + axe-core",
            command=f"Playwright Chromium against {frontend_url}",
            message=f"{type(error).__name__}: {error}",
        )
