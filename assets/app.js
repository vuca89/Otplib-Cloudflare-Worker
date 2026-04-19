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
const autoStopAlert = document.getElementById('autoStopAlert');
const autoStopAlertMsg = document.getElementById('autoStopAlertMsg');
// const autoStopAlertDismiss = document.getElementById('autoStopAlertDismiss');
const langBtn = document.getElementById('langBtn');
const langBtnLabel = document.getElementById('langBtnLabel');
const langDropdown = document.getElementById('langDropdown');

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

const AUTO_STOP_MINUTES    = 5;
const AUTO_STOP_TIMEOUT_MS = AUTO_STOP_MINUTES * 60 * 1000;

const LANG_STORAGE_KEY = 'lang';
const LANG_LABELS = { en: 'EN', ja: 'JA', ko: 'KO', de: 'DE', th: 'TH', zh: 'ZH', vi: 'VI' };

// ───────────────────────────────────────────────────────────────────────────

let timeoutClearLabel = null;
let timeoutBlur = null;
let refreshInterval = null;
let lastPeriod = null;
let currentSecret = null;
let isPaused = false;
let autoStopTimeout = null;

// ── i18n ──────────────────────────────────────────────────────────────────

let currentLocale = {};

const t = (key) => currentLocale[key] || key;

const applyTranslations = () => {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (currentLocale[key] !== undefined) el.textContent = currentLocale[key];
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (currentLocale[key] !== undefined) el.innerHTML = currentLocale[key];
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (currentLocale[key] !== undefined) el.title = currentLocale[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (currentLocale[key] !== undefined) el.placeholder = currentLocale[key];
  });
  // Timer text uses special template with timerCount span preserved
  const timerSpan = document.querySelector('[data-i18n-timer]');
  if (timerSpan && currentLocale.timerRefreshesIn) {
    const count = document.getElementById('timerCount');
    const countVal = count ? count.textContent : OTP_PERIOD_SECONDS;
    timerSpan.innerHTML = `${currentLocale.timerRefreshesIn} <span id="timerCount">${countVal}</span>${currentLocale.timerSeconds}`;
  }
  // Auto-stop alert message
  if (autoStopAlertMsg && currentLocale.autoStopMsg) {
    autoStopAlertMsg.innerHTML = currentLocale.autoStopMsg.replace('{minutes}', AUTO_STOP_MINUTES);
  }
  // Page title
  if (currentLocale.pageTitle) document.title = currentLocale.pageTitle;
  // Update pause/resume button title based on current state
  if (timerToggleBtn) {
    timerToggleBtn.title = isPaused ? t('timerResume') : t('timerPause');
  }
};

const loadLang = async (lang) => {
  try {
    const res = await fetch(`/locales/${lang}.json`);
    if (!res.ok) throw new Error('Not found');
    currentLocale = await res.json();
  } catch {
    // Fallback: keep current locale
    return;
  }
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  if (langBtnLabel) langBtnLabel.textContent = LANG_LABELS[lang] || lang.toUpperCase();
  applyTranslations();
};

// Language dropdown toggle
if (langBtn && langDropdown) {
  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    langDropdown.classList.toggle('hidden');
  });
  document.addEventListener('click', () => langDropdown.classList.add('hidden'));
  langDropdown.querySelectorAll('.lang-option').forEach(btn => {
    btn.addEventListener('click', () => {
      loadLang(btn.dataset.lang);
      langDropdown.classList.add('hidden');
    });
  });
}

// ──────────────────────────────────────────────────────────────────────────

const showAutoStopAlert = () => {
  if (autoStopAlert) autoStopAlert.classList.remove('hidden');
  // if (autoStopAlertDismiss) autoStopAlertDismiss.classList.remove('hidden');
  // Re-apply translated message in case lang changed while running
  if (autoStopAlertMsg && currentLocale.autoStopMsg) {
    autoStopAlertMsg.innerHTML = currentLocale.autoStopMsg.replace('{minutes}', AUTO_STOP_MINUTES);
  }
};

/*
const hideAutoStopAlert = () => {
  if (autoStopAlert) autoStopAlert.classList.add('hidden');
};
*/

const updateTimerToggleBtn = () => {
  if (!timerToggleBtn) return;
  timerToggleBtn.title = isPaused ? t('timerResume') : t('timerPause');
  if (pauseIcon) pauseIcon.classList.toggle('hidden', isPaused);
  if (playIcon) playIcon.classList.toggle('hidden', !isPaused);
};

const updateTimer = () => {
  const secondsInPeriod = Math.floor(Date.now() / 1000) % OTP_PERIOD_SECONDS;
  const secondsLeft = OTP_PERIOD_SECONDS - secondsInPeriod;
  const timerCountEl = document.getElementById('timerCount');
  if (timerCountEl) timerCountEl.innerText = secondsLeft;
  if (timerBar) timerBar.style.width = `${(secondsLeft / OTP_PERIOD_SECONDS) * 100}%`;
};

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
  if (autoStopTimeout) {
    clearTimeout(autoStopTimeout);
    autoStopTimeout = null;
  }
  currentSecret = null;
  lastPeriod = null;
  isPaused = false;
  if (timerContainer) timerContainer.classList.add('hidden');
};

const autoStop = () => {
  stopAutoRefresh();
  showAutoStopAlert();
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
        if (resultLabel) resultLabel.innerText = `${t('msgOtpPrefix')}${otp}`;
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
  autoStopTimeout = setTimeout(autoStop, AUTO_STOP_TIMEOUT_MS);
};

const clearLabel = () => {
  if (!resultLabel) return;
  resultLabel.innerText = '';
  clearTimeout(timeoutClearLabel);
  if (copyBtn) copyBtn.classList.add('hidden');
  // hideAutoStopAlert();
  stopAutoRefresh();
};

const handleForm = () => {
  if (!inputField || !resultLabel) return;

  clearLabel();

  let value = inputField.value;
  value = value.replace(/\s/g, '');
  if (!value) {
    resultLabel.innerText = t('msgValidRequired');
    timeoutClearLabel = setTimeout(clearLabel, ERROR_CLEAR_TIMEOUT_MS);
    return;
  }

  try {
    const otp = otplib.authenticator.generate(value);
    resultLabel.innerText = `${t('msgOtpPrefix')}${otp}`;
    if (copyBtn) copyBtn.classList.remove('hidden');
    startAutoRefresh(value);
  } catch (e) {
    resultLabel.innerText = t('msgInvalidSecret');
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
    const otp = resultLabel.innerText.replace(t('msgOtpPrefix'), '').trim();
    if (!otp) return;
    navigator.clipboard.writeText(otp).then(() => {
      copyBtn.title = t('copiedSuccess');
      setTimeout(() => { copyBtn.title = t('copyOtp'); }, COPY_FEEDBACK_TIMEOUT_MS);
    }).catch(() => {
      copyBtn.title = t('copyFailed');
      setTimeout(() => { copyBtn.title = t('copyOtp'); }, COPY_FEEDBACK_TIMEOUT_MS);
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

/*
if (autoStopAlertDismiss) {
  autoStopAlertDismiss.addEventListener('click', function () {
    hideAutoStopAlert();
  });
}
*/

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

// ── Bootstrap i18n ────────────────────────────────────────────────────────
const savedLang = localStorage.getItem(LANG_STORAGE_KEY) || 'en';
loadLang(savedLang);

