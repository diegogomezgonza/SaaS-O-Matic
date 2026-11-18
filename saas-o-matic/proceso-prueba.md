# Proceso de la prueba técnica

Este documento registra las decisiones, acciones y pasos seguidos durante la construcción de SaaS-O-Matic.

El archivo se encuentra en la raíz de `saas-o-matic` por indicación del usuario, para adjuntarlo junto al proyecto. Las menciones a `client-register` en pasos anteriores reflejan el nombre usado en ese momento.

## Lista de acciones

- [x] Planteamiento y planning del proyecto
  - Confirmar que React con JavaScript y Vite es una base adecuada para el frontend.
  - Utilizar React para construir el dashboard comercial y Vite para disponer de un entorno de desarrollo rápido y sencillo.
  - Mantener el backend como una aplicación independiente conectada a SQLite mediante una API REST.
  - Tener en cuenta desde el inicio las funcionalidades requeridas: buscador de clientes, detalle del cliente, historial de simulaciones, cálculo progresivo por tramos y conversión de divisas.
- [x] Inicialización de la plantilla frontend
  - Crear el proyecto `client-register` con React y JavaScript usando la estructura estándar de Vite.
  - Separar la aplicación por responsabilidades: composición de la app, layout, páginas, features de negocio, componentes compartidos, configuración, servicios y estilos.
  - Mantener las funcionalidades de clientes y simulaciones dentro de sus propias features para evitar componentes monolíticos.
  - Dejar preparado el acceso a la API REST propia y a la API externa de tipos de cambio mediante servicios independientes.
- [x] Integración del sistema visual
  - Incorporar Tailwind CSS mediante el plugin oficial de Vite.
  - Preparar shadcn/ui para generar componentes locales en JavaScript dentro de `src/components/ui`.
  - Configurar tokens semánticos de color, radios y estados mediante variables CSS.
  - Configurar el alias `@/` para mantener imports cortos y consistentes.
- [x] Creación de skills específicas del proyecto
  - Crear una skill de calidad, arquitectura y ciberseguridad para proteger la mantenibilidad y los datos de clientes.
  - Crear una skill de diseño UI para mantener una interfaz responsive, distintiva y coherente con Tailwind CSS + shadcn/ui.
  - Mantener ambas skills enfocadas en decisiones propias de Client Register, evitando instrucciones genéricas o aplicables sin contexto.

## Decisiones y notas

## Modelos utilizados

- Hasta la planificación, plantilla y creación de skills: **GPT 5.6 Luna en alto**, según lo indicado por el usuario.
- Para ejecución, generación del código funcional y comprobaciones: **GPT 6.1 Sol en alto**, según lo indicado por el usuario. El registro identifica la selección declarada, sin inferir telemetría de las sesiones anteriores.

## Implementación y comprobaciones

- [x] Cambio del nombre del producto a SaaS-O-Matic.
  - Renombrar la carpeta y el paquete a `saas-o-matic`, y actualizar cabecera, título del navegador, README e informe de cobertura.
  - Conservar el archivo SQLite existente para mantener los datos guardados.
- [x] Preparación del espacio de trabajo con IA para entrega.
  - Mantener `ai-workspace` en la raíz del repositorio, junto a la carpeta de código.
  - Reunir planificación, especificaciones y contratos, arquitectura y esquema SQLite, directrices de generación, prompts reales seleccionados y control de calidad.
  - Corregir ortografía y puntuación de los prompts, respetando la selección solicitada por el usuario y sin inventar mensajes o respuestas.
- [x] Inventario y limpieza de archivos y dependencias sin uso.
  - Listar los archivos propios y justificar la conservación de fuentes, configuración, tests, scripts e informes.
  - Retirar el marcador vacío `.gitkeep`, la carpeta vacía `src/config`, una exportación sin consumidores y `@testing-library/user-event`, que no se importaba.
  - Conservar la base SQLite y las evidencias solicitadas, y comprobar de nuevo cobertura, navegador y build.

