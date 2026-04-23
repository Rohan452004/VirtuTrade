# VirtuTrade — Docker deploy + Trivy image scan

## Prereqs
- Docker Desktop
- Trivy CLI (`trivy version`)

## Run the app (Mongo + Express API + Vite client)

From the repo root:

```bash
docker compose up --build
```

- Client: `http://localhost:5173`
- API: `http://localhost:4000` (health page at `/`)

## Environment notes
- The client talks to the API via `VITE_APP_WEB_URL` (set in `docker-compose.yml`).
- The server uses `COOKIE_SECURE=false` in compose so JWT cookies work on `http://localhost`.
  - In production HTTPS, set `COOKIE_SECURE=true` (and use TLS).

## Trivy scan the container images

After `docker compose up --build` (or `docker compose build`):

```bash
trivy image virtutrade-server
trivy image virtutrade-client
```

For a stricter CI-like gate:

```bash
trivy image --severity HIGH,CRITICAL --exit-code 1 virtutrade-server
trivy image --severity HIGH,CRITICAL --exit-code 1 virtutrade-client
```

## OWASP ZAP DAST scan

Use the embedded ZAP scripts from repo root:

```bash
npm run zap:baseline
```

For active scan coverage:

```bash
npm run zap:full
```

See `README-zap.md` for target override (`ZAP_TARGET`) and report files.

