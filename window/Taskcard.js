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

// Initial render
renderCalendar(currentDate);