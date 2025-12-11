# Engine Wiring for Ryuzen Toron v2.5H+

## Wiring a New Engine Version
1. Update `testops/backend/engine_adapter/version_lock.py` with the new Toron version tag.
2. Ensure the adapter's healthcheck (`testops/backend/engine_adapter/healthcheck.py`) recognizes the new version response payloads.
3. Validate the SIM dataset alignment under `testops/backend/tests_master/sim/` (dataset + assertions) to match new routing or tier changes.
4. If the new engine introduces replay-specific signals, extend `ReplayEngine.validate` to consume them and adjust the determinism score calculation.

## Master Runner Orchestration
- The Section 2 `MasterRunner` lives at `testops/backend/runners/master_runner.py` and is invoked via `/tests/run` in `test_router.py`.
- It sequences the SIM runner, k6 load generator, and replay determinism validator, persisting a snapshot to `testops/snapshots/`.
- Live log messages flow through the SSE broker embedded in the runner and surface via `/tests/stream/{run_id}`.

## Test Router and SSE Streaming
- `testops/backend/routers/test_router.py` exposes the API surface. Every endpoint is guarded by the existing unlock flag on the FastAPI app.
- `GET /tests/status/{run_id}` returns status + progress, while `GET /tests/result/{run_id}` surfaces the aggregated payload with replay metadata.
- SSE is backed by `sse_starlette` and streams the same log lines persisted in memory, so router changes do not require additional infrastructure.

## Replay and Snapshot Handling
- Snapshots contain the SIM metrics, k6 metrics, and trigger metadata. They are written with deterministic ordering for reproducible hashing.
- `ReplayEngine` computes a bounded jitter off the snapshot hash to detect drift; lowering `target_floor` can be used to relax acceptable change windows.
- Warroom logs should be emitted when replay or snapshot parsing errors occur to help correlate run regressions with infrastructure events.

## Quick Smoke Test
```bash
python - <<'PY'
from testops.backend.runners.master_runner import master_runner
import asyncio

async def demo():
    run_id = await master_runner.start_run("doc_demo")
    await asyncio.sleep(0.1)
    print(master_runner.get_status(run_id))

asyncio.run(demo())
PY
```
This validates wiring without needing the full UI loop.
