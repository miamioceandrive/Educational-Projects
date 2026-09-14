const STORAGE_KEY = "users";

function getUsers() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (data) {
    return JSON.parse(data);
  } else {
    return []; // ещё никто не регистрировался
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

//  поля формы регистрации
const nameInput = document.querySelector(".name");
const phoneInput = document.querySelector(".phone");
const emailInput = document.querySelector(".email");
const passwordInput = document.querySelector(".password");
const signupButton = document.querySelector(".signup");
const signupMessage = document.querySelector(".signupMessage");

//  поля формы входа
const emailLoginInput = document.querySelector(".emailLogin");
const passwordLoginInput = document.querySelector(".passwordLogin");
const loginButton = document.querySelector(".login");
const loginMessage = document.querySelector(".loginMessage");

//  ВАЛИДАЦИЯ

function validateName(name) {
  if (name.length < 2 || name.length > 24) {
    return false;
  }

  const onlyLetters = /^[A-Za-zА-Яа-яЁё]+$/;
  return onlyLetters.test(name);
}

function validateEmail(email) {
  if (email.length < 7) {
    return false;
  }

  return email.includes("@");
}

function validatePhone(phone) {
  if (phone[0] !== "+") {
    return false;
  }

  const digits = phone.slice(1);

  if (digits.length < 8 || digits.length > 12) {
    return false;
  }

  const onlyDigits = /^[0-9]+$/;
  return onlyDigits.test(digits);
}

function validatePassword(password) {
  return password.length >= 5 && password.length <= 26;
}

function showMessage(element, text, isError) {
  element.textContent = text;

  element.classList.remove("error", "success");

  if (isError) {
    element.classList.add("error");
  } else {
    element.classList.add("success");
  }
}

//  РЕГИСТРАЦИЯ

signupButton.addEventListener("click", function () {
  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  // проверка на пустые поля
  if (name === "" || phone === "" || email === "" || password === "") {
    showMessage(signupMessage, "Заполните все поля!", true);
    return;
  }

  // вадлидация инпутов
  if (!validateName(name)) {
    showMessage(
      signupMessage,
      "Имя должно содержать от 2 до 24 букв (только буквы)",
      true,
    );
    return;
  }

  if (!validateEmail(email)) {
    showMessage(
      signupMessage,
      "Email должен содержать символ @ и быть не короче 7 символов",
      true,
    );
    return;
  }

  if (!validatePhone(phone)) {
    showMessage(
      signupMessage,
      "Телефон должен начинаться с + и содержать от 8 до 12 цифр",
      true,
    );
    return;
  }

  if (!validatePassword(password)) {
    showMessage(
      signupMessage,
      "Пароль должен содержать от 5 до 26 символов",
      true,
    );
    return;
  }

  // достаем список юзеров из localStorage
  const users = getUsers();

  // Проверяем, не занят ли уже такой email.

  let emailAlreadyExists = false;
  for (let i = 0; i < users.length; i++) {
    if (users[i].email === email) {
      emailAlreadyExists = true;
    }
  }

  if (emailAlreadyExists) {
    showMessage(signupMessage, "Пользователь с таким email уже есть", true);
    return;
  }

  const newUser = {
    name: name,
    phone: phone,
    email: email,
    password: password,
  };

  users.push(newUser);
  saveUsers(users);

  showMessage(signupMessage, "Регистрация прошла успешно!", false);
  nameInput.value = "";
  phoneInput.value = "";
  emailInput.value = "";
  passwordInput.value = "";
});

//  АВТОРИЗАЦИЯ

loginButton.addEventListener("click", function () {
  const email = emailLoginInput.value.trim();
  const password = passwordLoginInput.value.trim();

  if (email === "" || password === "") {
    showMessage(loginMessage, "Заполните все поля!", true);
    return;
  }

  const users = getUsers();

  let foundUser = null;
  for (let i = 0; i < users.length; i++) {
    if (users[i].email === email && users[i].password === password) {
      foundUser = users[i];
    }
  }

  if (foundUser === null) {
    showMessage(loginMessage, "Неверный логин или пароль", true);
    return;
  }

  showMessage(loginMessage, "Здравствуйте, " + foundUser.name + "!", false);
  emailLoginInput.value = "";
  passwordLoginInput.value = "";
});
