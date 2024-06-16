document.addEventListener('DOMContentLoaded', () => {
    const projectModal = document.getElementById('projectModal');
    const taskModal = document.getElementById('taskModal');
    const projectModalTitle = document.getElementById('projectModalTitle');
    const taskModalTitle = document.getElementById('taskModalTitle');
    const addProjectBtn = document.getElementById('addProjectBtn');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const closeButtons = document.getElementsByClassName('close');
    const saveProjectBtn = document.getElementById('saveProjectBtn');
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    const projectsDiv = document.getElementById('projects');
    const tasksDiv = document.getElementById('tasks');
    const taskProjectSelect = document.getElementById('taskProject');
    let currentProject = null;
    let currentTask = null;

    // Show modals
    addProjectBtn.addEventListener('click', () => {
        currentProject = null;
        projectModalTitle.textContent = 'Add Project';
        projectModal.style.display = 'block';
    });

    addTaskBtn.addEventListener('click', () => {
        currentTask = null;
        taskModalTitle.textContent = 'Add Task';
        taskModal.style.display = 'block';
    });

    // Close modals
    Array.from(closeButtons).forEach(btn => {
        btn.addEventListener('click', () => {
            projectModal.style.display = 'none';
            taskModal.style.display = 'none';
        });
    });

    // Save project
    saveProjectBtn.addEventListener('click', () => {
        const projectId = currentProject ? currentProject : `project-${Date.now()}`;
        const projectName = document.getElementById('projectName').value;
        const projectDescription = document.getElementById('projectDescription').value;
        if (projectName && projectDescription) {
            if (currentProject) {
                const projectCard = document.querySelector(`.project-card[data-project-id="${projectId}"]`);
                projectCard.querySelector('h3').textContent = projectName;
                projectCard.querySelector('p').textContent = projectDescription;

                const option = taskProjectSelect.querySelector(`option[value="${projectId}"]`);
                option.textContent = projectName;
            } else {
                const projectCard = document.createElement('div');
                projectCard.className = 'project-card';
                projectCard.setAttribute('data-project-id', projectId);
                projectCard.innerHTML = `
                    <h3>${projectName}</h3>
                    <p>${projectDescription}</p>
                    <button onclick="viewProject('${projectId}')">View</button>
                    <button onclick="editProject('${projectId}')">Edit</button>
                    <button onclick="deleteProject('${projectId}')">Delete</button>
                `;
                projectsDiv.appendChild(projectCard);

                const option = document.createElement('option');
                option.value = projectId;
                option.textContent = projectName;
                taskProjectSelect.appendChild(option);

                addTaskBtn.disabled = false;
            }

            projectModal.style.display = 'none';
            document.getElementById('projectName').value = '';
            document.getElementById('projectDescription').value = '';
        }
    });

    // Save task
    saveTaskBtn.addEventListener('click', () => {
        const taskId = currentTask ? currentTask : `task-${Date.now()}`;
        const taskProjectId = document.getElementById('taskProject').value;
        const taskName = document.getElementById('taskName').value;
        const taskDeadline = document.getElementById('taskDeadline').value;
        const taskAssignee = document.getElementById('taskAssignee').value;
        if (taskProjectId && taskName && taskDeadline && taskAssignee) {
            if (currentTask) {
                const taskCard = document.querySelector(`.task-card[data-task-id="${taskId}"]`);
                taskCard.querySelector('h4').textContent = taskName;
                taskCard.querySelector('.deadline').textContent = `Deadline: ${taskDeadline}`;
                taskCard.querySelector('.assignee').textContent = `Assignee: ${taskAssignee}`;
                taskCard.querySelector('.project').textContent = `Project: ${document.querySelector(`#taskProject option[value="${taskProjectId}"]`).textContent}`;
            } else {
                const taskCard = document.createElement('div');
                taskCard.className = 'task-card';
                taskCard.setAttribute('data-task-id', taskId);
                taskCard.setAttribute('data-project-id', taskProjectId);
                taskCard.innerHTML = `
                    <h4>${taskName}</h4>
                    <p class="deadline">Deadline: ${taskDeadline}</p>
                    <p class="assignee">Assignee: ${taskAssignee}</p>
                    <p class="project">Project: ${document.querySelector(`#taskProject option[value="${taskProjectId}"]`).textContent}</p>
                    <div class="task-actions">
                        ${generateMoveButtons('todo')}
                    </div>
                    <button onclick="viewTask('${taskId}')">View</button>
                    <button onclick="editTask('${taskId}')">Edit</button>
                    <button onclick="deleteTask('${taskId}')">Delete</button>
                `;
                tasksDiv.appendChild(taskCard);
            }

            taskModal.style.display = 'none';
            document.getElementById('taskName').value = '';
            document.getElementById('taskDeadline').value = '';
            document.getElementById('taskAssignee').value = '';
        }
    });

    // Generate move buttons based on the current column
    function generateMoveButtons(currentColumn) {
        const columns = {
            todo: ['inProgress', 'done'],
            inProgress: ['todo', 'done'],
            done: ['todo', 'inProgress']
        };
        return columns[currentColumn].map(column => `<button onclick="moveTask(this, '${column}')">Move to ${column}</button>`).join('');
    }

    // Move task function
    window.moveTask = function (button, columnId) {
        const taskCard = button.parentElement.parentElement;
        const column = document.getElementById(columnId);
        taskCard.querySelector('.task-actions').innerHTML = generateMoveButtons(columnId);
        column.appendChild(taskCard);
    }

    // View project
    window.viewProject = function (projectId) {
        const projectCard = document.querySelector(`.project-card[data-project-id="${projectId}"]`);
        alert(`Project Name: ${projectCard.querySelector('h3').textContent}\nDescription: ${projectCard.querySelector('p').textContent}`);
    }

    // Edit project
    window.editProject = function (projectId) {
        currentProject = projectId;
        const projectCard = document.querySelector(`.project-card[data-project-id="${projectId}"]`);
        document.getElementById('projectName').value = projectCard.querySelector('h3').textContent;
        document.getElementById('projectDescription').value = projectCard.querySelector('p').textContent;
        projectModalTitle.textContent = 'Edit Project';
        projectModal.style.display = 'block';
    }

    // Delete project
    window.deleteProject = function (projectId) {
        if (confirm('Are you sure you want to delete this project?')) {
            const projectCard = document.querySelector(`.project-card[data-project-id="${projectId}"]`);
            projectCard.remove();
            const option = taskProjectSelect.querySelector(`option[value="${projectId}"]`);
            option.remove();
            if (!taskProjectSelect.options.length) {
                addTaskBtn.disabled = true;
            }
        }
    }

    // View task
    window.viewTask = function (taskId) {
        const taskCard = document.querySelector(`.task-card[data-task-id="${taskId}"]`);
        alert(`Task Name: ${taskCard.querySelector('h4').textContent}\nDeadline: ${taskCard.querySelector('.deadline').textContent}\nAssignee: ${taskCard.querySelector('.assignee').textContent}\nProject: ${taskCard.querySelector('.project').textContent}`);
    }

    // Edit task
    window.editTask = function (taskId) {
        currentTask = taskId;
        const taskCard = document.querySelector(`.task-card[data-task-id="${taskId}"]`);
        document.getElementById('taskProject').value = taskCard.getAttribute('data-project-id');
        document.getElementById('taskName').value = taskCard.querySelector('h4').textContent;
        document.getElementById('taskDeadline').value = taskCard.querySelector('.deadline').textContent.replace('Deadline: ', '');
        document.getElementById('taskAssignee').value = taskCard.querySelector('.assignee').textContent.replace('Assignee: ', '');
        taskModalTitle.textContent = 'Edit Task';
        taskModal.style.display = 'block';
    }

    // Delete task
    window.deleteTask = function (taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            const taskCard = document.querySelector(`.task-card[data-task-id="${taskId}"]`);
            taskCard.remove();
        }
    }
});
