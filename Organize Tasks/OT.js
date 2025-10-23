// --- Element references ---
const openBtn = document.getElementById('openBtn');
const popupBox = document.getElementById('popupOverlay');
const closeBtn = document.getElementById('closeBtn');
const iframe = document.getElementById('popupIframe');
const taskContainer = document.getElementById('taskContainer');
const sidebar = document.getElementById('mySidebar');

const favCount = document.getElementById("favCount");
const favoriteList = document.getElementById("favoriteList");
const toggleFavorites = document.getElementById("toggleFavorites");

// --- Popup handling ---
function openPopup(srcPath = '/window/indexadd.html') {
  iframe.src = srcPath;
  popupBox.style.display = 'flex';
  popupBox.setAttribute('aria-hidden', 'false');
}
function closePopup() {
  popupBox.style.display = 'none';
  iframe.src = '';
  popupBox.setAttribute('aria-hidden', 'true');
}
openBtn && openBtn.addEventListener('click', () => openPopup());
closeBtn && closeBtn.addEventListener('click', closePopup);
popupBox && popupBox.addEventListener('click', (e) => {
  if (e.target === popupBox) closePopup();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && popupBox.style.display === 'flex') closePopup();
});

// --- Sidebar ---
function w3_open() { if (sidebar) sidebar.style.display = 'block'; }
function w3_close() { if (sidebar) sidebar.style.display = 'none'; }

// --- Load tasks and favorites ---
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// Ensure each task has a unique id
function ensureTaskIds() {
  tasks.forEach((t, i) => {
    if (!t.id) t.id = Date.now() + i + Math.random().toString(16).slice(2);
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
ensureTaskIds();

// --- Save tasks ---
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// --- Calculate progress ---
function calculateProgressPercent(createdAtStr, deadlineStr) {
  try {
    const created = createdAtStr ? new Date(createdAtStr) : new Date();
    const end = new Date(deadlineStr);
    const now = new Date();
    const totalMs = end - created;
    const elapsedMs = now - created;
    if (totalMs <= 0) return 100;
    return Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)));
  } catch {
    return 0;
  }
}

// --- Render tasks ---
function renderTasks() {
  taskContainer.innerHTML = "";

  tasks.forEach((task, index) => {
    const isFav = favorites.some(f => f.id === task.id);
    const progress = calculateProgressPercent(task.createdAt, task.deadline);

    const card = document.createElement("div");
    card.classList.add("taskCard");

    card.innerHTML = `
      <h3>${task.title || "Untitled Task"}</h3>
      <p>${task.description || ""}</p>
      <small>Deadline: ${task.deadline || "—"}</small>
      <div class="progress">
        <div class="progress-fill" style="width:${progress}%; background:${
          progress < 50 ? "#4CAF50" : progress < 80 ? "#FFC107" : "#F44336"
        }"></div>
      </div>
      <div class="task-actions">
        <button class="favBtn">${isFav ? "★" : "☆"}</button>
        <button class="delBtn">🗑</button>
      </div>
    `;

    // Favorite toggle
    card.querySelector(".favBtn").addEventListener("click", () => toggleFavorite(task.id));

    // Delete task
    card.querySelector(".delBtn").addEventListener("click", () => deleteTask(task.id));

    taskContainer.appendChild(card);
  });
}

// --- Favorite handling ---
function toggleFavorite(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const alreadyFav = favorites.find(f => f.id === taskId);
  if (alreadyFav) {
    favorites = favorites.filter(f => f.id !== taskId);
  } else {
    favorites.push(task);
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateFavoriteSection();
  renderTasks();
}

// --- Delete handling ---
function deleteTask(taskId) {
  tasks = tasks.filter(t => t.id !== taskId);
  favorites = favorites.filter(f => f.id !== taskId);
  saveTasks();
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderTasks();
  updateFavoriteSection();
}

// --- Update favorite section ---
function updateFavoriteSection() {
  favCount.textContent = favorites.length;
  favoriteList.innerHTML = "";

  if (favorites.length === 0) {
    favoriteList.innerHTML = "<p style='font-size:13px;color:#888'>No favorites yet</p>";
    return;
  }

  favorites.forEach(fav => {
    const div = document.createElement("div");
    div.classList.add("favTask");
    div.textContent = fav.title;
    div.addEventListener("click", () => {
      alert(`Task: ${fav.title}\nDeadline: ${fav.deadline || "—"}`);
    });
    favoriteList.appendChild(div);
  });
}

// --- Dropdown toggle ---
toggleFavorites.addEventListener("click", () => {
  favoriteList.style.display = favoriteList.style.display === "block" ? "none" : "block";
});

// --- Message listener from iframe ---
window.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || typeof data !== "object") return;

  if (data.type === "newTask" && data.task) {
    const newTask = {
      id: Date.now() + Math.random().toString(16).slice(2),
      title: data.task.title || "Untitled Task",
      description: data.task.description || "",
      deadline: data.task.deadline || "",
      createdAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    closePopup();
  }
  if (data.type === "closePopup") closePopup();
});

// --- Init ---
document.addEventListener("DOMContentLoaded", () => {
  renderTasks();
  updateFavoriteSection();
});