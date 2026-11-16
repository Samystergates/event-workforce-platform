# Operations Web Application

The main Next.js web application for operational workflows, including dashboard and job management, provider and account views, invoices, timesheets, and finance screens.

## Local development

Requirements: Node.js and pnpm. The repository's `package.json` declares pnpm as its package manager.

1. Copy `.env.example` to `.env`.
2. Set `NEXTAUTH_SECRET` to a unique random value for this local environment.
3. Ensure the API gateway and required backend services are available at the configured local URLs.
4. Install and start the application:

```powershell
corepack pnpm install
corepack pnpm dev
```

The development server starts on the Next.js default port, `http://localhost:3000`.

## Configuration

| Variable | Purpose | Local example |
| --- | --- | --- |
| `NEXTAUTH_SECRET` | Local NextAuth signing/encryption secret | Generate a unique value; do not commit it |
| `NEXTAUTH_URL` | Canonical URL for the local web app | `http://localhost:3000` |
| `NEXT_PUBLIC_URL` | Core API base URL used by the browser app | `http://localhost:8060/api` |
| `NEXT_PUBLIC_FINANCE_URL` | Finance API base URL | `http://localhost:9091` |

`NEXT_PUBLIC_*` values are included in browser-visible code. They must never contain credentials or other secrets.

## Available scripts

- `pnpm dev` — start the development server
- `pnpm build` — create a production build
- `pnpm start` — serve a production build
- `pnpm lint` — run the configured Next.js lint command
