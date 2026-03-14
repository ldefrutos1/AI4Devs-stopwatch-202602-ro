/**
 * CRONÓMETRO PROFESIONAL — script.js
 * Lógica para cronometrado ascendente y cuenta atrás
 */

'use strict';

// ─── Estado ─────────────────────────────────────────────────────────────────

const state = {
  digits: [],          // dígitos introducidos por teclado (máx 6)
  setSeconds: 0,       // segundos fijados con "Set"
  elapsedSeconds: 0,   // segundos actuales en display
  isSet: false,        // true cuando el tiempo está fijado con Set
  isRunning: false,    // true mientras hay un intervalo activo
  mode: 'idle',        // 'idle' | 'up' | 'down'
  intervalId: null,
};

// ─── Referencias DOM ────────────────────────────────────────────────────────

const timeDisplay  = document.getElementById('timeDisplay');
const modeText     = document.getElementById('modeText');
const modeDot      = document.getElementById('modeDot');

const btnSet       = document.getElementById('btnSet');
const btnClear     = document.getElementById('btnClear');
const btnStart     = document.getElementById('btnStart');
const btnCountdown = document.getElementById('btnCountdown');
const btnStop      = document.getElementById('btnStop');

// ─── Utilidades de tiempo ────────────────────────────────────────────────────

/**
 * Convierte segundos totales a string HH:MM:SS
 * @param {number} totalSeconds
 * @returns {string}
 */
function secondsToHHMMSS(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return [hh, mm, ss].map(n => String(n).padStart(2, '0')).join(':');
}

/**
 * Convierte array de dígitos (máx 6) a segundos.
 * Los dígitos se interpretan como HHMMSS de derecha a izquierda.
 * Ej: [1,2,3,0] → "00:12:30" → 750s
 * @param {number[]} digits
 * @returns {number}
 */
function digitsToSeconds(digits) {
  // Rellenar con ceros por la izquierda hasta 6 dígitos
  const d = [...digits];
  while (d.length < 6) d.unshift(0);

  const hh = d[0] * 10 + d[1];
  const mm = d[2] * 10 + d[3];
  const ss = d[4] * 10 + d[5];

  return hh * 3600 + mm * 60 + ss;
}

/**
 * Convierte los dígitos actuales a string HH:MM:SS para el display
 */
function digitsToDisplay(digits) {
  const d = [...digits];
  while (d.length < 6) d.unshift(0);
  return `${d[0]}${d[1]}:${d[2]}${d[3]}:${d[4]}${d[5]}`;
}

// ─── Display helpers ─────────────────────────────────────────────────────────

function updateDisplay(seconds) {
  timeDisplay.value = secondsToHHMMSS(seconds);
}

function setDisplayClass(cls) {
  timeDisplay.classList.remove('editable', 'running-up', 'running-down', 'finished');
  if (cls) timeDisplay.classList.add(cls);
}

