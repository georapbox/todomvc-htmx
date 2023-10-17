const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { v4: uuid } = require('uuid');
const ejs = require('ejs');
const fs = require('fs');

const PORT = process.env.PORT || 3000;

let todos = [
  {
    id: uuid(),
    name: 'Taste htmx',
    done: true
  },
  {
    id: uuid(),
    name: 'Buy a unicorn',
    done: false
  }
];

const getItemsLeft = () => todos.filter(t => !t.done).length;

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'assets')));
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  const { filter } = req.query;
  let filteredTodos = [];
  switch (filter) {
    case 'all':
      filteredTodos = todos;
      break;
    case 'active':
      filteredTodos = todos.filter(t => !t.done);
      break;
    case 'completed':
      filteredTodos = todos.filter(t => t.done);
      break;
    default:
      filteredTodos = todos;
  }

  res.render('index', {
    todos: filteredTodos,
    filter,
    itemsLeft: getItemsLeft()
  });
});

app.post('/todos', (req, res) => {
  const { todo } = req.body;
  const newTodo = {
    id: uuid(),
    name: todo,
    done: false
  };
  todos.push(newTodo);
  let template = ejs.compile(fs.readFileSync('views/includes/todo-item.ejs', 'utf8'));
  let markup = template({ todo: newTodo });
  template = ejs.compile(fs.readFileSync('views/includes/item-count.ejs', 'utf8'));
  markup += template({ itemsLeft: getItemsLeft() });
  res.send(markup);
});

app.get('/todos/edit/:id', (req, res) => {
  const { id } = req.params;
  const todo = todos.find(t => t.id === id);
  let template = ejs.compile(fs.readFileSync('views/includes/edit-item.ejs', 'utf8'));
  let markup = template({ todo });
  res.send(markup);
});

app.patch('/todos/:id', (req, res) => {
  const { id } = req.params;
  const todo = todos.find(t => t.id === id);
  todo.done = !todo.done;
  let template = ejs.compile(fs.readFileSync('views/includes/todo-item.ejs', 'utf8'));
  let markup = template({ todo });
  template = ejs.compile(fs.readFileSync('views/includes/item-count.ejs', 'utf8'));
  markup += template({ itemsLeft: getItemsLeft() });
  res.send(markup);
});

app.post('/todos/update/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const todo = todos.find(t => t.id === id);
  todo.name = name;
  let template = ejs.compile(fs.readFileSync('views/includes/todo-item.ejs', 'utf8'));
  let markup = template({ todo });
  template = ejs.compile(fs.readFileSync('views/includes/item-count.ejs', 'utf8'));
  markup += template({ itemsLeft: getItemsLeft() });
  res.send(markup);
});

app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;
  const idx = todos.find(t => t === id);
  todos.splice(idx, 1);
  const template = ejs.compile(fs.readFileSync('views/includes/item-count.ejs', 'utf8'));
  const markup = template({ itemsLeft: getItemsLeft() });
  res.send(markup);
});

app.post('/todos/clear-completed', (req, res) => {
  const newTodos = todos.filter(t => !t.done);
  todos = [...newTodos];
  let template = ejs.compile(fs.readFileSync('views/includes/todo-list.ejs', 'utf8'));
  let markup = template({ todos });
  template = ejs.compile(fs.readFileSync('views/includes/item-count.ejs', 'utf8'));
  markup += template({ itemsLeft: getItemsLeft() });
  res.send(markup);
});

app.listen(PORT);

console.log('Listening on port: ' + PORT);
