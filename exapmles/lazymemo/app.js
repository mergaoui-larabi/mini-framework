import * as fm from "../../framwork/index.js";

const { dom, createSignal, createEffect, createMemo } = fm;

const [x, setX] = createSignal(0);
const [y, setY] = createSignal(0);

const total = createMemo(() => {
  return x() + y();
}, 0, "total", true);

const App = dom({
  tag: "div",
  attributes: { id: "app-container", class: "container", onkeydown: (e) => keydown(e) },
  children: [
    {
      tag: "h1",
      attributes: { class: "title" },
      children: ["Example"]
    },

    {
      tag: "button",
      attributes: {
        id: "increment-x-btn",
        onClick: () => setX(x() + 1)
      },
      children: ["Increment X"]
    },
    {
      tag: "button",
      attributes: {
        id: "increment-y-btn",
        onClick: () => setY(y() + 1)
      },
      children: ["Increment Y"]
    },
    {
      tag: "p",
      attributes: { id: "x-display" },
      children: [() => `X: ${x()}`]
    },
    {
      tag: "p",
      attributes: { id: "y-display" },
      children: [() => `Y: ${y()}`]
    },
    {
      tag: "p",
      attributes: { id: "total-display" },
      children: [() => `Total (X + Y): ${total()}`]
    }
  ]
});

document.body.append(App);