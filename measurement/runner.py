"""CLI runner that emits a machine-readable quality report."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from . import checks as _checks  # noqa: F401 - imports register built-in checks
from .core import MeasurementContext, REGISTRY


def git_value(root: Path, *args: str) -> str | None:
    try:
        return subprocess.check_output(
            ["git", *args], cwd=root, stderr=subprocess.DEVNULL, text=True
        ).strip() or None
    except (OSError, subprocess.CalledProcessError):
        return None


def build_report(root: Path) -> dict:
    repo = root.resolve()
    started_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    with tempfile.TemporaryDirectory(prefix="quality-measurement-") as workdir:
        context = MeasurementContext(root=repo, workspace=Path(workdir))
        results = []
        for check in REGISTRY:
            try:
                results.append(check(context).to_dict())
            except Exception as error:  # Keep the run report useful when one check breaks.
                results.append({
                    "id": getattr(check, "__name__", "unknown"),
                    "name": getattr(check, "__name__", "Unknown measurement"),
                    "status": "error",
                    "message": f"{type(error).__name__}: {error}",
                })
        completed = len(results)
        counts = {
            status: sum(item["status"] == status for item in results)
            for status in ("passed", "failed", "skipped", "error")
        }
    ended_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    return {
        "schema_version": "1.0.0",
        "run": {
            "status": "completed_with_errors" if counts["error"] else "completed",
            "started_at": started_at,
            "completed_at": ended_at,
            "commit": git_value(repo, "rev-parse", "HEAD"),
            "tag": git_value(repo, "describe", "--tags", "--exact-match", "HEAD"),
            "application_worktree_clean": not bool(
                git_value(repo, "status", "--porcelain", "--", "backend", "frontend")
            ),
        },
        "progress": {
            "total": len(REGISTRY),
            "completed": completed,
            "percent": round(completed * 100 / len(REGISTRY), 1) if REGISTRY else 100,
            "counts": counts,
        },
        "measurements": results,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Run repository quality measurements and emit JSON.")
    parser.add_argument("--root", type=Path, default=Path.cwd(), help="Repository to measure (default: current directory).")
    parser.add_argument("--output", type=Path, default=Path("-"), help="JSON output path, or '-' for stdout.")
    args = parser.parse_args()

    report = build_report(args.root)
    encoded = json.dumps(report, indent=2, ensure_ascii=False) + "\n"
    if str(args.output) == "-":
        sys.stdout.write(encoded)
    else:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(encoded, encoding="utf-8")
        print(f"Measurement report written to {args.output}", file=sys.stderr)
    return 1 if report["run"]["status"] == "completed_with_errors" else 0


if __name__ == "__main__":
    raise SystemExit(main())
