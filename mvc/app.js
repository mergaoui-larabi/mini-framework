import * as fm from "../framwork/core/dom/dom.js"

const dom = {
    tag: "div",
    attributes: {},
    children: [
        {
            tag: "span",
            attributes: {},
            children: []
        },
        {
            tag: "span",
            attributes: { style: "background-color: green;" },
            children: [
                "hoooooooooooooowa"
            ]
        },
        ""
    ]
}

console.log("howa")
const el = fm.domAbstracting(dom)
console.log(el)

document.body.append(el)