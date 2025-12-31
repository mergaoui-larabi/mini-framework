import * as fm from "../../framwork/index.js";

const { dom, createSignal, createEffect } = fm;

const [counter, setCounter] = createSignal(0);
const [todos, setTodos] = createSignal([]);
const [editingId, setEditingId] = createSignal(null);
const [filter, setFilter] = createSignal('all'); 

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

function editTodo(id, newText) {
  const newTodos = todos().map(todo => 
    todo.id === id ? { ...todo, text: newText } : todo
  );
  setTodos(newTodos);
  setEditingId(null);
}

function clearCompleted() {
  const newTodos = todos().filter(todo => !todo.completed);
  setTodos(newTodos);
  setCounter(newTodos.length);
}

function toggleAll() {
  console.log('toggleAll called');
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
    onclick: toggleAll,
    onchange: toggleAll
  }
});

const toggleAllLabel = dom({
  tag: "label",
  attributes: { 
    for: "toggle-all",
    onclick: (e) => {
      console.log('label clicked');
      toggleAll();
    }
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
          class: () => filter() === 'all' ? 'selected' : '',
          href: "#/",
          onclick: () => setFilter('all')
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
          class: () => filter() === 'active' ? 'selected' : '',
          href: "#/active",
          onclick: () => setFilter('active')
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
          class: () => filter() === 'completed' ? 'selected' : '',
          href: "#/completed",
          onclick: () => setFilter('completed')
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
  const allCompleted = todos().length > 0 && todos().every(todo => todo.completed);
  toggleAllCheckbox.checked = allCompleted;
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
        class: editingId() === todo.id ? "editing" : (todo.completed ? "completed" : "")
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
              attributes: {
                ondblclick: () => setEditingId(todo.id)
              },
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
        },
        ...(editingId() === todo.id ? [{
          tag: "input",
          attributes: {
            class: "edit",
            value: todo.text,
            onblur: (e) => editTodo(todo.id, e.target.value),
            onkeypress: (e) => {
              if (e.key === 'Enter') editTodo(todo.id, e.target.value);
              if (e.key === 'Escape') setEditingId(null);
            }
          }
        }] : [])
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