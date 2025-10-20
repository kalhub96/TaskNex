window.addEventListener("massage", (event) => {
    const tasks = event.data.tasks;
    if (!tasks) return;

    const container = 
    document.getElementById("taskContainer");
    container.innerHTML="";//clear before adding new

    tasks.forEach((task, index) => {
        const card = 
        document.createElement("div");
        card.classList.add("task-card");
        card.innerHTML = `
        <div class="task-title">${task.title}</div>
        <div class="task-desc">${task.description || "No description"}</div>
        <div class="task-actions">
            <button class="btn done">Done</button>
            <button class="btn delete">Delete</button>
        </div>`;
        container.appendChild(card);
    });
});