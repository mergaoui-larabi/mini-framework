export * from './dom/dom.js'
export * from './dom/tags.js'
export * from './event/event.js'
export * from './libs/fetch_config.js'
export * from './libs/validate_html_node.js'
export * from './router/router.js'
export * from './state/signal.js'
export * from './dom/show.js'


// let currentEffect = null

// export function createSignal(value) {
//     const subscribers = new Set();

//     return [
//         () => {
//             if (currentEffect) subscribers.add(currentEffect)
//             return value
//         },
//         (v) => {
//             value = v;
//             subscribers.forEach(fn => fn())
//         }
//     ];
// }


// export function effect(fn) {
//     currentEffect = fn;
//     fn();
//     currentEffect = null;
// }

// export function computed(fn) {
//     let value;
//     let dirty = true;
//     const subscribers = new Set();

//     const recompute = () => {
//         if (!dirty) return;
//         dirty = false;
//         value = fn();
//     };

//     const read = () => {
//         if (currentEffect) subscribers.add(currentEffect);
//         recompute();
//         return value;
//     };

//     effect(() => {
//         dirty = true;
//         subscribers.forEach(fn => fn());
//     });

//     return read;
// }

