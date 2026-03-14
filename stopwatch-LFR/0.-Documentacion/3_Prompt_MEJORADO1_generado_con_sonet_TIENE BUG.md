## Prompt mejorado Análisis del prompt y mejoras sugeridas

El prompt tiene una base sólida pero tiene varios puntos que lo harán más efectivo:Problemas actuales:

La sección "Genera imágenes profesionales para los tres botones" es ambigua — un LLM no genera imágenes reales; hay que especificar si se quieren SVG inline, iconos de librería o emojis.
El flujo de "Inicio" en el prompt tiene una contradicción: dice "Convertir el campo Tiempo a segundos" pero Inicio debería arrancar desde 0 hacia el objetivo, no desde el tiempo mostrado.
No se menciona el botón Stop/Pausa, que las tres soluciones analizadas mostraron como carencia importante.
No se especifica qué pasa si el usuario pulsa Inicio sin haber pulsado Set antes.
La nota final sobre conversiones HH:MM:SS debería estar integrada como requisito, no como nota.
Las secciones ### y ## están mezcladas inconsistentemente.

## Prompt mejorado

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
- El campo tiene un label visible asociado.

### Botones y flujo
- **Set**: fija el tiempo mostrado como objetivo en segundos. 
  Bloquea la edición por teclado. Muestra feedback al usuario.
- **Limpiar**: resetea el campo a 00:00:00, desbloquea la edición,
  detiene cualquier contador activo.
- **Inicio**: requiere que se haya pulsado Set previamente con un 
  valor > 00:00:00. Inicializa el display a 00:00:00 y cuenta hacia 
  arriba segundo a segundo. Al alcanzar el tiempo objetivo muestra 
  un mensaje y detiene el contador.
- **Cuenta atrás**: requiere Set con valor > 00:00:00. Parte del 
  tiempo fijado y descuenta segundo a segundo. Al llegar a 00:00:00 
  muestra un mensaje y detiene el contador.
- **Stop**: visible solo mientras un contador esté activo. Detiene 
  el contador sin resetear el display.

### Conversión de tiempo
- Todas las conversiones entre segundos y HH:MM:SS deben ser 
  correctas para valores ≥ 1 hora. Los minutos y segundos nunca 
  deben superar 59.
- Validar que el tiempo introducido tenga mm ≤ 59 y ss ≤ 59 antes 
  de aceptar el Set.

### Feedback al usuario
- Indicador de estado visible (ej: texto o dot de color) que muestre 
  el modo actual: en edición / fijado / contando / finalizado.
- Mensajes de aviso (toast o zona de mensaje) para: tiempo fijado, 
  tiempo alcanzado, cuenta atrás finalizada, error de validación.

## index.html
- DOCTYPE, charset UTF-8, viewport, meta description y lang="es".
- Estructura semántica: main, section, h1, label + input, botones.
- Iconos SVG inline en los botones (sin dependencias externas).
- Atributos ARIA: aria-live en la zona de mensajes, aria-label en 
  el input, aria-describedby para el hint de teclado.
- Script al final del body.

## script.js
- IIFE con 'use strict'.
- Estado centralizado en un único objeto { digits, targetSeconds, 
  isSet, isRunning, mode, intervalId }.
- Función updateButtonStates() que derive el estado de todos los 
  botones y del hint desde el objeto de estado.
- Función updateDisplay() desacoplada del resto de la lógica.
- Cálculo del tiempo mediante Date.now() en lugar de contador de 
  ticks para evitar deriva de setInterval en pestañas en segundo plano.
- Sin variables globales fuera del IIFE.

## style.css
- Custom properties en :root para colores, radios y sombras.
- Diseño oscuro por defecto con soporte de prefers-color-scheme: light.
- prefers-reduced-motion: reduce animaciones si el usuario lo requiere.
- Responsive: funciona en móvil (mínimo 320px) y escritorio.
- Sin dependencias externas (sin Google Fonts): usar system font stack.
- Estados visuales del display según modo (edición, corriendo, 
  finalizado) mediante clases CSS.