# Timeclock Mobile Application

Expo / React Native application for field clock-in and clock-out workflows. The app stores punch data locally and includes sync and retry services for intermittent connectivity.

## Requirements

- Node.js and npm
- Android Studio and an Android emulator for the documented Android workflow
- A reachable API gateway for syncing punches

## Local development

1. Copy `.env.example` to `.env`.
2. Start the API gateway and the timeclock backend.
3. Install dependencies and launch Expo:

```powershell
npm ci
npx expo start
```

For the Android emulator, the example API host `10.0.2.2` maps to the development computer. A physical device must use a LAN address reachable from the phone; do not use a production API URL in local config.

## Configuration

| Variable | Purpose | Example |
| --- | --- | --- |
| `API_BASE_URL` | API endpoint used for punch synchronization | `http://10.0.2.2:8060/api` |

The API URL is bundled into the native application. Never place credentials or tokens in this environment variable.

## Available scripts

- `npm start` — start the Expo development server
- `npm run android` — build and launch the Android app locally
- `npm run ios` — build and launch the iOS app locally (requires macOS tooling)
- `npm run web` — run the web target
- `npm run lint` — run Expo lint

The app's data and sync implementation is under `src/db`, `src/services`, and `src/tasks`.
