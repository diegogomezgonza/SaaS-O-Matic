# Inventario y limpieza de SaaS-O-Matic

Se revisaron imports locales, entradas de Vite, scripts npm, configuración, servicios y tests para identificar archivos propios sin uso. La aplicación no conserva logos, iconos o pantallas de ejemplo de Vite.

## Archivos propios de la aplicación

Las rutas siguientes son relativas a `saas-o-matic/`. Cada archivo conservado participa en ejecución, configuración, verificación o documentación de entrega.

```text
.gitignore
.prettierignore
.prettierrc.json
README.md
components.json
config/api-proxy.js
index.html
jsconfig.json
package-lock.json
package.json
proceso-prueba.md
scripts/check-browser.js
scripts/coverage-report.js
scripts/coverage.js
scripts/dev.js
scripts/export-coverage.js
scripts/serve-coverage.js
server/app.js
server/database.js
server/domain/tax-id.js
server/exchange-rates.js
server/index.js
server/validation.js
shared/catalog.js
shared/pricing.js
src/app/App.jsx
src/components/layout/AppShell.jsx
src/components/ui/button.jsx
src/components/ui/field.jsx
src/features/customers/components/CustomerDetail.jsx
src/features/customers/components/CustomerForm.jsx
src/features/customers/components/CustomerSearch.jsx
src/features/customers/hooks/useCustomers.js
src/features/customers/pages/CustomerDashboardPage.jsx
src/features/customers/services/customers.js
src/features/simulations/components/SimulationForm.jsx
src/features/simulations/components/SimulationHistory.jsx
src/features/simulations/services/simulations.js
src/lib/utils.js
src/main.jsx
src/shared/hooks/useExchangeRates.js
src/shared/lib/formatters.js
src/shared/services/exchangeRatesService.js
src/shared/services/http.js
src/styles/globals.css
tests/api.test.js
tests/domain.test.js
tests/exchange.test.js
tests/proxy.test.js
tests/security.test.js
tests/setup.js
tests/ui/components.test.jsx
tests/ui/dashboard.test.jsx
tests/ui/hooks.test.jsx
tests/ui/services.test.js
vite.config.js
vitest.config.js
```

## Motivos de conservación

| Grupo | Uso comprobado |
| --- | --- |
| Entradas y configuración | HTML carga `src/main.jsx`; Vite configura React/Tailwind y proxy; jsconfig resuelve alias; package/lock fijan dependencias; Vitest y Prettier tienen comandos reproducibles |
| `src` | Los componentes y hooks están conectados a la aplicación; los servicios encapsulan HTTP y los formatos y utilidades se importan desde consumidores reales |
| `server` y `shared` | Servidor, SQLite, validación, cambios de divisa, catálogo y cálculo de precios participan en los flujos de clientes y simulaciones |
| `tests` | Verifican dominio, persistencia, API, proxy, servicios, hooks y pantallas; todos forman parte de la suite ejecutada |
| `scripts` | Los comandos npm usan los seis scripts para desarrollo, E2E, generación/servido de HTML y exportación PNG |
| `components.json` | Configura el CLI de shadcn/ui y la ubicación de los componentes; no es un componente de ejecución |
| `README.md` y `proceso-prueba.md` | Instrucciones de uso y evidencia de proceso solicitada para la entrega |

## Archivos generados y datos

Se agrupan aparte de las fuentes para no confundir dependencias instaladas con código propio:

- `coverage-report/index.html`, `report.css`, `report-data.json`, `coverage.png` y el árbol `details/`: informe y detalle navegable solicitados; se regeneran mediante `npm run test:coverage`. Se conserva esta evidencia en la entrega. Los JSON internos `coverage-summary.json` y `coverage-final.json` son entradas del generador y están excluidos de Git.
- `coverage-run.json`: resultado intermedio de Vitest utilizado por el generador; excluido de Git.
- `test-results/dashboard-320.png`, `dashboard-390.png`, `dashboard-768.png`, `dashboard-1440.png` y `form-mobile.png`: capturas regenerables de E2E; excluidas de Git. Las evidencias seleccionadas se copian en `../ai-workspace/evidencias/`.
- `dist/index.html` y `dist/assets/`: salida necesaria para probar el build con preview; regenerable y excluida de Git.
- `data/client-register.sqlite` y sus archivos auxiliares WAL/SHM: datos persistidos de la aplicación; conservados y excluidos de Git.
- `node_modules/`: dependencias instaladas, no fuentes propias ni contenido de entrega; se recrean con `npm ci`.

## Limpieza realizada

- Eliminado `src/components/ui/.gitkeep`: marcador vacío que ya no era necesario porque la carpeta contiene componentes reales. Se puede recrear como archivo vacío si se necesitara.
- Eliminada la carpeta vacía `src/config`: su antiguo archivo ya no existía y no tenía consumidores. Se puede recrear con `mkdir` cuando haya una necesidad real.
- Eliminada la exportación `currencies` de `shared/catalog.js`: no tenía imports ni consumidores. El archivo del catálogo se conserva porque países y planes sí se usan.
- Retirada la dependencia de desarrollo `@testing-library/user-event`: no se importaba; las pruebas actuales utilizan React Testing Library y las acciones reales de Playwright. `package.json` y el lockfile quedan sincronizados. Puede reinstalarse si más adelante se decide usarla.

No se ha borrado ningún dato de cliente ni se han eliminado tests, componentes funcionales o informes solicitados para aumentar artificialmente la limpieza o la cobertura.
