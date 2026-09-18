// ======================
// 1. МОДЕЛЬ ДАННЫХ
// ======================

function getTodos() {
  const raw = localStorage.getItem("todos");
  return raw ? JSON.parse(raw) : [];
}

function saveTodos(todos) {
  localStorage.setItem("todos", JSON.stringify(todos));
}

let todos = getTodos();

if (todos.length === 0) {
  todos = [
    {
      id: Date.now() + 1,
      title: "Покормить кошку",
      date: "2026-01-10T11:30",
      done: true,
      remind: false,
    },
    {
      id: Date.now() + 2,
      title: "Покормить кота",
      date: "2026-01-10T12:30",
      done: false,
      remind: false,
    },
    {
      id: Date.now() + 3,
      title: "Покормить Юру",
      date: "2026-01-10T14:00",
      done: false,
      remind: false,
    },
    {
      id: Date.now() + 4,
      title: "Покормить Саню",
      date: "2026-01-10T22:00",
      done: false,
      remind: false,
    },
  ];
  saveTodos(todos);
}

// ============================
// 2. ССЫЛКИ НА DOM-ЭЛЕМЕНТЫ
// ============================

// Список задач
const taskListEl = document.querySelector(".task-list");

const searchInputEl = document.querySelector(".search-input");

const filtersEl = document.querySelector(".filters");

// FAB — кнопка открытия модалки
const fabEl = document.querySelector(".fab");

// Модалка
const modalEl = document.querySelector(".modal");
const modalOverlayEl = document.querySelector(".modal-overlay");
const modalFormEl = document.querySelector(".modal-form");

// Поля формы внутри модалки
const descriptionInputEl = document.querySelector('input[name="description"]');
const dateInputEl = document.querySelector('input[name="date"]');
const remindInputEl = document.querySelector(".switch-input");

// Кнопка "Отмена"
const cancelBtnEl = document.querySelector(".btn-outline");

// ===============================
// 3. ФУНКЦИЯ render() — база
// ===============================

const MONTHS_RU = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

