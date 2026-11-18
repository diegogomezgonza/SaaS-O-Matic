# Prompts seleccionados de la conversación

Selección de instrucciones reales del usuario, en orden de conversación. Se han corregido ortografía, puntuación y escapes de formato conservando el sentido de cada petición. No es una transcripción íntegra ni incluye respuestas generadas. La selección sigue las indicaciones del usuario; las denominaciones históricas se conservan cuando formaban parte del mensaje original.

## 1. Registro del proceso y elección del frontend

> Quiero que, antes de nada, creemos un archivo Markdown que vaya guardando los pasos a seguir que te voy dando, para poder adjuntárselo a ellos aparte del resultado. Quiero que lo escribas de forma que sea una lista de acciones, por ejemplo: «Planteamiento y planificación del proyecto».
>
> Como primer paso, dime si una plantilla con React y JavaScript usando Vite nos serviría para lo que se pide.

## 2. Plantilla y estructura de carpetas

> Perfecto, genera entonces una carpeta sobre la que crear el proyecto. Para el nombre, usa `client-register`, y quiero que apliques la estructura de carpetas y archivos de la forma en que un sénior lo haría, para que la generación del código sea limpia y siempre siga una misma estructura. Cuando esté lista la plantilla de Vite, avísame.

## 3. Investigación del sistema de estilos

> Antes de nada, para los estilos, quiero que investigues frameworks gratuitos de CSS que puedan dar un estilo moderno y que encaje con lo que se pide para este desarrollo. Dime qué opciones ves y por qué pueden encajar. No lo pongas en el proyecto todavía; por ahora hagamos esta clasificación simplemente.

## 4. Elección e integración del sistema visual

> Vayamos con Tailwind CSS + shadcn/ui, entonces. Aplícalo en el proyecto antes de continuar con los siguientes pasos.

## 5. Skills de calidad, seguridad y diseño

> Perfecto. Ahora hagamos lo siguiente: según las buenas prácticas de Codex para generar skills para proyectos concretos, analizando lo que se pide, evalúa si lo que te pido es eficaz y correcto. Si es así, hazlo y, al terminar, dime cómo has puesto cada skill:
>
> - Una skill para mantener siempre la calidad del código, con un enfoque como el que tendría un sénior, manteniendo la estructura y poniendo comentarios donde corresponda para dejar un código claro y adecuado para mostrar a otros compañeros. En esta misma skill debes aplicar también conceptos de ciberseguridad que protejan la aplicación, ya que en el proyecto se tratan datos de clientes.
> - Otra skill para que el estilo de la página se mantenga moderno y responsive, sin los elementos típicos del estilo generado por IA, y que haga un uso inteligente del framework de CSS que tiene.

## 6. Modelos, implementación y revisión funcional

> Hasta entonces hemos estado usando GPT 5.6 Luna en alto. Déjalo apuntado en las pruebas.
>
> Ahora, para la ejecución y generación del código, vamos a usar GPT 6.1 Sol en alto. Quiero que revises los requisitos que tiene que tener la aplicación para dejar hechos todos sus apartados. Cuando ya esté todo hecho, quiero que revises la funcionalidad de las acciones de la página y que compruebes que la página sea responsive y se vea bien en ordenador y móvil. Cuando tengas todo esto, ya pasamos a lo siguiente que te ordene.

## 7. Revisión de eslóganes y referencias al entorno

> Vale, quiero que elimines los textos típicos que genera la IA, que son como eslóganes. Muchas veces se generan frases de ese tipo, como la que te acabo de ver: «Cada suscripción, a medida». Esas frases que no ofrecen nada, quítalas.
>
> Veo otra, por ejemplo, que es «El siguiente presupuesto empieza con un cliente». La eliminaría también. Bueno, de hecho, no: esa última no la elimines, pero la primera que te he dicho sí. Son frases que se nota demasiado que están generadas por IA. No sé cómo explicarlo.
>
> Luego, la frase «Espacio comercial local» quítala, porque piensa que yo esto se lo tengo que entregar a una empresa para que lo evalúen como si fuera una aplicación que yo fuera a darle a un cliente real. Tiene que tener un aspecto de aplicación de producción. No puede haber referencias a que sea una especie de proyecto de demostración de un desarrollador en local. Tiene que ser lo que se le entregaría a una empresa, por mucho que esté en local y que en el fondo sepamos que no va a ir más allá. Entonces, haz lo siguiente.

