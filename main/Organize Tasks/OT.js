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

// --- Load tasks and favorites ---
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// Ensure each task has a unique id
tasks.forEach((t, i) => {
    if (!t.id) t.id = Date.now() + i + Math.random().toString(16).slice(2);
});

// --- Save tasks ---
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// --- Progress calculation ---
function calculateProgress(task) {
    if (task.deadline) {
        const created = task.createdAt ? new Date(task.createdAt) : new Date();
        const end = new Date(task.deadline);
        const now = new Date();
        const totalMs = end - created;
        const elapsedMs = now - created;
        if (totalMs <= 0) return 100;
        return Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)));
    } else if (task.checklist && task.checklist.length > 0) {
        const doneCount = task.checklist.filter(c => c.done).length;
        return Math.round((doneCount / task.checklist.length) * 100);
    } else {
        return 0;
    }
}

// --- Render tasks ---
function renderTasks() {
    taskContainer.innerHTML = '';

    tasks.forEach((task) => {
        const isFav = favorites.some(f => f.id === task.id);
        const progress = calculateProgress(task);

        // Checklist HTML
        let checklistHTML = '';
        let checklistToggleBtn = '';
        if (task.checklist && task.checklist.length > 0) {
            checklistToggleBtn = `<button class="showChecklistBtn">Show Checklist</button>`;
            checklistHTML = `
            <ul class="checklist">
                ${task.checklist.map((item, index) => `
                    <li class="${item.done ? 'completed' : ''}">
                        <label>
                            <input type="checkbox" data-task="${task.id}" data-index="${index}" ${item.done ? 'checked' : ''}>
                            ${item.text}
                        </label>
                    </li>
                `).join('')}
            </ul>`;
        }

        const card = document.createElement('div');
        card.classList.add('taskCard');
        card.innerHTML = `
            <h3>${task.title || "Untitled Task"}</h3>
            <p>${task.description || ""}</p>
            ${checklistToggleBtn}
            ${checklistHTML}
            <small>Deadline: ${task.deadline || "—"}</small>
            <div class="progress">
                <div class="progress-fill" style="width:${progress}%; background:${progress < 50 ? "#4CAF50" : progress < 80 ? "#FFC107" : "#F44336"}"></div>
            </div>
            <div class="task-actions">
                <button class="favBtn">${isFav ? "★" : "☆"}</button>
                <button class="delBtn">🗑</button>
            </div>
        `;
        taskContainer.appendChild(card);

        // --- Favorite toggle ---
        card.querySelector(".favBtn").addEventListener("click", () => toggleFavorite(task.id));

        // --- Delete ---
        card.querySelector(".delBtn").addEventListener("click", () => deleteTask(task.id));

        // --- Toggle checklist ---
        const toggleBtn = card.querySelector(".showChecklistBtn");
        const checklist = card.querySelector(".checklist");
        if (toggleBtn && checklist) {
            toggleBtn.addEventListener("click", () => {
                if (checklist.style.display === "block") {
                    checklist.style.display = "none";
                    toggleBtn.textContent = "Show Checklist";
                } else {
                    checklist.style.display = "block";
                    toggleBtn.textContent = "Hide Checklist";
                }
            });
        }

        // --- Checklist item change ---
        if (checklist) {
            checklist.querySelectorAll("input[type=checkbox]").forEach(cb => {
                cb.addEventListener("change", (e) => {
                    const tId = e.target.dataset.task;
                    const idx = e.target.dataset.index;
                    const t = tasks.find(t => t.id == tId);
                    if (t && t.checklist && t.checklist[idx]) {
                        t.checklist[idx].done = e.target.checked;
                        saveTasks();
                        renderTasks(); // update progress
                    }
                });
            });
        }
    });
}

// --- Favorite functions ---
function toggleFavorite(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const alreadyFav = favorites.some(f => f.id === taskId);
    if (alreadyFav) favorites = favorites.filter(f => f.id !== taskId);
    else favorites.push(task);

    localStorage.setItem("favorites", JSON.stringify(favorites));
    updateFavoriteSection();
    renderTasks();
}

function updateFavoriteSection() {
    favCount.textContent = favorites.length;
    favoriteList.innerHTML = '';
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

// --- Delete task ---
function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    favorites = favorites.filter(f => f.id !== taskId);
    saveTasks();
    localStorage.setItem("favorites", JSON.stringify(favorites));
    updateFavoriteSection();
    renderTasks();
}

// --- Popup ---
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
popupBox && popupBox.addEventListener('click', (e) => { if (e.target === popupBox) closePopup(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && popupBox.style.display === 'flex') closePopup(); });

// --- Sidebar ---
function w3_open() { if (sidebar) sidebar.style.display = 'block'; }
function w3_close() { if (sidebar) sidebar.style.display = 'none'; }

// --- Iframe message listener ---
window.addEventListener("message", (event) => {
    const data = event.data;
    if (!data || typeof data !== "object") return;

    if (data.type === "newTask" && data.task) {
        const newTask = {
            id: Date.now() + Math.random().toString(16).slice(2),
            title: data.task.title || "Untitled Task",
            description: data.task.description || "",
            deadline: data.task.deadline || "",
            checklist: data.task.checklist || [],
            createdAt: new Date().toISOString(),
        };
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        closePopup();
    }
    if (data.type === "closePopup") closePopup();
});
// --- Search ---
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('keyup', function(e) {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.taskCard').forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const desc = card.querySelector('p').textContent.toLowerCase();
        card.style.display = (title.includes(term) || desc.includes(term)) ? '' : 'none';
    });
});

// --- Filter ---
const filterWrapper = document.getElementById('filterWrapper');
const filterSelect = document.getElementById('filterSelect');
filterWrapper.addEventListener('click', () => {
    filterSelect.style.display = filterSelect.style.display === 'block' ? 'none' : 'block';
});

filterSelect.addEventListener('change', () => {
    const val = filterSelect.value;
    document.querySelectorAll('.taskCard').forEach(card => {
        const progress = parseFloat(card.querySelector('.progress-fill').style.width);
        if (val === 'all') card.style.display = '';
        else if (val === 'completed' && progress === 100) card.style.display = '';
        else if (val === 'pending' && progress < 100) card.style.display = '';
        else card.style.display = 'none';
    });
});

// --- Favorites dropdown ---
toggleFavorites.addEventListener("click", () => {
    favoriteList.style.display = favoriteList.style.display === "block" ? "none" : "block";
});

// --- Init ---
document.addEventListener("DOMContentLoaded", () => {
    renderTasks();
    updateFavoriteSection();
});