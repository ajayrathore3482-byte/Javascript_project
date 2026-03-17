"use strict";

/* =========================
   1. DOM SELECTORS
========================= */
const profileForm = document.getElementById("profileForm");
const profilePreview = document.getElementById("profilePreview");

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const taskFilter = document.getElementById("taskFilter");
const taskSearch = document.getElementById("taskSearch");

const noteForm = document.getElementById("noteForm");
const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const notesList = document.getElementById("notesList");
const noteSearch = document.getElementById("noteSearch");

const quizQuestion = document.getElementById("quizQuestion");
const quizOptions = document.getElementById("quizOptions");
const nextQuestionBtn = document.getElementById("nextQuestionBtn");
const quizScore = document.getElementById("quizScore");

const cityInput = document.getElementById("cityInput");
const getWeatherBtn = document.getElementById("getWeatherBtn");
const weatherResult = document.getElementById("weatherResult");

const themeToggle = document.getElementById("themeToggle");

const timerDisplay = document.getElementById("timerDisplay");
const startTimerBtn = document.getElementById("startTimer");
const pauseTimerBtn = document.getElementById("pauseTimer");
const resetTimerBtn = document.getElementById("resetTimer");
const modeButtons = document.querySelectorAll(".mode-btn");

const totalTasksEl = document.getElementById("totalTasks");
const completedTasksEl = document.getElementById("completedTasks");
const pendingTasksEl = document.getElementById("pendingTasks");
const totalNotesEl = document.getElementById("totalNotes");
const topicsCovered = document.getElementById("topicsCovered");
const toast = document.getElementById("toast");

/* =========================
   2. STORAGE + DEFAULT DATA
========================= */
let profile = JSON.parse(localStorage.getItem("studentProfile")) || {};
let tasks = JSON.parse(localStorage.getItem("studentTasks")) || [];
let notes = JSON.parse(localStorage.getItem("studentNotes")) || [];
let currentTheme = localStorage.getItem("theme") || "light";

let currentTaskSearch = "";
let currentNoteSearch = "";
let currentFilter = "all";

/* =========================
   3. TOPICS ARRAY
========================= */
const jsTopics = [
  "variables",
  "data types",
  "operators",
  "if/else",
  "switch",
  "loops",
  "functions",
  "arrays",
  "objects",
  "DOM manipulation",
  "events",
  "form validation",
  "localStorage",
  "sessionStorage",
  "JSON",
  "template literals",
  "array methods",
  "callbacks",
  "closures",
  "setTimeout",
  "setInterval",
  "promises",
  "async/await",
  "try/catch",
  "destructuring",
  "spread operator",
  "rest operator",
  "ternary operator",
  "event delegation",
  "debouncing"
];

/* =========================
   4. HELPER FUNCTIONS
========================= */

// Toast with setTimeout
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

// Save reusable helper
function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Debounce function (closure)
function debounce(callback, delay = 500) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

// ID generator using closure
function createIdGenerator(start = 1) {
  let id = start;
  return function () {
    return id++;
  };
}

const generateId = createIdGenerator(Date.now());

// Rest operator example
function sumNumbers(...numbers) {
  return numbers.reduce((acc, curr) => acc + curr, 0);
}

// Callback example
function executeAfterAction(message, callback) {
  callback(message);
}

/* =========================
   5. PROFILE SECTION
========================= */
function renderProfile() {
  const { name = "Not set", email = "Not set", course = "Not set", goal = "Not set" } = profile;

  profilePreview.innerHTML = `
    <h3>${name}</h3>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Course:</strong> ${course}</p>
    <p><strong>Daily Goal:</strong> ${goal}</p>
  `;
}

profileForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const course = document.getElementById("course").value.trim();
  const goal = document.getElementById("goal").value.trim();

  if (!name || !email || !course || !goal) {
    showToast("Please fill all profile fields");
    return;
  }

  if (!email.includes("@")) {
    showToast("Enter a valid email");
    return;
  }

  profile = { name, email, course, goal };
  saveToStorage("studentProfile", profile);
  renderProfile();
  showToast("Profile saved successfully");
});

