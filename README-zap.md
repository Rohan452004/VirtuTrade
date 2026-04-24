# VirtuTrade — OWASP ZAP integration

## Prereqs
- Docker Desktop running
- API reachable from Docker at `http://host.docker.internal:3000`

If your API runs on another port, set:

```bash
export ZAP_TARGET=http://host.docker.internal:3000
```

## Quick scans

From repo root:

```bash
npm run zap:baseline
```

Generates:
- `zap-report.html`
- `zap-report.json`
- `zap-report.md`

## Deeper scan (active scanning)

```bash
npm run zap:full
```

Generates:
- `zap-full-report.html`
- `zap-full-report.json`
- `zap-full-report.md`

## CI-style gate

```bash
npm run zap:ci
```

This runs a baseline scan with a shorter spider window and returns non-zero on policy violations.

## Tuning alert policy

Update `zap-rules.conf` to tune specific alert severities after triage.
Keep defaults strict and only downgrade findings with documented justification.
