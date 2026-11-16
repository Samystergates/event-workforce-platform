# Production Hardening Checklist

## Security

- Rotate all credentials previously committed to source control.
- Move secrets to a managed secret store.
- Enable `JWT_SECURITY_ENABLED=true` in gateway and set `JWT_ISSUER_URI`.
- Enforce HTTPS/TLS at ingress and between internal services where required.

## Reliability

- Validate readiness/liveness endpoints for each service.
- Configure autoscaling and resource limits.
- Enable gateway rate limiting in production (`GATEWAY_RATE_LIMIT_ENABLED=true`).
- Tune resilience policies per dependency (timeouts, retries, circuit breaker thresholds).

## Data

- Replace Flyway placeholder migrations with real schema migrations.
- Disable `ddl-auto=update` in production and rely on migrations only.
- Add database backup/restore verification and retention policy.

## Observability

- Centralize logs and include correlation IDs.
- Scrape Prometheus metrics from actuator endpoints.
- Define alert thresholds for 5xx rate, latency, queue lag, and DB connectivity.

## Delivery

- Add CI jobs for compile, tests, contract checks, SCA/SAST.
- Add CD promotion gates (`dev -> staging -> prod`) with rollback plan.
