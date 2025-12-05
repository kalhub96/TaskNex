// TP.js - Progress tracking page logic
// Sidebar 
const sidebar = document.getElementById('mySidebar');
function w3_open() { if (sidebar) sidebar.style.display = 'block'; }
function w3_close() { if (sidebar) sidebar.style.display = 'none'; }

// Progress bar elements
const overallFill = document.getElementById('overallFill');
const weeklyFill  = document.getElementById('weeklyFill');
const monthlyFill = document.getElementById('monthlyFill');

const totalCountEl     = document.getElementById('totalCount');
const completedCountEl = document.getElementById('completedCount');
const pendingCountEl   = document.getElementById('pendingCount');
const completedListEl  = document.getElementById('completedList');

async function fetchAllTasks() {
  try {
    const res = await fetch('/get-all-tasks');
    if (!res.ok) throw new Error('Failed to fetch tasks: ' + res.status);
    const tasks = await res.json();
    return Array.isArray(tasks) ? tasks : [];
  } catch (err) {
    console.error(err);
    return []; // fail-safe: empty list
  }
}

function getCompletedAt(task) {
  // prefer explicit completedAt, fallback to updatedAt
  if (task.completedAt) return new Date(task.completedAt);
  if (task.updatedAt) return new Date(task.updatedAt);
  return null;
}

function calculateAndRender(tasks) {
  const total = tasks.length;
  const completedTasks = tasks.filter(t => !!t.done);
  const completedCount = completedTasks.length;
  const pendingCount = total - completedCount;

  // overall percentage (guard divide by zero)
  const overallPct = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  // weekly: completed within last 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklyCompleted = completedTasks.filter(t => {
    const cAt = getCompletedAt(t);
    return cAt && cAt >= oneWeekAgo;
  }).length;
  const weeklyPct = total === 0 ? 0 : Math.round((weeklyCompleted / total) * 100);

  // monthly: completed within last 30 days
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const monthlyCompleted = completedTasks.filter(t => {
    const cAt = getCompletedAt(t);
    return cAt && cAt >= oneMonthAgo;
  }).length;
  const monthlyPct = total === 0 ? 0 : Math.round((monthlyCompleted / total) * 100);

  // render fills & counts
  overallFill.style.width = overallPct + '%';
  overallFill.title = `${overallPct}% overall (${completedCount}/${total})`;

  weeklyFill.style.width = weeklyPct + '%';
  weeklyFill.title = `${weeklyPct}% weekly (${weeklyCompleted}/${total})`;

  monthlyFill.style.width = monthlyPct + '%';
  monthlyFill.title = `${monthlyPct}% monthly (${monthlyCompleted}/${total})`;

  totalCountEl.textContent = total;
  completedCountEl.textContent = completedCount;
  pendingCountEl.textContent = pendingCount;

  // Completed tasks list
  completedListEl.innerHTML = '';
  completedTasks.slice().reverse().forEach(t => {
    const li = document.createElement('li');
    const time = getCompletedAt(t);
    li.textContent = `${t.title || 'Untitled'} — ${time ? time.toLocaleString() : 'completed'}`;
    completedListEl.appendChild(li);
  });
}

async function loadAndRender() {
  const tasks = await fetchAllTasks();
  calculateAndRender(tasks);
}

// initial load
window.addEventListener('load', () => {
  loadAndRender();

  // optional: refresh periodically (every 30s)
  setInterval(loadAndRender, 30000);
});