import * as fm from "../../framwork/index.js";
import { eventEmitter } from "../../framwork/event/event_emitter.js";

const { dom, createSignal, createEffect } = fm;

const [counter, setCounter] = createSignal(0);
const [todos, setTodos] = createSignal([]);
const [filter, setFilter] = createSignal('all');

// Listen for filter events
eventEmitter.on('filter-all', () => setFilter('all'));
eventEmitter.on('filter-active', () => setFilter('active'));
eventEmitter.on('filter-completed', () => setFilter('completed'));

function handleHashChange() {
  const hash = window.location.hash.slice(1) || '/';
  if (hash === '/') setFilter('all');
  else if (hash === '/active') setFilter('active');
  else if (hash === '/completed') setFilter('completed');
}

window.addEventListener('hashchange', handleHashChange);
handleHashChange(); 

const todoInput = dom({
  tag: "input",
  attributes: {
    class: "new-todo",
    placeholder: "What needs to be done?",
    autofocus: true,
    onkeypress: (e) => {
      if (e.key === 'Enter') {
        addTodo();
      }
    }
  }
});

function addTodo() {
  const inputValue = todoInput.value.trim();
  if (inputValue) {
    setTodos([...todos(), { text: inputValue, completed: false, id: Date.now() }]);
    setCounter(counter() + 1); 
    todoInput.value = ''; 
  }
}

function removeTodo(id) {
  const newTodos = todos().filter(todo => todo.id !== id);
  setTodos(newTodos);
  setCounter(newTodos.length);
}

function toggleTodo(id) {
  const newTodos = todos().map(todo => 
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  setTodos(newTodos);
}

function clearCompleted() {
  const newTodos = todos().filter(todo => !todo.completed);
  setTodos(newTodos);
  setCounter(newTodos.length);
}

function toggleAll() {
  const allCompleted = todos().every(todo => todo.completed);
  const newTodos = todos().map(todo => ({ ...todo, completed: !allCompleted }));
  setTodos(newTodos);
}

const todosContainer = dom({
  tag: "ul",
  attributes: { class: "todo-list" },
  children: []
});

const counterDisplay = dom({
  tag: "span",
  attributes: { class: "todo-count" },
  children: []
});

const toggleAllCheckbox = dom({
  tag: "input",
  attributes: {
    id: "toggle-all",
    class: "toggle-all",
    type: "checkbox",
    onchange: toggleAll
  }
});

const toggleAllLabel = dom({
  tag: "label",
  attributes: { 
    for: "toggle-all",
    onclick: toggleAll
  },
  children: ["Mark all as complete"]
});

const filtersContainer = dom({
  tag: "ul",
  attributes: { class: "filters" },
  children: [
    {
      tag: "li",
      attributes: {},
      children: [{
        tag: "a",
        attributes: { 
          class: "selected", 
          href: "#/",
          onclick: (e) => {
            e.preventDefault();
            eventEmitter.emit('filter-all');
          }
        },
        children: ["All"]
      }]
    },
    {
      tag: "li",
      attributes: {},
      children: [{
        tag: "a",
        attributes: { 
          href: "#/active",
          onclick: (e) => {
            e.preventDefault();
            eventEmitter.emit('filter-active');
          }
        },
        children: ["Active"]
      }]
    },
    {
      tag: "li",
      attributes: {},
      children: [{
        tag: "a",
        attributes: { 
          href: "#/completed",
          onclick: (e) => {
            e.preventDefault();
            eventEmitter.emit('filter-completed');
          }
        },
        children: ["Completed"]
      }]
    }
  ]
});

const clearCompletedButton = dom({
  tag: "button",
  attributes: {
    class: "clear-completed",
    onclick: clearCompleted
  },
  children: ["Clear completed"]
});

const footerSection = dom({
  tag: "footer",
  attributes: { class: "footer" },
  children: []
});

const mainSection = dom({
  tag: "section",
  attributes: { class: "main" },
  children: []
});

createEffect(() => {
  const count = todos().filter(todo => !todo.completed).length;
  counterDisplay.innerHTML = `<strong>${count}</strong> ${count === 1 ? 'item' : 'items'} left`;
});

createEffect(() => {
  while (todosContainer.firstChild) {
    todosContainer.removeChild(todosContainer.firstChild);
  }
  
  const filteredTodos = todos().filter(todo => {
    if (filter() === 'active') return !todo.completed;
    if (filter() === 'completed') return todo.completed;
    return true; 
  });
  
  filteredTodos.forEach((todo) => {
    const todoItem = dom({
      tag: "li",
      attributes: { 
        class: todo.completed ? "completed" : ""
      },
      children: [
        {
          tag: "div",
          attributes: { class: "view" },
          children: [
            {
              tag: "input",
              attributes: {
                class: "toggle",
                type: "checkbox",
                ...(todo.completed ? { checked: "checked" } : {}),
                onchange: () => toggleTodo(todo.id)
              }
            },
            {
              tag: "label",
              attributes: {},
              children: [todo.text]
            },
            {
              tag: "button",
              attributes: {
                class: "destroy",
                onclick: () => removeTodo(todo.id)
              },
              children: []
            }
          ]
        }
      ]
    });
    
    todosContainer.appendChild(todoItem);
  });
});

const App = dom({
  tag: "section",
  attributes: { class: "todoapp" },
  children: [
    {
      tag: "header",
      attributes: { class: "header" },
      children: [
        {
          tag: "h1",
          attributes: {},
          children: ["todos"]
        }
      ]
    },
    {
      tag: "section",
      attributes: { class: "main" },
      children: []
    },
    {
      tag: "footer",
      attributes: { class: "footer" },
      children: []
    }
  ]
});

App.children[0].appendChild(todoInput);
App.children[1].appendChild(toggleAllCheckbox);
App.children[1].appendChild(toggleAllLabel);
App.children[1].appendChild(todosContainer);
App.children[2].appendChild(counterDisplay);
App.children[2].appendChild(filtersContainer);
App.children[2].appendChild(clearCompletedButton);

document.body.append(App);