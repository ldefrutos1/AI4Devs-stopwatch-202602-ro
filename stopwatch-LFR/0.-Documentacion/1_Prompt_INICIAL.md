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

   
	