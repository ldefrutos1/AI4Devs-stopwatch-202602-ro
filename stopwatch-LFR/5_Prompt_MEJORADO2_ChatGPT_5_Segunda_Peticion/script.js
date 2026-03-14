(function () {
  'use strict';

  const state = {
    digits: ['0', '0', '0', '0', '0', '0'],
    targetSeconds: 0,
    mode: 'idle',
    intervalId: null,
    startTimestamp: null,
    toastTimeout: null
  };

  const timeDisplay = document.getElementById('timeDisplay');
  const hint = document.getElementById('hint');
  const statusDot = document.getElementById('statusDot');
  const statusLabel = document.getElementById('statusLabel');
  const progressFill = document.getElementById('progressFill');
  const toastRegion = document.getElementById('toastRegion');
  const stopRow = document.getElementById('stopRow');

  const buttons = {
    set: document.querySelector('[data-action="set"]'),
    clear: document.querySelector('[data-action="clear"]'),
    start: document.querySelector('[data-action="start"]'),
    countdown: document.querySelector('[data-action="countdown"]'),
    stop: document.querySelector('[data-action="stop"]')
  };

  function formatTime(totalSeconds) {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    return [
      String(hours).padStart(2, '0'),
      String(minutes).padStart(2, '0'),
      String(seconds).padStart(2, '0')
    ].join(':');
  }

  function digitsToDisplay() {
    return `${state.digits[0]}${state.digits[1]}:${state.digits[2]}${state.digits[3]}:${state.digits[4]}${state.digits[5]}`;
  }

  function digitsToSeconds() {
    const hours = Number(`${state.digits[0]}${state.digits[1]}`);
    const minutes = Number(`${state.digits[2]}${state.digits[3]}`);
    const seconds = Number(`${state.digits[4]}${state.digits[5]}`);

    return (hours * 3600) + (minutes * 60) + seconds;
  }

  function parseDigitsParts() {
    return {
      hours: Number(`${state.digits[0]}${state.digits[1]}`),
      minutes: Number(`${state.digits[2]}${state.digits[3]}`),
      seconds: Number(`${state.digits[4]}${state.digits[5]}`)
    };
  }

  function setDisplayValue(value) {
    timeDisplay.value = value;
  }

  function resetDigits() {
    state.digits = ['0', '0', '0', '0', '0', '0'];
  }

  function applyDisplayModeClass() {
    timeDisplay.classList.remove(
      'display-input--ready',
      'display-input--up',
      'display-input--down',
      'display-input--finished'
    );

    switch (state.mode) {
      case 'idle':
      case 'set':
        timeDisplay.classList.add('display-input--ready');
        break;
      case 'running-up':
        timeDisplay.classList.add('display-input--up');
        break;
      case 'running-down':
        timeDisplay.classList.add('display-input--down');
        break;
      case 'finished':
        timeDisplay.classList.add('display-input--finished');
        break;
      default:
        timeDisplay.classList.add('display-input--ready');
        break;
    }
  }

  function updateProgress(currentSeconds) {
    if (state.targetSeconds <= 0) {
      progressFill.style.width = '0%';
      return;
    }

    const ratio = Math.max(0, Math.min(1, currentSeconds / state.targetSeconds));
    progressFill.style.width = `${ratio * 100}%`;
  }

  function showToast(message, variant) {
    if (state.toastTimeout) {
      window.clearTimeout(state.toastTimeout);
      state.toastTimeout = null;
    }

    toastRegion.innerHTML = '';

    const toast = document.createElement('div');
    toast.className = `toast toast--${variant}`;
    toast.textContent = message;
    toastRegion.appendChild(toast);

    state.toastTimeout = window.setTimeout(function () {
      toast.remove();
      state.toastTimeout = null;
    }, 3000);
  }

  function stopInterval() {
    if (state.intervalId !== null) {
      window.clearInterval(state.intervalId);
      state.intervalId = null;
    }
    state.startTimestamp = null;
  }

  function updateButtonStates() {
    const hasTarget = state.targetSeconds > 0;
    const isRunning = state.mode === 'running-up' || state.mode === 'running-down';

    switch (state.mode) {
      case 'idle':
        statusLabel.textContent = 'listo';
        hint.textContent = 'Introduce 6 dígitos con el teclado numérico antes de pulsar Set.';
        statusDot.style.background = 'var(--muted)';
        buttons.set.disabled = false;
        buttons.clear.disabled = false;
        buttons.start.disabled = true;
        buttons.countdown.disabled = true;
        stopRow.hidden = true;
        break;

      case 'set':
        statusLabel.textContent = 'fijado';
        hint.textContent = 'Tiempo fijado. Puedes iniciar el conteo ascendente o la cuenta atrás.';
        statusDot.style.background = 'var(--primary)';
        buttons.set.disabled = true;
        buttons.clear.disabled = false;
        buttons.start.disabled = !hasTarget;
        buttons.countdown.disabled = !hasTarget;
        stopRow.hidden = true;
        break;

      case 'running-up':
        statusLabel.textContent = 'contando';
        hint.textContent = 'Cronómetro ascendente en ejecución.';
        statusDot.style.background = 'var(--success)';
        buttons.set.disabled = true;
        buttons.clear.disabled = false;
        buttons.start.disabled = true;
        buttons.countdown.disabled = true;
        stopRow.hidden = false;
        break;

      case 'running-down':
        statusLabel.textContent = 'contando';
        hint.textContent = 'Cuenta atrás en ejecución.';
        statusDot.style.background = 'var(--warning)';
        buttons.set.disabled = true;
        buttons.clear.disabled = false;
        buttons.start.disabled = true;
        buttons.countdown.disabled = true;
        stopRow.hidden = false;
        break;

      case 'finished':
        statusLabel.textContent = 'finalizado';
        hint.textContent = 'Proceso completado. Puedes limpiar o volver a fijar un tiempo.';
        statusDot.style.background = 'var(--finished)';
        buttons.set.disabled = false;
        buttons.clear.disabled = false;
        buttons.start.disabled = !hasTarget;
        buttons.countdown.disabled = !hasTarget;
        stopRow.hidden = true;
        break;

      default:
        statusLabel.textContent = 'listo';
        hint.textContent = 'Introduce 6 dígitos con el teclado numérico antes de pulsar Set.';
        statusDot.style.background = 'var(--muted)';
        buttons.set.disabled = false;
        buttons.clear.disabled = false;
        buttons.start.disabled = true;
        buttons.countdown.disabled = true;
        stopRow.hidden = true;
        break;
    }

    if (!isRunning && state.mode !== 'finished') {
      updateProgress(state.mode === 'set' ? state.targetSeconds : 0);
    }

    applyDisplayModeClass();
  }

  function finishRun(message, finalValue) {
    stopInterval();
    state.mode = 'finished';
    setDisplayValue(formatTime(finalValue));
    updateProgress(state.targetSeconds);
    updateButtonStates();
    showToast(message, 'success');
  }

  function startCountUp() {
    if (state.targetSeconds <= 0 || state.mode !== 'set') {
      return;
    }

    state.mode = 'running-up';
    state.startTimestamp = Date.now();
    setDisplayValue('00:00:00');
    updateProgress(0);
    updateButtonStates();

    state.intervalId = window.setInterval(function () {
      const elapsedSeconds = Math.floor((Date.now() - state.startTimestamp) / 1000);

      if (elapsedSeconds >= state.targetSeconds) {
        finishRun('Tiempo alcanzado.', state.targetSeconds);
        return;
      }

      setDisplayValue(formatTime(elapsedSeconds));
      updateProgress(elapsedSeconds);
    }, 250);
  }

  function startCountDown() {
    if (state.targetSeconds <= 0 || state.mode !== 'set') {
      return;
    }

    state.mode = 'running-down';
    state.startTimestamp = Date.now();
    setDisplayValue(formatTime(state.targetSeconds));
    updateProgress(state.targetSeconds);
    updateButtonStates();

    state.intervalId = window.setInterval(function () {
      const elapsedSeconds = Math.floor((Date.now() - state.startTimestamp) / 1000);
      const remainingSeconds = Math.max(0, state.targetSeconds - elapsedSeconds);

      if (remainingSeconds <= 0) {
        finishRun('Cuenta atrás finalizada.', 0);
        return;
      }

      setDisplayValue(formatTime(remainingSeconds));
      updateProgress(remainingSeconds);
    }, 250);
  }

  function validateAndSet() {
    if (state.mode === 'running-up' || state.mode === 'running-down') {
      return;
    }

    const parts = parseDigitsParts();
    const seconds = digitsToSeconds();

    if (parts.minutes > 59 || parts.seconds > 59) {
      showToast('Error de validación: minutos y segundos deben ser ≤ 59.', 'error');
      return;
    }

    if (seconds <= 0) {
      showToast('Error de validación: el tiempo debe ser mayor que 00:00:00.', 'error');
      return;
    }

    state.targetSeconds = seconds;
    state.mode = 'set';
    setDisplayValue(formatTime(state.targetSeconds));
    updateProgress(state.targetSeconds);
    updateButtonStates();
    showToast('Tiempo fijado correctamente.', 'success');
  }

  function clearAll() {
    stopInterval();
    resetDigits();
    state.targetSeconds = 0;
    state.mode = 'idle';
    setDisplayValue('00:00:00');
    updateProgress(0);
    updateButtonStates();
  }

  function stopCurrentRun() {
    if (state.mode !== 'running-up' && state.mode !== 'running-down') {
      return;
    }

    stopInterval();
    state.mode = 'set';
    updateButtonStates();
  }

  function handleNumericInput(key) {
    if (state.mode !== 'idle') {
      return;
    }

    state.digits.shift();
    state.digits.push(key);
    setDisplayValue(digitsToDisplay());
  }

  function handleBackspace() {
    if (state.mode !== 'idle') {
      return;
    }

    state.digits.pop();
    state.digits.unshift('0');
    setDisplayValue(digitsToDisplay());
  }

  function handleKeydown(event) {
    if (state.mode !== 'idle') {
      return;
    }

    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      handleNumericInput(event.key);
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      handleBackspace();
    }
  }

  document.addEventListener('keydown', handleKeydown);

  buttons.set.addEventListener('click', validateAndSet);
  buttons.clear.addEventListener('click', clearAll);
  buttons.start.addEventListener('click', startCountUp);
  buttons.countdown.addEventListener('click', startCountDown);
  buttons.stop.addEventListener('click', stopCurrentRun);

  setDisplayValue('00:00:00');
  updateProgress(0);
  updateButtonStates();
})();
