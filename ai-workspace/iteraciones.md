# Iteración con IA y control de calidad

Estas notas resumen hechos de la conversación y de las comprobaciones ejecutadas. Los mensajes del usuario seleccionados para la entrega están en [prompts.md](prompts.md); este archivo no inventa respuestas ni se presenta como una transcripción del chat.

## Decisiones observables

1. El usuario pidió registrar el proceso antes de empezar, evaluar React/JavaScript/Vite y estructurar el código para mantener responsabilidades claras.
2. Solicitó investigar alternativas gratuitas de estilos y eligió Tailwind CSS con shadcn/ui. Se configuraron el plugin Vite, alias, tokens y componentes locales.
3. Pidió dos skills específicas: calidad/seguridad y diseño. Después añadió a la segunda reglas explícitas para evitar eslóganes y referencias de interfaz a una demo o prueba local.
4. Indicó el cambio de modelo para implementar y verificar. Se desglosaron contratos, reglas y decisiones sobre precios, países, planes, almacenamiento y llamadas API.
5. La implementación se comprobó con tests de dominio/API y un recorrido real de navegador. Las primeras pruebas detectaron una discrepancia en la inserción SQL de clientes, que se corrigió usando columnas explícitas. Las capturas móviles requirieron recargar por viewport para evitar artefactos del compositor.
6. El usuario revisó los textos visibles y dio correcciones concretas. Se mantuvo la frase del estado vacío que aprobó y se retiraron las etiquetas y eslóganes no deseados.
7. Solicitó cobertura HTML con barras y exportación PNG. La medición inicial mostró huecos en frontend y errores HTTP; se añadieron tests de formularios, hooks, cancelación, red, host/origen, límites, persistencia y validaciones. Se endureció la comprobación del tipo MIME JSON.
8. El usuario pidió reorganizar el registro, cambiar la marca a SaaS-O-Matic y preparar la entrega con documentación y prompts reales seleccionados. La carpeta de código y el paquete pasaron a `saas-o-matic`; los datos existentes se conservaron.
9. Finalmente pidió inventariar y limpiar archivos innecesarios. La revisión contrasta imports, scripts y pruebas; el resultado está en [inventario-archivos.md](inventario-archivos.md).

## Qué se verifica y dónde

- Los tests unitarios ejercitan precios, controles fiscales, servicios, hooks y componentes, incluidos errores y recuperación.
- Los tests de integración levantan la API y utilizan SQLite real, incluidos persistencia tras reapertura, unicidad, payloads inválidos y protección de errores.
- Playwright recorre las acciones de la aplicación integrada y comprueba overflow y capturas a varios anchos. Las cotizaciones de este recorrido son fixtures deterministas; la conexión real se comprobó por separado.
- El comando `npm run test:coverage` combina tests, umbrales por archivo, E2E y build, y genera un HTML con detalle de código y un PNG. Los resultados actuales y los límites figuran en [verificacion.md](verificacion.md).

## Criterio aplicado al revisar resultados

No se convierte el porcentaje de cobertura en una certificación de seguridad. Los avisos de dependencias permanecen identificados; se actualizó la herramienta de tests para evitar avisos críticos de su rama anterior y se evitaron arreglos forzados que propusieran regresiones de versión. Los cambios de código se vuelven a comprobar antes de regenerar evidencias.
