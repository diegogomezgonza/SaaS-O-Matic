# SaaS-O-Matic — Runtime Reference

Application commands, payloads, validation limits, and storage behavior. For the project overview, screenshots, architecture, and development workflow, see the [repository README](../README.md).

## Installation

Requires Node.js 22.14 or newer and npm. Run commands in this directory:

```sh
npm ci
npm run dev
```

The application runs at `http://127.0.0.1:5173`, with the API on port `3000`. The development command starts both services. SQLite is initialized automatically; Node.js 22 may print an experimental warning for `node:sqlite`.

## Scripts

| Command                                 | Purpose                                         |
| --------------------------------------- | ----------------------------------------------- |
| `npm run dev`                           | Start frontend and backend together             |
| `npm run dev:client`                    | Start Vite only                                 |
| `npm run dev:server`                    | Start the API in watch mode                     |
| `npm run start:server`                  | Start the API without watching                  |
| `npm run build`                         | Generate the frontend build in `dist/`          |
| `npm run preview -- --host 127.0.0.1`   | Preview the frontend build on port 4173         |
| `npm test`                              | Run the Vitest suite                            |
| `npm run test:e2e`                      | Run browser flows and responsive checks         |
| `npm run test:coverage`                 | Run coverage, E2E, build, and report generation |
| `npm run coverage:serve`                | Serve the generated report on port 4174         |
| `npm run coverage:png`                  | Export the latest report to PNG                 |
| `npm run format`                        | Format application files                        |
| `npm run format:check`                  | Verify formatting                               |
| `npm run components:add -- <component>` | Add a local shadcn/ui component                 |

## Build preview

Use two terminals in this directory:

```sh
# Terminal 1
npm run start:server
```

```sh
# Terminal 2
npm run build
npm run preview -- --host 127.0.0.1
```

Open `http://127.0.0.1:4173`. Both development and preview proxy the backend route families without adding a prefix. Release occupied ports before starting either runtime.

## Configuration

| Setting               | Default                                                        | Scope                          |
| --------------------- | -------------------------------------------------------------- | ------------------------------ |
| `DATABASE_PATH`       | `data/client-register.sqlite`, resolved from the server module | SQLite database location       |
| `PORT`                | `3000`                                                         | API listening port             |
| `CHROME_PATH`         | Detected macOS Chrome or Playwright Chromium                   | E2E and PNG export             |
| Vite development port | `5173`                                                         | Application UI                 |
| Vite preview port     | `4173`                                                         | Frontend build preview         |
| Coverage viewer port  | `4174`                                                         | Report server                  |
| E2E ports             | `5174` and `3101`                                              | Isolated browser-test services |

Changing `PORT` also requires changing the proxy target in `vite.config.js`. No secret or external-service key is required by the frontend. Database and environment files are excluded from Git. The database filename retains its original technical name to preserve existing data.

## Request examples

The API base URL is `http://127.0.0.1:3000`. Routes do not use an `/api` prefix. Send JSON with `Content-Type: application/json`.

### Register a customer

`POST /customers`

```json
{
  "companyName": "Example Company",
  "taxId": "B12345674",
  "email": "contact@example.test",
  "country": "ES",
  "plan": "Business"
}
```

This is synthetic example data. The API normalizes the tax identifier and email, validates the selected country and plan, and enforces uniqueness on `(country, taxId)`.

### Save an estimate

`POST /simulations`

```json
{
  "customerId": "<id-returned-by-customer-registration>",
  "users": 15,
  "storageGb": 100,
  "apiCalls": 10000
}
```

Replace `customerId` with an existing customer ID. The API calculates and stores the EUR price breakdown; client-supplied price fields are rejected.

### Read records

```text
GET /health
GET /catalog
GET /customers?q=Example
GET /customers/:id
GET /customers/:id/simulations
GET /exchange-rates
```

Searches return up to 100 matches. Customer history is ordered newest first. Missing resources return `404`.

### Validation limits

| Field         | Constraint                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------ |
| `companyName` | 2–120 characters                                                                           |
| `taxId`       | 3–24 normalized alphanumeric characters; Spanish identifiers must pass checksum validation |
| `email`       | Valid email shape, maximum 254 characters                                                  |
| `country`     | ES, FR, DE, PT, or GB                                                                      |
| `plan`        | Starter, Business, or Enterprise                                                           |
| `users`       | Integer from 0 to 100,000                                                                  |
| `storageGb`   | Integer from 0 to 1,000,000                                                                |
| `apiCalls`    | Integer from 0 to 1,000,000,000                                                            |

Unknown fields are rejected. Errors use `{ message, fields? }`; successful writes return `201`, validation failures `422`, and duplicate customers `409`.

## Persistence and exchange rates

`server/database.js` owns SQLite access, enables foreign keys and WAL, and uses parameterized statements. Customers and simulations are stored in separate tables. Estimates retain their original prices and tax breakdown in integer EUR cents.

Exchange rates come from a fixed HTTPS provider through the backend. Responses are validated, requests time out after seven seconds, and accepted values are cached for one hour. The UI supports EUR, USD, and GBP. If the provider fails, EUR remains available and the interface offers a retry. Currency conversion changes display values only.

## Coverage artifacts

`npm run test:coverage` writes:

```text
coverage-report/
├── index.html         Overview with coverage bars and verification results
├── report.css         Overview styles
├── report-data.json   Normalized metrics and source fingerprint
├── details/           Navigable source coverage
└── coverage.png       Full-page PNG export
```

Open the HTML directly or run `npm run coverage:serve`. Browser checks require Chrome or `npx playwright install chromium`. E2E fixtures use an in-memory database and do not modify application records. Raw coverage inputs and temporary browser output are ignored by Git.

## Project skills and documentation

- [Code quality and security skill](../ai-workspace/skills/client-register-code-quality-security/SKILL.md).
- [UI design and product-copy skill](../ai-workspace/skills/client-register-ui-design/SKILL.md).
- [Architecture and SQLite model](../ai-workspace/arquitectura.md).
- [Business rules and API specification](../ai-workspace/especificacion.md).
- [Verification and dependency advisories](../ai-workspace/verificacion.md).
- [Engineering process log](proceso-prueba.md).

The API currently runs within a loopback, single-user boundary. Authentication, authorization, and HTTPS must be configured before external hosting. Tax profiles do not implement exemptions or reverse-charge rules. These operational limits are separate from source coverage.
