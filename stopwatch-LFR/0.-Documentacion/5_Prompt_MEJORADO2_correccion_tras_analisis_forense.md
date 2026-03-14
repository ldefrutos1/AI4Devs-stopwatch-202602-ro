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
- El campo tiene un label visible con for="timeDisplay".

### Botones y flujo
- Set: fija el tiempo mostrado como objetivo. Valida mm ≤ 59 y
  ss ≤ 59 y valor > 00:00:00. Bloquea edición por teclado.
  Muestra toast de confirmación.
- Limpiar: resetea a 00:00:00, desbloquea edición, detiene
  cualquier contador activo.
- Inicio: solo activo tras Set con valor > 00:00:00. Pone el
  display a 00:00:00 y cuenta hacia arriba segundo a segundo.
  Al alcanzar el objetivo muestra toast y detiene el contador.
- Cuenta atrás: solo activo tras Set con valor > 00:00:00.
  Parte del tiempo fijado y descuenta segundo a segundo.
  Al llegar a 00:00:00 muestra toast y detiene el contador.
- Stop: visible únicamente mientras un contador esté activo.
  Detiene el contador sin resetear el display.

### Conversión de tiempo
- Conversiones entre segundos y HH:MM:SS correctas para
  valores mayores o iguales a 1 hora.
- Minutos y segundos nunca superan 59 en el display.

### Feedback
- Indicador de estado con los modos: listo / fijado /
  contando / finalizado.
- Toast para: tiempo fijado, tiempo alcanzado, cuenta atrás
  finalizada, error de validación.

## index.html — contrato de ids

Cada elemento que comparte uso entre HTML (ARIA) y JS
(getElementById) usa UN ÚNICO id. La tabla siguiente es
el contrato que debe respetarse sin excepción:

| Elemento            | id exacto       | Usado en JS como          | Usado en ARIA como             |
|---------------------|-----------------|---------------------------|--------------------------------|
| Input de tiempo     | timeDisplay     | getElementById('timeDisplay') | for del label                |
| Párrafo de hint     | hint            | getElementById('hint')    | aria-describedby="hint"        |
| Dot de estado       | statusDot       | getElementById('statusDot') | —                            |
| Label de estado     | statusLabel     | getElementById('statusLabel') | aria-live en su padre       |
| Barra de progreso   | progressFill    | getElementById('progressFill') | aria-hidden="true"          |
| Región de toasts    | toastRegion     | getElementById('toastRegion') | role="status" aria-live     |
| Fila del botón Stop | stopRow         | getElementById('stopRow') | hidden attribute             |

Reglas adicionales de HTML:
- Ningún elemento tiene más de un atributo id.
- DOCTYPE, charset UTF-8, viewport, meta description, lang="es".
- Estructura semántica: main, section, h1, label+input, botones.
- Iconos SVG inline en los botones, sin dependencias externas.
- Script al final del body.

## script.js
- IIFE con 'use strict'. Sin variables ni funciones fuera del IIFE.
- Estado centralizado en un único objeto con las propiedades:
  digits (array), targetSeconds, mode, intervalId,
  startTimestamp, toastTimeout.
- Los valores de mode son exactamente:
  'idle' | 'set' | 'running-up' | 'running-down' | 'finished'
- updateButtonStates() centraliza el estado de todos los botones,
  el hint y el indicador de estado. Se llama tras cada cambio
  de state.mode.
- El tiempo se calcula con Date.now() en cada tick del intervalo,
  no acumulando un contador de ticks, para evitar deriva.
- Cada getElementById usa exactamente el id de la tabla anterior.

## style.css
- Custom properties en :root para colores, radios y sombras.
- Soporte de prefers-color-scheme: light con un bloque
  @media separado que redefine las variables necesarias.
- @media (prefers-reduced-motion: reduce) desactiva animaciones.
- Responsive funcional desde 320px hasta escritorio.
- Sin Google Fonts ni fuentes externas. System font stack.
- El input de tiempo tiene clases CSS para cada modo:
  display-input--ready, display-input--up,
  display-input--down, display-input--finished.

## Lista de verificación — el modelo debe resolver esto antes
## de escribir la primera línea de código

1. ¿Cada getElementById('x') del JS tiene su id="x" en la tabla?
2. ¿Ningún elemento HTML tiene dos atributos id?
3. ¿Cada aria-describedby="x" apunta a un id de la tabla?
4. ¿El cálculo de tiempo usa Date.now(), no un contador?
5. ¿updateButtonStates() cubre los 5 valores de mode?
6. ¿Las clases CSS del input cubren los 5 valores de mode?