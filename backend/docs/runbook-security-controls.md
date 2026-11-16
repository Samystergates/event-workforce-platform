# Runbook: JWT and Rate Limit Controls

## Configure JWT at gateway

JWT authentication is enabled by default. Configure:

- `JWT_ISSUER_URI=<your-issuer-uri>`
- `JWT_AUDIENCE=<expected-audience>`
- `JWT_SIGNING_SECRET=<base64-encoded random key of at least 64 bytes>` (same value for core and form services)

Finance API tokens must include the `finance` or `admin` scope. The finance service enforces these scopes directly as well as at the gateway.

Generate a signing key outside the repository and inject it through a secret manager or protected runtime environment. Never commit it.
For Kubernetes/Helm, create the referenced `eventico-jwt-secrets` Secret with key `signing-secret` before deploying core and form.

1. Provide the required values to the gateway, core service, and form service.
2. Restart `api-gateway`.
3. Validate:
   - Request without token to protected `/api/...` routes returns `401`.
   - A token without the required finance scope is rejected on finance routes.
   - A valid token with required scope returns `2xx`.
   - Request with wrong audience returns `401`.

## Enable Redis-backed rate limiting

1. Ensure Redis is reachable from gateway:
   - `REDIS_HOST`
   - `REDIS_PORT`
2. Set:
   - `GATEWAY_RATE_LIMIT_ENABLED=true`
   - `GATEWAY_RATE_LIMIT_RPM=<limit>`
3. Restart `api-gateway`.
4. Validate by burst-calling an endpoint and confirming `429` after threshold.

## Emergency response

- Do not disable JWT authentication in production as a troubleshooting shortcut.
- If authentication is unavailable, restore the identity provider or roll back the deployment while retaining authentication.
- Record any temporary development-only bypass in the incident timeline and restore hardened settings before deployment.
