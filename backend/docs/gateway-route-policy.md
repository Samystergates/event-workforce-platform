# Gateway Route Policy

## Ordering

1. Most specific routes first (`/api/v1/invoices/**`, `/api/form/**`, `/api/timeclock/**`).
2. Legacy compatibility rewrites next.
3. Catch-all last (`/api/**` -> core service).

## Security

- Disable discovery locator route exposure by default.
- JWT authentication is enabled by default; configure a valid issuer and expected audience.
- Keep public routes limited to login, signed review actions, and the signed job-offer acceptance link.
- Finance API routes require the `finance` or `admin` OAuth2 scope at both the gateway and finance service.
- Keep docs/actuator paths explicit in the security allow-list.

## Safety checks

- Route conflicts must be tested before release.
- No new direct frontend-to-service URLs; use gateway only.
