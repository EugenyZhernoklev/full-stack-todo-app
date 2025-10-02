const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const filePath = 'todos.json';

// Загрузка задач при старте
let todos = [];
try {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    todos = JSON.parse(data);
    console.log('Loaded todos:', todos);
  } else {
    console.log('No todos.json found, starting empty');
  }
} catch (error) {
  console.error('Error loading todos:', error);
  todos = [];
}

// Сохранение задач в файл
const saveTodos = () => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(todos, null, 2));
    console.log('Saved todos to', filePath);
  } catch (error) {
    console.error('Error saving todos:', error);
  }
};

app.get('/todos', (req, res) => res.json(todos));

app.post('/todos', (req, res) => {
  const todo = { id: Date.now(), text: req.body.text, completed: false };
  todos.push(todo);
  saveTodos();
  res.json(todo);
});

app.put('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = req.body.completed;
    saveTodos();
    res.json(todo);
  } else {
    res.status(404).json({ error: 'Todo not found' });
  }
});

app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const initialLength = todos.length;
  todos = todos.filter(t => t.id !== id);
  if (todos.length < initialLength) {
    saveTodos();
    res.json({ message: 'Todo deleted' });
  } else {
    res.status(404).json({ error: 'Todo not found' });
  }
});

app.listen(port, () => console.log(`API running on http://localhost:${port}`));