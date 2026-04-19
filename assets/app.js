const inputField = document.getElementById('inputField');
const submitBtn = document.getElementById('submitBtn');
const form = document.getElementById('form');
const resultLabel = document.getElementById('resultLabel');
const toggleThemeBtn = document.getElementById('toggleThemeBtn');
const toggleSecretBtn = document.getElementById('toggleSecretBtn');
const eyeIcon = document.getElementById('eyeIcon');
const eyeOffIcon = document.getElementById('eyeOffIcon');
const copyBtn = document.getElementById('copyBtn');
const timerContainer = document.getElementById('timerContainer');
const timerCount = document.getElementById('timerCount');
const timerBar = document.getElementById('timerBar');
const timerToggleBtn = document.getElementById('timerToggleBtn');
const pauseIcon = document.getElementById('pauseIcon');
const playIcon = document.getElementById('playIcon');

// ── Constants ─────────────────────────────────────────────────────────────

const OTP_PERIOD_SECONDS      = 30;
const OTP_PERIOD_MS           = OTP_PERIOD_SECONDS * 1000;
const TIMER_TICK_MS           = 1000;
const ERROR_CLEAR_TIMEOUT_MS  = 5000;
const COPY_FEEDBACK_TIMEOUT_MS = 2000;
const BLUR_DEBOUNCE_MS        = 200;

const DARK_THEME_CODE   = 'dark';
const LIGHT_THEME_CODE  = 'light';
const THEME_STORAGE_KEY = 'theme';

const MSG_OTP_PREFIX     = 'Your OTP is: ';
const MSG_INVALID_SECRET = 'Invalid secret key';
const MSG_VALID_REQUIRED = 'Please enter a valid secret key';
const COPY_TITLE_DEFAULT = 'Copy OTP';
const COPY_TITLE_SUCCESS = 'Copied!';
const COPY_TITLE_FAIL    = 'Copy failed';

const TIMER_TOGGLE_TITLE_PAUSE  = 'Pause';
const TIMER_TOGGLE_TITLE_RESUME = 'Resume';

// ───────────────────────────────────────────────────────────────────────────

let timeoutClearLabel = null;
let timeoutBlur = null;
let refreshInterval = null;
let lastPeriod = null;
let currentSecret = null;
let isPaused = false;

// OTP generation

const updateTimerToggleBtn = () => {
  if (!timerToggleBtn) return;
  timerToggleBtn.title = isPaused ? TIMER_TOGGLE_TITLE_RESUME : TIMER_TOGGLE_TITLE_PAUSE;
  if (pauseIcon) pauseIcon.classList.toggle('hidden', isPaused);
  if (playIcon) playIcon.classList.toggle('hidden', !isPaused);
};

const updateTimer = () => {
  const secondsInPeriod = Math.floor(Date.now() / 1000) % OTP_PERIOD_SECONDS;
  const secondsLeft = OTP_PERIOD_SECONDS - secondsInPeriod;
  if (timerCount) timerCount.innerText = secondsLeft;
  if (timerBar) timerBar.style.width = `${(secondsLeft / OTP_PERIOD_SECONDS) * 100}%`;
};

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
  currentSecret = null;
  lastPeriod = null;
  isPaused = false;
  if (timerContainer) timerContainer.classList.add('hidden');
};

const pauseAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
  isPaused = true;
  updateTimerToggleBtn();
};

const onTimerTick = () => {
  updateTimer();
  const currentPeriod = Math.floor(Date.now() / OTP_PERIOD_MS);
  if (currentPeriod !== lastPeriod) {
    lastPeriod = currentPeriod;
    try {
      const otp = otplib.authenticator.generate(currentSecret);
      if (resultLabel) resultLabel.innerText = `${MSG_OTP_PREFIX}${otp}`;
    } catch (e) {
      // secret became invalid; stop refreshing
      stopAutoRefresh();
    }
  }
};

const resumeAutoRefresh = () => {
  if (!currentSecret) return;
  isPaused = false;
  updateTimerToggleBtn();
  onTimerTick();
  refreshInterval = setInterval(onTimerTick, TIMER_TICK_MS);
};

