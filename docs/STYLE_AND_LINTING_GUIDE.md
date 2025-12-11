# Style and Linting Guide

## Purpose
Define coding and documentation style rules enforced across TestOps and Toron v2.5H+.

## Architecture
- **Local Tools**: ruff/flake8/black/isort/mypy.
- **CI Enforcement**: `.github/workflows/testops-ci.yml` lint-and-format job.
- **Reports**: lint results surfaced in PR checks.

### Interaction Diagram
```
[Developer Edit] -> [Local Lint] -> [CI lint-and-format] -> [PR Status]
```

## Component Interaction
1. Developers run local formatters before committing.
2. CI re-runs linters; failures block merge.
3. Reports attached to PR for maintainers to review.

## API References
- `POST /v1/test-runs` with `suite=lint` to trigger lint-only run.
- `GET /v1/reports/{id}` to fetch lint output.

## Python Style
- Use `ruff`/`flake8` with configs in repo; zero warnings policy.
- Prefer type hints everywhere; mypy clean for touched modules.
- No try/except around imports; fail fast.
- Functions <50 lines where practical; favor pure functions for determinism.

## Markdown Style
- Descriptive headings; wrap at ~100 characters when feasible.
- Include ASCII diagrams for architecture descriptions.
- Use bullet lists for steps; avoid TODOs.

## Lint Commands
- `ruff check .`
- `flake8 .`
- `black .` (if configured) and `isort .`
- `mypy src/ backend/` for typed paths.

## Troubleshooting
- **Formatter conflicts**: run `make format` to normalize ordering.
- **New lint rule**: update `.ruff.toml` or equivalent and document in commit message.

## Upgrade Paths
- Introduce new rules gradually with autofix support.
- Align mypy coverage expansion with module ownership.

## Versioning Notes
- Lint rules versioned via config files; bump when rules change and note in release notes.
