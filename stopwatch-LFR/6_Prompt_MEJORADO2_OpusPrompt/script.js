(function () {
  'use strict';

  var timeDisplay    = document.getElementById('timeDisplay');
  var hint           = document.getElementById('hint');
  var statusDot      = document.getElementById('statusDot');
  var statusLabel    = document.getElementById('statusLabel');
  var progressFill   = document.getElementById('progressFill');
  var toastRegion    = document.getElementById('toastRegion');
  var stopRow        = document.getElementById('stopRow');
  var btnSet         = document.getElementById('btnSet');
  var btnLimpiar     = document.getElementById('btnLimpiar');
  var btnInicio      = document.getElementById('btnInicio');
  var btnCuentaAtras = document.getElementById('btnCuentaAtras');
  var btnStop        = stopRow.querySelector('button');

  var DISPLAY_CLASSES = [
    'display-input--ready',
    'display-input--up',
    'display-input--down',
    'display-input--finished'
  ];

  var DOT_CLASSES = [
    'status__dot--idle',
    'status__dot--set',
    'status__dot--running',
    'status__dot--finished'
  ];

  var state = {
    digits: [0, 0, 0, 0, 0, 0],
    targetSeconds: 0,
    mode: 'idle',
    intervalId: null,
    startTimestamp: null,
    toastTimeout: null
  };

  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function secondsToHMS(secs) {
    var h = Math.floor(secs / 3600);
    var m = Math.floor((secs % 3600) / 60);
    var s = secs % 60;
    return pad(h) + ':' + pad(m) + ':' + pad(s);
  }

  function digitsToDisplay() {
    var d = state.digits;
    return d[0] + '' + d[1] + ':' + d[2] + '' + d[3] + ':' + d[4] + '' + d[5];
  }

  function digitsToSeconds() {
    var d = state.digits;
    return (d[0] * 10 + d[1]) * 3600 + (d[2] * 10 + d[3]) * 60 + (d[4] * 10 + d[5]);
  }

  function displayClassFor(mode) {
    switch (mode) {
      case 'running-up':   return 'display-input--up';
      case 'running-down': return 'display-input--down';
      case 'finished':     return 'display-input--finished';
      default:             return 'display-input--ready';
    }
  }

  function dotClassFor(mode) {
    switch (mode) {
      case 'set':          return 'status__dot--set';
      case 'running-up':
      case 'running-down': return 'status__dot--running';
      case 'finished':     return 'status__dot--finished';
      default:             return 'status__dot--idle';
    }
  }

  function statusTextFor(mode) {
    switch (mode) {
      case 'set':          return 'Fijado';
      case 'running-up':
      case 'running-down': return 'Contando';
      case 'finished':     return 'Finalizado';
      default:             return 'Listo';
    }
  }

  function hintTextFor(mode) {
    switch (mode) {
      case 'idle':         return 'Pulsa teclas numericas para introducir el tiempo';
      case 'set':          return 'Tiempo fijado \u2014 pulsa Inicio o Cuenta atras';
      case 'running-up':   return 'Contando hacia arriba\u2026';
      case 'running-down': return 'Cuenta atras en curso\u2026';
      case 'finished':     return 'Pulsa Limpiar para reiniciar';
      default:             return '';
    }
  }

  function updateButtonStates() {
    var mode    = state.mode;
    var running = mode === 'running-up' || mode === 'running-down';

    btnSet.disabled         = mode !== 'idle';
    btnInicio.disabled      = mode !== 'set';
    btnCuentaAtras.disabled = mode !== 'set';
    stopRow.hidden          = !running;

    hint.textContent = hintTextFor(mode);

    DISPLAY_CLASSES.forEach(function (c) { timeDisplay.classList.remove(c); });
    timeDisplay.classList.add(displayClassFor(mode));

    DOT_CLASSES.forEach(function (c) { statusDot.classList.remove(c); });
    statusDot.classList.add(dotClassFor(mode));

    statusLabel.textContent = statusTextFor(mode);

    if (!running && mode !== 'finished') {
      progressFill.style.width = '0%';
    }
  }

  function showToast(msg) {
    if (state.toastTimeout) clearTimeout(state.toastTimeout);
    toastRegion.textContent = msg;
    toastRegion.classList.add('toast--visible');
    state.toastTimeout = setTimeout(function () {
      toastRegion.classList.remove('toast--visible');
      state.toastTimeout = null;
    }, 3500);
  }

  function clearTimer() {
    if (state.intervalId) {
      clearInterval(state.intervalId);
      state.intervalId = null;
    }
  }

  function tick() {
    var elapsed = Math.floor((Date.now() - state.startTimestamp) / 1000);
    var target  = state.targetSeconds;

    if (state.mode === 'running-up') {
      if (elapsed > target) elapsed = target;
      timeDisplay.value = secondsToHMS(elapsed);
      progressFill.style.width = (elapsed / target * 100) + '%';
      if (elapsed >= target) {
        clearTimer();
        state.mode = 'finished';
        showToast('\u00a1Tiempo alcanzado!');
        updateButtonStates();
      }
    } else if (state.mode === 'running-down') {
      var remaining = target - elapsed;
      if (remaining < 0) remaining = 0;
      timeDisplay.value = secondsToHMS(remaining);
      progressFill.style.width = (elapsed / target * 100) + '%';
      if (remaining <= 0) {
        clearTimer();
        state.mode = 'finished';
        showToast('\u00a1Cuenta atras finalizada!');
        updateButtonStates();
      }
    }
  }

  document.addEventListener('keydown', function (e) {
    if (state.mode !== 'idle') return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      state.digits.pop();
      state.digits.unshift(0);
      timeDisplay.value = digitsToDisplay();
      return;
    }

    var d = parseInt(e.key, 10);
    if (isNaN(d)) return;

    state.digits.shift();
    state.digits.push(d);
    timeDisplay.value = digitsToDisplay();
  });

  btnSet.addEventListener('click', function () {
    var d  = state.digits;
    var mm = d[2] * 10 + d[3];
    var ss = d[4] * 10 + d[5];

    if (mm > 59 || ss > 59) {
      showToast('Error: minutos y segundos deben ser \u2264 59');
      return;
    }

    var total = digitsToSeconds();
    if (total === 0) {
      showToast('Error: el tiempo debe ser mayor que 00:00:00');
      return;
    }

    state.targetSeconds = total;
    state.mode = 'set';
    showToast('Tiempo fijado: ' + secondsToHMS(total));
    updateButtonStates();
  });

  btnLimpiar.addEventListener('click', function () {
    clearTimer();
    state.digits         = [0, 0, 0, 0, 0, 0];
    state.targetSeconds  = 0;
    state.mode           = 'idle';
    state.startTimestamp  = null;
    timeDisplay.value    = '00:00:00';
    progressFill.style.width = '0%';
    updateButtonStates();
  });

  btnInicio.addEventListener('click', function () {
    if (state.mode !== 'set' || state.targetSeconds <= 0) return;
    clearTimer();
    state.mode           = 'running-up';
    state.startTimestamp  = Date.now();
    timeDisplay.value    = '00:00:00';
    progressFill.style.width = '0%';
    updateButtonStates();
    state.intervalId = setInterval(tick, 250);
  });

  btnCuentaAtras.addEventListener('click', function () {
    if (state.mode !== 'set' || state.targetSeconds <= 0) return;
    clearTimer();
    state.mode           = 'running-down';
    state.startTimestamp  = Date.now();
    timeDisplay.value    = secondsToHMS(state.targetSeconds);
    progressFill.style.width = '0%';
    updateButtonStates();
    state.intervalId = setInterval(tick, 250);
  });

  btnStop.addEventListener('click', function () {
    clearTimer();
    state.mode = 'finished';
    updateButtonStates();
  });

  updateButtonStates();
})();
