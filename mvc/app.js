import * as fm from "../framwork/index.js"


const [count, setCount] = fm.createSignal(1);

const doubled = fm.computed(() => {
    console.log("computed runs");
    return count() * 2;
});

fm.effect(() => {
    document.getElementById("out").textContent = doubled();
});

document.getElementById("btn").onclick = () => {
    setCount(count() + 1);
};
