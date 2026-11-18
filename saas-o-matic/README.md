# SaaS-O-Matic

SaaS-O-Matic: dashboard comercial para registrar clientes corporativos y presupuestar suscripciones con precios progresivos, impuestos y conversión de divisas. React + JavaScript + Vite, Tailwind CSS y componentes locales shadcn/ui; API Node.js y SQLite.

La carpeta y el paquete se llaman `saas-o-matic`. El archivo de base de datos conserva su nombre técnico original, `client-register.sqlite`, para mantener los datos existentes.

## Arranque local

Requiere Node.js **22.14 o superior** y npm. SQLite está integrado en Node; en Node 22 muestra un aviso experimental esperado.

```sh
npm ci
npm run dev
```

Abrir http://127.0.0.1:5173. El mismo comando inicia frontend y API (puerto 3000); Ctrl+C cierra ambos. No requiere claves de API ni servicios de base de datos. La primera ejecución crea `data/client-register.sqlite` sin clientes ficticios. Si un puerto está ocupado, liberarlo antes de arrancar. Internet es necesario para los tipos de cambio; EUR funciona sin el proveedor.

## Comprobar la aplicación

```sh
npm test
npm run build
npm run format:check
npm run test:e2e
```

## Informe de cobertura HTML y PNG

```sh
npm run test:coverage
npm run coverage:serve
```

Abrir http://127.0.0.1:4174. El informe generado está también en `coverage-report/index.html` y puede abrirse directamente desde el explorador de archivos. La carpeta `coverage-report/` contiene el detalle navegable por archivo y `coverage.png`, listo para adjuntar. Para compartir el informe interactivo hay que enviar la carpeta completa; para compartir una imagen basta con el PNG. `npm run coverage:png` vuelve a exportar el último HTML.

`test:coverage` ejecuta Vitest con V8, el recorrido funcional/responsive en Chrome y el build. Exige **100% por archivo en líneas, sentencias, funciones y ramas**; devuelve error si no se alcanza el objetivo o si falla alguna comprobación. Al completar todo, genera el HTML y su PNG automáticamente. Usa el mismo navegador y requisitos de E2E. Los resultados son un snapshot fechado con huella SHA-256 del código medido; regenerarlo después de cambiar el código.

Se incluyen todos los módulos funcionales de `src/`, `server/` y `shared/`, incluidos componentes, hooks, servicios y errores. Se excluyen únicamente los puntos de arranque `src/main.jsx` y `server/index.js` del porcentaje; tampoco se instrumentan configuración, CSS, dependencias, herramientas y tests. Una reexportación sin instrucciones ejecutables se identifica expresamente. Los mocks aíslan red y dependencias en pruebas unitarias; las pruebas REST usan SQLite real y E2E verifica la aplicación integrada. El 100% de cobertura no certifica ausencia de vulnerabilidades; los avisos de dependencias y los límites de despliegue se mantienen documentados por separado.

E2E usa Chrome instalado en macOS o Chromium de Playwright (`npx playwright install chromium` en otros entornos). También admite `CHROME_PATH=/ruta/al/navegador`. Inicia servidores temporales en 5174 y 3101, utiliza SQLite en memoria y empresas claramente identificadas como fixtures; no modifica la base de desarrollo. Prueba altas, errores de NIF, búsqueda, selección, slider, persistencia, monedas, fallos/reintentos, formulario modal y acciones en móvil. Genera capturas a 320, 390, 768 y 1440 px en `test-results/` (excluidas de Git). Los tipos de cambio en E2E son fixtures deterministas; el proveedor real se prueba por separado.

Para probar el build, usar dos terminales:

```sh
npm run start:server
```

```sh
npm run build
npm run preview -- --host 127.0.0.1
```

Abrir http://127.0.0.1:4173. La API admite esos orígenes locales. `DATABASE_PATH` y `PORT` son opciones de servidor; si se cambia el puerto, actualizar también el proxy en `vite.config.js`.

## Organización

