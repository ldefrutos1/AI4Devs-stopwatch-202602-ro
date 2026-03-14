# ⏱️ Evaluación iterativa de prompts y soluciones para un cronómetro web

![Estado](https://img.shields.io/badge/estado-completado-success)
![Soluciones](https://img.shields.io/badge/soluciones-5-blue)
![Prompts](https://img.shields.io/badge/prompts-3-purple)
![Resultado](https://img.shields.io/badge/ganadora-Soluci%C3%B3n%205-brightgreen)

> Proceso de generación, comparación y refinamiento de prompts para obtener una solución web más robusta, mantenible y usable.

---

## ✨ Visión general

Este repositorio resume un proceso iterativo de:

- **definición manual de prompt**
- **generación de soluciones con tres LLMs**
- **comparación técnica de las soluciones**
- **refinamiento del prompt con IA**
- **generación de soluciones con dos LLMs y prompt refinado**
- **análisis forense de bugs**
- **selección final de la mejor solución**

El objetivo fue construir una aplicación web de cronómetro con **cuenta ascendente**, **cuenta atrás** y **aviso al alcanzar el tiempo fijado**, siguiendo buenas prácticas de desarrollo web.  
La evaluación final concluye que la **Solución 5: ChatGPT con el prompt refinado** es la alternativa más completa a nivel técnico global. 

**En la iteración Solución 4 (prompt refinado con Sonet) es muy reseñable que la solución final del LLM aunque tiene un mayor impacto visual (es probablemente la más atractiva) perdió calidad respecto a propuestas intermedias, llegando incluso a estar por debajo de soluciones generadas con el prompt inicial sin refinar**.

Tras el análisis se ejecuto el prompt final de nuevo en ChatGPT y en Opus y se analizó el resultado; manteniendose como mejor solución ChatGPT.

---

## 🧭 Proceso seguido

### 1. 📝 Prompt inicial
Se creó un primer prompt orientado a una aplicación sencilla pero profesional, dividida en tres ficheros (`index.html`, `script.js`, `style.css`) y con soporte para cronometraje ascendente y descendente.

### 2. 🤖 Generación de soluciones 1, 2 y 3
Con ese prompt se generaron tres implementaciones mediante tres LLM distintos, buscando observar diferencias en estructura, accesibilidad, validación, control del estado y presentación visual. 

### 3. 🔎 Comparativa inicial
La primera comparativa permitió detectar:
- diferencias en encapsulación JavaScript
- validación desigual
- uso de dependencias externas
- problemas potenciales de deriva temporal con `setInterval`


### 4. 🛠️ Refinamiento del prompt
Se generó un **Prompt MEJORADO1** para endurecer requisitos de accesibilidad, estructura y control de estados.  
Tras detectar un bug, se realizó un análisis forense que reveló una colisión silenciosa entre requisitos ARIA y referencias JavaScript.

Como resultado, se construyó un **Prompt MEJORADO2**, añadiendo:
- contrato explícito de `id`
- reglas de coherencia
- checklist previa a la generación


### 5. 🚀 Generación de soluciones 4 y 5
Con **Prompt MEJORADO2** se generaron dos nuevas soluciones con dos IAs distintas. Estas versiones elevaron la calidad visual y técnica, aunque también incrementaron el coste de iteración, especialmente en la solución 5. 

### 6. 📊 Comparativa final
La evaluación final se realizó con criterios homogéneos: mantenibilidad, robustez funcional, buenas prácticas, code smells, riesgo de bugs futuros y coste real de iteración.

**Ranking final:**
1. **Solución 5: ChatGPT con prompt MEJORADO**
2. **Solución 1: ChatGPT**
3. **Solución 3: Opus**
4. **Solución 2: Sonet**
5. **Solución 4: Sonet con prompt MEJORADO**

---

## 🏁 Resultado final

> **Solución seleccionada:** **Solución 5**

### Motivos principales
- mejor equilibrio entre robustez, mantenibilidad y acabado visual
- mayor madurez técnica tras el refinamiento del prompt
- mejor comportamiento comparativo frente al resto de alternativas

Como alternativa conservadora y de bajo riesgo, la **Solución 1** también queda bien posicionada. 

---

## 🔍 Hallazgos clave

- El **prompt inicial** era funcional, pero dejaba ambigüedades relevantes en iconografía, flujo y validación. 
- **Prompt MEJORADO1** aumentó la precisión, pero también generó tensión entre requisitos, provocando un bug silencioso. 
- **Prompt MEJORADO2** mejoró claramente la fiabilidad al introducir un contrato de ids y una checklist obligatoria.  
- El refinamiento visual no siempre compensa el coste adicional de iteración; solo lo hizo claramente en la **Solución 5**. 

---

## 📋 Tabla resumen de soluciones

| Solución | Herramienta usada |
|---|---|
| Solución 1 | ChatGPT |
| Solución 2 | Web Claude: Sonet |
| Solución 3 | Opus (desde Cursor) |
| Solución 4 | Web Claude: Sonet  |
| Solución 5 | ChatGPT |

---

## 🎯 Aprendizajes

### ✅ Buenas prácticas que aportaron valor
- comparar varias soluciones desde un mismo prompt
- reforzar requisitos con reglas verificables
- incorporar checklist previa a la generación
- evaluar no solo funcionalidad, sino también mantenibilidad y riesgo

### ⚠️ Riesgos detectados
- más detalle en el prompt no implica automáticamente menos errores
- requisitos cruzados sin contrato explícito pueden provocar bugs silenciosos
- el sobre-refinamiento visual puede aumentar mucho el tiempo de ajuste

## ✅ Conclusión

La calidad del resultado final no dependió solo del modelo utilizado, sino del **nivel de precisión del prompt** y de la capacidad de transformar ambigüedades en **reglas verificables**.


Es **MUY IMPORTANTE la verificación de los pasos intermedios**, el LLM puede mejorar ciertos aspectos (como el visual) empeorando significativamente otros aspectos de generaciones previas.

La transición desde el prompt inicial hasta **Prompt MEJORADO2** incrementó la fiabilidad de generación y mejoró la comparación entre soluciones. Como cierre del proceso, la **Solución 5** queda seleccionada como referencia final. 

---

## 🧾 Prompts utilizados

> Despliega cada bloque para consultar los prompts empleados en el proceso.

<details>
<summary><strong>📄 Prompt inicial</strong></summary>

```md
Necesito una pagina web que me permita cronometrar tiempos, tanto en sentido ascendente como en sentido descendente (cuanta atrás), quiero que la pagina esté desarrollada siguiendo las bunas practicas del desarrollo web y que tenga una apariencia profesional pero manteniendo la aplicación lo simple, sin complejidades.

###Ficheros esperados
   ### index.html
   - Input text "Tiempo" read only con el formato HH:MM:SS contendrá el tiempo a cronometrar, se actualiza cuando el usuario pulsa un número en el teclado y no se ha pulsado aún Set
   - Botón Set: fija el temporizador con el valor del campo Tiempo en segundos, al pulsarlo deja de actualizarse el campo Tiempo cuando el usuario pulse un número
   - Botón Limpiar:`pone el Tiempo a 00:00:00 y habilita la modificación cuando el usuario pulsa un número
   - Botón Cuenta atras: empieza la cuenta atrás
   - Botón inicio:  al pulsarlo el campo Tiempo se inicializa a 00:00:00 y empieza a cronometrar
   ## script.js
   - Contiene el código js asociado a la funcionalidad
   - Cuando se pulse Inicio debe:
    1.- Convertir el campo Tiempo a segundos
    2.- Poner el campo tiempo a 00:00:00
    3.- Lanzar un proceso que vaya actualizado el campo tiempo de segundo en segundo
    4.- Cuando se llegue al tiempo establecido debe mostrar un mensaje
  - Cuando se pulse Inicio Cuenta atras:
    1.- Convertir el campo Tiempo a segundos
    2.- Lanzar un proceso que vaya actualizado el campo tiempo de descontando de segundo en segundo
    3.- Cuando se llegue a 00:00:00 debe mostrar un mensaje
   ## style.css
   - Busca estilos sencillos pero muy profesionales

   ## Genera imágenes profesionales para los tres botones
   ## NOTA: asegurate de realizar correctamente las conversiones a HH:MM:SS cuando se vaya incrementando o decrementando el tiempo; el usuario debe veer en todo momento el tiempo transcurrido
```

</details>

<details>
<summary><strong>📄 Prompt MEJORADO1</strong></summary>

```md
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
```

</details>

<details>
<summary><strong>📄 Prompt MEJORADO2</strong></summary>

```md
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
6. ¿Las clases CSS del input cubren los 5 valores de mode?```

</details>

---

