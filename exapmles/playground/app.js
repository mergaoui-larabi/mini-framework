import * as fm from "../../framwork/index.js";

const { dom, createSignal, createEffect, Router, useHash } = fm;

const [todos, setTodos] = createSignal([]);
const [editingId, setEditingId] = createSignal(null);

// Initialize router
Router.instance.initRouter();

// Use router's hash signal for filter
const hash = useHash();
const filter = () => {
  const h = hash();
  if (h === '#/active') return 'active';
  if (h === '#/completed') return 'completed';
  return 'all';
}; 

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
      if (e.nativeEvent.key === 'Enter') {
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
    setTodos([...todos(), { text: inputValue, completed: false, id: Date.now() }]);
    todoInput.value = ''; 
  }
}

function removeTodo(id) {
  setTodos(todos().filter(todo => todo.id !== id));
}

function toggleTodo(id) {
  setTodos(todos().map(todo => 
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  ));
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
  const allCompleted = todos().every(todo => todo.completed);
  setTodos(todos().map(todo => ({ ...todo, completed: !allCompleted })));
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
  const filteredTodos = todos().filter(todo => {
    if (filter() === 'active') return !todo.completed;
    if (filter() === 'completed') return todo.completed;
    return true;
  });

  // Track which todos should exist
  const currentIds = new Set(filteredTodos.map(t => t.id));
  
  // Remove elements that shouldn't exist anymore
  todoElements.forEach((element, id) => {
    if (!currentIds.has(id)) {
      element.remove();
      todoElements.delete(id);
    }
  });

  // Add or update elements
  filteredTodos.forEach((todo, index) => {
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
  filteredTodos.forEach((todo, index) => {
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
    const currentTodo = todos().find(t => t.id === todo.id);
    if (!currentTodo) return;
    
    const isEditing = editingId() === todo.id;
    li.className = isEditing ? "editing" : (currentTodo.completed ? "completed" : "");
    if (isEditing) {
      li.setAttribute("data-testid", "todo-item");
    }
    
    // Handle edit input
    let editInput = li.querySelector('.edit');
    if (isEditing && !editInput) {
      editInput = dom({
        tag: "input",
        attributes: {
          class: "edit",
          value: currentTodo.text,
          onblur: (e) => editTodo(todo.id, e.target.value),
          onkeypress: (e) => {
            if (e.nativeEvent.key === 'Enter') editTodo(todo.id, e.nativeEvent.target.value);
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
    "data-testid": "toggle-all",
    onchange: toggleAll
  }
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
    disabled: true,
    onclick: clearCompleted
  },
  children: ["Clear completed"]
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
  },
  
});

createEffect(() => {
  const count = todos().filter(todo => !todo.completed).length;
  counterDisplay.innerHTML = `<strong>${count}</strong> ${count === 1 ? 'item' : 'items'} left`;
});

createEffect(() => {
  const allCompleted = todos().length > 0 && todos().every(todo => todo.completed);
  toggleAllCheckbox.checked = allCompleted;
});

// Update clear completed button state
createEffect(() => {
  const hasCompleted = todos().some(todo => todo.completed);
  if (hasCompleted) {
    clearCompletedButton.removeAttribute('disabled');
  } else {
    clearCompletedButton.setAttribute('disabled', 'true');
  }
});

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

// Build the input container
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