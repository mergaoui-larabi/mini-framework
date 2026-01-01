import * as fm from "../../framwork/index.js";

const { dom, createSignal, createEffect, createMemo, useHash, Router } = fm;

// Initialize router to enable hash change tracking
Router.instance.initRouter();

// State
const [todos, setTodos] = createSignal([]);
const [editingId, setEditingId] = createSignal(null);

// Use reactive router hash for filtering
const hash = useHash();

// Derive filter from hash
const filter = createMemo(() => {
    const currentHash = hash();
    console.log('Current hash:', currentHash); // Debug log
    if (currentHash === '#/active') return 'active';
    if (currentHash === '#/completed') return 'completed';
    return 'all'; // Default for '', '#', '#/', etc.
});

// Filtered todos based on current filter
const filteredTodos = createMemo(() => {
    const currentFilter = filter();
    return todos().filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true;
    });
});

// Active todos count
const activeTodoCount = createMemo(() => {
    return todos().filter(todo => !todo.completed).length;
});

// Has completed todos
const hasCompletedTodos = createMemo(() => {
    return todos().some(todo => todo.completed);
});

// All todos completed
const allCompleted = createMemo(() => {
    return todos().length > 0 && todos().every(todo => todo.completed);
});

// Todo functions
function addTodo(text) {
    const trimmedText = text.trim();
    if (trimmedText) {
        setTodos([...todos(), {
            id: Date.now(),
            text: trimmedText,
            completed: false
        }]);
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
    const trimmedText = newText.trim();
    if (trimmedText) {
        setTodos(todos().map(todo =>
            todo.id === id ? { ...todo, text: trimmedText } : todo
        ));
    } else {
        removeTodo(id);
    }
    setEditingId(null);
}

function toggleAll() {
    const shouldComplete = !allCompleted();
    setTodos(todos().map(todo => ({ ...todo, completed: shouldComplete })));
}

function clearCompleted() {
    setTodos(todos().filter(todo => !todo.completed));
}

// Create fully reactive todo list
const todoList = dom({
    tag: "ul",
    attributes: { class: "todo-list" },
    children: () => filteredTodos().map(todo => ({
        tag: "li",
        id: todo.id, // Used for reconciliation
        attributes: {
            class: () => {
                // Find current todo data
                const currentTodo = todos().find(t => t.id === todo.id);
                if (!currentTodo) return '';

                const editing = editingId() === todo.id;
                if (editing) return 'editing';
                return currentTodo.completed ? 'completed' : '';
            },
            "data-id": todo.id
        },
        children: () => {
            const currentTodo = todos().find(t => t.id === todo.id);
            if (!currentTodo) return [];

            const editing = editingId() === todo.id;

            const children = [
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
                                    const current = todos().find(t => t.id === todo.id);
                                    return current && current.completed ? "checked" : undefined;
                                },
                                onchange: () => toggleTodo(todo.id)
                            }
                        },
                        {
                            tag: "label",
                            attributes: {
                                ondblclick: () => setEditingId(todo.id)
                            },
                            children: [() => {
                                const current = todos().find(t => t.id === todo.id);
                                return current ? current.text : '';
                            }]
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
            ];

            // Add edit input if editing
            if (editing) {
                children.push({
                    tag: "input",
                    attributes: {
                        class: "edit",
                        value: currentTodo.text,
                        onblur: (e) => editTodo(todo.id, e.target.value),
                        onkeydown: (e) => {
                            if (e.nativeEvent.key === 'Enter') {
                                editTodo(todo.id, e.nativeEvent.target.value);
                            }
                            if (e.nativeEvent.key === 'Escape') {
                                setEditingId(null);
                            }
                        }
                    }
                });
            }

            return children;
        }
    }))
});

// Auto-focus edit input when entering edit mode
createEffect(() => {
    const editingTodoId = editingId();
    if (editingTodoId !== null) {
        // Use setTimeout to ensure DOM is updated
        setTimeout(() => {
            const editInput = document.querySelector('.editing .edit');
            if (editInput) {
                editInput.focus();
                editInput.select();
            }
        }, 0);
    }
});

// Main section visibility
const mainSection = dom({
    tag: "section",
    attributes: {
        class: "main",
        style: () => todos().length > 0 ? '' : 'display: none;'
    },
    children: []
});

// Toggle all checkbox
const toggleAllCheckbox = dom({
    tag: "input",
    attributes: {
        id: "toggle-all",
        class: "toggle-all",
        type: "checkbox"
    }
});

// Keep toggle-all checkbox synced
createEffect(() => {
    toggleAllCheckbox.checked = allCompleted();
});

toggleAllCheckbox.addEventListener('change', toggleAll);

mainSection.appendChild(toggleAllCheckbox);
mainSection.appendChild(dom({
    tag: "label",
    attributes: { for: "toggle-all" },
    children: ["Mark all as complete"]
}));
mainSection.appendChild(todoList);

// Footer section
const footerSection = dom({
    tag: "footer",
    attributes: {
        class: "footer",
        style: () => todos().length > 0 ? '' : 'display: none;'
    },
    children: []
});

// Todo counter
const todoCounter = dom({
    tag: "span",
    attributes: { class: "todo-count" },
    children: []
});

createEffect(() => {
    const count = activeTodoCount();
    todoCounter.innerHTML = `<strong>${count}</strong> ${count === 1 ? 'item' : 'items'} left`;
});

footerSection.appendChild(todoCounter);

// Filters with reactive router (hash changes automatically update filter via useHash)
footerSection.appendChild(dom({
    tag: "ul",
    attributes: { class: "filters" },
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
}));

// Clear completed button
const clearCompletedBtn = dom({
    tag: "button",
    attributes: {
        class: "clear-completed",
        style: () => hasCompletedTodos() ? '' : 'display: none;',
        onclick: clearCompleted
    },
    children: ["Clear completed"]
});

footerSection.appendChild(clearCompletedBtn);

// Input for new todos
const newTodoInput = dom({
    tag: "input",
    attributes: {
        class: "new-todo",
        placeholder: "What needs to be done?",
        autofocus: true
    }
});

newTodoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addTodo(e.target.value);
        e.target.value = '';
    }
});

// Main app
const App = dom({
    tag: "section",
    attributes: { class: "todoapp" },
    children: [
        {
            tag: "header",
            attributes: { class: "header" },
            children: [
                { tag: "h1", children: ["todos"] }
            ]
        }
    ]
});

App.children[0].appendChild(newTodoInput);
App.appendChild(mainSection);
App.appendChild(footerSection);

document.body.appendChild(App);
