const openBtn = document.getElementById('openBtn');
const popupBox = document.getElementById('popupOverlay'); // your overlay id
const closeBtn = document.getElementById('closeBtn');
const iframe = document.getElementById('popupIframe');
const taskContainer = document.getElementById('taskContainer');
const sidebar = document.getElementById('mySidebar'); // for w3_open / w3_close

// Safety check for required elements
if (!openBtn || !popupBox || !iframe || !closeBtn || !taskContainer) {
  console.error('One or more required elements not found:', {
    openBtn, popupBox, iframe, closeBtn, taskContainer
  });
} else {
  console.log('All required elements found.');
}

// --- Popup (iframe) handling ---
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

// --- Sidebar helpers (as in your file) ---
function w3_open() {
  if (sidebar) sidebar.style.display = 'block';
}
function w3_close() {
  if (sidebar) sidebar.style.display = 'none';
}

// --- Tasks (localStorage) ---
// Use safe parse with fallback
let tasks;
try {
  tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  if (!Array.isArray(tasks)) tasks = [];
} catch (err) {
  console.warn('Failed parsing tasks from localStorage, resetting to []', err);
  tasks = [];
}

// Helper: save tasks
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Helper: clamp
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

// --- Progress calculation ---
// percent = elapsed / total * 100 ; createdAt -> deadline
function calculateProgressPercent(createdAtStr, deadlineStr) {
  try {
    const created = createdAtStr ? new Date(createdAtStr) : new Date(); // fallback to now
    const end = new Date(deadlineStr);
    // normalize times to start of day for day-based progress
    const start = new Date(created.getFullYear(), created.getMonth(), created.getDate());
    const finish = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const now = new Date();
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const totalMs = finish - start;
    const elapsedMs = nowDay - start;

    // if deadline already passed, percent = 100
    if (totalMs <= 0) {
      return 100;
    }

    const raw = (elapsedMs / totalMs) * 100;
    const percent = clamp(Math.round(raw), 0, 100);
    return percent;
  } catch (err) {
    console.warn('Progress calc error', err);
    return 0;
  }
}

// --- Render tasks (main) ---
function renderTasks() {
  taskContainer.innerHTML = '';

  tasks.forEach((t, i) => {
    // ensure minimal task shape
    if (!t.title) t.title = 'Untitled Task';
    // if task has no createdAt, set it now (persist)
    if (!t.createdAt) {
      t.createdAt = new Date().toISOString();
      saveTasks();
    }

    // card
    const el = document.createElement('div');
    el.className = 'taskCard';

    // favorite star (visual)
    const favMark = document.createElement('div');
    favMark.className = 'fav';
    favMark.textContent = t.favorite ? '★' : '☆';

    // title / description / deadline
    const h3 = document.createElement('h3');
    h3.textContent = t.title;

    const p = document.createElement('p');
    p.textContent = t.description || '';

    const small = document.createElement('small');
    small.textContent = `Deadline: ${t.deadline || '—'}`;

    // buttons container
    const controls = document.createElement('div');
    controls.style.marginTop = '8px';

    const favBtn = document.createElement('button');
    favBtn.className = 'favBtn';
    favBtn.textContent = t.favorite ? 'Unfavorite' : 'Favorite';

    const delBtn = document.createElement('button');
    delBtn.className = 'delBtn';
    delBtn.textContent = 'Delete';

    controls.appendChild(favBtn);
    controls.appendChild(delBtn);

    // assemble card content
    el.appendChild(favMark);
    el.appendChild(h3);
    el.appendChild(p);
    el.appendChild(small);

    // Add progress bar if deadline exists
    if (t.deadline) {
      const progressContainer = document.createElement('div');
      progressContainer.className = 'progress';

      const progressFill = document.createElement('div');
      progressFill.className = 'progress-fill';

      const percent = calculateProgressPercent(t.createdAt, t.deadline);
      progressFill.style.width = `${percent}%`;

      // color: green -> amber -> red as deadline nears (based on percent)
      // Here we interpret percent as elapsed fraction. If percent >= 100 -> overdue/completed time window.
      if (percent < 50) progressFill.style.background = '#4CAF50';
      else if (percent < 80) progressFill.style.background = '#FFC107';
      else progressFill.style.background = '#F44336';

      progressContainer.appendChild(progressFill);
      el.appendChild(progressContainer);
    }

    el.appendChild(controls);

    // favorite toggle
    favBtn.addEventListener('click', () => {
      tasks[i].favorite = !tasks[i].favorite;
      saveTasks();
      renderTasks();
    });

    // delete
    delBtn.addEventListener('click', () => {
      tasks.splice(i, 1);
      saveTasks();
      renderTasks();
    });

    taskContainer.appendChild(el);
  });
}

// initial render
document.addEventListener('DOMContentLoaded', renderTasks);

// --- Listen for messages from iframe add form ---
// The iframe should postMessage({ type:'newTask', task: { title, description, deadline } }, '*')
window.addEventListener('message', (event) => {
  // Optional: you can check event.origin if security needed
  const data = event.data;
  if (!data || typeof data !== 'object') return;

  console.log('message received', data);

  if (data.type === 'newTask' && data.task) {
    const incoming = data.task;
    // ensure required fields on incoming
    const newTask = {
      title: incoming.title || 'Untitled Task',
      description: incoming.description || '',
      deadline: incoming.deadline || '',
      favorite: !!incoming.favorite,
      createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    // close popup if available
    closePopup();
    return;
  }

  if (data.type === 'closePopup') {
    closePopup();
    return;
  }
});

// If your current "Add" code adds tasks directly (not through iframe), make sure to:
// - push createdAt = new Date().toISOString() into the new task object
// - call saveTasks() and renderTasks() after adding