## 8. Incorporación de las reglas de redacción a la skill

> Añade estas indicaciones a la skill de diseño para que no vuelvan a aparecer eslóganes de relleno ni referencias a que es una demo o una prueba local. Quiero que todos los textos tengan un tono de aplicación de producción.

## 9. Tests e informe de cobertura

> Code Coverage Report
>
> Tenemos que hacerlo de la siguiente forma: debemos crear tests para los apartados de la aplicación en los que tenga sentido hacerlo, para asegurarnos de que a nivel de seguridad y funcionalidad funciona completamente. Hasta que este informe de cobertura no esté todo en verde, con las barras indicando que está completamente bien, no pares de generar tests hasta que se cumpla todo esto.
>
> Me gustaría que este informe de cobertura se pudiera levantar en un HTML que también esté dentro del proyecto, para que ellos lo puedan ver. Mi idea es que, cuando ya esté todo esto, se pueda exportar, por ejemplo, a PNG para poder enviárselo. Entonces, hazlo así.

## 10. Ajustes adicionales de textos

> Vale, ahora también quiero que elimines los siguientes textos. Por un lado, el texto «Tu directorio empieza aquí», elimínalo. El de «Cambio actualizado» también. Si alguna de las cosas que te estoy pidiendo quitar se indica que debe estar en el proyecto, no la quites; por si acaso, ya te lo digo. Pero el texto «Cambio actualizado» quítalo también.
>
> Y ya está. Por ahora, esto que te comento. También me gustaría hacer una cosa… Bueno, no, por ahora eso: esos textos, porque por lo general el resto está todo bien. Entonces, haz lo siguiente y ya está.

## 11. Ubicación del registro del proceso

> El Markdown `proceso-prueba` mételo en la carpeta del proyecto.

## 12. Espacio de trabajo con IA para la entrega

> Asegúrate de cumplir este punto:
>
> **3. Entregables: Tu espacio de trabajo con IA**
>
> No nos envíes únicamente el código final funcionando en un repositorio público de GitHub. Para nosotros, el valor real reside en el proceso de ingeniería. Queremos ver cómo diseñas, planificas e interactúas con los modelos de IA.
>
> Junto con el código del proyecto, debes incluir en la raíz de tu repositorio una carpeta llamada `/ai-workspace` (o el nombre que prefieras). La estructura es 100% libre.
>
> La carpeta debe servirnos para entender cómo has gestionado estas tres dimensiones:
>
> **1. Planificación de funcionalidades y specs (Spec-Driven Development)**
>
> - Queremos ver cómo desglosaste las reglas de negocio, los contratos de la API y las validaciones antes de empezar a programar.
> - Compártenos las especificaciones, prompts estructurados o planes de acción que diseñaste para guiar a la IA en la creación de las diferentes funcionalidades del sistema.
>
> **2. Definición de la arquitectura**
>
> - Muestra cómo planteaste la estructura de la base de datos y la organización de carpetas del proyecto.
> - Explícanos qué directrices le diste a la IA, o cómo configuraste tu entorno, para asegurar que el código final siguiera patrones limpios y modulares, evitando que generara código desorganizado o archivos masivos difíciles de mantener.
>
> **3. El proceso de «Vibe Coding» y control de calidad**
>
> - Interacción real: déjanos ver cómo fue el desarrollo iterativo con la IA. Internamente utilizamos Claude, pero puedes utilizar el que prefieras. Puedes adjuntar capturas de prompts clave, hilos de conversación o notas.
>
> Puedes sacar de esta conversación los prompts que te he ido dando.

## 13. Inventario y limpieza de la aplicación

> Ahora quiero que listes todos los archivos de la aplicación y elimines los que no tengan uso o no tengan sentido, ya que en la generación de plantillas con Vite se pueden haber generado archivos innecesarios.
