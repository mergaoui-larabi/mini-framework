import * as fm from "../../framwork/index.js";

const { dom, createSignal, createEffect, untrack } = fm;

const [todos, setTodos] = createSignal([]);
const [editingId, setEditingId] = createSignal(null);
const [filter, setFilter] = createSignal('all');

function toggleAll() {
    console.log("toggleAll")
}

function clearCompleted() {
    console.log("clearCompleted()")
}

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
        },
        {
            tag: "input",
            attributes: {
                class: "new-todo",
                placeholder: "What needs to be done?",
                onkeydown: (e) => {
                    if (e.nativeEvent.code === 'Enter') {
                        console.log(e.nativeEvent.target.value);
                        setTodos([...todos(), e.nativeEvent.target.value]);
                        e.nativeEvent.target.value = ''
                    }
                },
                autofocus: true,
            },
        },
        {
            tag: "section",
            attributes: { class: "main" },
            children: [
                {
                    tag: "input",
                    attributes: {
                        id: "toggle-all",
                        class: "toggle-all",
                        type: "checkbox",
                        onclick: toggleAll,
                        onchange: toggleAll
                    }
                },
                {
                    tag: "label",
                    attributes: {
                        for: "toggle-all",
                        onclick: toggleAll
                    },
                    children: ["Mark all as complete"]
                },
                {
                    tag: "ul",
                    attributes: { class: "todo-list" },
                    children: () => todos().map((node) => ({
                        tag: "li",
                        attributes: {
                            "data-id": 0, // todo increment
                            onclick: (e) =>{
                                console.log(e.nativeEvent.target)
                            
                            }
                        },
                        children: [
                            {
                                tag: "div",
                                attributes: {
                                    class: "view"
                                },
                                children: [
                                    { tag: "input", attributes: { class: "toggle", type: "checkbox" } },
                                    { tag: "label", children: [node] },
                                    { tag: "button", attributes: { class: "destroy" } }
                                ]
                            },
                        ]
                    }))
                }

            ]
        },
        {
            tag: "footer",
            attributes: { class: "footer" },
            children: [
                {
                    tag: "span",
                    attributes: { class: "todo-count" },
                    children: []
                },
                // router step
                {
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
                },
                {
                    tag: "button",
                    attributes: {
                        class: "clear-completed",
                        onclick: clearCompleted
                    },
                    children: ["Clear completed"]
                }
            ]
        },

    ]
});

document.body.append(App)