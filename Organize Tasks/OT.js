const openBtn = document.getElementById('openBtn');
const popupBox = document.getElementById('popupOverlay');
const closeBtn = document.getElementById('closeBtn');
const iframe = document.getElementById('popupIframe');

if (!openBtn || !popupBox || !iframe || !closeBtn) {
    console.error('One or more required element not found:',{openBtn, popupBox, iframe, closeBtn});
} else{

    openBtn.addEventListener('click', () => {
        iframe.src = '/window/indexadd.html';
        popupBox.style.display = 'flex';
        popupBox.setAttribute('aria-hidden','false');
    });
    
    closeBtn.addEventListener('click',closepopup);
    popupBox.addEventListener('click',(e) => {
        if(e.target === popupBox)
            closepopup();
    });

    document.addEventListener('keydown',(e) => {
        if (e.key === 'Escape' &&
            popupBox.style.display === 'flex')
            closepopup();
    });

    function closepopup() {
        popupBox.style.display = 'none';
        iframe.src = '';
        popupBox.setAttribute('aria-hidden','true');
    }
}

function w3_open() {
  document.getElementById("mySidebar").style.display = "block";
}

function w3_close() {
  document.getElementById("mySidebar").style.display = "none";
}

console.log('indexot: script loaded');
const taskContainer = document.getElementById('taskContainer');

let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

    function renderTasks() {
      taskContainer.innerHTML = '';
      tasks.forEach((t, i) => {
        const el = document.createElement('div');
        el.className = 'taskCard';
        el.innerHTML = `
          <div class="fav">${t.favorite ? '★' : '☆'}</div>
          <h3>${t.title}</h3>
          <p>${t.description}</p>
          <small>Deadline: ${t.deadline || '—'}</small>
          <div style="margin-top:8px">
            <button class="favBtn">${t.favorite ? 'Unfavorite' : 'Favorite'}</button>
            <button class="delBtn">Delete</button>
          </div>
          `;
        // favorite toggle
        el.querySelector('.favBtn').addEventListener('click', () => {
          tasks[i].favorite = !tasks[i].favorite;
          localStorage.setItem('tasks', JSON.stringify(tasks));
          renderTasks();
        });
        // delete
        el.querySelector('.delBtn').addEventListener('click', () => {
          tasks.splice(i, 1);
          localStorage.setItem('tasks', JSON.stringify(tasks));
          renderTasks();
        });
        taskContainer.appendChild(el);
      });
    }

    // initial render
    renderTasks();

    // message listener BEFORE iframe can send
    window.addEventListener('message', (event) => {
      console.log('indexot: message received', event.data, 'origin:', event.origin);
      // optional origin check in production:
      // if (event.origin !== 'http://yourdomain.com') return;

      const data = event.data;
      if (!data) return;
      if (data.type === 'newTask' && data.task) {
        tasks.push(data.task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        // hide popup
        popupOverlay.style.display = 'none';
      }
      if (data.type === 'closePopup') {
        popupOverlay.style.display = 'none';
      }
    });

    // popup controls
    openBtn.addEventListener('click', () => { popupOverlay.style.display = 'flex'; });
    closeBtn.addEventListener('click', () => { popupOverlay.style.display = 'none'; });