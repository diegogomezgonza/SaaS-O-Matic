# Planificación de funcionalidades

El planteamiento y las decisiones de negocio se registraron en `especificacion.md` antes de escribir la implementación funcional. Este documento ordena ese plan para facilitar la revisión y enlaza los resultados actuales; no pretende reconstruir versiones o marcas temporales que no se guardaron.

## Definición del alcance

El comercial debe registrar una empresa, localizarla por nombre o identificador fiscal, ajustar el consumo y guardar un presupuesto mensual. El cálculo combina tarifas progresivas e impuesto del país; la divisa modifica la presentación. Almacenamiento y llamadas API se guardan sin inventar tarifas adicionales. Los planes son etiquetas comerciales porque el enunciado no define diferencias de precio.

## Plan de ejecución y criterios

| Paso | Decisión previa | Resultado que comprobar |
| --- | --- | --- |
| Elegir frontend | React y JavaScript con Vite; elegir sistema visual antes de desarrollar pantallas | Arranque y build reproducibles |
| Fijar estructura y reglas de generación | Features de clientes y simulaciones; primitivas UI y servicios separados; skills de calidad y diseño | Componentes sin SQL ni lógica fiscal, imports y tokens consistentes |
| Definir contratos y modelo | Cliente, simulación, identificadores, límites y errores JSON; SQLite con relación cliente/simulaciones | Altas válidas, errores de validación y unicidad |
| Aislar las reglas de negocio | Cálculo puro en céntimos y validación fiscal por algoritmo de control | Casos límite de tramos e identificadores válidos/inválidos |
| Implementar persistencia y API | Repositorio con consultas parametrizadas; servidor autoritativo para presupuestos | Guardado, consultas y persistencia después de reabrir SQLite |
| Conectar las pantallas | Directorio, formulario de alta, detalle, simulador y listado histórico | Acciones completas con cargas, vacíos, errores y reintentos |
| Integrar cambios de divisa | Proveedor HTTPS fijo, timeout, validación, caché y fecha del cambio | Conversión EUR/USD/GBP y continuidad en EUR si falla el proveedor |
| Revisar el producto | Textos funcionales, responsive y accesibilidad básica | Verificación de acciones y capturas a 320, 390, 768 y 1440 px |
| Generar evidencias de calidad | Tests y cobertura por archivo; HTML y PNG reproducibles | Tests, umbrales, E2E y build correctos |

## Riesgos y decisiones explícitas

- No confundir un checksum fiscal válido con la existencia legal de la empresa.
- Definir el catálogo limitado de países e impuestos, sin presentarlo como un motor fiscal completo.
- Evitar dobles reglas: servidor autoritativo y función de precios compartida para previsualización.
- Evitar filtraciones de datos de clientes por logs, errores, navegador o proveedor externo.
- Conservar el presupuesto original y su desglose, aunque cambie el tipo de cambio de visualización.
- Mantener las limitaciones de despliegue y los avisos de dependencias documentados y separados de la cobertura.

Los contratos, campos, rangos numéricos y ejemplos concretos se mantienen en [especificacion.md](especificacion.md), como única referencia de reglas de negocio.
