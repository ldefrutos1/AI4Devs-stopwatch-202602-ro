# Comparativa de tres soluciones de cronómetro

> Ejercicio: implementar un contador con cuenta ascendente y cuenta atrás, con aviso al alcanzar el tiempo fijado. Tres archivos separados (HTML, JS, CSS) siguiendo buenas prácticas de programación.

---

## Índice

1. [Solución 1: ChatGPT](#solución-1)
2. [Solución 2: Sonet](#solución-2)
3. [Solución 3: Opus](#solución-3)
4. [Tabla comparativa](#tabla-comparativa)
5. [Veredicto final](#veredicto-final)
6. [Punto débil compartido](#punto-débil-compartido)

---

## Solución 1: ChatGPT

**Estilo:** Temporizador profesional con fondo claro, tipografía Inter (Google Fonts) y diseño de tarjeta con glassmorphism suave.

### HTML — Puntos fuertes

- **Semántica excelente:** uso correcto de `main`, `section`, `article`, `header` y `label`.
- **Accesibilidad completa:** `aria-live`, `aria-label`, `aria-describedby`, `aria-atomic`, `role="status"` en el toast.
- **Meta tags correctos:** `charset`, `viewport` y `meta description` presentes.
- **Toast declarado en el HTML** con atributos ARIA correctos (`role="status"` + `aria-atomic="true"`).
- **Textos de ayuda** vinculados al input con `aria-describedby`.

### HTML — Debilidades

- **Dependencia de SVG externos** (`assets/set.svg`, `assets/start.svg`, etc.): si los archivos no están presentes el botón queda sin icono.
- **`input type="text"`** con `inputmode="numeric"`: no garantiza validación de teclado numérico en todos los navegadores.
- **Google Fonts** como dependencia externa: falla sin conexión a internet.
- Sin `lang` de región (`es` en lugar de `es-ES`) ni favicon.

### JavaScript — Puntos fuertes

- **IIFE con `'use strict'`:** scope completamente aislado, sin contaminación del objeto global.
- **Constantes semánticas nombradas:** `MAX_DIGITS`, `ONE_SECOND` — sin *magic numbers*.
- **Funciones pequeñas y con una sola responsabilidad:** `pad`, `formatSecondsToTime`, `digitsToTime`, `lockTimeConfiguration`, `unlockTimeConfiguration`, etc.
- **Gestión de estado coherente:** `stopTimer()` se llama antes de iniciar cualquier nuevo ciclo; el estado de bloqueo (`isLocked`) previene edición durante la ejecución.
- **Validación robusta de entrada:** comprueba minutos y segundos > 59, horas > 99, y tiempo > 0 antes de arrancar.
- **Sistema de feedback dual:** toast con gestión de timeout + indicador de estado con `colorMap` por modo (`ready`, `locked`, `running`, `countdown`).
- **Soporte de teclado:** dígitos numéricos y Backspace correctamente gestionados.

### JavaScript — Debilidades

- **Sin protección contra deriva de `setInterval`:** en pestañas en segundo plano o bajo carga, los ticks se acumulan con retraso. La solución robusta sería anclar con `Date.now()`.
- **Sin botón Stop/pausa:** solo se puede reiniciar completamente con "Limpiar".
- **`digitBuffer` como string:** más frágil que un array de dígitos; la manipulación mediante `slice` es menos legible.
- Sin comentarios JSDoc en las funciones.
- Sin tests.

### CSS — Puntos fuertes

- **Custom properties** (`--bg`, `--primary`, `--danger`, etc.) en `:root` para fácil mantenimiento.
- **`clamp()` y `min()`** para tipografía y ancho responsivos.
- **Tres breakpoints** bien estructurados (820 px, 560 px).
- **Transiciones suaves** en botones con `transform` y `filter`.
- **`focus-visible`** implementado para accesibilidad de teclado.

### CSS — Debilidades

- Sin soporte de **modo oscuro** (`prefers-color-scheme`).
- Sin **`prefers-reduced-motion`** para las animaciones del toast.
- Dependencia de Google Fonts compartida con el HTML.

---

## Solución 2: Sonet

**Estilo:** Industrial-Precision / Dark Luxury. Fondo oscuro casi negro (`#0b0c0f`), tipografía `Share Tech Mono` para el display y `Rajdhani` para la UI, paleta dorada como acento.

### HTML — Puntos fuertes

- **SVG inline en botones:** sin dependencias externas de iconos; los iconos son parte del documento.
- **Botón Stop dinámico:** aparece solo cuando el temporizador está corriendo (`display: none` / `flex` por JS), lo que mejora la UX.
- **Hint de teclado** visible al usuario en todo momento.
- **Comentarios de sección** en el HTML que mejoran la legibilidad del código fuente.

### HTML — Debilidades

- **Accesibilidad muy escasa:** sin `aria-live` en la zona del display, sin `role` en el indicador de modo, sin `aria-describedby`.
- **Semántica débil:** usa `div` y `p` donde `section`, `h1` o `h2` serían semánticamente correctos. El `app-title` es un `<p>`, no un encabezado.
- Sin `meta description`.
- **Google Fonts** como dependencia externa (dos familias: `Rajdhani` y `Share Tech Mono`).

### JavaScript — Puntos fuertes

- **Objeto `state` centralizado:** todo el estado de la aplicación vive en un único objeto literal (`digits`, `setSeconds`, `elapsedSeconds`, `isSet`, `isRunning`, `mode`, `intervalId`). Facilita depuración e inspección.
- **JSDoc en funciones clave:** `secondsToHHMMSS` y `digitsToSeconds` están documentadas con tipos y descripción.
- **Separación en secciones comentadas** con líneas divisorias: Estado, Referencias DOM, Utilidades, Display helpers, Toast, Control de intervalo, Entrada por teclado, Handlers — muy legible.
- **`digits` como Array** con `unshift`/`push`: más idiomático y robusto que la manipulación de strings.
- **Botón Stop funcional:** permite detener el timer sin resetear completamente.
- **Toast creado dinámicamente por JS** (no hardcodeado en HTML): el DOM se mantiene limpio y el toast se elimina del árbol tras mostrarse.

### JavaScript — Debilidades

- **Sin IIFE:** usa `'use strict'` en el nivel de módulo pero sin encapsulación; todas las variables y funciones quedan en el scope global.
- **Sin protección contra deriva de `setInterval`:** mismo problema que Solución 1.
- **Validación incompleta:** no se comprueban minutos o segundos > 59; es posible introducir `00:99:99` sin advertencia.
- **`btnClear` con estado inconsistente:** llama a `resetToIdle()` que ya pone `isSet = false`, y luego vuelve a asignarlo — código redundante.
- Si no se ha hecho Set, `limitSeconds` vale 0 y el cronómetro arranca sin límite sin informar al usuario de forma clara.

### CSS — Puntos fuertes

- **Diseño oscuro completo y coherente:** paleta de variables bien definida con niveles de fondo, borde, acento y semántica de color.
- **Animación del toast con `cubic-bezier` cuidada:** entrada con rebote (`cubic-bezier(0.34, 1.56, 0.64, 1)`) y salida suave.
- **Estados visuales del display** por clase CSS (`editable`, `running-up`, `running-down`, `finished`): el color y el glow cambian según el modo.
- **Variantes de botón** bien separadas por modificador BEM-like (`.btn-primary`, `.btn-danger`, `.btn-ghost`, `.btn-stop`).

### CSS — Debilidades

- Sin **`prefers-reduced-motion`** para la animación del toast y el pulso de `.finished`.
- Sin soporte de **modo claro** (`prefers-color-scheme: light`).
- **`overflow: hidden`** en `body`: puede romper el scroll en móviles si el contenido desborda.

---

## Solución 3: Opus

**Estilo:** Minimalista, fondo oscuro `#0f172a` (Tailwind Slate-900), tipografía del sistema, colores semánticos por función de botón.

### HTML — Puntos fuertes

- **Estructura limpia y mínima:** fácil de leer y mantener; sin divs innecesarios.
- **`h1` semántico** como título principal; `main` como contenedor correcto.
- **SVG inline en botones:** sin dependencias externas de iconos.
- **`title` en cada botón** para tooltip nativo del navegador.

### HTML — Debilidades

- **Sin accesibilidad:** ningún atributo `aria-*`. No hay `aria-live` en el display, ni `role` en el mensaje, ni `aria-label` en el input.
- **Input sin `label` asociado** explícitamente (sin `for`/`id` emparejados o `aria-label`).
- Sin `meta description` ni favicon.
- Sin fuente tipográfica declarada explícitamente (usa `Segoe UI` + system stack, que es aceptable pero no óptimo en todos los sistemas).

### JavaScript — Puntos fuertes

- **IIFE con `'use strict'`:** scope completamente aislado.
- **`digits` como array de 6 posiciones fijas con `shift()` + `push()`:** implementa un buffer circular elegante sin lógica adicional — el patrón más limpio de las tres soluciones para este problema.
- **`updateButtonStates()` centralizado:** función que deriva el estado completo de la UI (botones habilitados/deshabilitados, texto del hint) a partir del estado de la aplicación. Elimina condiciones dispersas en los handlers y sigue el principio de fuente única de verdad para la UI.
- **Botones con `disabled` nativo por estado:** previene acciones inválidas sin condicionales extra en cada handler.
- **Hint dinámico y contextual:** guía al usuario en cada fase (edición, tiempo fijado, en marcha).

### JavaScript — Debilidades

- **Sin validación de mm/ss > 59:** acepta valores como `00:99:99` sin advertencia.
- **Sin protección contra deriva de `setInterval`:** mismo problema compartido con las otras dos soluciones.
- Sin comentarios JSDoc ni comentarios de sección.
- **Sin botón Stop:** no se puede interrumpir el contador sin reiniciar completamente.
- **`var` en lugar de `const/let`** dentro de `digitsToSeconds` y `secondsToDisplay`: inconsistente con el resto del código que usa declaraciones modernas.

### CSS — Puntos fuertes

- **Sin dependencias externas:** usa únicamente fuentes del sistema — 0 peticiones de red adicionales.
- **`:disabled` nativo bien manejado:** la opacidad reducida y `cursor: not-allowed` comunican el estado sin JS adicional.
- **Responsive limpio:** `flex-direction: column` en móvil y botones al 100% de ancho.
- **Colores semánticos por botón:** cada acción tiene su propio color (azul para Set, rojo para Limpiar, verde para Inicio, púrpura para Cuenta atrás).

### CSS — Debilidades

- **Sin custom properties (variables CSS):** todos los colores están hardcodeados; difícil de mantener o temizar.
- Sin **`prefers-reduced-motion`**.
- Sin soporte de **modo oscuro** inverso ni modo claro.
- El sistema de colores con `rgba()` hardcodeado para hover es frágil ante cambios de paleta.

---

## Tabla comparativa

| Criterio | Solución 1: ChatGPT | Solución 2: Sonet | Solución 3:Opus |
|---|---|---|---|
| Semántica HTML | ✅ Excelente | ⚠️ Básica | ✅ Buena |
| Accesibilidad (ARIA) | ✅ Completa | ⚠️ Escasa | ❌ Ausente |
| Encapsulación JS | ✅ IIFE | ❌ Sin IIFE | ✅ IIFE |
| Gestión del estado | ⚠️ Variables sueltas | ✅ Objeto `state` | ⚠️ Variables sueltas |
| Validación de entrada | ✅ Completa (mm/ss/hh) | ⚠️ Parcial | ⚠️ Parcial |
| Documentación (JSDoc) | ❌ No | ✅ Sí | ❌ No |
| Botón Stop / pausa | ❌ No | ✅ Sí | ❌ No |
| Control de UI por estado | ⚠️ Disperso | ⚠️ Parcial | ✅ Centralizado (`updateButtonStates`) |
| Patrón de dígitos | ⚠️ String buffer | ✅ Array con `unshift/push` | ✅ Array con `shift/push` fijo |
| CSS: custom properties | ✅ Completo | ✅ Completo | ❌ Sin variables |
| CSS: animaciones | ✅ Cuidadas | ✅ Cuidadas | ⚠️ Mínimas |
| `prefers-reduced-motion` | ❌ No | ❌ No | ❌ No |
| Modo oscuro CSS | ❌ No | ✅ Solo oscuro | ❌ Solo oscuro |
| Dependencias externas | ❌ Fonts + SVG files | ⚠️ Solo Fonts | ✅ Ninguna |
| Legibilidad del código | ✅ Alta | ✅ Alta | ✅ Alta |

---

## Veredicto final

### 🥇 Ganadora global: Solución 1

La **Solución 1** es la mejor solución considerada globalmente como ejercicio de buenas prácticas de programación, que era el criterio del enunciado. Es la única que aborda todas las dimensiones que componen esa definición:

- HTML semántico **y accesible** — la única con ARIA completo.
- JavaScript encapsulado con funciones bien nombradas, sin *magic numbers* y con validación robusta de entrada.
- CSS mantenible con sistema de custom properties, `clamp()`, `min()` y responsividad cuidada.

### 🥈 Mejor arquitectura JS: Solución 2

La **Solución 2** tiene el JavaScript arquitectónicamente más maduro. Sus dos contribuciones destacadas son el **objeto `state` centralizado** (el patrón más mantenible para gestión de estado en vanilla JS) y la **documentación JSDoc**. Además es la única con botón Stop. Su penalización principal es la ausencia de IIFE, que deja todo en el scope global, y la accesibilidad HTML prácticamente nula.

### 🥉 Mejor patrón de control de UI: Solución 3

La **Solución 3** tiene el patrón más inteligente de una sola pieza: `updateButtonStates()` como función que deriva toda la UI del estado, más el buffer circular de `digits` con `shift/push` de tamaño fijo. Si el criterio fuera únicamente el diseño de la lógica de control, esta sería la ganadora. La ausencia total de accesibilidad, variables CSS y documentación la lastran en el contexto del ejercicio.

---

## Punto débil compartido

Las **tres soluciones** usan `setInterval` con un tick de 1000 ms sin ancla temporal. En pestañas en segundo plano, bajo carga de CPU o en dispositivos lentos, el intervalo se desvía y el contador acumula retraso.

**Solución robusta:**

```javascript
// Al arrancar, guardar el timestamp de inicio
const startTime = Date.now();
const startSeconds = 0; // o el valor de partida

intervalId = setInterval(() => {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  currentSeconds = startSeconds + elapsed;
  updateDisplay(secondsToDisplay(currentSeconds));

  if (currentSeconds >= targetSeconds) {
    stopTimer();
    // ...
  }
}, 250); // tick más frecuente, pero el tiempo calculado es siempre exacto
```

Con este enfoque el tick puede ser impreciso, pero el tiempo mostrado siempre se calcula a partir de la diferencia real de relojes del sistema, eliminando la deriva.

---

*Análisis realizado sobre las tres implementaciones completas (HTML + JS + CSS) evaluando semántica, accesibilidad, arquitectura JavaScript, calidad del CSS y robustez general.*
