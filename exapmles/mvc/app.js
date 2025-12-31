import * as fm from "../../framwork/index.js";

const { dom, createSignal, createEffect } = fm;

const [counter, setCounter] = createSignal(0);
const [todos, setTodos] = createSignal([]);

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
}

function clearCompleted() {
}

function toggleAll() {
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
          onclick: (e) => { e.preventDefault(); /* TODO: filter all */ }
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
          onclick: (e) => { e.preventDefault(); /* TODO: filter active */ }
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
          onclick: (e) => { e.preventDefault(); /* TODO: filter completed */ }
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
  
  todos().forEach((todo) => {
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
                checked: todo.completed,
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

// Use appendChild with dom elements
App.children[0].appendChild(todoInput);
App.children[1].appendChild(toggleAllCheckbox);
App.children[1].appendChild(toggleAllLabel);
App.children[1].appendChild(todosContainer);
App.children[2].appendChild(counterDisplay);
App.children[2].appendChild(filtersContainer);
App.children[2].appendChild(clearCompletedButton);

document.body.append(App);