function setModeIndicator(dotClass, text) {
  modeDot.className = 'mode-dot' + (dotClass ? ' ' + dotClass : '');
  modeText.textContent = text;
  modeText.className = 'mode-text' + (text ? ' active' : '');
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function showToast(message, type = 'info', icon = '◆', duration = 3000) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.setProperty('--toast-duration', `${(duration - 300) / 1000}s`);
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

// ─── Control de intervalo ─────────────────────────────────────────────────────

function stopTimer() {
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
  state.isRunning = false;
}

function resetToIdle() {
  stopTimer();
  state.digits = [];
  state.setSeconds = 0;
  state.elapsedSeconds = 0;
  state.isSet = false;
  state.mode = 'idle';
  timeDisplay.value = '00:00:00';
  setDisplayClass(null);
  setModeIndicator('', '');
  btnStop.style.display = 'none';
}

// ─── Entrada por teclado ──────────────────────────────────────────────────────

document.addEventListener('keydown', (e) => {
  if (state.isRunning) return;
  if (state.isSet) return; // bloqueado tras Set

  const key = e.key;
  if (!/^\d$/.test(key)) return;

  if (state.digits.length >= 6) return;

  state.digits.push(parseInt(key, 10));
  timeDisplay.value = digitsToDisplay(state.digits);
  setDisplayClass('editable');
  setModeIndicator('active-edit', 'Edición');
});

// ─── Botón: LIMPIAR ───────────────────────────────────────────────────────────

btnClear.addEventListener('click', () => {
  resetToIdle();
  setDisplayClass('editable');
  setModeIndicator('active-edit', 'Edición');
  // Permitir edición inmediatamente
  state.isSet = false;
});

// ─── Botón: SET ───────────────────────────────────────────────────────────────

btnSet.addEventListener('click', () => {
  if (state.isRunning) return;

  const seconds = digitsToSeconds(state.digits);
  state.setSeconds = seconds;
  state.elapsedSeconds = seconds;
  state.isSet = true;

  updateDisplay(seconds);
  setDisplayClass(null);
  setModeIndicator('', '');

  showToast(`Tiempo fijado: ${secondsToHHMMSS(seconds)}`, 'info', '◈');
});

// ─── Botón: INICIO (cronómetro ascendente) ────────────────────────────────────

btnStart.addEventListener('click', () => {
  if (state.isRunning) return;

  // 1. Guardar referencia al tiempo establecido (máximo)
  const limitSeconds = state.isSet ? state.setSeconds : 0;

  // 2. Inicializar a cero
  state.elapsedSeconds = 0;
  state.mode = 'up';
  state.isRunning = true;

  // 3. Mostrar 00:00:00 y estado
  updateDisplay(0);
  setDisplayClass('running-up');
  setModeIndicator('active-up', 'Cronómetro');
  btnStop.style.display = 'flex';

  // 4. Arrancar el intervalo de 1 segundo
  state.intervalId = setInterval(() => {
    state.elapsedSeconds++;
    updateDisplay(state.elapsedSeconds);

    // Mostrar mensaje al llegar al tiempo fijado (si se ha fijado)
    if (limitSeconds > 0 && state.elapsedSeconds >= limitSeconds) {
      stopTimer();
      setDisplayClass('finished');
      setModeIndicator('', '');
      btnStop.style.display = 'none';
      showToast('¡Tiempo alcanzado!', 'success', '✓', 4000);
    }
  }, 1000);
});

// ─── Botón: CUENTA ATRÁS ─────────────────────────────────────────────────────

btnCountdown.addEventListener('click', () => {
  if (state.isRunning) return;

  // Obtener segundos del display actual
  const startSeconds = state.isSet
    ? state.setSeconds
    : digitsToSeconds(state.digits);

  if (startSeconds === 0) {
    showToast('Introduce un tiempo primero', 'warning', '⚠');
    return;
  }

  // 1. Fijar punto de partida
  state.elapsedSeconds = startSeconds;
  state.setSeconds = startSeconds;
  state.mode = 'down';
  state.isRunning = true;

  // 2. Mostrar tiempo inicial y estado
  updateDisplay(startSeconds);
  setDisplayClass('running-down');
  setModeIndicator('active-down', 'Cuenta atrás');
  btnStop.style.display = 'flex';

  // 3. Arrancar el intervalo de 1 segundo
  state.intervalId = setInterval(() => {
    state.elapsedSeconds--;
    updateDisplay(state.elapsedSeconds);

    // 4. Al llegar a cero → notificar
    if (state.elapsedSeconds <= 0) {
      stopTimer();
      timeDisplay.value = '00:00:00';
      setDisplayClass('finished');
      setModeIndicator('', '');
      btnStop.style.display = 'none';
      showToast('¡Cuenta atrás finalizada!', 'warning', '⏰', 4000);
    }
  }, 1000);
});

// ─── Botón: STOP ─────────────────────────────────────────────────────────────

btnStop.addEventListener('click', () => {
  stopTimer();
  state.mode = 'idle';
  setDisplayClass(null);
  setModeIndicator('', '');
  btnStop.style.display = 'none';
  showToast('Cronómetro detenido', 'info', '■');
});

// ─── Init ─────────────────────────────────────────────────────────────────────

timeDisplay.value = '00:00:00';
btnStop.style.display = 'none';
