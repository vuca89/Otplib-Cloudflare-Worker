const inputField = document.getElementById('inputField');
const submitBtn = document.getElementById('submitBtn');
const form = document.getElementById('form');
const resultLabel = document.getElementById('resultLabel');
const toggleThemeBtn = document.getElementById('toggleThemeBtn');
let timeoutClearLabel = null;
let timeoutBlur = null;
const darkThemeCode = 'dark';

// OTP generation

const clearLabel = () => {
  if (!resultLabel)
    return;

  resultLabel.innerText = '';
  clearTimeout(timeoutClearLabel);
}

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

  const otp = otplib.authenticator.generate(value);
  resultLabel.innerText = `Your OTP is: ${otp}`;
}

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

    cleartimeout(timeoutBlur);
    handleForm();
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
