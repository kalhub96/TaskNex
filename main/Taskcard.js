console.log('indexadd: script loaded');

const form = document.getElementById('taskForm');
const taskInput = document.getElementById('mainInput');
const addChecklistBtn = document.getElementById('addChecklistBtn');
const taskList = document.getElementById('taskList');

let checklist = []; // Store all checklist items

// Add checklist item
addChecklistBtn.addEventListener('click', () => {
  const text = taskInput.value.trim();
  if (!text) return;

  const li = document.createElement('li');
  li.innerHTML = `<label><input type="checkbox"> ${text}</label>`; 
  taskList.appendChild(li);

  checklist.push({ text, done: false });
  taskInput.value = '';
});

// Main task submit
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const deadline = document.getElementById('deadline').value;


  const taskData = {
    title,
    description,
    deadline,
    checklist, 
    createdAt: new Date().toISOString(), 
    favorite: false,
  };

  // Minimal calendar placeholder
  let currentDate = new Date();
  function renderCalendar(date) {
    console.log("Render calendar for", date);
  }
  renderCalendar(currentDate);

  // Send task to parent iframe
  console.log('indexadd: sending task to parent', taskData);
  window.parent.postMessage({ type: 'newTask', task: taskData }, '*');

  // Reset form and checklist
  form.reset();
  taskList.innerHTML = '';
  checklist = [];
});