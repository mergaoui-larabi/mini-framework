import { getDevMode } from "./core/libs/fetch_config.js";

const devMode = await getDevMode()
console.log(devMode)
let currentEffect = null

export function createSignal(value) {
    const subscribers = new Set();

    return [
        () => {
            if (currentEffect) subscribers.add(currentEffect)
            return value
        },
        (v) => {
            value = v;
            subscribers.forEach(fn => fn())
        }
    ];
}


export function effect(fn) {
    currentEffect = fn;
    fn();
    currentEffect = null;
}

export function computed(fn) {
    let value;
    let dirty = true;
    const subscribers = new Set();

    const recompute = () => {
        if (!dirty) return;
        dirty = false;
        value = fn();
    };

    const read = () => {
        if (currentEffect) subscribers.add(currentEffect);
        recompute();
        return value;
    };

    effect(() => {
        dirty = true;
        subscribers.forEach(fn => fn());
    });

    return read;
}

