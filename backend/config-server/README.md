# Eventico Config Server

This service is the central configuration source for Eventico microservices.

The Config Server serves service configuration from classpath resources. The current configuration uses the Spring Cloud Config native profile and does not require a separate Git configuration repository.

## Configuration Layout

- `src/main/resources/application.yaml`: Config Server runtime config.
- `src/main/resources/config/*.yaml`: Per-service externalized configs served by Config Server.

## Service Config Files

- `api-gateway.yaml`
- `eventico.yaml`
- `finance.yaml`
- `form.yaml`
- `timeclock.yaml`

## Environment Variables (Defaults Included)

- `CONFIG_SERVER_PORT` (default `8080`)
- `API_GATEWAY_PORT` (default `8060`)
- `EVENTICO_PORT` (default `9090`)
- `FINANCE_PORT` (default `9091`)
- `FORM_PORT` (default `9094`)
- `TIMECLOCK_PORT` (default `8082`)
- `EUREKA_SERVER_URL` (default `http://localhost:8761/eureka/`)
- Gateway/Auth/Rate-Limit:
  - `JWT_ISSUER_URI`
  - `JWT_SECURITY_ENABLED`
  - `JWT_AUDIENCE`
  - `REDIS_HOST`
  - `REDIS_PORT`
  - `GATEWAY_RATE_LIMIT_ENABLED`
  - `GATEWAY_RATE_LIMIT_RPM`

JWT enforcement defaults to enabled. Supply a valid issuer and audience. The `JWT_SIGNING_SECRET` is required by core and form services, must be Base64 encoding of at least 64 random bytes, and must be injected as a runtime secret with the same value in both services.

## Run locally

```powershell
cd backend/config-server
.\mvnw.cmd spring-boot:run
```

The service listens on port `8080` by default. Override it with `CONFIG_SERVER_PORT`.
