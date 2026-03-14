# Análisis Forense — Aplicación Web Cronómetro


**Proyecto:** Aplicación web Cronómetro (`index.html` / `style.css` / `script.js`)
**Incidencias documentadas:** 2

---

## Incidencia #1 — SVG decorativos sin ocultar a lectores de pantalla

### Síntoma reportado

Durante la revisión del código generado se detectó que los SVG inline de los botones carecían del atributo `aria-hidden`, lo que implicaba un problema de accesibilidad ARIA: los lectores de pantalla anunciaban el contenido gráfico redundante además del texto visible del botón.

### Diagnóstico: causa raíz

En la versión inicial, el SVG del logo decorativo del encabezado y el SVG del botón de borrado del teclado se incluyeron sin ningún atributo de accesibilidad:

```html
<!-- Logo decorativo — versión inicial -->
<div class="logo-mark">
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="22" r="14" stroke="currentColor" stroke-width="2"/>
    ...
  </svg>
</div>

<!-- Botón de borrado — versión inicial -->
<button class="key key-del" id="delKey" aria-label="Borrar">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ...>
    ...
  </svg>
</button>
```

Un lector de pantalla (NVDA, JAWS, VoiceOver) procesa el árbol de accesibilidad de arriba a abajo. Sin `aria-hidden="true"`, cada `<svg>` se convierte en un nodo accesible que el lector intenta describir. En los botones con texto visible esto produce anuncios duplicados o confusos: el lector anuncia el SVG como elemento gráfico sin nombre significativo y después anuncia la etiqueta de texto del botón.

El patrón concreto de fallo para cada tipo de elemento era:

| Elemento | Problema |
|----------|----------|
| Logo decorativo en `<header>` | SVG sin propósito semántico expuesto al árbol de accesibilidad |
| SVG dentro de `<button>` con texto visible | El icono era anunciado como gráfico sin nombre antes del texto del botón |
| SVG dentro de `<button>` sin texto visible (`key-del`) | El botón tenía `aria-label="Borrar"` correcto en el `<button>`, pero el SVG interior podía interferir con el cálculo del nombre accesible en algunos navegadores |

### Corrección aplicada

