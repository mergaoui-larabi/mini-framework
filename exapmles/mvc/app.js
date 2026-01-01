import * as fm from "../../framwork/index.js";

const { dom, createSignal, createEffect } = fm;

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
      console.log(e.nativeEvent.code);
      console.log(e);
      
      if (e.nativeEvent.code === 'Enter') {
        console.log("toto");        
        addTodo();
      }
    }
  }
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
  setTodos(todos().map(todo => 
    todo.id === id ? { ...todo, text: newText } : todo
  ));
  setEditingId(null);
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
  attributes: { class: "todo-list" },
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
            }
          }
        ]
      }
    ]
  });

  createEffect(() => {
    const count = todos().filter(todo => !todo.completed).length;
    counterDisplay.innerHTML = `<strong>${count}</strong> ${count === 1 ? 'item' : 'items'} left`;
  });
  
  createEffect(() => {
    const allCompleted = todos().length > 0 && todos().every(todo => todo.completed);
    toggleAllCheckbox.checked = allCompleted;
  });
  
  // Hide/show main and footer sections based on whether there are todos
  createEffect(() => {
    const hasTodos = todos().length > 0;
    mainSection.style.display = hasTodos ? '' : 'none';
    footerSection.style.display = hasTodos ? '' : 'none';
  });
  
  // Watch for editing state changes
  createEffect(() => {
    const isEditing = editingId() === todo.id;
    li.className = isEditing ? "editing" : (todo.completed ? "completed" : "");
    
    // Handle edit input
    let editInput = li.querySelector('.edit');
    if (isEditing && !editInput) {
      editInput = dom({
        tag: "input",
        attributes: {
          class: "edit",
          value: todo.text,
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

const mainSection = dom({
  tag: "section",
  attributes: { class: "main" },
  children: []
});

const footerSection = dom({
  tag: "footer",
  attributes: { class: "footer" },
  children: []
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
          children: ["todos"]
        }
      ]
    }
  ]
});

App.children[0].appendChild(todoInput);
App.appendChild(mainSection);
App.appendChild(footerSection);

mainSection.appendChild(toggleAllCheckbox);
mainSection.appendChild(toggleAllLabel);
mainSection.appendChild(todosContainer);

footerSection.appendChild(counterDisplay);
footerSection.appendChild(filtersContainer);
footerSection.appendChild(clearCompletedButton);

document.body.append(App);