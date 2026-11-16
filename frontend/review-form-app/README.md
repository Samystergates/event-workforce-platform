# Review Form Application

Next.js frontend for service-provider review submissions. The app receives a review token in its route and submits form data and attachments to the configured backend API.

## Local development

Requirements: Node.js and npm.

1. Copy `.env.example` to `.env`.
2. Set `NEXTAUTH_SECRET` to a unique random value for this local environment.
3. Ensure the form service is reachable through the configured API gateway.
4. Install and run:

```powershell
npm ci
npm run dev
```

The development server listens on `http://localhost:3001`.

## Configuration

| Variable | Purpose | Local example |
| --- | --- | --- |
| `NEXTAUTH_SECRET` | Local NextAuth secret | Generate a unique value; do not commit it |
| `NEXTAUTH_URL` | Canonical URL for the local app | `http://localhost:3001` |
| `NEXT_PUBLIC_API_BASE_URL` | API base URL; browser-visible | `http://localhost:8060/api` |

`NEXT_PUBLIC_*` values are public in the client bundle and must not contain credentials.

## Available scripts

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run start` — serve a production build
- `npm run lint` — run ESLint
- `npm run typecheck` — validate TypeScript without emitting build files

The production build runs lint and type validation; configuration does not suppress either check.
