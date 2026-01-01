import * as fm from "../../framwork/index.js";

const { dom, createSignal, createEffect, createMemo, batch, useHash, useNavigate, Router } = fm;

// Initialize Router
Router.instance.initRouter();

const [todos, setTodos] = createSignal([]);
const [editingId, setEditingId] = createSignal(null);
const [filter, setFilter] = createSignal('all');

// Use createMemo for filtered todos
const filteredTodos = createMemo(() => {
  const currentFilter = filter();
  return todos().filter(todo => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true;
  });
});

// Use createMemo for counts
const activeCount = createMemo(() =>
  todos().filter(t => !t.completed).length
);

const completedCount = createMemo(() =>
  todos().filter(t => t.completed).length
);

const allCompleted = createMemo(() =>
  todos().length > 0 && todos().every(t => t.completed)
);

const hash = useHash();
const navigate = useNavigate();

// Sync filter with hash
createEffect(() => {
  const currentHash = hash();
  if (currentHash === '#/active') {
    setFilter('active');
  } else if (currentHash === '#/completed') {
    setFilter('completed');
  } else {
    setFilter('all');
  }
});

const todoInput = dom({
  tag: "input",
  attributes: {
    class: "new-todo",
    id: "todo-input",
    type: "text",
    placeholder: "What needs to be done?",
    autofocus: true,
    onkeypress: (e) => {
      if (e.nativeEvent.code === 'Enter') {
        addTodo();
      }
    }
  }
});

const todoInputLabel = dom({
  tag: "label",
  attributes: {
    class: "visually-hidden",
    for: "todo-input"
  },
  children: ["New Todo Input"]
});

let todoIdCounter = 0;

function addTodo() {
  const inputValue = todoInput.value.trim();
  if (inputValue) {
    setTodos([...todos(), { text: inputValue, completed: false, id: ++todoIdCounter }]);
    todoInput.value = '';
  }
}

function removeTodo(id) {
  setTodos(todos().filter(todo => todo.id !== id));
  setEditingId(null);
}

// Update the `toggleTodo` function to use signals for marking todos as completed
function toggleTodo(id, value) {
  console.log(id, value)
  setTodos(todos().map(todo => {
    if (todo.id === id) {
      return { ...todo, completed: value };
    }
    return todo;
  }));
}

function editTodo(id, newText) {
  console.log('Editing todo ID:', id, 'with text:', newText);
  const t = newText.trim();

  if (t) {
    setTodos(todos().map(todo =>
      todo.id === id ? { ...todo, text: t } : todo
    ));
    setEditingId(null);
  } else {
    console.log('Removing todo with ID:', id);
    setTodos(todos().filter(todo => todo.id !== id));
    setEditingId(null);
  }
}

function clearCompleted() {
  setTodos(todos().filter(todo => !todo.completed));
}

function toggleAll() {
  const shouldComplete = !allCompleted();
  setTodos(todos().map(todo => ({ ...todo, completed: shouldComplete })));
}

// Create a static ul element with reactive children
const todosContainer = dom({
  tag: "ul",
  attributes: {
    class: "todo-list",
  },
  children: () => filteredTodos().map(todo => {
    const todoId = todo.id; // Capture the ID at creation time
    return {
      tag: "li",
      attributes: {
        id: `todo-${todoId}`,
        class: () => {
          const isEditing = editingId() === todoId;
          const currentTodo = todos().find(t => t.id === todoId) || todo;
          return isEditing ? "editing" : (currentTodo.completed ? "completed" : "");
        }
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
                checked: () => {
                  const currentTodo = todos().find(t => t.id === todoId) || todo;
                  return currentTodo.completed;
                },
                onchange: (e) => toggleTodo(todoId, e.nativeEvent.target.checked)
              }
            },
            {
              tag: "label",
              attributes: {
                ondblclick: () => {
                  console.log('Double-clicking todo ID:', todoId);
                  setEditingId(todoId);
                  setTimeout(() => {
                    const input = document.querySelector(`#todo-${todoId} .edit`);
                    if (input) {
                      const currentTodo = todos().find(t => t.id === todoId) || todo;
                      input.value = currentTodo.text;
                      input.focus();
                    }
                  }, 0);
                }
              },
              children: [() => {
                const currentTodo = todos().find(t => t.id === todoId) || todo;
                return currentTodo.text;
              }]
            },
            {
              tag: "button",
              attributes: {
                class: "destroy",
                onclick: () => removeTodo(todoId)
              }
            }
          ]
        },
        {
          tag: "input",
          attributes: {
            class: "edit",
            style: () => editingId() === todoId ? '' : 'display: none',
            onblur: (e) => {
              const currentEditingId = editingId();
              if (currentEditingId) {
                editTodo(currentEditingId, e.target.value);
              }
            },
            onkeypress: (e) => {
              const currentEditingId = editingId();
              if (currentEditingId) {
                if (e.nativeEvent.key === 'Enter' && e.nativeEvent.target.value.trim() !== '') {
                  editTodo(currentEditingId, e.target.value);
                }
                if (e.nativeEvent.key === 'Escape') setEditingId(null);
              }
            }
          }
        }
      ]
    };
  })
});