Se añadió `aria-hidden="true"` a todos los SVG cuya función es exclusivamente decorativa o redundante con el texto visible adyacente. Dado que la corrección se realizó simultáneamente con la migración a SVG inline (Incidencia #2), los atributos quedaron incorporados en el nuevo marcado:

```html
<!-- Logo decorativo — versión corregida -->
<div class="logo-mark">
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"
       aria-hidden="true">
    ...
  </svg>
</div>

<!-- Botón con texto visible — versión corregida -->
<button class="btn btn-start" id="btnStart" title="Iniciar cronómetro ascendente">
  <svg class="btn-icon" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round"
       aria-hidden="true">
    ...
  </svg>
  <span>Inicio</span>
</button>
```

La regla aplicada es estándar en accesibilidad web: cuando un SVG es puramente decorativo o su información ya está expresada por un texto visible adyacente, debe ocultarse del árbol de accesibilidad con `aria-hidden="true"` para evitar ruido en la experiencia de usuarios con lectores de pantalla.

### Prompt que desencadenó la corrección

> _"Los iconos no se ven, parece un problema de ruta relativa en el índice."_

Aunque el prompt estaba centrado en el problema visual de rutas, la reescritura del marcado que requirió la solución (migración a SVG inline) ofreció la oportunidad de introducir correctamente `aria-hidden="true"` en todos los SVG del documento.

---

## Incidencia #2 — Iconos no visibles por rutas relativas a ficheros externos

### Síntoma reportado

> _"Los iconos no se ven, parece un problema de ruta relativa en el índice."_

Los cuatro botones de control (**Set**, **Limpiar**, **Inicio**, **Cuenta atrás**) aparecían sin icono, mostrando únicamente la etiqueta de texto.

### Diagnóstico: causa raíz

#### Mecanismo de carga original

En la versión inicial los iconos se referenciaban mediante etiquetas `<img>` con rutas relativas a ficheros SVG externos:

```html
<button class="btn btn-set" id="btnSet">
  <img src="icons/icon-set.svg" alt="" class="btn-icon" />
  <span>Set</span>
</button>
```

Los cuatro ficheros SVG se generaron correctamente y se alojaron en una subcarpeta `icons/`:

```
/
├── index.html
├── style.css
├── script.js
└── icons/
    ├── icon-set.svg
    ├── icon-clear.svg
    ├── icon-start.svg
    └── icon-countdown.svg
```

#### Por qué fallaba

La ruta `src="icons/icon-set.svg"` es **relativa al documento HTML**. Para que el navegador la resuelva correctamente deben cumplirse dos condiciones simultáneamente:

| Condición | Detalle |
|-----------|---------|
| El HTML debe servirse desde un servidor HTTP | Con `file://` muchos navegadores bloquean peticiones a recursos locales por política de seguridad (CORS / same-origin) |
| La carpeta `icons/` debe estar en el mismo nivel que `index.html` | Si el HTML se abre desde una ubicación diferente a donde están los SVG, la ruta relativa apunta al vacío |

En el entorno de previsualización del asistente, `index.html` se renderiza de forma aislada, sin que la carpeta `icons/` acompañe al documento. El navegador solicita `icons/icon-set.svg`, no lo encuentra, y muestra el espacio en blanco del `<img>` roto.

### Corrección aplicada

Se eliminaron las cuatro etiquetas `<img>` y los cuatro ficheros SVG externos. El código vectorial de cada icono se incrustó directamente dentro del botón correspondiente usando etiquetas `<svg>` nativas:

```html
<!-- ANTES -->
<button class="btn btn-set" id="btnSet">
  <img src="icons/icon-set.svg" alt="" class="btn-icon" />
  <span>Set</span>
</button>

<!-- DESPUÉS -->
<button class="btn btn-set" id="btnSet">
  <svg class="btn-icon" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round"
       aria-hidden="true">
    <circle cx="11" cy="12" r="8"/>
    <polyline points="11 8 11 12 14 14"/>
    <line x1="17" y1="3" x2="21" y2="7"/>
    <line x1="21" y1="3" x2="17" y2="7"/>
  </svg>
  <span>Set</span>
</button>
```

Se aplicó el mismo patrón a los otros tres botones:

| Botón | Icono inline |
|-------|-------------|
| **Set** | Reloj con líneas de anclaje (×) |
| **Limpiar** | Flecha de reinicio circular |
| **Inicio** | Círculo con triángulo de play |
| **Cuenta atrás** | Reloj con flecha descendente |

#### Ventajas del SVG inline frente a `<img src="...">`

| Aspecto | `<img src="...">` | SVG inline |
|---------|-------------------|------------|
| Dependencias externas | ✗ Requiere ficheros adicionales | ✓ Ninguna |
| Funciona con `file://` | ✗ Bloqueado en muchos navegadores | ✓ Siempre |
| Hereda color CSS (`currentColor`) | ✗ No | ✓ Sí — se adapta al color del botón |
| Control de accesibilidad (`aria-hidden`) | Limitado | ✓ Total |
| Cacheable por separado | ✓ Sí | ✗ No (impacto menor) |
| Complejidad de despliegue | Alta — requiere mantener estructura de carpetas | Baja — un único fichero autocontenido |

Para iconos de interfaz en número reducido, el SVG inline es la práctica recomendada precisamente por su independencia total de rutas y ficheros externos.

### Prompt que desencadenó la corrección

> _"Los iconos no se ven, parece un problema de ruta relativa en el índice."_

Este prompt fue suficiente para identificar el vector del fallo (ruta relativa → dependencia de ficheros externos no disponibles en el entorno de previsualización) y aplicar la solución definitiva sin ambigüedad.

---

## Estado final del proyecto

| Fichero | Estado | Cambios |
|---------|--------|---------|
| `index.html` | ✅ Corregido | SVG de iconos incrustados inline con `aria-hidden="true"` |
| `style.css` | ✅ Sin cambios | La clase `.btn-icon` es compatible con `<img>` y `<svg>` |
| `script.js` | ✅ Sin cambios | Sin impacto de las incidencias visuales o de accesibilidad |
| `icons/` | ⚠ Obsoleta | La carpeta y sus SVG ya no son necesarios |

---

## Lecciones aprendidas

**Sobre la arquitectura de assets:** los recursos externos (imágenes, fuentes locales, scripts) crean dependencias de estructura de directorios que pueden romperse en entornos de previsualización aislados. Para aplicaciones HTML autocontenidas pequeñas, incrustar recursos críticos inline elimina esa clase de fallos por completo.

**Sobre accesibilidad:** añadir `aria-hidden="true"` a SVG decorativos no es opcional en producción. Los lectores de pantalla exponen cualquier nodo no ocultado explícitamente, generando ruido en la experiencia de usuarios con discapacidad visual. La regla es simple: si el SVG no aporta información que no esté ya en el texto visible adyacente, debe ocultarse del árbol de accesibilidad.

**Sobre la relación entre incidencias:** ambas correcciones se resolvieron en un único cambio de código porque el fallo de rutas relativas (Incidencia #2) obligó a reescribir el marcado de los botones, lo que a su vez permitió incorporar los atributos ARIA correctos (Incidencia #1) en la misma operación.
