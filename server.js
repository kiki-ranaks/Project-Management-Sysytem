// Import required modules
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

// Initialize Express app and define port
const app = express();
const port = 5000;

// Connect to SQLite database
const db = new sqlite3.Database('db.sqlite', (err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Middleware to parse JSON bodies
app.use(express.json());

// SQL statements to create tables
const createProjectsTable = `
    CREATE TABLE IF NOT EXISTS projects (
        project_id INTEGER PRIMARY KEY,
        project_name TEXT,
        description TEXT
    );`;

const createTasksTable = `
    CREATE TABLE IF NOT EXISTS tasks (
        task_id INTEGER PRIMARY KEY,
        project_id INTEGER,
        task_name TEXT,
        description TEXT,
        deadline DATE,
        status TEXT,
        assigned_to TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(project_id)
    );`;

// Execute table creation queries
db.serialize(() => {
    db.run(createProjectsTable);
    db.run(createTasksTable);
});

// Define API endpoints for projects

// Get all projects
app.get('/projects', (req, res) => {
    db.all('SELECT * FROM projects', (err, projects) => {
        if (err) {
            console.error('Error querying projects:', err);
            res.status(500).json({ error: 'Failed to retrieve projects' });
        } else {
            res.json(projects);
        }
    });
});

// Create a new project
app.post('/projects', (req, res) => {
    const { project_name, description } = req.body;
    const query = 'INSERT INTO projects (project_name, description) VALUES (?, ?)';
    db.run(query, [project_name, description], function(err) {
        if (err) {
            console.error('Error creating project:', err);
            res.status(500).json({ error: 'Failed to create project' });
        } else {
            res.status(201).json({ message: 'Project created successfully', project_id: this.lastID });
        }
    });
});

// Update a project
app.put('/projects/:project_id', (req, res) => {
    const { project_id } = req.params;
    const { project_name, description } = req.body;
    const query = 'UPDATE projects SET project_name = ?, description = ? WHERE project_id = ?';
    db.run(query, [project_name, description, project_id], function(err) {
        if (err) {
            console.error('Error updating project:', err);
            res.status(500).json({ error: 'Failed to update project' });
        } else {
            res.json({ message: 'Project updated successfully', changes: this.changes });
        }
    });
});

// Delete a project
app.delete('/projects/:project_id', (req, res) => {
    const { project_id } = req.params;
    const query = 'DELETE FROM projects WHERE project_id = ?';
    db.run(query, project_id, function(err) {
        if (err) {
            console.error('Error deleting project:', err);
            res.status(500).json({ error: 'Failed to delete project' });
        } else {
            res.json({ message: 'Project deleted successfully', changes: this.changes });
        }
    });
});

// Define API endpoints for tasks

// Get all tasks for a project
app.get('/projects/:project_id/tasks', (req, res) => {
    const { project_id } = req.params;
    const query = 'SELECT * FROM tasks WHERE project_id = ?';
    db.all(query, project_id, (err, tasks) => {
        if (err) {
            console.error('Error querying tasks:', err);
            res.status(500).json({ error: 'Failed to retrieve tasks' });
        } else {
            res.json(tasks);
        }
    });
});

// Create a new task for a project
app.post('/projects/:project_id/tasks', (req, res) => {
    const { project_id } = req.params;
    const { task_name, description, deadline, status, assigned_to } = req.body;
    const query = 'INSERT INTO tasks (project_id, task_name, description, deadline, status, assigned_to) VALUES (?, ?, ?, ?, ?, ?)';
    db.run(query, [project_id, task_name, description, deadline, status, assigned_to], function(err) {
        if (err) {
            console.error('Error creating task:', err);
            res.status(500).json({ error: 'Failed to create task' });
        } else {
            res.status(201).json({ message: 'Task created successfully', task_id: this.lastID });
        }
    });
});

// Update a task
app.put('/projects/:project_id/tasks/:task_id', (req, res) => {
    const { project_id, task_id } = req.params;
    const { task_name, description, deadline, status, assigned_to } = req.body;
    const query = 'UPDATE tasks SET task_name = ?, description = ?, deadline = ?, status = ?, assigned_to = ? WHERE task_id = ? AND project_id = ?';
    db.run(query, [task_name, description, deadline, status, assigned_to, task_id, project_id], function(err) {
        if (err) {
            console.error('Error updating task:', err);
            res.status(500).json({ error: 'Failed to update task' });
        } else {
            res.json({ message: 'Task updated successfully', changes: this.changes });
        }
    });
});

// Delete a task
app.delete('/projects/:project_id/tasks/:task_id', (req, res) => {
    const { project_id, task_id } = req.params;
    const query = 'DELETE FROM tasks WHERE task_id = ? AND project_id = ?';
    db.run(query, [task_id, project_id], function(err) {
        if (err) {
            console.error('Error deleting task:', err);
            res.status(500).json({ error: 'Failed to delete task' });
        } else {
            res.json({ message: 'Task deleted successfully', changes: this.changes });
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});