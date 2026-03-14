/**
 * Cronómetro profesional
 * Cuenta ascendente y cuenta atrás con aviso al finalizar.
 *
 * Buenas prácticas aplicadas:
 *  - IIFE + 'use strict' → sin contaminación del scope global
 *  - Estado centralizado en un único objeto
 *  - updateButtonStates() deriva toda la UI del estado
 *  - Tiempo calculado con Date.now() → sin deriva de setInterval
 *  - Validación de mm/ss ≤ 59 antes de aceptar Set
 *  - Documentación JSDoc en funciones públicas del módulo
 */
(() => {
  'use strict';

  // ─── Constantes ────────────────────────────────────────────────────────────

  const TICK_MS     = 200;   // frecuencia del ticker (< 1 s para precisión visual)
  const TOAST_MS    = 3500;  // duración del toast en ms
  const MAX_DIGITS  = 6;

  // ─── Estado ────────────────────────────────────────────────────────────────

  /**
   * @typedef {'idle'|'set'|'running-up'|'running-down'|'finished'} Mode
   */

  const state = {
    /** @type {number[]} Dígitos introducidos por teclado, máx MAX_DIGITS */
    digits: [],
    /** Segundos fijados con Set */
    targetSeconds: 0,
    /** Modo actual de la aplicación @type {Mode} */
    mode: 'idle',
    /** Id del intervalo activo, o null */
    intervalId: null,
    /** Timestamp Date.now() al arrancar el timer */
    startTimestamp: 0,
    /** Segundos en el display al arrancar (para cuenta atrás) */
    startSeconds: 0,
    /** Referencia del timeout activo del toast */
    toastTimeout: null,
  };

  // ─── Referencias DOM ───────────────────────────────────────────────────────

  const timeDisplay  = document.getElementById('timeDisplay');
  const statusDot    = document.getElementById('statusDot');
  const statusLabel  = document.getElementById('statusLabel');
  const hint         = document.getElementById('hint');
  const progressFill = document.getElementById('progressFill');
  const toastRegion  = document.getElementById('toastRegion');
  const stopRow      = document.getElementById('stopRow');

  const btnSet       = document.getElementById('btnSet');
  const btnClear     = document.getElementById('btnClear');
  const btnStart     = document.getElementById('btnStart');
  const btnCountdown = document.getElementById('btnCountdown');
  const btnStop      = document.getElementById('btnStop');

  // ─── Utilidades de tiempo ──────────────────────────────────────────────────

  /**
   * Convierte segundos totales a string HH:MM:SS.
   * @param {number} totalSeconds
   * @returns {string}
   */
  function secondsToHHMMSS(totalSeconds) {
    const safe = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(safe / 3600);
    const m = Math.floor((safe % 3600) / 60);
    const s = safe % 60;
    return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
  }

  /**
   * Convierte el array de dígitos actual a string HH:MM:SS para el display.
   * @returns {string}
   */
  function digitsToDisplay() {
    const d = [...state.digits];
    while (d.length < MAX_DIGITS) d.unshift(0);
    return `${d[0]}${d[1]}:${d[2]}${d[3]}:${d[4]}${d[5]}`;
  }

  /**
   * Convierte el array de dígitos a segundos totales.
   * @returns {number}
   */
  function digitsToSeconds() {
    const d = [...state.digits];
    while (d.length < MAX_DIGITS) d.unshift(0);
    const h = d[0] * 10 + d[1];
    const m = d[2] * 10 + d[3];
    const s = d[4] * 10 + d[5];
    return h * 3600 + m * 60 + s;
  }

  /**
   * Valida que el tiempo en el buffer de dígitos sea coherente.
   * @returns {{ valid: boolean, error?: string }}
   */
  function validateDigits() {
    const d = [...state.digits];
    while (d.length < MAX_DIGITS) d.unshift(0);
    const m = d[2] * 10 + d[3];
    const s = d[4] * 10 + d[5];
    if (m > 59) return { valid: false, error: 'Los minutos no pueden superar 59.' };
    if (s > 59) return { valid: false, error: 'Los segundos no pueden superar 59.' };
    const total = digitsToSeconds();
    if (total === 0) return { valid: false, error: 'Introduce un tiempo mayor que 00:00:00.' };
    return { valid: true };
  }

  // ─── Display ───────────────────────────────────────────────────────────────

  /**
   * Actualiza el valor del input de tiempo.
   * @param {string} value
   */
  function setDisplay(value) {
    timeDisplay.value = value;
  }

  /**
   * Aplica clase de modo al input y actualiza la barra de progreso.
   * @param {Mode} mode
   * @param {number} [elapsed]   segundos transcurridos (modo up)
   * @param {number} [remaining] segundos restantes (modo down)
   */
  function syncDisplayMode(mode, elapsed = 0, remaining = 0) {
    timeDisplay.className = 'display-input';
    if (mode === 'idle' || mode === 'set') {
      timeDisplay.classList.add('display-input--ready');
    } else if (mode === 'running-up') {
      timeDisplay.classList.add('display-input--up');
      const pct = state.targetSeconds > 0
        ? Math.min(100, (elapsed / state.targetSeconds) * 100)
        : 0;
      progressFill.style.width = `${pct}%`;
    } else if (mode === 'running-down') {
      timeDisplay.classList.add('display-input--down');
      const pct = state.targetSeconds > 0
        ? Math.min(100, (remaining / state.targetSeconds) * 100)
        : 0;
      progressFill.style.width = `${pct}%`;
    } else if (mode === 'finished') {
      timeDisplay.classList.add('display-input--finished');
      progressFill.style.width = '0%';
    }
  }

  // ─── Estado global de UI ───────────────────────────────────────────────────

  /**
   * Sincroniza botones, indicador de estado y hint con el estado actual.
   * Fuente única de verdad para toda la UI.
   */
  function updateButtonStates() {
    const { mode, targetSeconds } = state;
    const isRunning  = mode === 'running-up' || mode === 'running-down';
    const isSet      = mode === 'set';
    const isIdle     = mode === 'idle';
    const isFinished = mode === 'finished';

    // Botones
    btnSet.disabled       = isRunning || isSet;
    btnClear.disabled     = false; // siempre disponible
    btnStart.disabled     = (!isSet && !isFinished) || isRunning || targetSeconds === 0;
    btnCountdown.disabled = (!isSet && !isFinished) || isRunning || targetSeconds === 0;
    stopRow.hidden        = !isRunning;

    // Indicador de estado
    const statusMap = {
      idle:          { dot: '',          label: 'Listo' },
      set:           { dot: 'dot--set',  label: `Fijado: ${secondsToHHMMSS(targetSeconds)}` },
      'running-up':  { dot: 'dot--up',   label: 'Contando…' },
      'running-down':{ dot: 'dot--down', label: 'Cuenta atrás…' },
      finished:      { dot: 'dot--done', label: 'Completado' },
    };
    const s = statusMap[mode] || statusMap.idle;
    statusDot.className   = `status-dot ${s.dot}`;
    statusLabel.textContent = s.label;

    // Hint contextual
    if (isIdle) {
      hint.textContent = 'Pulsa teclas numéricas para introducir el tiempo';
    } else if (isSet) {
      hint.textContent = 'Tiempo fijado — pulsa Inicio o Cuenta atrás';
    } else if (isRunning) {
      hint.textContent = 'Cronómetro en marcha — pulsa Detener para pausar';
    } else if (isFinished) {
      hint.textContent = 'Pulsa Limpiar para reiniciar';
    }
  }

  // ─── Toast ─────────────────────────────────────────────────────────────────

  /**
   * Muestra un mensaje toast temporal.
   * @param {string} message
   * @param {'info'|'success'|'warning'|'error'} [type]
   */
  function showToast(message, type = 'info') {
    if (state.toastTimeout) clearTimeout(state.toastTimeout);

    toastRegion.textContent = '';
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'status');

    const icons = { info: '◈', success: '✓', warning: '⚠', error: '✕' };
    toast.innerHTML = `<span class="toast__icon" aria-hidden="true">${icons[type]}</span><span>${message}</span>`;
    toastRegion.appendChild(toast);

    // Trigger reflow para animación de entrada
    void toast.offsetWidth;
    toast.classList.add('toast--visible');

    state.toastTimeout = setTimeout(() => {
      toast.classList.remove('toast--visible');
      toast.classList.add('toast--out');
      setTimeout(() => toast.remove(), 350);
    }, TOAST_MS);
  }

  // ─── Control del timer ─────────────────────────────────────────────────────

  function stopInterval() {
    if (state.intervalId !== null) {
      clearInterval(state.intervalId);
      state.intervalId = null;
    }
  }

  function resetToIdle() {
    stopInterval();
    state.digits        = [];
    state.targetSeconds = 0;
    state.mode          = 'idle';
    state.startTimestamp = 0;
    state.startSeconds  = 0;
    progressFill.style.width = '0%';
    setDisplay('00:00:00');
    syncDisplayMode('idle');
    updateButtonStates();
  }

  // ─── Inicio (cuenta ascendente) ────────────────────────────────────────────

  function startAscending() {
    stopInterval();
    state.mode           = 'running-up';
    state.startTimestamp = Date.now();
    state.startSeconds   = 0;

    setDisplay('00:00:00');
    syncDisplayMode('running-up', 0);
    updateButtonStates();

    state.intervalId = setInterval(() => {
      const elapsed = Math.floor((Date.now() - state.startTimestamp) / 1000);
      setDisplay(secondsToHHMMSS(elapsed));
      syncDisplayMode('running-up', elapsed);

      if (elapsed >= state.targetSeconds) {
        stopInterval();
        setDisplay(secondsToHHMMSS(state.targetSeconds));
        progressFill.style.width = '100%';
        state.mode = 'finished';
        syncDisplayMode('finished');
        updateButtonStates();
        showToast(`¡Tiempo alcanzado! ${secondsToHHMMSS(state.targetSeconds)}`, 'success');
      }
    }, TICK_MS);
  }

  // ─── Cuenta atrás ──────────────────────────────────────────────────────────

  function startCountdown() {
    stopInterval();
    state.mode           = 'running-down';
    state.startTimestamp = Date.now();
    state.startSeconds   = state.targetSeconds;

    setDisplay(secondsToHHMMSS(state.targetSeconds));
    syncDisplayMode('running-down', 0, state.targetSeconds);
    updateButtonStates();

    state.intervalId = setInterval(() => {
      const elapsed    = Math.floor((Date.now() - state.startTimestamp) / 1000);
      const remaining  = Math.max(0, state.targetSeconds - elapsed);
      setDisplay(secondsToHHMMSS(remaining));
      syncDisplayMode('running-down', elapsed, remaining);

      if (remaining <= 0) {
        stopInterval();
        setDisplay('00:00:00');
        state.mode = 'finished';
        syncDisplayMode('finished');
        updateButtonStates();
        showToast('¡Cuenta atrás finalizada!', 'warning');
      }
    }, TICK_MS);
  }

  // ─── Eventos de teclado ────────────────────────────────────────────────────

  document.addEventListener('keydown', (e) => {
    const isRunning = state.mode === 'running-up' || state.mode === 'running-down';
    if (state.mode === 'set' || isRunning) return;

    if (/^\d$/.test(e.key)) {
      if (state.digits.length >= MAX_DIGITS) return;
      state.digits.push(parseInt(e.key, 10));
      setDisplay(digitsToDisplay());
      if (state.mode !== 'idle') {
        state.mode = 'idle';
        updateButtonStates();
      }
      return;
    }

    if (e.key === 'Backspace' && state.digits.length > 0) {
      e.preventDefault();
      state.digits.pop();
      setDisplay(digitsToDisplay());
    }
  });

  // ─── Handlers de botones ───────────────────────────────────────────────────

  btnSet.addEventListener('click', () => {
    const validation = validateDigits();
    if (!validation.valid) {
      showToast(validation.error, 'error');
      return;
    }
    state.targetSeconds = digitsToSeconds();
    state.mode = 'set';
    updateButtonStates();
    showToast(`Tiempo fijado: ${secondsToHHMMSS(state.targetSeconds)}`, 'info');
  });

  btnClear.addEventListener('click', () => {
    resetToIdle();
    showToast('Cronómetro reiniciado', 'info');
  });

  btnStart.addEventListener('click', () => {
    if (btnStart.disabled) return;
    startAscending();
  });

  btnCountdown.addEventListener('click', () => {
    if (btnCountdown.disabled) return;
    startCountdown();
  });

  btnStop.addEventListener('click', () => {
    stopInterval();
    state.mode = 'set'; // vuelve a estado set, puede relanzar
    progressFill.style.width = '0%';
    syncDisplayMode('set');
    updateButtonStates();
    showToast('Cronómetro detenido', 'info');
  });

  // ─── Inicialización ────────────────────────────────────────────────────────

  resetToIdle();

})();
