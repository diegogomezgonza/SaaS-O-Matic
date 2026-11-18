# Verificación de SaaS-O-Matic

Fecha: 18 de noviembre de 2026. Implementación y comprobaciones en la fase declarada por el usuario como GPT 6.1 Sol en alto. Fase anterior declarada: GPT 5.6 Luna en alto.

## Ampliación de cobertura

La verificación posterior amplía la suite original de seis tests a **21 tests en nueve archivos**, todos correctos y sin omisiones. Tras retirar una exportación sin uso, `npm run test:coverage` exige y alcanza 100% por archivo en las cuatro métricas: **339/339 sentencias, 257/257 ramas, 94/94 funciones y 298/298 líneas**. Hay 24 módulos con instrucciones cubiertas y una reexportación sin instrucciones ejecutables. Solo se excluyen del porcentaje `src/main.jsx` y `server/index.js`; no se excluyen componentes ni ramas de seguridad para subir el resultado.

Tras alinear las rutas con el enunciado se repitió toda la generación: backend y frontend usan `POST /customers` y `POST /simulations`, sin prefijo. Las rutas antiguas devuelven 404. El test adicional verifica que el proxy compartido de desarrollo/preview/E2E solo capture familias del backend y deje servir el frontend. El recorrido de navegador comprueba expresamente los paths de los POST realizados. HTML y PNG regenerados con 21/21 tests correctos, cobertura 100%, E2E y build correctos.

El HTML está en `saas-o-matic/coverage-report/index.html`, su PNG en `saas-o-matic/coverage-report/coverage.png`, y el detalle de código en `coverage-report/details/`. La portada explica alcance y limitaciones. Se abre mediante `npm run coverage:serve` en http://127.0.0.1:4174 o directamente como archivo. La exportación PNG se verificó visualmente. El generador solo marca la verificación como completada si pasan cobertura, tests, E2E y build.

El cambio de marca se verificó tanto en la cabecera como en el título del navegador y el informe. Se conservó SQLite al renombrar la carpeta a `saas-o-matic`. La revisión de limpieza produjo un inventario contrastado de 57 archivos propios, retiró un marcador vacío, una carpeta vacía, una exportación y una dependencia sin uso, y repitió la comprobación completa con resultados correctos. La documentación de planificación, arquitectura y prompts se reúne en `ai-workspace`, en la raíz del repositorio.

Se añadieron pruebas de MIME JSON estricto, payload inválido y excesivo, host/origen, rate limit y recuperación, errores internos sin fugas de información, búsquedas parametrizadas, renderizado de contenido con apariencia de HTML como texto, errores y reintentos de formularios, aborto de solicitudes obsoletas, servicios y conversiones. Se endureció el MIME JSON: `application/json-evil` ya no supera el control de tipo de contenido.

Después de las nuevas retiradas de textos se repitió E2E con acciones y tamaños 320/390/768/1440, sin overflow ni errores JS. Se conservaron los avisos funcionales sobre indisponibilidad del proveedor y la fecha del cambio como información consultable en el selector.

La auditoría posterior de herramientas de desarrollo reporta **14 avisos: 12 altos y 2 moderados, 0 críticos**. La selección de Vitest se actualizó a 5.1.1 compatible con Node/Vite para evitar los avisos críticos de la rama anterior. Persisten avisos transitivos de glob matching también presentes en Vite/shadcn; no forman parte de la cobertura ni quedan resueltos por el 100%. No se ejecutan arreglos forzados ni se presenta el porcentaje como certificación de seguridad.

## Resultado

Los requisitos funcionales del enunciado se han implementado para el alcance local y las decisiones explícitas de `especificacion.md`. La aplicación arranca con `npm run dev`, que inicia frontend y API. No se han publicado servicios ni creado un repositorio público.

| Área | Evidencia |
| --- | --- |
| Compilación | `npm run build` correcto, Vite 6.4.6 |
| Consistencia de formato | `npm run format:check` correcto |
| Dominio, integración y frontend | `npm test`: 21 pruebas correctas, 0 fallos |
| Navegador | `npm run test:e2e`: recorrido completo correcto en Chrome headless |
| Responsive | Capturas y comprobación automática sin overflow horizontal a 320, 390, 768 y 1440 px |
| Proveedor real | Consulta HTTPS correcta: EUR, USD y GBP con fecha de actualización del proveedor |
| Dependencias de ejecución | `npm audit --omit=dev`: 0 vulnerabilidades reportadas |

