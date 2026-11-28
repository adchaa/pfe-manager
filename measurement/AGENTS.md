# AGENTS.md — measurement runner

Guide for agents adding or changing quality measurements. The goal: a new measurement must not change the behaviour, IDs, or output of the existing ones.

## How it fits together

```
python3 -m measurement
  └─ runner.main()
       ├─ imports measurement.checks   ← registration happens here
       ├─ iterates core.REGISTRY       ← checks run in registration order
       ├─ catches per-check exceptions
       └─ writes the JSON report       ← report.schema.json
```

| File | Role | Change policy |
| --- | --- | --- |
| `core.py` | `MeasurementContext`, `MeasurementResult`, `@measurement`, `result()` | Contract. Additive changes only. |
| `checks.py` | Built-in checks; each is one `@measurement` function | Add new functions here. |
| `runner.py` | Report envelope, git metadata, error isolation, exit code | Touch only to import a new check module. |
| `report.schema.json` | Output contract | Update only when a field is genuinely new; never change `schema_version` casually. |
| `browser_measurement.mjs` | Playwright/axe helper used by `WEB-01` | Keep its stdout a single JSON object. |
| `Dockerfile`, `package.json`, `package-lock.json` | Pinned analyzer image and JS deps | Any dependency change must be exact-pinned and rebuilt. |
| `../../docs/mesures/v0/measurements.json` | Generated baseline report | Never edit by hand. |

## Hard rules

1. **Never rename, remove, or repurpose an existing ID** (`STACK-01`, `SE-14`, `SE-01`, `WEB-01`). Baseline comparisons depend on them. Their `target` strings are part of that contract too.
2. **IDs must be unique.** Before using an ID, confirm it is unused:
   ```sh
   grep -rn 'id="XX-01"' measurement/
   ```
   No output means the ID is free. (A check may repeat its own ID across success/failure branches — that is fine.)
3. **No work at import time.** No network calls, subprocesses, file writes, or environment reads at module level. The only allowed import-time side effect is the `@measurement` decorator appending to `REGISTRY`.
4. **Do not mutate shared state.** No module-level mutable caches and no writes to `REGISTRY` from a check. All checks share one `MeasurementContext` per run, so treat it as read-only.
5. **Expected failure is a result, not an exception.** Return `status="failed"`, `"skipped"`, or `"error"` instead of raising. The runner catches unexpected exceptions, but the fallback entry loses your ID, family, target, and metadata.
6. **`value` must be JSON-serializable**: `str`, `int`, `float`, `bool`, `None`, `list`, `dict`. Convert `Path`, `datetime`, `set`, and exceptions first.
7. **Always bound work with a timeout** on subprocesses and HTTP calls.
8. **Use the right paths.** `context.root` is the repository being measured (e.g. `/workspace`). `context.workspace` is a temp directory deleted after the run. Never write into the repo; scratch output goes in `workspace` under a filename unique to your check.
9. **Read service URLs from env with Compose defaults**, so the check works both in and out of Docker:
   ```python
   os.environ.get("MEASUREMENT_FRONTEND_URL", "http://frontend")
   os.environ.get("MEASUREMENT_BACKEND_URL", "http://backend:3000")
   ```
10. **No new Python dependencies.** The analyzer image installs only the standard library. New JS dependencies must be exact-pinned in `package.json` + `package-lock.json` and installed in `Dockerfile` with `npm ci`.
11. **Measurements must be read-only and repeatable.** Do not create users, seed data, or mutate the stack. If a measurement genuinely needs setup, do it and undo it in `finally`, and document it.
12. **Do not reorder existing checks** or drop the `from . import checks` import in `runner.py` — that import is what registers them.

## Status semantics

| Status | Use when |
| --- | --- |
| `passed` | The check ran and met its target. |
| `failed` | The check ran and did not meet its target. |
| `skipped` | A prerequisite is unavailable (tool missing, feature not applicable). |
| `error` | The measurement itself is broken (parse failure, crash, timeout). |

The runner exits `1` when any measurement is `error`, and `0` otherwise. `failed` is a valid quality outcome, not a runner failure.

## Add a measurement

