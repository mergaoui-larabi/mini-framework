import * as fm from "../framwork/index.js"

const [flag, setFlag] = fm.createSignal(true, "flag")
const [a, setA] = fm.createSignal(1, "a")
const [b, setB] = fm.createSignal(0, "b")

function handleClick() {
    setA(a() + 1);
}

fm.createEffect(() => {
    setFlag(!flag)
    console.log(flag() ? a() : b())
})


const dom = {
    tag: "div",
    attributes: {},
    children: [
        `${a()}`,
        {
            tag: "button",
            attributes: {
                onclick: handleClick
            },
            children: [
                "+"
            ]
        }
    ]
}

const el = fm.domAbstracting(dom)
document.body.append(el)