## Funcionalidad comprobada

- Alta de cliente mediante el formulario y rechazo de identificador fiscal español inválido.
- Prevención de duplicados por país e identificador; rechazo de campos desconocidos.
- DNI, NIE, NIF especial y entidades: casos válidos e inválidos de control.
- Búsqueda por texto y NIF, resultado vacío y selección de empresa.
- Cálculo de los límites 0, 1, 10, 11, 15, 50, 51 y 100000 usuarios.
- Ejemplo del enunciado: 15 usuarios → 140 EUR base; ES → 169,40 EUR con impuesto.
- Inputs y slider sincronizados, incluidas acciones de teclado.
- Guardado, actualización del histórico y conservación tras recarga; reapertura de SQLite desde disco en integración.
- Rechazo de precios suministrados por el cliente, consumos negativos, decimales y valores fuera de límite.
- Conversión EUR/USD/GBP y regreso a EUR con cotizaciones deterministas en E2E.
- Guardado desde pantalla móvil, error de guardado y recuperación al reintentar.
- Indisponibilidad de cambios: EUR sigue disponible, otras monedas deshabilitadas, reintento y recuperación.
- Respuestas externas inválidas, desactualizadas o con valores negativos rechazadas; caché validada.
- Formulario móvil, cierre con Escape, etiquetas de campos y foco visible.
- Origen externo rechazado; búsquedas con contenido SQL no alteran la consulta; no se imprimen datos de clientes.
- Cero errores de JavaScript durante el recorrido E2E.

Los datos de navegador pertenecen a una base en memoria exclusiva de pruebas. Las capturas muestran una empresa identificada como fixture; no contienen clientes reales. Las capturas iniciales de móvil mostraron artefactos del compositor tras redimensionar; la prueba se ajustó para recargar en cada tamaño y se revisaron las imágenes completas resultantes.

## Revisión visual

Se inspeccionaron las capturas de escritorio, tablet y móvil. En escritorio hay directorio lateral y espacio de trabajo; en tablet y móvil se apilan. El formulario se adapta a una o dos columnas. El desglose y el historial permanecen legibles y los controles no desbordan el viewport. Evidencias seleccionadas en `evidencias/`; las imágenes se regeneran en `saas-o-matic/test-results/` mediante E2E.

No se ha certificado accesibilidad con lector de pantalla ni se han probado dispositivos físicos o todos los motores de navegador; la verificación realizada es Chrome con viewports de escritorio/móvil y teclado.

## Límites y asuntos conocidos

- Demostración local monousuario, sin autenticación: no lista para exposición pública. Antes de ello se requieren autenticación, autorización, HTTPS y configuración de despliegue.
- Impuestos de cinco países como catálogo simplificado, sin reglas B2B ni exenciones. Plan, GB y llamadas no alteran la tarifa según la decisión documentada.
- SQLite integrado de Node 22 emite aviso experimental; versión mínima 22.14 declarada.
- La auditoría completa reportó 12 avisos (10 altos y 2 moderados) en herramientas de desarrollo y sus dependencias, principalmente el árbol de shadcn/Vite y glob matching. La consulta de registro devuelve picomatch 4.0.7 como última versión disponible, mientras el aviso cubre hasta esa versión. No se aplicó `npm audit fix --force`, que sugería regresiones de versión. Los patrones glob son configuración local, los servidores están limitados a loopback y el bundle de ejecución no incluye el CLI. Mantener revisiones de avisos antes de cambiar dependencias o desplegar.
- No hay bloqueo de instalación ni fallos de build o tests por estos avisos. Cero avisos en dependencias de ejecución no equivale a una certificación de seguridad.

## Incidencias corregidas durante las pruebas

- Incompatibilidad entre columnas y placeholders en la primera inserción SQL de clientes: corregida usando columnas explícitas y cubierta por integración y E2E.
- Capturas móviles tras redimensionar: recarga por viewport antes de capturar para evitar artefactos del navegador.
- Error de conexión al servidor: normalizado a mensaje accionable en español.
