import { createEffect, createSignal, dom, For } from "../../framwork/index.js";

const [className, setClassName] = createSignal("red")
const [arr, setArr] = createSignal([1, 2, 3, 4, 5])

createEffect(() => {
  if (className() === "blue") {
    // setArr([...arr(), 0])
  }
})
createEffect(() => {
  if (className() === "red") {
    setArr(arr().filter((i) => i !== 0))
  }
})



const Map = dom({
  tag: "div",
  attributes: {
    class: className,
    style: () => `width: 100px; height: 100px; background-color: ${className()};`,
    onClick: (e) => {
      setClassName(className() === "red" ? "blue" : "red");
      setArr([...arr(), arr().length + 1]);
    }
  },
  children: For(arr, (item) => ({
    tag: "div",
    attributes: {},
    children: [item.toString()]
  }))
})

// console.log(For(arr, (item) => ({
//     tag: "div",
//     attributes: {},
//     children: () => item.value
//   }))()
// )



document.body.appendChild(Map);