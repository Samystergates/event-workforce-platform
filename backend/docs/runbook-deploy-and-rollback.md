# Runbook: Deploy and Rollback

## Deploy sequence

1. Deploy `service-registry`.
2. Deploy `config-server`.
3. Deploy `api-gateway`.
4. Deploy business services: `eventico`, `form`, `timeclock`, `finance`.
5. Confirm registration in Eureka.
6. Validate `/actuator/health/readiness` for all services.
7. Validate Flyway migration success from startup logs before opening traffic.
8. Enable gateway protection flags in production:
   - `JWT_SECURITY_ENABLED=true`
   - `GATEWAY_RATE_LIMIT_ENABLED=true`

## Smoke checks

- Gateway docs: `GET /swagger-ui.html`
- Timeclock punch: `POST /api/timeclock/punch`
- Form files endpoint: `GET /api/form/{jobId}/{serviceProviderId}/files`
- Finance health endpoints

## Rollback

1. Roll back gateway first if edge routing/security change caused outage.
2. Roll back affected business service image/tag.
3. If migration caused startup failure, restore DB backup and redeploy previous image.
4. Re-run readiness checks.
5. Verify error-rate recovery and consumer flows.

## Escalation signals

- Sustained `5xx` > threshold.
- Repeated circuit-open events.
- Kafka consumer lag or publish failures.
- DB connectivity or migration failures.