- [x] Alineación literal de los endpoints con el enunciado.
  - Eliminar el prefijo `/api`: altas en `POST /customers` y simulaciones en `POST /simulations`.
  - Actualizar el resto de rutas, el cliente HTTP del frontend y el proxy de Vite para desarrollo, preview y E2E.
  - Añadir comprobaciones de contrato para las URLs exactas y el rechazo de las antiguas rutas.
  - Actualizar especificación y README, y regenerar los informes HTML/PNG con los resultados de los tests, navegador y build.
  - Verificar 21 tests correctos, 0 fallos u omisiones y 100% de líneas, sentencias, funciones y ramas por archivo funcional; comprobar en navegador que las altas y guardados usan las dos rutas exactas.

- [x] Desglose de requisitos y decisiones de negocio antes de implementar (`especificacion.md`).
- [x] Implementación de API REST, SQLite, control fiscal, tarifas acumulativas e histórico con desglose en céntimos.
- [x] Implementación de registro, búsqueda, detalle, formulario de simulación, almacenamiento y llamadas API.
- [x] Integración del proveedor público de cambio con validación, timeout, caché, estados de error y reintento.
- [x] Diseño responsive con Tailwind y primitivas locales; formularios etiquetados, foco visible y modal nativo.
- [x] Pruebas de reglas de negocio, API y persistencia tras reabrir SQLite.
- [x] Verificación en navegador de acciones, errores y conversiones con fixtures separados de los datos de desarrollo.
- [x] Comprobación visual y de desbordamiento en móvil, tablet y escritorio.
- [x] Documentación de arranque, contratos, decisiones y limitaciones para evaluación.
- [x] Revisión de textos para una presentación de producto empresarial.
  - Sustituir «Cada suscripción, a medida» por el título funcional «Clientes y presupuestos».
  - Eliminar «Espacio comercial local» y las referencias visibles al entorno local o a una prueba técnica.
  - Utilizar descripciones de acciones y costes que ayuden al usuario, evitando eslóganes de relleno.
  - Conservar «El siguiente presupuesto empieza con un cliente» por indicación expresa del usuario.
  - Mantener las aclaraciones útiles sobre estimaciones, impuestos y conversión de moneda.
- [x] Incorporación de las reglas de redacción a la skill de diseño.
  - Exigir un tono de aplicación empresarial terminada en todos los textos de interfaz.
  - Evitar eslóganes de relleno y referencias a demos, pruebas técnicas o entornos locales.
  - Conservar las advertencias útiles para el usuario y la frase del estado vacío aprobada expresamente.
  - Sincronizar la skill versionable del proyecto y la instalada en Codex.

## Decisiones iniciales

- [x] Creación de Code Coverage Report verificable en HTML y exportación PNG.
  - Ampliar las pruebas a validación, límites y errores de API, host/origen, rate limit, precios, SQLite, formularios, servicios, hooks y estados del frontend.
  - Medir con Vitest 5.1.1 y V8, exigiendo 100% por archivo en líneas, sentencias, funciones y ramas del código funcional.
  - Alcanzar 20 tests correctos, 0 omitidos y 100% de las cuatro métricas, sin exclusiones de lógica de negocio o componentes.
  - Identificar los dos puntos de arranque excluidos y el módulo de reexportación sin instrucciones ejecutables.
  - Corregir el tipo MIME JSON para rechazar prefijos no válidos detectados durante la revisión de seguridad.
  - Generar informe con barras, enlaces al código, alcance, resultados, fecha, huella del código y PNG adjuntable.
  - Volver a ejecutar E2E responsive y compilación como condición para la marca de verificación completada.
  - Aplicar las nuevas retiradas de textos al código y a las pruebas antes de producir el informe final.

- [x] Eliminar los textos «Tu directorio empieza aquí» y «Cambio actualizado» de la interfaz. Mantener la fecha del cambio consultable en el selector, sin un bloque informativo permanente; el enunciado no exige esas frases.

- La plantilla React + JavaScript + Vite es válida para la prueba porque permite crear una interfaz interactiva y responsive, consumir la API propia y consultar una API externa de tipos de cambio.
- JavaScript es suficiente para el reto. TypeScript podría aportar más seguridad y mantenibilidad, pero no es obligatorio según el enunciado.
- La selección de React + Vite cubre el frontend; todavía será necesario definir y construir el backend, la base de datos y los contratos de la API.
- La estructura inicial se ha preparado para que la generación asistida por IA siga límites claros entre presentación, lógica de negocio y acceso a datos.
