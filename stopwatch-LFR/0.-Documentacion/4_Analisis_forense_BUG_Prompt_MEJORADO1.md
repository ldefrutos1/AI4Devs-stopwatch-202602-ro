## Análisis forense: por qué el prompt mejorado generó un bug que el original no tenía

La causa raíz no está en el prompt
El bug no fue causado por el prompt mejorado. Fue causado por un error de generación que el prompt mejorado, paradójicamente, hizo más probable al añadir complejidad de ARIA. La cadena causal es esta:

1. El prompt mejorado añadió requisitos de accesibilidad ARIA detallados:
# Del prompt mejorado:
aria-live en la zona de mensajes
aria-label en el input
aria-describedby para el hint de teclado
2. El modelo generó dos IDs distintos para el mismo elemento al intentar satisfacer simultáneamente aria-describedby="keyboardHint" (nombre semántico descriptivo) e id="hint" (nombre corto para el JS). Ambos eran correctos individualmente, pero colisionaron en el mismo elemento:
html<!-- BUG: dos id en el mismo elemento -->
<p id="keyboardHint" class="hint" aria-live="polite" id="hint">
3. El JS usaba getElementById('hint') → devuelve null porque el navegador solo registra el primer id. El segundo se ignora silenciosamente. Ningún error en consola de HTML, solo un crash en runtime cuando el JS intenta hint.textContent = ....
4. El prompt original (simple) no tenía este problema porque no pedía ARIA, así que el modelo generó un único id="hint" sin tensión entre nombres:
html<!-- Sol.3 original: un solo id, sin conflicto -->
<p id="hint" class="hint">Pulsa teclas numéricas...</p>
```

---

### El patrón de fallo: complejidad → tensión entre requisitos → error silencioso

Este es un patrón conocido en la generación de código con LLMs. Cuando el prompt añade requisitos que interactúan entre sí (en este caso, un nombre semántico para ARIA + un nombre corto para JS sobre el mismo elemento), el modelo los satisface por separado sin detectar la colisión entre ellos. El HTML no lanza error, el JS tampoco hasta el primer uso, y el fallo es completamente silencioso.
```
Prompt simple     →  1 requisito por elemento  →  sin tensión  →  sin bug
Prompt complejo   →  2 requisitos por elemento →  tensión       →  id duplicado
```

---

### ¿Hay que corregir el prompt?

**El prompt mejorado está bien.** El requisito de `aria-describedby` es correcto y debe mantenerse. Lo que hay que añadir son **reglas de contrato** que prevengan este tipo de colisión silenciosa. Hay dos tipos de corrección:

**Tipo A — Eliminar la ambigüedad de nombres** especificando que el mismo elemento usa el mismo `id` para ARIA y para JS:
```
El elemento hint (<p>) debe tener id="hint" y ser referenciado
como aria-describedby="hint" en el input. Un solo id, usado
en ambos contextos.
```

**Tipo B — Añadir una lista de verificación explícita al final del prompt** que el modelo debe ejecutar antes de entregar el código:
```
## Lista de verificación obligatoria antes de entregar
Antes de generar el código final, verifica internamente:
1. Ningún elemento HTML tiene más de un atributo id.
2. Cada getElementById('x') en el JS tiene exactamente
   un elemento con id="x" en el HTML, mismo nombre exacto.
3. Cada aria-describedby="x" apunta a un id="x" que existe.
4. Ninguna variable DOM puede valer null en su primer uso.
```

El Tipo B es más robusto porque cubre cualquier variante de este mismo patrón de fallo, no solo el caso concreto del hint.

---

### Prompt corregido

Solo se añade la sección de verificación al final. El resto del prompt mejorado permanece intacto porque era correcto:
```
Crea una aplicación web de cronómetro en tres ficheros separados
(index.html, script.js, style.css) siguiendo estrictamente las
buenas prácticas de desarrollo web: semántica HTML5, accesibilidad
ARIA, CSS con custom properties y JavaScript encapsulado en IIFE
con 'use strict'. La interfaz debe ser profesional y minimalista.