// Use reactive children function for counter display
const counterDisplay = dom({
  tag: "span",
  attributes: { class: "todo-count" },
  children: [
    () => {
      const count = activeCount();
      return `${count} ${count === 1 ? 'item' : 'items'} left`;
    }
  ]
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

// Update checkbox reactively
createEffect(() => {
  toggleAllCheckbox.checked = allCompleted();
});

const toggleAllLabel = dom({
  tag: "label",
  attributes: {
    class: "toggle-all-label",
    for: "toggle-all"
  },
  children: [
    {
      tag: "div",
      attributes: { class: "toggle-all-container" },
      children: [
        "::before",
        "Toggle All Input"
      ]
    }
  ]
});

// Use reactive class attribute
const filtersContainer = dom({
  tag: "ul",
  attributes: {
    class: "filters",
  },
  children: [
    {
      tag: "li",
      children: [{
        tag: "a",
        attributes: {
          class: () => filter() === 'all' ? 'selected' : '',
          href: "#/"
        },
        children: ["All"]
      }]
    },
    {
      tag: "li",
      children: [{
        tag: "a",
        attributes: {
          class: () => filter() === 'active' ? 'selected' : '',
          href: "#/active"
        },
        children: ["Active"]
      }]
    },
    {
      tag: "li",
      children: [{
        tag: "a",
        attributes: {
          class: () => filter() === 'completed' ? 'selected' : '',
          href: "#/completed"
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

// Update button disabled state reactively
createEffect(() => {
  const hasCompleted = completedCount() > 0;
  if (hasCompleted) {
    clearCompletedButton.removeAttribute('disabled');
  } else {
    clearCompletedButton.setAttribute('disabled', 'true');
  }
});

const inputContainer = dom({
  tag: "div",
  attributes: { class: "input-container" },
  children: []
});

const mainSection = dom({
  tag: "main",
  attributes: {
    class: "main",
  },
  children: []
});

const footerSection = dom({
  tag: "footer",
  attributes: {
    class: "footer",
  }
});

// Hide/show sections reactively
createEffect(() => {
  const hasTodos = todos().length > 0;
  mainSection.style.display = hasTodos ? '' : 'none';
  footerSection.style.display = hasTodos ? '' : 'none';
});

const App = dom({
  tag: "section",
  attributes: {
    class: "todoapp",
    id: "root"
  },
  children: [
    {
      tag: "header",
      attributes: {
        class: "header",
      },
      children: [
        {
          tag: "h1",
          children: ["todos"]
        }
      ]
    }
  ]
});

inputContainer.appendChild(todoInput);
inputContainer.appendChild(todoInputLabel);

// Add input container to header
App.children[0].appendChild(inputContainer);

// Build main section
App.appendChild(mainSection);
mainSection.appendChild(toggleAllCheckbox);
mainSection.appendChild(toggleAllLabel);
mainSection.appendChild(todosContainer);

// Build footer section
App.appendChild(footerSection);
footerSection.appendChild(counterDisplay);
footerSection.appendChild(filtersContainer);
footerSection.appendChild(clearCompletedButton);

// Create info footer
const infoFooter = dom({
  tag: "footer",
  attributes: { class: "info" },
  children: [
    {
      tag: "p",
      children: ["Double-click to edit a todo"]
    },
    {
      tag: "p",
      children: [
        "Created by the ",
        {
          tag: "a",
          attributes: { href: "http://todomvc.com" },
          children: ["TodoMVC Team"]
        }
      ]
    },
    {
      tag: "p",
      children: [
        "Part of ",
        {
          tag: "a",
          attributes: { href: "http://todomvc.com" },
          children: ["TodoMVC"]
        }
      ]
    }
  ]
});

document.body.append(App);
document.body.append(infoFooter);
document.body.classList.add("learn-bar");