const startAutoRefresh = (secret) => {
  stopAutoRefresh();
  currentSecret = secret;
  lastPeriod = Math.floor(Date.now() / OTP_PERIOD_MS);
  isPaused = false;
  updateTimerToggleBtn();
  updateTimer();
  if (timerContainer) timerContainer.classList.remove('hidden');
  refreshInterval = setInterval(onTimerTick, TIMER_TICK_MS);
};

const clearLabel = () => {
  if (!resultLabel) return;
  resultLabel.innerText = '';
  clearTimeout(timeoutClearLabel);
  if (copyBtn) copyBtn.classList.add('hidden');
  stopAutoRefresh();
};

const handleForm = () => {
  if (!inputField || !resultLabel) return;

  clearLabel();

  let value = inputField.value;
  value = value.replace(/\s/g, '');
  if (!value) {
    resultLabel.innerText = MSG_VALID_REQUIRED;
    timeoutClearLabel = setTimeout(clearLabel, ERROR_CLEAR_TIMEOUT_MS);
    return;
  }

  try {
    const otp = otplib.authenticator.generate(value);
    resultLabel.innerText = `${MSG_OTP_PREFIX}${otp}`;
    if (copyBtn) copyBtn.classList.remove('hidden');
    startAutoRefresh(value);
  } catch (e) {
    resultLabel.innerText = MSG_INVALID_SECRET;
    timeoutClearLabel = setTimeout(clearLabel, ERROR_CLEAR_TIMEOUT_MS);
  }
};

if (inputField) {
  inputField.addEventListener('focus', function () {
    clearTimeout(timeoutBlur);
  });
  inputField.addEventListener('blur', function () {
    timeoutBlur = setTimeout(() => {
      handleForm();
    }, BLUR_DEBOUNCE_MS);
  });
}

if (submitBtn) {
  submitBtn.addEventListener('click', function (event) {
    event.preventDefault();
    clearTimeout(timeoutBlur);
    handleForm();
  });
}

if (form) {
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    clearTimeout(timeoutBlur);
    handleForm();
  });
}

// Copy OTP to clipboard

if (copyBtn) {
  copyBtn.addEventListener('click', function () {
    if (!resultLabel) return;
    const otp = resultLabel.innerText.replace(MSG_OTP_PREFIX, '').trim();
    if (!otp) return;
    navigator.clipboard.writeText(otp).then(() => {
      copyBtn.title = COPY_TITLE_SUCCESS;
      setTimeout(() => { copyBtn.title = COPY_TITLE_DEFAULT; }, COPY_FEEDBACK_TIMEOUT_MS);
    }).catch(() => {
      copyBtn.title = COPY_TITLE_FAIL;
      setTimeout(() => { copyBtn.title = COPY_TITLE_DEFAULT; }, COPY_FEEDBACK_TIMEOUT_MS);
    });
  });
}

// Toggle secret key visibility

if (toggleSecretBtn && inputField) {
  toggleSecretBtn.addEventListener('click', function () {
    const isPassword = inputField.type === 'password';
    inputField.type = isPassword ? 'text' : 'password';
    if (eyeIcon) eyeIcon.classList.toggle('hidden', isPassword);
    if (eyeOffIcon) eyeOffIcon.classList.toggle('hidden', !isPassword);
  });
}

if (timerToggleBtn) {
  timerToggleBtn.addEventListener('click', function () {
    if (isPaused) {
      resumeAutoRefresh();
    } else {
      pauseAutoRefresh();
    }
  });
}

// --------

// Theme switcher

function isDarkTheme() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored) {
    return stored === DARK_THEME_CODE;
  }
  return window.matchMedia('(prefers-color-scheme: ' + DARK_THEME_CODE + ')').matches;
}

function toggleTheme(isDark) {
  if (isDark) {
    document.documentElement.classList.add(DARK_THEME_CODE);
    document.documentElement.setAttribute('data-theme', DARK_THEME_CODE);
  } else {
    document.documentElement.classList.remove(DARK_THEME_CODE);
    document.documentElement.setAttribute('data-theme', LIGHT_THEME_CODE);
  }

  localStorage.setItem(THEME_STORAGE_KEY, isDark ? DARK_THEME_CODE : LIGHT_THEME_CODE);
}

if (toggleThemeBtn) {
  toggleThemeBtn.addEventListener('click', function () {
    toggleTheme(!isDarkTheme());
  });
}

toggleTheme(isDarkTheme());
