# Versioning and Release Notes

## Purpose
Describe how versions are assigned and how release notes are authored for TestOps and Toron v2.5H+.

## Architecture
- **Version Matrix**: correlates UI, Runner, Engine, Snapshot schema, Telemetry policy.
- **Release Publisher**: generates notes and tags artifacts.
- **Artifact Store**: retains snapshots and reports linked to versions.

### Diagram
```
[Code Changes] -> [CI Pipeline] -> [Version Matrix] -> [Release Notes]
                                      |                   |
                                  [Snapshots]         [Artifacts]
```

## Component Interaction
1. CI builds artifacts and updates version matrix.
2. Release publisher generates notes using template and attaches artifacts.
3. Warroom references notes during go/no-go and postmortems.

## API References
- `POST /v1/releases` — publish release with artifacts.
- `GET /v1/releases/{version}` — fetch release notes.
- `GET /v1/version-matrix` — retrieve compatibility table.

## Versioning Scheme
- Semantic Versioning: `MAJOR.MINOR.PATCH` with optional `-beta` or `-rc` suffixes.
- Engine tags: `toron-v2.5H+.<patch>`.
- Snapshot tags: `run-<semver>-<timestamp>`.
- Telemetry policy and hash salt versions recorded separately.

## Release Process
1. Draft release notes with changes, suite results, and snapshot tags.
2. Ensure CI pipeline green and artifacts packaged.
3. Capture go/no-go decision referencing `BETA_GO_NO_GO_CHECKLIST.md`.
4. Tag repo and images; publish notes to `reports/releases/`.

## Command Examples
- `python tools/version_matrix.py --out reports/version_matrix.json`
- `make release-notes VERSION=<semver>`
- `git tag <semver> && git push origin <semver>`

## Release Notes Template
```
Version: <semver>
Date: <YYYY-MM-DD>
Components:
- UI: <version>
- Runner: <version>
- Engine: <version>
- Snapshot Schema: <version>
- Telemetry Policy: <version>

Highlights:
- ...

Suites:
- Lint/Format: pass
- Unit: pass (% coverage)
- Sim-suite: determinism %
- Hardening: scores
- Chaos/Load: results
- Snapshot-compare: pass/fail

Artifacts:
- snapshots/...tag...
- reports/... files ...

Known Issues:
- ...
```

## Troubleshooting
- **Version drift**: regenerate matrix using `python tools/version_matrix.py`.
- **Missing artifacts**: rerun `package-artifacts` job.

## Upgrade Paths
- Increment minor for backward-compatible features; major for breaking snapshot schema.
- Note required migration steps in `V3_MIGRATION_GUIDE.md` when applicable.

## Versioning Notes
- Keep release notes immutable post-publication; append errata with timestamps.