```text
shared/                 Catálogo y cálculo puro compartidos
server/
  app.js                Contrato HTTP, límites y errores seguros
  database.js           Repositorio SQLite parametrizado
  validation.js         Validación de entrada y allowlists
  domain/tax-id.js      Algoritmos de control fiscal
  exchange-rates.js     Proveedor fijo, validación y caché
src/
  app/                  Composición de la aplicación
  components/layout/    Estructura general
  components/ui/        Primitivas reutilizables
  features/customers/   Componentes, hook y servicio de clientes
  features/simulations/ Simulador, histórico y servicio
  shared/               HTTP, formato de importes, hook de cambio
  styles/               Tokens semánticos y estilos globales
tests/                  Dominio e integración REST/SQLite
scripts/                Arranque y prueba de navegador
```

Alias `@/` para `src`. Generar componentes con `npm run components:add -- button`; revisar los cambios antes de incorporarlos. Tailwind usa su plugin Vite y tokens semánticos; los componentes del sistema visual permanecen editables en el repositorio. Formatear con `npm run format`.

## API

Rutas sin prefijo: `POST /customers` y `POST /simulations`, coincidiendo exactamente con el enunciado. JSON para escrituras; errores `{message, fields?}`. El frontend usa estas mismas rutas mediante el proxy de Vite en desarrollo y preview. Las antiguas rutas con `/api` devuelven 404.

| Método | Ruta                       | Propósito                                |
| ------ | -------------------------- | ---------------------------------------- |
| GET    | /health                    | Disponibilidad                           |
| GET    | /catalog                   | Países, impuestos y planes               |
| GET    | /customers?q=              | Listar/buscar por nombre o identificador |
| POST   | /customers                 | Crear cliente                            |
| GET    | /customers/:id             | Datos de cliente                         |
| GET    | /customers/:id/simulations | Historial guardado                       |
| POST   | /simulations               | Calcular y persistir presupuesto         |
| GET    | /exchange-rates            | Cambios EUR/USD/GBP validados            |

Cliente: `{companyName,taxId,email,country,plan}`. Simulación: `{customerId,users,storageGb,apiCalls}`. Los precios enviados por el navegador se rechazan; el servidor calcula el presupuesto. Estado 201 al crear, 422 en validación, 409 en duplicados y 404 si no existe el recurso. Máximo 100 resultados de búsqueda; se puede acotar por empresa/NIF.

## Decisiones de negocio

Primeros 10 usuarios a 10 EUR, siguientes 40 a 8 EUR, resto a 5 EUR. Importes en céntimos y redondeo único de impuesto. Ejemplo: 15 usuarios en ES → base 140 EUR, impuesto 29,40 EUR, total 169,40 EUR. Se guarda el desglose original; convertir divisas solo modifica la presentación y muestra la fecha del cambio.

ES 21%, FR 20%, DE 19%, PT 23%, GB 20% constituyen un catálogo simplificado para esta prueba; no es un motor fiscal B2B. Starter, Business y Enterprise son etiquetas; almacenamiento y llamadas API no añaden recargos porque el enunciado no establece tarifas. Validar un checksum no prueba que un identificador exista en AEAT. Detalles, fuentes y contratos en `../ai-workspace/especificacion.md`.

## Datos y límites de seguridad

API enlazada a loopback, sin autenticación porque el alcance es una demostración local monousuario. **No publicar en Internet sin añadir autenticación, permisos por cliente, HTTPS y configuración de producción.** Las empresas, emails e identificadores solo se guardan en SQLite local; no se envían al proveedor de divisas ni a localStorage, y no se imprimen en logs. Se aplican validación estricta, consultas parametrizadas, restricciones de origen/host, JSON obligatorio, límite de cuerpo de 16 KB, rate limit y cabeceras básicas. El proveedor de cambio tiene timeout y caché; nunca se inventan tipos de cambio cuando falla.

El [espacio de trabajo con IA](../ai-workspace/README.md), en la raíz del repositorio, reúne planificación, especificaciones, arquitectura, prompts reales seleccionados, skills y evidencias de revisión. La auditoría de dependencias y sus limitaciones se documentan en `../ai-workspace/verificacion.md`. El registro del proceso está en [proceso-prueba.md](proceso-prueba.md), en la raíz de esta carpeta.
