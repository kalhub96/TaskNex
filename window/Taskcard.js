console.log('indexadd: script loaded');

const form = document.getElementById('taskForm');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const deadline = document.getElementById('deadline').value;

  if (!title || !description) {
    alert('Please fill in title and description');
    return;
  }

  const taskData = { title, description, deadline, favorite: false };

  // debug log so you can see this action in the iframe console
  console.log('indexadd: sending task to parent', taskData);

  // Send message to parent window (use '*' during dev; set origin for prod)
  window.parent.postMessage({ type: 'newTask', task: taskData }, '*');


  // reset form
  form.reset();
});

const monthYear = document.getElementById('monthYear');
const dayContainer = document.getElementById('days');
const prevBtn = document.getElementById('prevMonth');
const nextBtn = document.getElementById('nextMonth');

let currentDate = new Date();

const months =[
  "January", "February", "March", "April", "May", "June", "July", "August",
  "September", "October", "November", "December"];

  function renderCalendar(date) {
  daysContainer.innerHTML = '';
  const year = date.getFullYear();
  const month = date.getMonth();
  
  monthYear.textContent = `${months[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  // Add blank spaces for days before first day
  for (let i = 0; i < firstDay; i++) {
    const blankDiv = document.createElement('div');
    daysContainer.appendChild(blankDiv);
  }

  // Add days
  for (let i = 1; i <= lastDate; i++) {
    const dayDiv = document.createElement('div');
    dayDiv.textContent = i;

    // Highlight today
    const today = new Date();
    if (
      i === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      dayDiv.classList.add('today');
    }

    daysContainer.appendChild(dayDiv);
  }
}

// Navigation
prevBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
});

nextBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
});

// Initial render
renderCalendar(currentDate);