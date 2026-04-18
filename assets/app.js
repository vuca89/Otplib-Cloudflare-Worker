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

let timeoutClearLabel = null;
let timeoutBlur = null;
let refreshInterval = null;
let lastPeriod = null;
let currentSecret = null;
const darkThemeCode = 'dark';

// OTP generation

const updateTimer = () => {
  const secondsInPeriod = Math.floor(Date.now() / 1000) % 30;
  const secondsLeft = 30 - secondsInPeriod;
  if (timerCount) timerCount.innerText = secondsLeft;
  if (timerBar) timerBar.style.width = `${(secondsLeft / 30) * 100}%`;
};

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
  currentSecret = null;
  lastPeriod = null;
  if (timerContainer) timerContainer.classList.add('hidden');
};

const startAutoRefresh = (secret) => {
  stopAutoRefresh();
  currentSecret = secret;
  lastPeriod = Math.floor(Date.now() / 30000);
  updateTimer();
  if (timerContainer) timerContainer.classList.remove('hidden');

  refreshInterval = setInterval(() => {
    updateTimer();
    const currentPeriod = Math.floor(Date.now() / 30000);
    if (currentPeriod !== lastPeriod) {
      lastPeriod = currentPeriod;
      try {
        const otp = otplib.authenticator.generate(currentSecret);
        if (resultLabel) resultLabel.innerText = `Your OTP is: ${otp}`;
      } catch (e) {
        // secret became invalid; stop refreshing
        stopAutoRefresh();
      }
    }
  }, 1000);
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
    resultLabel.innerText = 'Please enter a valid secret key';
    timeoutClearLabel = setTimeout(clearLabel, 5000);
    return;
  }

  try {
    const otp = otplib.authenticator.generate(value);
    resultLabel.innerText = `Your OTP is: ${otp}`;
    if (copyBtn) copyBtn.classList.remove('hidden');
    startAutoRefresh(value);
  } catch (e) {
    resultLabel.innerText = 'Invalid secret key';
    timeoutClearLabel = setTimeout(clearLabel, 5000);
  }
};

if (inputField) {
  inputField.addEventListener('focus', function () {
    clearTimeout(timeoutBlur);
  });
  inputField.addEventListener('blur', function () {
    timeoutBlur = setTimeout(() => {
      handleForm();
    }, 200);
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
    const otp = resultLabel.innerText.replace('Your OTP is: ', '').trim();
    if (!otp) return;
    navigator.clipboard.writeText(otp).then(() => {
      copyBtn.title = 'Copied!';
      setTimeout(() => { copyBtn.title = 'Copy OTP'; }, 2000);
    }).catch(() => {
      copyBtn.title = 'Copy failed';
      setTimeout(() => { copyBtn.title = 'Copy OTP'; }, 2000);
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

// --------

// Theme switcher

function isDarkTheme() {
  return localStorage.getItem('theme') === darkThemeCode ||
    document.documentElement.classList.contains(darkThemeCode) ||
    document.documentElement.getAttribute('data-theme') === darkThemeCode ||
    window.matchMedia('(prefers-color-scheme: ' + darkThemeCode + ')').matches;
}

function toggleTheme(isDark) {
  if (isDark) {
    document.documentElement.classList.add(darkThemeCode);
    document.documentElement.setAttribute('data-theme', darkThemeCode);
  } else {
    document.documentElement.classList.remove(darkThemeCode);
    document.documentElement.setAttribute('data-theme', 'light');
  }

  localStorage.setItem('theme', isDark ? darkThemeCode : 'light');
}

if (toggleThemeBtn) {
  toggleThemeBtn.addEventListener('click', function () {
    toggleTheme(!isDarkTheme());
  });
}

toggleTheme(isDarkTheme());
