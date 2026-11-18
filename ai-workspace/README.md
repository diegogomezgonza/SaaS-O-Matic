# Espacio de trabajo con IA de SaaS-O-Matic

Esta carpeta forma parte de la entrega junto al código en `../saas-o-matic/`. Permite revisar el planteamiento del sistema, las instrucciones dadas a la IA, las decisiones de arquitectura y las comprobaciones realizadas.

## Recorrido de revisión

| Dimensión del enunciado | Evidencia |
| --- | --- |
| Planificación y especificaciones | [Plan de desarrollo](planificacion.md), [reglas, contratos y validaciones](especificacion.md) y primeras instrucciones en [prompts seleccionados](prompts.md) |
| Arquitectura y directrices de generación | [Arquitectura y modelo SQLite](arquitectura.md), [AGENTS.md](../AGENTS.md) y [skills del proyecto](skills/) |
| Interacción real y control de calidad | [Prompts seleccionados](prompts.md), [notas de iteración](iteraciones.md), [registro del proceso](../saas-o-matic/proceso-prueba.md), [verificación](verificacion.md), [capturas](evidencias/) y [cobertura](../saas-o-matic/coverage-report/index.html) |

## Cómo se documentó el trabajo

La especificación recoge las reglas y los contratos planteados antes de implementar, actualizados con las decisiones posteriores. La arquitectura describe el estado entregado. Los prompts proceden de esta conversación y tienen correcciones ortográficas y de puntuación; constituyen una selección editorial, no una exportación íntegra del chat. Las notas de iteración identifican decisiones, comprobaciones y cambios observados; no se han inventado respuestas, sesiones o commits.

El usuario indicó GPT 5.6 Luna en alto para la etapa inicial y GPT 6.1 Sol en alto para la implementación y revisión. Se conserva esa atribución como selección declarada por el usuario, sin presentarla como telemetría comprobada.

Las skills conservan sus identificadores originales `client-register-*` para mantener sus invocaciones; su contenido y alcance corresponden a SaaS-O-Matic. El nombre inicial aparece en los prompts y pasos históricos porque así se solicitó en su momento.

## Reproducir la comprobación

Desde `saas-o-matic/`, ejecutar `npm ci` y `npm run test:coverage`. El comando ejecuta tests de dominio, API y frontend, recorrido funcional/responsive y build; genera el HTML navegable y su PNG. Los datos de pruebas son fixtures aislados, no clientes reales. Los límites de cobertura y de seguridad se explican en el propio informe y en el README de la aplicación.
