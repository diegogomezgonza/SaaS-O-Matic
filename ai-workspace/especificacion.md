# Especificación de implementación

## Modelos y proceso

Según indicación del candidato: planificación, plantilla y skills con **GPT 5.6 Luna, razonamiento alto**. Desde la implementación funcional: **GPT 6.1 Sol, razonamiento alto**. Es un registro declarado por el usuario, no telemetría comprobada de las sesiones anteriores.

## Alcance y decisiones

- Alta, búsqueda por empresa/NIF, selección y detalle de clientes; email, país y plan obligatorios.
- SQLite real con unicidad por país e identificador fiscal; consultas parametrizadas, claves foráneas y archivo local excluido de Git.
- Simulación: usuarios enteros 0–100000, almacenamiento GB 0–1000000, llamadas API enteras 0–1000000000. Valores no negativos y límites explícitos.
- Planes Starter, Business y Enterprise como etiquetas comerciales: no cambian las tarifas porque el enunciado no define diferencias.
- Almacenamiento y llamadas API se registran sin recargo: no hay precio definido.
- Tramos acumulativos: primeros 10 a 1000 céntimos, siguientes 40 a 800, resto a 500. Impuesto redondeado al céntimo. Backend autoritativo; función pura compartida para la previsualización.
- Países soportados en esta prueba: ES 21%, FR 20%, DE 19%, PT 23%, GB 20%. Catálogo configurable simplificado de simulación, sin casuística fiscal B2B, exenciones ni pretensión de facturación fiscal real. No aceptar países con impuestos desconocidos.
- NIF español: DNI, NIE, NIF especiales K/L/M y entidades con control numérico o alfabético según tipo. Validación matemática no certifica registro ni identidad ante AEAT.
- Histórico inmutable: guardar usuarios, almacenamiento, llamadas, base, impuesto, total y desglose en EUR; convertir solo visualización con fecha del tipo de cambio. Si falla el proveedor, EUR sigue disponible y se ofrece reintento sin inventar tipos.

## Contrato REST

Rutas sin prefijo, coincidiendo exactamente con el enunciado; errores `{ message, fields? }`, sin datos internos. El frontend consume las mismas rutas mediante un proxy limitado a las familias del backend, compartido entre desarrollo, preview y E2E. Las antiguas rutas con `/api` no se mantienen como alias.

- GET `/health`: disponibilidad.
- GET `/catalog`: países, impuestos y planes.
- GET `/customers?q=`: búsqueda literal y limitada, máximo 100 resultados.
- POST `/customers`: `{companyName,taxId,email,country,plan}`, 201; 422 validación, 409 duplicado.
- GET `/customers/:id`: datos de cliente; 404 inexistente.
- GET `/customers/:id/simulations`: histórico descendente.
- POST `/simulations`: `{customerId,users,storageGb,apiCalls}`, 201 con presupuesto calculado en servidor.
- GET `/exchange-rates`: proxy a proveedor fijo HTTPS, respuesta validada y caché con TTL; 503 si falla.

## Arquitectura y seguridad

Frontend: app compone; features poseen hooks, componentes y servicios; shared ofrece cliente HTTP y formatos; componentes UI son reutilizables. Backend: servidor HTTP, router/API, validación, repositorio SQLite y dominio separables. Arranque único de desarrollo, proxy Vite y modo producción local.

Aplicación local enlazada a loopback. Escrituras desde navegador solo mismo origen/orígenes locales permitidos, JSON obligatorio, tamaño de cuerpo limitado, rate limit, cabeceras de seguridad, sin PII en logs ni almacenamiento del navegador. No hay usuarios o autenticación en el enunciado: no exponer a Internet sin autenticación, autorización y HTTPS. No hay envío de datos de clientes al proveedor de cambio.

## Criterios de aceptación

Alta válida persiste al recargar; NIF inválido y duplicado se rechazan; búsqueda y selección funcionan; 15 usuarios producen 140 EUR base; en ES total 169,40 EUR; guardar actualiza histórico; modificar usuarios recalcula; cambio de moneda convierte importes e histórico; fallo externo conserva EUR y permite reintentar. Comprobar estados vacíos, cargas y errores. Probar acciones en navegador y capturas a 390, 768 y 1440 px, sin desbordamiento horizontal y con foco visible.

## Fuentes técnicas

- DNI/NIE: https://www.interior.gob.es/opencms/es/servicios-al-ciudadano/tramites-y-gestiones/dni/calculo-del-digito-de-control-del-nif-nie/
- Composición del NIF de entidades: https://www.boe.es/buscar/act.php?id=BOE-A-2008-3580
- SQLite integrado: https://nodejs.org/api/sqlite.html (requiere Node 22.14 o superior; API experimental en Node 22).