## Requisitos funcionales

### Campo de tiempo
- Input de solo lectura con formato HH:MM:SS, valor inicial 00:00:00.
- Mientras no se haya pulsado Set, cada vez que el usuario pulse
  una tecla numérica los dígitos se desplazan hacia la izquierda
  (buffer circular de 6 dígitos). Backspace elimina el último dígito.
- El campo tiene un label visible asociado con for/id correctos.

### Botones y flujo
- Set: fija el tiempo mostrado como objetivo en segundos.
  Bloquea la edición por teclado. Muestra feedback al usuario.
- Limpiar: resetea el campo a 00:00:00, desbloquea la edición,
  detiene cualquier contador activo.
- Inicio: requiere Set con valor > 00:00:00. Inicializa el display
  a 00:00:00 y cuenta hacia arriba segundo a segundo. Al alcanzar
  el tiempo objetivo muestra un mensaje y detiene el contador.
- Cuenta atrás: requiere Set con valor > 00:00:00. Parte del
  tiempo fijado y descuenta segundo a segundo. Al llegar a 00:00:00
  muestra un mensaje y detiene el contador.
- Stop: visible solo mientras un contador esté activo. Detiene
  el contador sin resetear el display.

### Conversión de tiempo
- Todas las conversiones entre segundos y HH:MM:SS deben ser
  correctas para valores ≥ 1 hora. Los minutos y segundos nunca
  deben superar 59.
- Validar mm ≤ 59 y ss ≤ 59 antes de aceptar el Set.

### Feedback al usuario
- Indicador de estado (texto o dot de color) con los modos:
  en edición / fijado / contando / finalizado.
- Toast para: tiempo fijado, tiempo alcanzado, cuenta atrás
  finalizada, error de validación.

## index.html
- DOCTYPE, charset UTF-8, viewport, meta description, lang="es".
- Estructura semántica: main, section, h1, label+input, botones.
- Iconos SVG inline en los botones (sin dependencias externas).
- ARIA: el párrafo de hint tiene id="hint". El input tiene
  aria-describedby="hint". La zona de mensajes tiene aria-live.
  Un solo id por elemento, reutilizado en JS y en aria-describedby.
- Script al final del body, sin defer ni async necesario.

## script.js
- IIFE con 'use strict'.
- Estado centralizado en un único objeto.
- updateButtonStates() que derive el estado de todos los botones
  y del hint desde el objeto de estado.
- Tiempo calculado con Date.now() para evitar deriva de setInterval.
- Sin variables ni funciones fuera del IIFE.
- Cada getElementById usa exactamente el mismo id que aparece
  en el HTML, sin alias ni renombrados.

## style.css
- Custom properties en :root para colores, radios y sombras.
- Diseño oscuro con soporte de prefers-color-scheme: light.
- prefers-reduced-motion respetado en animaciones.
- Responsive desde 320px. Sin Google Fonts ni fuentes externas.
- Estados visuales del display por clase CSS según modo.

## Lista de verificación — ejecutar antes de entregar el código
1. Ningún elemento HTML tiene más de un atributo id.
2. Cada getElementById('x') del JS tiene exactamente un
   elemento con id="x" en el HTML, mismo nombre exacto.
3. Cada aria-describedby="x" apunta a un id="x" existente.
4. Ninguna variable DOM referenciada en JS puede ser null
   en su primer uso.
5. El setInterval usa Date.now() para calcular el tiempo,
   no un contador de ticks.
6. La función updateButtonStates() cubre todos los modos
   posibles del estado sin dejar ramas sin tratar.
La diferencia clave respecto al prompt anterior está en la sección ARIA del HTML, que ahora especifica explícitamente el nombre del id y cómo debe reutilizarse, y en la lista de verificación final que fuerza al modelo a hacer una pasada de coherencia antes de entregar.