/* =========================
   6. TASK MANAGER
========================= */
function addTask(taskText) {
  const newTask = {
    id: generateId(),
    text: taskText,
    completed: false,
    createdAt: Date.now()
  };

  tasks = [...tasks, newTask];
  saveToStorage("studentTasks", tasks);
  renderTasks();
  updateStats();
}

function getFilteredTasks() {
  let filteredTasks = [...tasks];

  if (currentFilter === "completed") {
    filteredTasks = filteredTasks.filter(task => task.completed);
  } else if (currentFilter === "pending") {
    filteredTasks = filteredTasks.filter(task => !task.completed);
  }

  if (currentTaskSearch) {
    filteredTasks = filteredTasks.filter(task =>
      task.text.toLowerCase().includes(currentTaskSearch.toLowerCase())
    );
  }

  // sort example
  filteredTasks.sort((a, b) => b.createdAt - a.createdAt);

  return filteredTasks;
}

function renderTasks() {
  const filteredTasks = getFilteredTasks();

  if (filteredTasks.length === 0) {
    taskList.innerHTML = `<li>No tasks found</li>`;
    return;
  }

  taskList.innerHTML = filteredTasks
    .map(({ id, text, completed }) => {
      return `
        <li class="${completed ? "completed" : ""}" data-id="${id}">
          <span class="task-text">${text}</span>
          <div class="task-actions">
            <button class="small-btn complete-btn">${completed ? "Undo" : "Complete"}</button>
            <button class="small-btn delete-btn">Delete</button>
          </div>
        </li>
      `;
    })
    .join("");
}

taskForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const value = taskInput.value.trim();

  if (value.length < 3) {
    showToast("Task must be at least 3 characters");
    return;
  }

  addTask(value);
  taskInput.value = "";
  executeAfterAction("Task added", showToast);
});

// Event delegation
taskList.addEventListener("click", function (e) {
  const li = e.target.closest("li");
  if (!li) return;

  const id = Number(li.dataset.id);
  const taskIndex = tasks.findIndex(task => task.id === id);

  if (taskIndex === -1) return;

  if (e.target.classList.contains("complete-btn")) {
    tasks[taskIndex].completed = !tasks[taskIndex].completed;
  }

  if (e.target.classList.contains("delete-btn")) {
    tasks = tasks.filter(task => task.id !== id);
  }

  saveToStorage("studentTasks", tasks);
  renderTasks();
  updateStats();
});

taskFilter.addEventListener("change", function () {
  currentFilter = this.value;
  renderTasks();
});

taskSearch.addEventListener(
  "input",
  debounce(function (e) {
    currentTaskSearch = e.target.value.trim();
    renderTasks();
  }, 400)
);

/* =========================
   7. NOTES SECTION
========================= */
function addNote(title, content) {
  const newNote = {
    id: generateId(),
    title,
    content,
    createdAt: Date.now()
  };

  notes = [...notes, newNote];
  saveToStorage("studentNotes", notes);
  renderNotes();
  updateStats();
}

function getFilteredNotes() {
  let filteredNotes = [...notes];

  if (currentNoteSearch) {
    filteredNotes = filteredNotes.filter(note =>
      `${note.title} ${note.content}`.toLowerCase().includes(currentNoteSearch.toLowerCase())
    );
  }

  return filteredNotes.sort((a, b) => b.createdAt - a.createdAt);
}

function renderNotes() {
  const filteredNotes = getFilteredNotes();

  if (filteredNotes.length === 0) {
    notesList.innerHTML = `<p>No notes available</p>`;
    return;
  }

  notesList.innerHTML = filteredNotes
    .map(({ id, title, content }) => {
      return `
        <div class="note-card" data-id="${id}">
          <h4>${title}</h4>
          <p>${content}</p>
          <div class="note-actions">
            <button class="small-btn delete-btn">Delete</button>
          </div>
        </div>
      `;
    })
    .join("");
}

noteForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();

  if (!title || !content) {
    showToast("Please fill note title and content");
    return;
  }

  addNote(title, content);
  noteTitle.value = "";
  noteContent.value = "";
  showToast("Note added");
});

notesList.addEventListener("click", function (e) {
  const noteCard = e.target.closest(".note-card");
  if (!noteCard) return;

  const id = Number(noteCard.dataset.id);

  if (e.target.classList.contains("delete-btn")) {
    notes = notes.filter(note => note.id !== id);
    saveToStorage("studentNotes", notes);
    renderNotes();
    updateStats();
    showToast("Note deleted");
  }
});

noteSearch.addEventListener(
  "input",
  debounce(function (e) {
    currentNoteSearch = e.target.value.trim();
    renderNotes();
  }, 400)
);

/* =========================
   8. QUIZ SECTION
========================= */
const quizData = [
  {
    question: "Which keyword is used to declare a block-scoped variable?",
    options: ["var", "let", "print", "define"],
    answer: "let"
  },
  {
    question: "Which method converts JSON string into JavaScript object?",
    options: ["JSON.parse()", "JSON.stringify()", "parseInt()", "toObject()"],
    answer: "JSON.parse()"
  },
  {
    question: "Which array method returns a new array with matched items?",
    options: ["map", "filter", "reduce", "find"],
    answer: "filter"
  },
  {
    question: "Which function runs repeatedly after fixed time?",
    options: ["setTimeout", "setInterval", "clearTimeout", "addEventListener"],
    answer: "setInterval"
  }
];

let currentQuestionIndex = 0;
let score = Number(sessionStorage.getItem("quizScore")) || 0;
let selectedAnswer = null;

function renderQuiz() {
  if (currentQuestionIndex >= quizData.length) {
    quizQuestion.textContent = `Quiz Finished! Final Score: ${score}/${quizData.length}`;
    quizOptions.innerHTML = "";
    nextQuestionBtn.style.display = "none";
    sessionStorage.setItem("quizScore", score);
    return;
  }

  const { question, options } = quizData[currentQuestionIndex];
  quizQuestion.textContent = question;

  quizOptions.innerHTML = options
    .map(option => `<div class="quiz-option" data-option="${option}">${option}</div>`)
    .join("");

  quizScore.textContent = `Score: ${score}`;
}

quizOptions.addEventListener("click", function (e) {
  if (!e.target.classList.contains("quiz-option")) return;

  document.querySelectorAll(".quiz-option").forEach(option => {
    option.classList.remove("selected");
  });

  e.target.classList.add("selected");
  selectedAnswer = e.target.dataset.option;
});

nextQuestionBtn.addEventListener("click", function () {
  if (!selectedAnswer) {
    showToast("Please select an answer");
    return;
  }

  const currentQuestion = quizData[currentQuestionIndex];

  score += selectedAnswer === currentQuestion.answer ? 1 : 0;
  sessionStorage.setItem("quizScore", score);

  currentQuestionIndex++;
  selectedAnswer = null;
  renderQuiz();
});

/* =========================
   9. WEATHER SECTION
========================= */
function getWeatherDescription(code) {
  switch (code) {
    case 0:
      return "Clear sky";
    case 1:
    case 2:
    case 3:
      return "Partly cloudy";
    case 45:
    case 48:
      return "Fog";
    case 61:
    case 63:
    case 65:
      return "Rainy";
    default:
      return "Weather data available";
  }
}

