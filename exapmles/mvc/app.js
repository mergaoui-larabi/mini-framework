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
    "data-testid": "text-input",
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

function addTodo() {
  const inputValue = todoInput.value.trim();
  if (inputValue) {
    // Use batch for multiple updates
    batch(() => {
      setTodos([...todos(), { text: inputValue, completed: false, id: Date.now() }]);
      todoInput.value = '';
    });
  }
}

function removeTodo(id) {
  setTodos(todos().filter(todo => todo.id !== id));
}

// Update the `toggleTodo` function to use signals for marking todos as completed
function toggleTodo(id) {
  setTodos(todos().map(todo => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed };
    }
    return todo;
  }));
}

function editTodo(id, newText) {
  const t = newText.trim();
  if (t) {
    setTodos(todos().map(todo => 
      todo.id === id ? { ...todo, text: newText } : todo
    ));
    setEditingId(null);
  } else {
    removeTodo(id);
  }
}

function clearCompleted() {
  setTodos(todos().filter(todo => !todo.completed));
}

function toggleAll() {
  const shouldComplete = !allCompleted();
  setTodos(todos().map(todo => ({ ...todo, completed: shouldComplete })));
}

// Create a static ul element
const todosContainer = dom({
  tag: "ul",
  attributes: { 
    class: "todo-list",
    "data-testid": "todo-list"
  },
  children: []
});

// Manually handle list updates efficiently
const todoElements = new Map();

createEffect(() => {
  const filtered = filteredTodos();
  
  // Track which todos should exist
  const currentIds = new Set(filtered.map(t => t.id));
  
  // Remove elements that shouldn't exist anymore
  todoElements.forEach((element, id) => {
    if (!currentIds.has(id)) {
      element.remove();
      todoElements.delete(id);
    }
  });

  // Add or update elements
  filtered.forEach((todo, index) => {
    let liElement = todoElements.get(todo.id);
    
    if (!liElement) {
      // Create new element
      liElement = createTodoElement(todo);
      todoElements.set(todo.id, liElement);
      todosContainer.appendChild(liElement);
    } else {
      // Update existing element
      updateTodoElement(liElement, todo);
    }
  });

  // Reorder elements to match filtered order
  filtered.forEach((todo, index) => {
    const element = todoElements.get(todo.id);
    const currentIndex = Array.from(todosContainer.children).indexOf(element);
    if (currentIndex !== index) {
      if (index >= todosContainer.children.length) {
        todosContainer.appendChild(element);
      } else {
        todosContainer.insertBefore(element, todosContainer.children[index]);
      }
    }
  });
});

function createTodoElement(todo) {
  const li = dom({
    tag: "li",
    attributes: { 
      class: todo.completed ? "completed" : "",
      "data-testid": "todo-item"
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
              "data-testid": "todo-item-toggle",
              ...(todo.completed ? { checked: "checked" } : {}),
              onchange: () => toggleTodo(todo.id)
            }
          },
          {
            tag: "label",
            attributes: {
              "data-testid": "todo-item-label",
              ondblclick: () => setEditingId(todo.id)
            },
            children: [todo.text]
          },
          {
            tag: "button",
            attributes: {
              class: "destroy",
              "data-testid": "todo-item-button",
              onclick: () => removeTodo(todo.id)
            }
          }
        ]
      }
    ]
  });
  
  // Watch for editing state changes
  createEffect(() => {
    const isEditing = editingId() === todo.id;
    li.className = isEditing ? "editing" : (todo.completed ? "completed" : "");
    if (isEditing) {
      li.setAttribute("data-testid", "todo-item");
    }
    
    // Handle edit input
    let editInput = li.querySelector('.edit');
    if (isEditing && !editInput) {
      const currentTodo = todos().find(t => t.id === todo.id) || todo;
      editInput = dom({
        tag: "input",
        attributes: {
          class: "edit",
          value: currentTodo.text,
          onblur: (e) => editTodo(todo.id, e.target.value),
          onkeypress: (e) => {
            if (e.nativeEvent.key === 'Enter') editTodo(todo.id, e.target.value);
            if (e.nativeEvent.key === 'Escape') setEditingId(null);
          }
        }
      });
      li.appendChild(editInput);
      editInput.focus();
    } else if (!isEditing && editInput) {
      editInput.remove();
    }
  });

  return li;
}

function updateTodoElement(liElement, todo) {
  const isEditing = editingId() === todo.id;
  liElement.className = isEditing ? "editing" : (todo.completed ? "completed" : "");
  
  const checkbox = liElement.querySelector('.toggle');
  const label = liElement.querySelector('label');
  
  if (checkbox) {
    checkbox.checked = todo.completed;
  }
  
  if (label) {
    label.textContent = todo.text;
  }
}

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
    "data-testid": "toggle-all",
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
    "data-testid": "footer-navigation"
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
    "data-testid": "main"
  },
  children: []
});

const footerSection = dom({
  tag: "footer",
  attributes: { 
    class: "footer",
    "data-testid": "footer"
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
        "data-testid": "header"
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