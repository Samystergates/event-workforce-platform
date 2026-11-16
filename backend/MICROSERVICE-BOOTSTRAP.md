# Eventico Microservice Bootstrap

This setup uses:
- `service-registry` (Eureka) on `8761`
- `config-server` on `8080`
- `api-gateway` on `8060`
- Business services (`eventico`, `form`, `timeclock`, `finance`) registered in Eureka

## Startup order

1. Start `service-registry`
2. Start `config-server` (independent of Eureka)
3. Start `api-gateway` and the business services; they import config and register with Eureka

## Local Docker Compose

The Compose stack is for local development only. Copy `backend/env.example` to `backend/.env.local`, set a local `MYSQL_ROOT_PASSWORD` and the required JWT values, then run from `backend/deploy`:

```bash
docker compose --env-file ../.env.local -f docker-compose.microservices.yml up --build
```

The example file is not loaded automatically by Spring Boot. When running services directly, set the relevant environment variables in the process environment. Never reuse local development credentials in a deployed environment.

## Runtime behavior

- `api-gateway` and the four business services import config from `config-server` via:
  - `spring.config.import=optional:configserver:${CONFIG_SERVER_URL:http://localhost:8080}`
- The gateway and business services register to Eureka via:
  - `eureka.client.service-url.defaultZone=${EUREKA_SERVER_URL:http://localhost:8761/eureka/}`
- `config-server` serves the native configuration files in its classpath; `service-registry` is the Eureka server, not a discovery client.
- Gateway routes service traffic using `lb://<service-name>`

## Gateway routes

- `finance`: `/api/v1/invoices/**`, `/api/v1/matching/**`, `/api/v1/bank/**`
- `form`: `/api/form/**`
- `timeclock`: `/api/timeclock/**`, `/api/users/**`, `/api/admin-config/**`
- `core eventico`: `/api/**` (catch-all after specific routes)
- legacy `timeclock`: `/timeclock/**` rewrites to `/api/timeclock/**`

## Security baseline

- Secrets have been switched to environment-variable based config in service property files.
- Do not commit real credentials in `application.properties`/`application.yaml`.
- Prefer secret stores (Vault / cloud secret manager / orchestrator secrets) in production.