async function fetchWeather(city) {
  try {
    weatherResult.innerHTML = `<p>Loading weather...</p>`;

    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    );
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found");
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,windspeed_10m,weather_code`
    );
    const weatherData = await weatherResponse.json();

    const { temperature_2m, windspeed_10m, weather_code } = weatherData.current;

    weatherResult.innerHTML = `
      <h3>${name}, ${country}</h3>
      <p><strong>Temperature:</strong> ${temperature_2m}°C</p>
      <p><strong>Wind Speed:</strong> ${windspeed_10m} km/h</p>
      <p><strong>Condition:</strong> ${getWeatherDescription(weather_code)}</p>
    `;

    showToast("Weather fetched successfully");
  } catch (error) {
    weatherResult.innerHTML = `<p>${error.message}</p>`;
    showToast("Weather fetch failed");
  }
}

getWeatherBtn.addEventListener("click", function () {
  const city = cityInput.value.trim();

  if (!city) {
    showToast("Please enter a city name");
    return;
  }

  fetchWeather(city);
});

/* =========================
   10. POMODORO TIMER
========================= */
function createPomodoroTimer() {
  let timer = null;
  let timeLeft = 25 * 60;
  let currentMode = "study";

  function updateDisplay() {
    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const seconds = String(timeLeft % 60).padStart(2, "0");
    timerDisplay.textContent = `${minutes}:${seconds}`;
  }

  function setMode(mode) {
    currentMode = mode;

    switch (mode) {
      case "study":
        timeLeft = 25 * 60;
        break;
      case "short":
        timeLeft = 5 * 60;
        break;
      case "long":
        timeLeft = 15 * 60;
        break;
      default:
        timeLeft = 25 * 60;
    }

    clearInterval(timer);
    timer = null;
    updateDisplay();
    showToast(`${mode} mode selected`);
  }

  function start() {
    if (timer) return;

    timer = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
      } else {
        clearInterval(timer);
        timer = null;
        showToast("Time is up!");
      }
    }, 1000);
  }

  function pause() {
    clearInterval(timer);
    timer = null;
  }

  function reset() {
    setMode(currentMode);
  }

  return {
    start,
    pause,
    reset,
    setMode
  };
}

const pomodoro = createPomodoroTimer();

startTimerBtn.addEventListener("click", pomodoro.start);
pauseTimerBtn.addEventListener("click", pomodoro.pause);
resetTimerBtn.addEventListener("click", pomodoro.reset);

modeButtons.forEach(button => {
  button.addEventListener("click", function () {
    pomodoro.setMode(this.dataset.mode);
  });
});

/* =========================
   11. THEME SWITCHER
========================= */
function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
}

themeToggle.addEventListener("click", function () {
  currentTheme = currentTheme === "light" ? "dark" : "light";
  applyTheme(currentTheme);
  showToast(`Theme changed to ${currentTheme}`);
});

/* =========================
   12. STATS
========================= */
function updateStats() {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = tasks.filter(task => !task.completed).length;
  const totalNotes = notes.length;

  totalTasksEl.textContent = totalTasks;
  completedTasksEl.textContent = completedTasks;
  pendingTasksEl.textContent = pendingTasks;
  totalNotesEl.textContent = totalNotes;

  // some / every examples
  const hasCompletedTask = tasks.some(task => task.completed);
  const allTasksCompleted = tasks.length > 0 ? tasks.every(task => task.completed) : false;

  console.log("Has completed task:", hasCompletedTask);
  console.log("All tasks completed:", allTasksCompleted);

  // reduce example
  const totalDemo = sumNumbers(totalTasks, completedTasks, pendingTasks, totalNotes);
  console.log("Combined stats sum:", totalDemo);
}

/* =========================
   13. TOPICS RENDER
========================= */
function renderTopics() {
  topicsCovered.innerHTML = jsTopics.map(topic => `<span>• ${topic}</span>`).join("<br>");
}

/* =========================
   14. INIT APP
========================= */
function init() {
  applyTheme(currentTheme);
  renderProfile();
  renderTasks();
  renderNotes();
  renderQuiz();
  renderTopics();
  updateStats();

  // Welcome message using ternary operator
  const welcomeMessage = profile.name
    ? `Welcome back, ${profile.name}!`
    : "Welcome! Please save your profile.";
  showToast(welcomeMessage);
}

init();