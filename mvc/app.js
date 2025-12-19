import * as fm from "../framwork/index.js"

// const [flag, setFlag] = fm.createSignal(true, "flag")
// const [a, setA] = fm.createSignal(1, "a")
// const [b, setB] = fm.createSignal(0, "b")

// function handleClick() {
//     setA(a() + 1);
// }

// fm.createEffect(() => {
//     setFlag(!flag)
//     console.log(flag() ? a() : b())
// })


// const dom = {
//     tag: "div",
//     attributes: {},
//     children: [
//         `${a()}`,
//         {
//             tag: "button",
//             attributes: {
//                 onclick: handleClick
//             },
//             children: [
//                 "+"
//             ]
//         }
//     ]
// }

// const el = fm.domAbstracting(dom)
// document.body.append(el)





const [count, setCount] = fm.createSignal(0);

let btn = document.createElement('button');
btn.textContent = 'Increment';
btn.onclick = () => setCount(count() + 1);

// 1. GLOBAL TEMPLATE (Created once)
const _tmpl$ = document.createElement("template");
_tmpl$.innerHTML = "<div>Count: <!></div>"; 
// Note: <!> acts as a marker/comment node for where text goes

function App() {

  // 2. DOM INSTANTIATION (Fast cloning)
  // cloneNode(true) is significantly faster than creating nodes manually
  const div = _tmpl$.content.firstChild.cloneNode(true);
  
  // 3. TRAVERSAL & REPLACEMENT
  // The <!> comment node is a placeholder. We replace it with a text node.
  const placeholder = div.firstChild.nextSibling;
  const textNode = document.createTextNode('');
  div.replaceChild(textNode, placeholder);

  // 4. REACTIVE BINDING
  // This is the "Magic". We create an Effect that only updates this specific textNode.
  fm.createEffect(() => {
    // This function re-runs whenever 'count' changes.
    // It updates the DOM directly.
    textNode.nodeValue = count();
  });

  return div;
}

document.body.append(App());
document.body.append(btn);
