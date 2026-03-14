(() => {
  'use strict';

  const timeDisplay = document.getElementById('timeDisplay');
  const setButton = document.getElementById('setButton');
  const clearButton = document.getElementById('clearButton');
  const countdownButton = document.getElementById('countdownButton');
  const startButton = document.getElementById('startButton');
  const statusText = document.getElementById('statusText');
  const statusDot = document.getElementById('statusDot');
  const toast = document.getElementById('toast');

  const MAX_DIGITS = 6;
  const ONE_SECOND = 1000;

  let digitBuffer = '000000';
  let isLocked = false;
  let intervalId = null;
  let targetSeconds = 0;
  let toastTimeoutId = null;

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function formatSecondsToTime(totalSeconds) {
    const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  function digitsToTime(buffer) {
    const normalized = String(buffer).replace(/\D/g, '').padStart(MAX_DIGITS, '0').slice(-MAX_DIGITS);
    const hours = normalized.slice(0, 2);
    const minutes = normalized.slice(2, 4);
    const seconds = normalized.slice(4, 6);
    return `${hours}:${minutes}:${seconds}`;
  }

  function timeToSeconds(value) {
    const [hours, minutes, seconds] = value.split(':').map(Number);
    return (hours * 3600) + (minutes * 60) + seconds;
  }

  function updateDisplay(value) {
    timeDisplay.value = value;
  }

  function syncBufferFromDisplay() {
    digitBuffer = timeDisplay.value.replace(/:/g, '').padStart(MAX_DIGITS, '0').slice(-MAX_DIGITS);
  }

  function stopTimer() {
    if (intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  }

  function setStatus(message, tone = 'ready') {
    statusText.textContent = message;

    const colorMap = {
      ready: '#22c55e',
      locked: '#f59e0b',
      running: '#2563eb',
      countdown: '#dc2626'
    };

    statusDot.style.background = colorMap[tone] || colorMap.ready;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('visible');

    if (toastTimeoutId) {
      window.clearTimeout(toastTimeoutId);
    }

    toastTimeoutId = window.setTimeout(() => {
      toast.classList.remove('visible');
    }, 3200);
  }

  function validateDisplayTime() {
    const currentValue = timeDisplay.value;
    const [hours, minutes, seconds] = currentValue.split(':').map(Number);

    if (minutes > 59 || seconds > 59) {
      showToast('Los minutos y los segundos deben estar entre 00 y 59.');
      return false;
    }

    if (hours > 99) {
      showToast('Las horas no pueden superar 99.');
      return false;
    }

    return true;
  }

  function prepareTargetSeconds() {
    if (!validateDisplayTime()) {
      return null;
    }

    syncBufferFromDisplay();
    targetSeconds = timeToSeconds(timeDisplay.value);
    return targetSeconds;
  }

  function lockTimeConfiguration() {
    isLocked = true;
    setStatus('Tiempo fijado', 'locked');
  }

  function unlockTimeConfiguration() {
    isLocked = false;
    setStatus('Listo para configurar', 'ready');
  }

  function handleDigitInput(key) {
    if (isLocked || intervalId !== null) {
      return;
    }

    digitBuffer = `${digitBuffer}${key}`.slice(-MAX_DIGITS);
    updateDisplay(digitsToTime(digitBuffer));
  }

  function resetToZero() {
    stopTimer();
    digitBuffer = '000000';
    targetSeconds = 0;
    updateDisplay('00:00:00');
    unlockTimeConfiguration();
  }

  function finishTimer(message) {
    stopTimer();
    setStatus('Proceso completado', 'ready');
    showToast(message);
  }

  function startAscendingTimer() {
    const preparedSeconds = prepareTargetSeconds();
    if (preparedSeconds === null) {
      return;
    }

    if (preparedSeconds === 0) {
      showToast('Configura un tiempo mayor que 00:00:00 para iniciar.');
      return;
    }

    stopTimer();
    lockTimeConfiguration();

    let elapsedSeconds = 0;
    updateDisplay('00:00:00');
    setStatus('Cronometrando en ascendente', 'running');

    intervalId = window.setInterval(() => {
      elapsedSeconds += 1;
      updateDisplay(formatSecondsToTime(elapsedSeconds));

      if (elapsedSeconds >= preparedSeconds) {
        finishTimer('Tiempo objetivo alcanzado.');
      }
    }, ONE_SECOND);
  }

  function startCountdownTimer() {
    const preparedSeconds = prepareTargetSeconds();
    if (preparedSeconds === null) {
      return;
    }

    if (preparedSeconds === 0) {
      showToast('Configura un tiempo mayor que 00:00:00 para iniciar la cuenta atrás.');
      return;
    }

    stopTimer();
    lockTimeConfiguration();

    let remainingSeconds = preparedSeconds;
    updateDisplay(formatSecondsToTime(remainingSeconds));
    setStatus('Cuenta atrás en ejecución', 'countdown');

    intervalId = window.setInterval(() => {
      remainingSeconds -= 1;
      updateDisplay(formatSecondsToTime(remainingSeconds));

      if (remainingSeconds <= 0) {
        updateDisplay('00:00:00');
        finishTimer('La cuenta atrás ha finalizado.');
      }
    }, ONE_SECOND);
  }

  document.addEventListener('keydown', (event) => {
    if (/^\d$/.test(event.key)) {
      handleDigitInput(event.key);
      return;
    }

    if (event.key === 'Backspace' && !isLocked && intervalId === null) {
      digitBuffer = `0${digitBuffer.slice(0, -1)}`.slice(-MAX_DIGITS);
      updateDisplay(digitsToTime(digitBuffer));
      event.preventDefault();
    }
  });

  setButton.addEventListener('click', () => {
    const preparedSeconds = prepareTargetSeconds();
    if (preparedSeconds === null) {
      return;
    }

    lockTimeConfiguration();
    showToast(`Tiempo fijado en ${formatSecondsToTime(preparedSeconds)}.`);
  });

  clearButton.addEventListener('click', () => {
    resetToZero();
    showToast('Temporizador limpiado.');
  });

  startButton.addEventListener('click', startAscendingTimer);
  countdownButton.addEventListener('click', startCountdownTimer);

  updateDisplay('00:00:00');
  setStatus('Listo para configurar', 'ready');
})();
