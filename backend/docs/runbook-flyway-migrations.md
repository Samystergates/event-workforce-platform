# Runbook: Flyway Migration Operations

## Pre-deploy checks

1. Confirm new migration version is unique and monotonic (`V{n}__...sql`).
2. Run migration on staging clone first.
3. Confirm app starts with `ddl-auto=validate`.

## Deploy migration

1. Set `FLYWAY_ENABLED=true` for target service.
2. Deploy new service image.
3. Verify logs show successful Flyway migration.
4. Validate `actuator/health/readiness`.

## Rollback migration

1. Prefer forward-fix migrations.
2. If rollback is mandatory, restore DB from backup snapshot.
3. Roll back service image and verify schema compatibility.

## Guardrails

- Never edit a migration after it is applied in shared environments.
- Use a new migration for any correction.
