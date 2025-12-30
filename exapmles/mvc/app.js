import * as fm from "../../framwork/index.js";

const { dom, createSignal, createEffect } = fm;

const [counter, setCounter] = createSignal(0);

function increment() {
  setCounter(counter() + 1);
}

const App = dom({
  tag: "div",
  attributes: { id: "app-container", class: "container" },
  children: [
    {
      tag: "h1",
      attributes: { class: "title" },
      children: ["Example"]
    },
    {
      tag: "button",
      attributes: {
        id: "increment-btn",
        onClick: () => increment()
      },
      children: ["Increment"]
    },
    {
      tag: "p",
      attributes: { id: "counter-display" },
      children: [() => counter()]
    }
  ]
});

const Div = dom({
  tag: "div",
  attributes: { id: "app-container", class: "container" },
  children: []
});

document.body.append(App, Div, App);