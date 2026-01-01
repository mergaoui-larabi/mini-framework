import * as fm from "../../framwork/index.js";
import { currentFilter, todos, addTodo, removeTodo, getFilteredTodos } from './edit.js'
const { createSignal, dom } = fm;

// Map to track individual task completion states by todo id
const taskCompletionStates = new Map()

export function sectionPart() {
    return dom(tag: 'section', attribu{ class: 'todoapp' },
        header(),
        main(),
        footer())
}

export function footerPart() {
    return dom(tag: 'footer', { class: 'info' },
        dom(tag: 'p', {}, "Double-click to edit a todo"),
        dom(tag: 'p', {}, "Created by the TodoMVC Team"),
        dom(tag: 'p', {}, dom(tag: 'a', { href: 'https://todomvc.com/' },
            "TodoMVC "),
            "Part of ")
    )
}

function footer() {
    const activeCount = () => {
        let count = 0
        todos().forEach(todo => {
            const state = taskCompletionStates.get(todo.id)
            const isCompleted = state ? state.completed() : false
            if (!isCompleted) count++
        })
        return `${count} item${count !== 1 ? 's' : ''} left`
    }

    return dom(tag: 'footer', {
        class: 'footer',
        style: () => todos().length === 0 ? { display: 'none' } : { display: 'block' }
    },
        dom(tag: 'span', { class: 'todo-count' },
            dom(tag: 'strong', {}, activeCount)
        ),
        dom(tag: 'ul', { class: 'filters' },
            dom(tag: 'li', {}, dom(tag: 'a', {
                href: '#/',
                class: () => currentFilter() === 'all'
                    ? 'router-link-active router-link-exact-active selected'
                    : ''
            }, 'All')),

            dom(tag: 'li', {}, dom(tag: 'a', {
                href: '#/active',
                class: () => currentFilter() === 'active'
                    ? 'router-link-active router-link-exact-active selected'
                    : ''
            }, 'Active')),

            dom(tag: 'li', {}, dom(tag: 'a', {
                href: '#/completed',
                class: () => currentFilter() === 'completed'
                    ? 'router-link-active router-link-exact-active selected'
                    : ''
            }, 'Completed'))
        ),
        dom(tag: 'button', {
            class: 'clear-completed',
            style: 'display: none;'
        }, 'Clear completed')
    )
}

function main() {
    const handleToggleAll = () => {
        const list = todos()
        const allCompleted = list.length > 0 && list.every(todo => {
            const state = taskCompletionStates.get(todo.id)
            return state ? state.completed() : false
        })

        const newState = !allCompleted

        taskCompletionStates.forEach(({ setCompleted }) => {
            setCompleted(newState)
        })
    }

    return dom(tag: 'main', { class: 'main' },
        dom(tag: 'div', { class: 'toggle-all-container' },
            dom(tag: 'input', {
                type: 'checkbox',
                id: 'toggle-all-input',
                class: 'toggle-all',
                onchange: handleToggleAll,
                checked: () => {
                    const list = todos()
                    if (list.length === 0) return false
                    return list.every(todo => {
                        const state = taskCompletionStates.get(todo.id)
                        return state ? state.completed() : false
                    })
                }
            }),
            dom(tag: 'label', {
                class: 'toggle-all-label',
                for: 'toggle-all-input'
            })
        ),
        dom(tag: 'ul', { class: 'todo-list' },
            () => getFilteredTodos(taskCompletionStates).map(todo => {
                const vnode = task(todo)
                vnode.key = todo.id
                return vnode
            })
        )
    )
}

function header() {
    return dom(tag: 'header', { class: 'header' },
        dom(tag: 'h1', {}, 'todos'),
        dom(tag: 'input', {
            class: "new-todo",
            placeholder: "What needs to be done?",
            onkeydown: (e) => {
                if (e.key !== 'Enter') return

                const value = e.target.value.trim()
                if (!value) return

                e.target.value = ''
                addTodo(value)
            }
        })
    )
}

function task(todo) {
    let completed, setCompleted

    if (taskCompletionStates.has(todo.id)) {
        const state = taskCompletionStates.get(todo.id)
        completed = state.completed
        setCompleted = state.setCompleted
    } else {
        const signalPair = createSignal(false)
        completed = signalPair[0]
        setCompleted = signalPair[1]

        taskCompletionStates.set(todo.id, { completed, setCompleted })
    }

    const toggleStatus = () => {
        setCompleted(!completed())
    }

    const deleteTask = () => {
        removeTodo(todo.id)
        taskCompletionStates.delete(todo.id)
    }

    return dom(tag: 'li', {
        class: () => completed() ? 'completed' : ''
    },
        dom(tag: 'div', { class: 'view' },
            dom(tag: 'input', {
                type: 'checkbox',
                class: 'toggle',
                onchange: toggleStatus,
                checked: () => completed()  // ← Use local signal
            }),
            dom(tag: 'label', {}, todo.title),
            dom(tag: 'button', {
                class: 'destroy',
                onclick: deleteTask
            })
        ),
        dom(tag: 'div', { class: 'input-container' },
            dom(tag: 'input', {
                id: 'edit-todo-input',
                type: 'text',
                class: 'edit'
            }),
            dom(tag: 'label', {
                class: 'visually-hidden',
                for: 'edit-todo-input'
            }, 'Edit Todo Input')
        )
    )
}

document.body.append(sectionPart())