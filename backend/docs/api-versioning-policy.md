# API Versioning Policy

## Current strategy

- Keep existing routes backward compatible.
- Expose `v1` aliases at gateway for form and timeclock endpoints.
- Prefer new endpoints under `/api/v1/...`.

## Rules

1. Breaking changes require new version path (`/api/v2/...`).
2. Add deprecation notice and sunset date before removing old versions.
3. Contract tests must cover versioned request/response schemas.
4. Do not silently change field semantics in existing versions.
