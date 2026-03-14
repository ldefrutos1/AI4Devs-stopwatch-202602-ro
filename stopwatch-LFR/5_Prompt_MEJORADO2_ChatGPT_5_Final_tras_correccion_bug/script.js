(() => {
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

  const setButton = document.getElementById('setButton');
  const clearButton = document.getElementById('clearButton');
  const startButton = document.getElementById('startButton');
  const countdownButton = document.getElementById('countdownButton');
  const stopButton = document.getElementById('stopButton');

  function digitsToDisplay(digits) {
    return `${digits.slice(0, 2).join('')}:${digits.slice(2, 4).join('')}:${digits.slice(4, 6).join('')}`;
  }

  function secondsToDisplay(totalSeconds) {
    const safeSeconds = Math.max(0, totalSeconds);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    return [hours, minutes, seconds]
      .map((value) => String(value).padStart(2, '0'))
      .join(':');
  }

  function digitsToSeconds(digits) {
    const hours = Number(digits.slice(0, 2).join(''));
    const minutes = Number(digits.slice(2, 4).join(''));
    const seconds = Number(digits.slice(4, 6).join(''));

    return (hours * 3600) + (minutes * 60) + seconds;
  }

  function syncDigitsFromSeconds(totalSeconds) {
    const safeSeconds = Math.max(0, totalSeconds);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;
    const compact = `${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}${String(seconds).padStart(2, '0')}`;

    state.digits = compact.slice(-6).split('');
  }

  function showToast(message, isError = false) {
    window.clearTimeout(state.toastTimeout);
    toastRegion.textContent = '';

    const toast = document.createElement('div');
    toast.className = `toast${isError ? ' toast--error' : ''}`;
    toast.textContent = message;
    toastRegion.appendChild(toast);

    state.toastTimeout = window.setTimeout(() => {
      toast.remove();
    }, 2800);
  }

  function applyDisplayClass(mode) {
    timeDisplay.classList.remove(
      'display-input--ready',
      'display-input--up',
      'display-input--down',
      'display-input--finished'
    );

    switch (mode) {
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

  function setProgress(percent) {
    const bounded = Math.max(0, Math.min(100, percent));
    progressFill.style.width = `${bounded}%`;
  }

  function stopTimer() {
    if (state.intervalId !== null) {
      window.clearInterval(state.intervalId);
      state.intervalId = null;
    }
    state.startTimestamp = null;
  }

  function updateButtonStates() {
    const hasTarget = state.targetSeconds > 0;

    setButton.disabled = state.mode !== 'idle';
    clearButton.disabled = false;
    startButton.disabled = !(state.mode === 'set' && hasTarget);
    countdownButton.disabled = !(state.mode === 'set' && hasTarget);
    stopButton.disabled = !(state.mode === 'running-up' || state.mode === 'running-down');
    stopRow.hidden = !(state.mode === 'running-up' || state.mode === 'running-down');

    switch (state.mode) {
      case 'idle':
        hint.textContent = 'Usa las teclas numéricas para introducir HHMMSS antes de fijar el tiempo.';
        statusLabel.textContent = 'Listo';
        statusDot.dataset.state = 'idle';
        setProgress(0);
        break;
      case 'set':
        hint.textContent = 'Tiempo fijado. Puedes iniciar el conteo ascendente o la cuenta atrás.';
        statusLabel.textContent = 'Fijado';
        statusDot.dataset.state = 'set';
        setProgress(0);
        break;
      case 'running-up':
        hint.textContent = 'Conteo ascendente en ejecución.';
        statusLabel.textContent = 'Contando';
        statusDot.dataset.state = 'running';
        break;
      case 'running-down':
        hint.textContent = 'Cuenta atrás en ejecución.';
        statusLabel.textContent = 'Contando';
        statusDot.dataset.state = 'running';
        break;
      case 'finished':
        hint.textContent = 'Proceso finalizado. Pulsa Limpiar para preparar un nuevo tiempo.';
        statusLabel.textContent = 'Finalizado';
        statusDot.dataset.state = 'finished';
        setProgress(100);
        break;
      default:
        hint.textContent = 'Usa las teclas numéricas para introducir HHMMSS antes de fijar el tiempo.';
        statusLabel.textContent = 'Listo';
        statusDot.dataset.state = 'idle';
        setProgress(0);
        break;
    }

    applyDisplayClass(state.mode);
  }

  function renderDigits() {
    timeDisplay.value = digitsToDisplay(state.digits);
  }

  function handleNumericInput(key) {
    state.digits.shift();
    state.digits.push(key);
    renderDigits();
  }

  function handleBackspace() {
    state.digits.pop();
    state.digits.unshift('0');
    renderDigits();
  }

  function finishTimer(message) {
    stopTimer();
    state.mode = 'finished';
    updateButtonStates();
    showToast(message);
  }

  function startRunningUp() {
    if (state.mode !== 'set' || state.targetSeconds <= 0) {
      return;
    }

    stopTimer();
    state.mode = 'running-up';
    state.startTimestamp = Date.now();
    timeDisplay.value = '00:00:00';
    setProgress(0);
    updateButtonStates();

    state.intervalId = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - state.startTimestamp) / 1000);
      const boundedElapsed = Math.min(elapsedSeconds, state.targetSeconds);
      timeDisplay.value = secondsToDisplay(boundedElapsed);
      setProgress((boundedElapsed / state.targetSeconds) * 100);

      if (elapsedSeconds >= state.targetSeconds) {
        finishTimer('Tiempo alcanzado.');
      }
    }, 250);
  }

  function startRunningDown() {
    if (state.mode !== 'set' || state.targetSeconds <= 0) {
      return;
    }

    stopTimer();
    state.mode = 'running-down';
    state.startTimestamp = Date.now();
    timeDisplay.value = secondsToDisplay(state.targetSeconds);
    setProgress(100);
    updateButtonStates();

    state.intervalId = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - state.startTimestamp) / 1000);
      const remainingSeconds = Math.max(state.targetSeconds - elapsedSeconds, 0);
      timeDisplay.value = secondsToDisplay(remainingSeconds);
      setProgress((remainingSeconds / state.targetSeconds) * 100);

      if (remainingSeconds <= 0) {
        finishTimer('Cuenta atrás finalizada.');
      }
    }, 250);
  }

  function validateAndSetTime() {
    const minutes = Number(state.digits.slice(2, 4).join(''));
    const seconds = Number(state.digits.slice(4, 6).join(''));
    const targetSeconds = digitsToSeconds(state.digits);

    if (minutes > 59 || seconds > 59 || targetSeconds <= 0) {
      showToast('Error de validación: revisa horas, minutos y segundos.', true);
      return;
    }

    state.targetSeconds = targetSeconds;
    state.mode = 'set';
    syncDigitsFromSeconds(targetSeconds);
    renderDigits();
    updateButtonStates();
    showToast('Tiempo fijado correctamente.');
  }

  function clearAll() {
    stopTimer();
    state.digits = ['0', '0', '0', '0', '0', '0'];
    state.targetSeconds = 0;
    state.mode = 'idle';
    renderDigits();
    updateButtonStates();
    toastRegion.textContent = '';
    window.clearTimeout(state.toastTimeout);
  }

  function stopCurrentRun() {
    if (state.mode !== 'running-up' && state.mode !== 'running-down') {
      return;
    }

    stopTimer();
    state.mode = 'set';
    updateButtonStates();
    showToast('Contador detenido.');
  }

  document.addEventListener('keydown', (event) => {
    if (state.mode !== 'idle') {
      return;
    }

    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      handleNumericInput(event.key);
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      handleBackspace();
    }
  });

  setButton.addEventListener('click', validateAndSetTime);
  clearButton.addEventListener('click', clearAll);
  startButton.addEventListener('click', startRunningUp);
  countdownButton.addEventListener('click', startRunningDown);
  stopButton.addEventListener('click', stopCurrentRun);

  renderDigits();
  updateButtonStates();
})();
