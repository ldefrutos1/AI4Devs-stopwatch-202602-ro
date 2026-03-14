/**
 * CRONÓMETRO — script.js
 * Handles: keypad input, Set/Clear, ascending stopwatch, countdown timer
 */

// ─── DOM References ───────────────────────────────────────────────────────────
const timeDisplay   = document.getElementById('timeDisplay');
const displayWrapper= document.getElementById('displayWrapper');
const modeBadge     = document.getElementById('modeBadge');
const subMs         = document.getElementById('subMs');
const statusDot     = document.getElementById('statusDot');
const statusText    = document.getElementById('statusText');
const toast         = document.getElementById('toast');
const toastMsg      = document.getElementById('toastMsg');

const btnSet        = document.getElementById('btnSet');
const btnClear      = document.getElementById('btnClear');
const btnStart      = document.getElementById('btnStart');
const btnCountdown  = document.getElementById('btnCountdown');
const delKey        = document.getElementById('delKey');
const keypad        = document.getElementById('keypad');

// ─── State ────────────────────────────────────────────────────────────────────
let inputDigits   = [];          // raw digit buffer (up to 6 digits → HHMMSS)
let setSeconds    = 0;           // seconds locked by "Set"
let isSet         = false;       // whether Set has been pressed
let isRunning     = false;
let intervalId    = null;
let msIntervalId  = null;
let elapsedMs     = 0;           // milliseconds accumulated (stopwatch)
let remainingMs   = 0;           // milliseconds remaining   (countdown)
let mode          = null;        // 'up' | 'down' | null
let toastTimeout  = null;

// ─── Helpers: Time Formatting ─────────────────────────────────────────────────

/** Convert total seconds → { h, m, s } */
function secondsToParts(totalSeconds) {
  const s = Math.floor(totalSeconds) % 60;
  const m = Math.floor(totalSeconds / 60) % 60;
  const h = Math.floor(totalSeconds / 3600);
  return { h, m, s };
}

/** Format parts → HH:MM:SS */
function formatTime(h, m, s) {
  return [h, m, s]
    .map(n => String(n).padStart(2, '0'))
    .join(':');
}

/** Convert total milliseconds → display string HH:MM:SS */
function msToDisplay(ms) {
  const totalSec = Math.floor(ms / 1000);
  const { h, m, s } = secondsToParts(totalSec);
  return formatTime(h, m, s);
}

/** Convert digit buffer → HH:MM:SS display */
function digitsToDisplay(digits) {
  // Pad to 6 digits on the right: [H,H,M,M,S,S]
  const padded = digits.slice(-6).join('');
  const str    = padded.padStart(6, '0');
  return `${str.slice(0,2)}:${str.slice(2,4)}:${str.slice(4,6)}`;
}

/** Convert digit buffer → total seconds */
function digitsToSeconds(digits) {
  const str = digits.slice(-6).join('').padStart(6, '0');
  const h   = parseInt(str.slice(0,2), 10);
  const m   = parseInt(str.slice(2,4), 10);
  const s   = parseInt(str.slice(4,6), 10);
  return h * 3600 + m * 60 + s;
}

// ─── Display Update ───────────────────────────────────────────────────────────

function updateDisplay(timeStr) {
  timeDisplay.value = timeStr;
}

function setMode(newMode) {
  mode = newMode;
  displayWrapper.classList.remove('running', 'countdown', 'finished');
  if (newMode === 'up')   { displayWrapper.classList.add('running');   modeBadge.textContent = 'SUBIDA';   }
  if (newMode === 'down') { displayWrapper.classList.add('countdown'); modeBadge.textContent = 'BAJADA';   }
  if (newMode === null)   {                                             modeBadge.textContent = '—';        }
}