1. Pick a unique ID and a `family` (for example `Security (ISO/IEC 25010 integrity)`).
2. Add one function to `checks.py`:

   ```python
   @measurement
   def my_metric(context: MeasurementContext) -> MeasurementResult:
       """One sentence describing what is measured and against what target."""
       try:
           value = do_the_work(context)
       except (OSError, subprocess.TimeoutExpired) as error:
           return result(
               id="XX-01",
               name="Human-readable measurement name",
               value=None,
               target="What a pass looks like",
               status="error",
               family="Family / category",
               tool="Tool name",
               command="Exact command or request used",
               message=f"{type(error).__name__}: {error}",
           )
       return result(
           id="XX-01",
           name="Human-readable measurement name",
           value=value,
           unit="optional unit",
           target="What a pass looks like",
           passed=meets_target(value),
           family="Family / category",
           tool="Tool name",
           command="Exact command or request used",
           message="Caveats that affect interpretation.",
       )
   ```

3. If the check is large or pulls in its own tooling, put it in a new module (`measurement/my_check.py`) and register it in `runner.py`:
   ```python
   from . import checks as _checks  # noqa: F401 - imports register built-in checks
   from . import my_check as _my_check  # noqa: F401 - registers additional checks
   ```
4. Confirm the ID is unique (see rule 2).
5. Run and verify (below).
6. Add the new ID to the list in this file.

## Report contract

Each entry in `measurements` has:

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | Stable, unique, uppercase prefix + number. |
| `name` | yes | Short human-readable label. |
| `status` | yes | `passed`, `failed`, `skipped`, or `error`. |
| `value` | no | Any JSON value; the evidence. |
| `unit` | no | Unit of `value`. |
| `target` | no | Threshold or expected state. |
| `message` | no | Caveats, redaction notes, or failure detail. |
| `family` | no | Quality family / ISO 25010 category. |
| `tool` | no | Tool that produced the evidence. |
| `command` | no | Reproducible command or request. |

`progress` is derived from `REGISTRY`, so it updates automatically. Do not hardcode counts.

## Run and verify

Full stack, from the repository root:

```sh
docker compose --profile measure run --build --rm analyse
```

This starts MongoDB, backend, and frontend, waits for health checks, runs the analyzer, and writes `docs/mesures/v0/measurements.json`. The stack stays up afterwards; stop it with `docker compose down` (add `-v` to drop MongoDB data).

> The Compose command overwrites the committed `v0` baseline. When iterating on a new check, write somewhere else and leave `docs/mesures/v0/measurements.json` untouched. Arguments after the service name override its `command` while keeping the image entrypoint:
>
> ```sh
> docker compose --profile measure run --build --rm analyse \
>   --root /workspace --output /workspace/docs/mesures/dev/measurements.json
> ```

Quick local run (tools must be installed; service-dependent checks will report `error`, which is expected without the stack):

```sh
python3 -m measurement --root . --output /tmp/measurements.json
```

Checklist before declaring done:

- [ ] The run completes and existing four IDs each appear exactly once.
- [ ] Your new ID appears exactly once with the expected status.
- [ ] `progress.total` increased by exactly one.
- [ ] No new `error` entries come from your change.
- [ ] The report still validates against `report.schema.json`.
- [ ] You did not modify `docs/mesures/v0/measurements.json` by hand.

## Current measurements

- `STACK-01` — live frontend, backend login validation, and the same invalid login through the frontend proxy. MongoDB readiness is enforced by Compose health checks.
- `SE-14` — high/critical dependency advisories from `npm audit` over both committed lockfiles.
- `SE-01` — secrets in Git history reachable from all refs, via Gitleaks.
- `WEB-01` — Playwright login journey, axe-core WCAG 2.0/2.1/2.2 A/AA, 320px horizontal overflow, and LCP.

## Known limits

- `WEB-01` covers only the public login form. Protected workflows need a seeded test account and are not covered.
- LCP is a lab measurement of `/login` in the pinned Chromium container.
- `npm audit` results move when registry advisories change.
- The frontend image packages the app with Vite and skips the strict TypeScript build because the current baseline has TypeScript errors.
- `run.application_worktree_clean` covers only `backend/` and `frontend/`; measurement tooling and output are expected to live outside the frozen application snapshot.

## Baseline

For the Phase 2 baseline, run against the frozen `v0-baseline` checkout. Review `run.commit`, `run.tag`, and `run.application_worktree_clean` before treating a report as the baseline.