function formatDateForDisplay(machineDate) {
  if (!machineDate) return "";

  const d = new Date(machineDate);

  if (Number.isNaN(d.getTime())) return machineDate;

  const day = d.getDate(); // число месяца: 1 - 31
  const month = MONTHS_RU[d.getMonth()]; // getMonth() — от 0 - 11
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${day} ${month}, ${hours}:${minutes}`;
}

function createTaskElement(task) {
  const li = document.createElement("li");

  li.className = task.done ? "task task-done" : "task";

  li.dataset.id = task.id;

  li.innerHTML = `
    <label class="task-checkbox">
      <input class="task-checkbox-input" type="checkbox" ${task.done ? "checked" : ""} />
      <span class="task-checkbox-box" aria-hidden="true">
        <span class="task-checkbox-icon material-symbols-outlined">check</span>
      </span>
    </label>
    <div class="task-body">
      <p class="task-meta">${formatDateForDisplay(task.date)}</p>
      <p class="task-title">${task.title}</p>
    </div>
    <button class="task-delete" type="button" aria-label="Удалить задачу">
      <span class="material-symbols-outlined" aria-hidden="true">close</span>
    </button>
  `;

  return li;
}

// render
function render() {
  taskListEl.innerHTML = "";

  let visibleTodos = todos;

  if (currentFilter === "active") {
    visibleTodos = visibleTodos.filter((t) => !t.done);
  } else if (currentFilter === "done") {
    visibleTodos = visibleTodos.filter((t) => t.done);
  }

  if (searchQuery) {
    visibleTodos = visibleTodos.filter((t) =>
      t.title.toLowerCase().includes(searchQuery),
    );
  }

  if (visibleTodos.length === 0) {
    const emptyEl = document.createElement("li");
    emptyEl.className = "task-list-empty";
    emptyEl.textContent =
      searchQuery || currentFilter !== "all"
        ? "Ничего не найдено"
        : "Задач пока нет — нажми на карандаш, чтобы добавить";
    taskListEl.append(emptyEl);
    return;
  }

  for (const task of visibleTodos) {
    const li = createTaskElement(task);
    taskListEl.append(li);
  }
}

// ====================================================
// 4. СОБЫТИЯ: удалить задачу и отметить выполненной
// ====================================================

taskListEl.addEventListener("click", (e) => {
  const li = e.target.closest(".task");
  if (!li) return;
  const id = li.dataset.id;

  // --- Удаление ---

  if (e.target.closest(".task-delete")) {
    todos = todos.filter((t) => String(t.id) !== id);

    saveTodos(todos);
    render();
    return;
  }

  // --- Переключение "выполнено" ---

  if (e.target.closest(".task-checkbox")) {
    const task = todos.find((t) => String(t.id) === id);

    if (task) {
      task.done = !task.done;
      saveTodos(todos);
      render();
    }

    return;
  }

  // --- Редактирование ---

  const task = todos.find((t) => String(t.id) === id);
  if (task) {
    openEditModal(task);
  }
});

// ===========================
// 5. ФИЛЬТРЫ и ПОИСК
// ===========================

let currentFilter = "all";
let searchQuery = "";

filtersEl.addEventListener("click", (e) => {
  const tab = e.target.closest(".filters-tab");
  if (!tab) return;

  currentFilter = tab.dataset.filter;

  filtersEl.querySelectorAll(".filters-tab").forEach((btn) => {
    btn.classList.remove("filters-tab-active");
    btn.setAttribute("aria-selected", "false");
  });
  tab.classList.add("filters-tab-active");
  tab.setAttribute("aria-selected", "true");

  render();
});

searchInputEl.addEventListener("input", (e) => {
  searchQuery = e.target.value.toLowerCase().trim();
  render();
});

const searchFormEl = document.querySelector(".search");
searchFormEl.addEventListener("submit", (e) => {
  e.preventDefault();
});

// ==================================================
// 6. МОДАЛКА: добавление И редактирование задачи
// ==================================================
id;
let editingId = null;

const modalSubmitBtnEl = modalFormEl.querySelector(".btn-primary");

// --- openAddModal ---
// Открыть модалку в режиме новая задача: форма пустая, editingId сброшен.
function openAddModal() {
  editingId = null;
  modalFormEl.reset();
  modalSubmitBtnEl.textContent = "Добавить";
  modalEl.classList.add("is-open");
  descriptionInputEl.focus();
}

// --- openEditModal -----------------------------------------------------
// Открыть модалку в режиме редактирование для конкретной задачи.

function openEditModal(task) {
  editingId = task.id; // запоминаем какую именно задачу редактируем

  descriptionInputEl.value = task.title;
  dateInputEl.value = task.date;
  remindInputEl.checked = task.remind;

  modalSubmitBtnEl.textContent = "Сохранить";
  modalEl.classList.add("is-open");
  descriptionInputEl.focus();
}

// --- closeModal ---
// Закрыть модалку и вернуть её в нейтральное состояние — вызывается из
// ТРЁХ разных мест (оверлей, кнопка "Отмена", Escape)

function closeModal() {
  modalEl.classList.remove("is-open");
  modalFormEl.reset();
  editingId = null;
}

// --- Открытие модалки: клик по плавающей кнопке с карандашом ---
fabEl.addEventListener("click", () => {
  openAddModal();
});

// --- Закрытие модалки: три независимых способа ---
// Все три ведут к одному и тому же closeModal().

// Клик по затемнённой подложке позади окна:
modalOverlayEl.addEventListener("click", () => {
  closeModal();
});

// Кнопка "Отмена"
cancelBtnEl.addEventListener("click", () => {
  closeModal();
});

// Клавиша Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalEl.classList.contains("is-open")) {
    closeModal();
  }
});

// --- Сохранение: submit формы ---
modalFormEl.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = descriptionInputEl.value.trim();
  const date = dateInputEl.value;
  const remind = remindInputEl.checked;

  if (title === "") {
    descriptionInputEl.focus();
    return;
  }

  if (editingId === null) {
    // --- Режим добавления ---

    const newTask = {
      id: Date.now(),
      title,
      date,
      done: false,
      remind,
    };

    todos.unshift(newTask);
  } else {
    // --- Режим редактирования ---

    const task = todos.find((t) => t.id === editingId);
    if (task) {
      task.title = title;
      task.date = date;
      task.remind = remind;
    }
  }

  saveTodos(todos);
  closeModal();
  render();
});

render();
