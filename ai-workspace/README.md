# SaaS-O-Matic — AI Engineering Workspace

Versioned specifications, architecture decisions, project skills, selected prompts, and verification evidence for the application in [`saas-o-matic/`](../saas-o-matic/).

## Documentation index

| Area                   | Reference                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| Planning               | [Development plan](planificacion.md)                                                         |
| Business rules and API | [Specification, contracts, and validation](especificacion.md)                                |
| Architecture           | [Feature boundaries and SQLite data model](arquitectura.md)                                  |
| AI interaction         | [Selected prompts](prompts.md) and [iteration notes](iteraciones.md)                         |
| Engineering history    | [Process log](../saas-o-matic/proceso-prueba.md)                                             |
| Code review and checks | [Verification notes and known limitations](verificacion.md)                                  |
| Repository maintenance | [Application file inventory](inventario-archivos.md)                                         |
| Visual evidence        | [Screenshots](evidencias/) and [coverage report](../saas-o-matic/coverage-report/index.html) |

## Project skills

| Skill                                                                              | Scope                                                                                | Agent configuration                                                            |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| [Code quality and security](skills/client-register-code-quality-security/SKILL.md) | Architecture, validation, maintainability, data protection, and verification         | [openai.yaml](skills/client-register-code-quality-security/agents/openai.yaml) |
| [UI design and product copy](skills/client-register-ui-design/SKILL.md)            | Responsive layout, accessibility, Tailwind/shadcn conventions, and interface writing | [openai.yaml](skills/client-register-ui-design/agents/openai.yaml)             |

[AGENTS.md](../AGENTS.md) connects repository tasks to the versioned skills. The original `client-register-*` skill identifiers remain stable; their scope is SaaS-O-Matic.

## Record conventions

The specification contains the original implementation rules with subsequent decisions incorporated. Architecture documentation describes the current implementation. The prompt archive is a curated selection of actual conversation messages with spelling and punctuation edits; it is not a complete chat export. Iteration notes record observed decisions and checks without inventing sessions or commit history.

The user reported GPT 5.6 Luna with high reasoning for the initial phase and GPT 6.1 Sol with high reasoning for implementation and review. These labels record the user's declared model selection rather than independently verified session telemetry. Source prompts and process notes remain in their original language.

## Reproduce verification

```sh
cd saas-o-matic
npm ci
npm run test:coverage
```

Run these commands from the repository root. The coverage command checks unit/integration tests, per-file thresholds, integrated browser flows, responsive layouts, and the frontend build, then generates an HTML report and PNG. Chrome or Playwright Chromium is required for browser checks. Fixtures are isolated from application data.

See the [repository README](../README.md#testing-and-coverage) for commands and the [runtime reference](../saas-o-matic/README.md) for configuration.
