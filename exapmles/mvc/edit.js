import * as fm from "../../framwork/index.js";

const { createSignal } = fm;

// Create shared filter state that persists across route changes
export const [currentFilter, setCurrentFilter] = createSignal('all')
export const [todos, setTodos] = createSignal([]) // holds an array of todo objects {id, title, completed: createSignal(bool)}

let todoIdCounter = 0

export function addTodo(title) {
    const newTodo = {
        id: ++todoIdCounter,
        title: title
        // No completed property!
    }
    setTodos([...todos(), newTodo])
}

export function removeTodo(id) {
    setTodos(todos().filter(todo => todo.id !== id))
}

export function editTodo(id, newTitle) {
    setTodos(todos().map(todo =>
        todo.id === id
            ? { ...todo, title: newTitle }
            : todo
    ))
}

export function getFilteredTodos(taskStates) {
    const filter = currentFilter()
    const list = todos()

    return list.filter(todo => {
        const state = taskStates.get(todo.id)
        const isCompleted = state ? state.completed() : false

        if (filter === 'active') return !isCompleted
        if (filter === 'completed') return isCompleted
        return true
    })
}