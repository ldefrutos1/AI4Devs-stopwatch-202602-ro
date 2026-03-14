(function () {
  "use strict";

  const tiempoInput = document.getElementById("tiempo");
  const hint = document.getElementById("hint");
  const mensaje = document.getElementById("mensaje");
  const btnSet = document.getElementById("btnSet");
  const btnLimpiar = document.getElementById("btnLimpiar");
  const btnInicio = document.getElementById("btnInicio");
  const btnCuentaAtras = document.getElementById("btnCuentaAtras");

  let digits = [0, 0, 0, 0, 0, 0];
  let isSet = false;
  let isRunning = false;
  let targetSeconds = 0;
  let currentSeconds = 0;
  let timerInterval = null;

  function digitsToDisplay() {
    return (
      digits[0] + "" + digits[1] + ":" +
      digits[2] + "" + digits[3] + ":" +
      digits[4] + "" + digits[5]
    );
  }

  function digitsToSeconds() {
    var h = digits[0] * 10 + digits[1];
    var m = digits[2] * 10 + digits[3];
    var s = digits[4] * 10 + digits[5];
    return h * 3600 + m * 60 + s;
  }

  function secondsToDisplay(totalSecs) {
    var h = Math.floor(totalSecs / 3600);
    var m = Math.floor((totalSecs % 3600) / 60);
    var s = totalSecs % 60;
    return (
      String(h).padStart(2, "0") + ":" +
      String(m).padStart(2, "0") + ":" +
      String(s).padStart(2, "0")
    );
  }

  function updateDisplay(text) {
    tiempoInput.value = text;
  }

  function showMessage(text) {
    mensaje.textContent = text;
    mensaje.classList.remove("hidden");
    mensaje.classList.add("visible");
    setTimeout(function () {
      mensaje.classList.remove("visible");
      mensaje.classList.add("hidden");
    }, 4000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    isRunning = false;
    updateButtonStates();
  }

  function updateButtonStates() {
    btnSet.disabled = isSet || isRunning;
    btnInicio.disabled = !isSet || isRunning;
    btnCuentaAtras.disabled = !isSet || isRunning;

    if (!isSet && !isRunning) {
      hint.textContent = "Pulsa teclas numéricas para introducir el tiempo";
    } else if (isSet && !isRunning) {
      hint.textContent = "Tiempo fijado: " + secondsToDisplay(targetSeconds) + "  —  Pulsa Inicio o Cuenta atrás";
    } else if (isRunning) {
      hint.textContent = "Cronómetro en marcha…";
    }
  }

  // --- Keyboard digit input ---
  document.addEventListener("keydown", function (e) {
    if (isSet || isRunning) return;
    var d = parseInt(e.key, 10);
    if (isNaN(d)) return;

    digits.shift();
    digits.push(d);
    updateDisplay(digitsToDisplay());
  });

  // --- Set ---
  btnSet.addEventListener("click", function () {
    targetSeconds = digitsToSeconds();
    if (targetSeconds === 0) {
      showMessage("Introduce un tiempo mayor que 00:00:00");
      return;
    }
    isSet = true;
    updateButtonStates();
  });

  // --- Limpiar ---
  btnLimpiar.addEventListener("click", function () {
    stopTimer();
    digits = [0, 0, 0, 0, 0, 0];
    isSet = false;
    targetSeconds = 0;
    currentSeconds = 0;
    updateDisplay("00:00:00");
    updateButtonStates();
  });

  // --- Inicio (count UP) ---
  btnInicio.addEventListener("click", function () {
    if (!isSet || targetSeconds === 0) return;
    stopTimer();
    currentSeconds = 0;
    updateDisplay("00:00:00");
    isRunning = true;
    updateButtonStates();

    timerInterval = setInterval(function () {
      currentSeconds++;
      updateDisplay(secondsToDisplay(currentSeconds));
      if (currentSeconds >= targetSeconds) {
        stopTimer();
        showMessage("¡Tiempo alcanzado! (" + secondsToDisplay(targetSeconds) + ")");
      }
    }, 1000);
  });

  // --- Cuenta atrás (count DOWN) ---
  btnCuentaAtras.addEventListener("click", function () {
    if (!isSet || targetSeconds === 0) return;
    stopTimer();
    currentSeconds = targetSeconds;
    updateDisplay(secondsToDisplay(currentSeconds));
    isRunning = true;
    updateButtonStates();

    timerInterval = setInterval(function () {
      currentSeconds--;
      updateDisplay(secondsToDisplay(currentSeconds));
      if (currentSeconds <= 0) {
        stopTimer();
        showMessage("¡Cuenta atrás finalizada!");
      }
    }, 1000);
  });

  updateButtonStates();
})();
