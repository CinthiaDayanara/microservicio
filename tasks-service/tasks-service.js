require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

const tasks = [];

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.post('/tasks', authenticateToken, (req, res) => {
  const { title, description } = req.body;
  const newTask = {
    id: tasks.length + 1,
    title,
    description,
    completed: false,
    username: req.user.username
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.get('/tasks', authenticateToken, (req, res) => {
  const userTasks = tasks.filter(task => task.username === req.user.username);
  res.json(userTasks);
});

app.put('/tasks/:id', authenticateToken, (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id) && t.username === req.user.username);
  if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });
  
  tasks[taskIndex] = { ...tasks[taskIndex], ...req.body, id: tasks[taskIndex].id, username: req.user.username };
  res.json(tasks[taskIndex]);
});

app.delete('/tasks/:id', authenticateToken, (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id) && t.username === req.user.username);
  if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });
  
  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Tasks service running on port ${PORT}`));