function setStatus(state, text) {
  statusDot.className   = 'status-dot' + (state ? ` ${state}` : '');
  statusText.textContent = text;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function showToast(msg, duration = 3500) {
  clearTimeout(toastTimeout);
  toastMsg.textContent = msg;
  toast.classList.add('show');
  toastTimeout = setTimeout(() => toast.classList.remove('show'), duration);
}

// ─── Stop running interval ────────────────────────────────────────────────────

function stopTimer() {
  clearInterval(intervalId);
  clearInterval(msIntervalId);
  intervalId   = null;
  msIntervalId = null;
  isRunning    = false;
  subMs.textContent = '00';
}

// ─── Keypad Logic ─────────────────────────────────────────────────────────────

function setKeypadEnabled(enabled) {
  keypad.querySelectorAll('.key').forEach(k => {
    if (enabled) k.classList.remove('disabled');
    else         k.classList.add('disabled');
  });
}

function appendDigit(val) {
  if (isSet || isRunning) return;

  // "00" appends two zeros
  const digits = val === '00' ? ['0','0'] : [String(val)];
  digits.forEach(d => {
    if (inputDigits.length < 6) inputDigits.push(d);
  });
  updateDisplay(digitsToDisplay(inputDigits));
}

function deleteDigit() {
  if (isSet || isRunning) return;
  inputDigits.pop();
  updateDisplay(digitsToDisplay(inputDigits));
}

// Keyboard numbers support
document.addEventListener('keydown', e => {
  if (isRunning || isSet) return;
  if (e.key >= '0' && e.key <= '9') appendDigit(e.key);
  if (e.key === 'Backspace')        deleteDigit();
});

keypad.addEventListener('click', e => {
  const key = e.target.closest('.key');
  if (!key) return;
  if (key.id === 'delKey') { deleteDigit(); return; }
  appendDigit(key.dataset.val);
});

// ─── Button: SET ──────────────────────────────────────────────────────────────

btnSet.addEventListener('click', () => {
  if (isRunning) return;
  setSeconds = digitsToSeconds(inputDigits);
  isSet      = true;
  setKeypadEnabled(false);
  setStatus('', `Fijado en ${timeDisplay.value}`);
});

// ─── Button: CLEAR ────────────────────────────────────────────────────────────

btnClear.addEventListener('click', () => {
  stopTimer();
  inputDigits = [];
  setSeconds  = 0;
  isSet       = false;
  elapsedMs   = 0;
  remainingMs = 0;
  updateDisplay('00:00:00');
  setMode(null);
  setKeypadEnabled(true);
  setStatus('', 'Listo');
  displayWrapper.classList.remove('finished');
});

// ─── Button: INICIO (Ascending Stopwatch) ─────────────────────────────────────
/**
 * 1. Convierte el campo Tiempo a segundos (referencia como límite superior)
 * 2. Pone el campo a 00:00:00
 * 3. Inicia cronómetro ascendente (segundo a segundo)
 * 4. Al llegar al tiempo fijado muestra un mensaje
 */
btnStart.addEventListener('click', () => {
  if (isRunning) { stopTimer(); setStatus('', 'Pausado'); return; }

  const limitMs = setSeconds * 1000;
  elapsedMs     = 0;
  const tickMs  = 50;   // sub-second resolution

  updateDisplay('00:00:00');
  setMode('up');
  isRunning = true;
  setStatus('active', 'Cronometrando…');

  // Sub-second (centésimas)
  const startWall = performance.now();

  msIntervalId = setInterval(() => {
    elapsedMs = performance.now() - startWall;
    const cs  = Math.floor((elapsedMs % 1000) / 10);
    subMs.textContent = String(cs).padStart(2, '0');
    updateDisplay(msToDisplay(elapsedMs));

    if (limitMs > 0 && elapsedMs >= limitMs) {
      stopTimer();
      updateDisplay(msToDisplay(limitMs));
      displayWrapper.classList.add('finished');
      modeBadge.textContent = 'FIN';
      setStatus('done', '¡Tiempo alcanzado!');
      showToast('⏱ ¡Tiempo alcanzado! ' + formatTime(...Object.values(secondsToParts(setSeconds))));
    }
  }, tickMs);
});

// ─── Button: CUENTA ATRÁS (Countdown) ────────────────────────────────────────
/**
 * 1. Convierte el campo Tiempo a segundos
 * 2. Inicia descontando de segundo en segundo
 * 3. Al llegar a 00:00:00 muestra un mensaje
 */
btnCountdown.addEventListener('click', () => {
  if (isRunning) { stopTimer(); setStatus('', 'Pausado'); return; }

  const totalMs = (isSet ? setSeconds : digitsToSeconds(inputDigits)) * 1000;
  if (totalMs <= 0) {
    showToast('⚠ Introduce un tiempo antes de iniciar la cuenta atrás');
    return;
  }

  remainingMs = totalMs;
  const tickMs = 50;

  setMode('down');
  isRunning = true;
  setStatus('warning', 'Cuenta atrás…');

  const startWall = performance.now();
  const baseRemaining = remainingMs;

  msIntervalId = setInterval(() => {
    const elapsed = performance.now() - startWall;
    remainingMs   = Math.max(0, baseRemaining - elapsed);

    const cs = Math.floor((remainingMs % 1000) / 10);
    subMs.textContent = String(cs).padStart(2, '0');
    updateDisplay(msToDisplay(remainingMs));

    if (remainingMs <= 0) {
      stopTimer();
      updateDisplay('00:00:00');
      subMs.textContent = '00';
      displayWrapper.classList.remove('countdown');
      displayWrapper.classList.add('finished');
      modeBadge.textContent = 'FIN';
      setStatus('done', '¡Cuenta atrás finalizada!');
      showToast('🎯 ¡Cuenta atrás finalizada!');
    }
  }, tickMs);
});

// ─── Initial State ────────────────────────────────────────────────────────────
setStatus('', 'Listo');
