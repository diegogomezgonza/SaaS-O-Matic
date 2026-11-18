---
name: client-register-code-quality-security
description: Maintain senior-level code quality, feature architecture, and security for SaaS-O-Matic changes across the React frontend and the REST/SQLite backend. Use for implementation, review, refactoring, API, data, dependency, or configuration work.
---

# SaaS-O-Matic Code Quality Security

Apply this skill to every meaningful change in the SaaS-O-Matic project. The product handles corporate customer data, tax identifiers, contact emails, usage simulations, and prices, so quality and security are part of the feature definition rather than a final cleanup step.

## Project context

- The project is SaaS-O-Matic, an internal commercial dashboard for multi-currency SaaS subscription simulations.
- The frontend uses React, JavaScript, Vite, Tailwind CSS, and shadcn/ui.
- The backend uses a REST API and SQLite. Treat the backend as a separate boundary.
- The project is organized by business feature. Preserve that direction when adding new code.

## Architecture invariants

- Keep application composition in `src/app` and layout primitives in `src/components/layout`.
- Keep shadcn primitives in `src/components/ui`; extend an existing primitive before creating a duplicate.
- Put customer-specific code in `src/features/customers` and simulation-specific code in `src/features/simulations`.
- Put genuinely cross-feature utilities and services in `src/shared`. Do not move domain logic there merely to avoid choosing a feature owner.
- Keep API calls in services or data-access modules, not inside presentational components. Normalize response and error shapes at the boundary.
- Keep build/proxy configuration in `config` and `vite.config.js`; introduce `src/config` only when frontend configuration is needed. Use the `@/` alias consistently.
- Do not mix pricing, tax, identifier validation, or persistence rules into JSX. Make them isolated, testable functions or backend services.
- Preserve existing conventions and make the smallest coherent change. Do not introduce a new library or folder pattern without a concrete need.

## Senior implementation rules

1. Before editing, identify the affected feature, user flow, data contract, and failure states. If a contract is unclear, record the assumption instead of hiding it in code.
2. Keep components focused. Separate orchestration, presentation, business rules, and I/O; avoid large components and generic utility dumping grounds.
3. Prefer explicit names and small pure functions. Avoid duplicated business rules between frontend and backend; the backend remains authoritative.
4. Model loading, empty, validation-error, server-error, and success states for every asynchronous flow.
5. Add comments only for non-obvious reasoning, business invariants, security decisions, or intentional trade-offs. Do not comment what the code visibly does.
6. Remove dead code, unused imports, placeholder logs, and speculative abstractions before handoff.
7. Keep public API and data shapes documented near their boundary. Use JSDoc when JavaScript types or invariants would otherwise be unclear.

## Security and data protection

Treat company names, tax identifiers, contact emails, client IDs, usage values, and saved simulations as sensitive business data.

- Never place secrets, private keys, database credentials, or privileged tokens in the frontend. `VITE_*` values are public configuration.
- Validate and normalize all input at the backend boundary. Frontend validation improves usability but never replaces server-side validation.
- Validate tax identifiers with country-aware rules. For Spain, use the official checksum algorithm and reject malformed or ambiguous input before persistence.
- Use allowlisted fields for customer and simulation writes. Prevent mass assignment and reject unknown or impossible values.
- Use parameterized database queries or the chosen ORM/query builder. Never concatenate user input into SQL.
- Enforce authorization before returning customer data or simulations. Prevent IDOR-style access by checking ownership or permitted tenant scope whenever authentication is introduced.
- Do not log tax identifiers, emails, raw request bodies, or full customer records. Redact sensitive fields in diagnostic output and error telemetry.
- Return safe client-facing errors. Do not expose stack traces, SQL statements, filesystem paths, or internal dependency details.
- Configure restrictive CORS for known origins, sensible request-size limits, security headers, and rate limits on customer and simulation endpoints when the backend is exposed beyond local development.
- Do not store sensitive customer data or access tokens in `localStorage` unless there is a documented, justified threat-model decision. Prefer in-memory state or secure server-managed sessions for credentials.
- Do not use `dangerouslySetInnerHTML` for customer-controlled content. Render values as text and validate any external URL before using it.
- Treat exchange-rate responses as untrusted external input: use timeouts, validate the response shape, allowlist supported currencies, handle stale or unavailable data, and never render response content as markup.
- Keep dependencies and the lockfile synchronized. Review advisories and transitive packages before adding dependencies; do not solve audit issues with blind `--force` upgrades.

## Verification before handoff

- Run `npm run build` from `saas-o-matic` after frontend changes.
- Run the available tests and add focused tests for billing tiers, tax calculation, Spanish identifier validation, input rejection, and persistence when those modules exist.
- Check that each asynchronous screen has loading, empty, error, and retry behavior where relevant.
- Review the diff for accidental PII, secrets, broad error messages, unsafe HTML, duplicated rules, and unrelated formatting changes.
- State any remaining security assumption or development-only shortcut explicitly. Never claim the application is secure without evidence for the relevant boundary.
