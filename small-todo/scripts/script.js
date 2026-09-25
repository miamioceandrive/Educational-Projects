const API_URL = "https://dummyjson.com/todos";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const statusText = document.getElementById("status");
const button = form.querySelector("button");

function showStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.classList.toggle("error", isError);
}

function renderTodo(todo, position = "end") {
  const li = document.createElement("li");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;

  // Текст задачи
  const span = document.createElement("span");
  span.textContent = todo.todo;

  if (todo.completed) {
    li.classList.add("done");
  }

  checkbox.addEventListener("change", () => {
    li.classList.toggle("done", checkbox.checked);
  });

  li.append(checkbox, span);

  if (position === "start") {
    list.prepend(li);
  } else {
    list.append(li);
  }
}

// 1. ПОЛУЧЕНИЕ ЗАДАЧ (GET-запрос)
async function loadTodos() {
  showStatus("Загрузка...");

  try {
    const response = await fetch(`${API_URL}?limit=10`);

    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }

    const data = await response.json();

    data.todos.forEach((todo) => renderTodo(todo));

    showStatus("");
  } catch (error) {
    console.error(error);
    showStatus("Не удалось загрузить задачи", true);
  }
}

// 2. ДОБАВЛЕНИЕ ЗАДАЧИ (POST-запрос)
async function addTodo(text) {
  try {
    const response = await fetch(`${API_URL}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({
        todo: text,
        completed: false,
        userId: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }

    const newTodo = await response.json();

    // Показываем новую задачу в начале списка
    renderTodo(newTodo, "start");
    showStatus("");
  } catch (error) {
    console.error(error);
    showStatus("Не удалось добавить задачу ", true);
  }
}

// Обработчик отправки формы
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const text = input.value.trim();

  if (!text) {
    return;
  }

  await addTodo(text);
  button.disabled = false;

  input.value = "";
  input.focus();
});

loadTodos();
