
let currentObserver = null;

export function createSignal(initialValue, name = "signal") {
    let value = initialValue;
    const observers = new Set();

    function get() {
        if (currentObserver) {
            observers.add(currentObserver);
            console.log(`${name} tracked`);
        }
        return value;
    };

    function set(newValue) {
        if (Object.is(value, newValue)) return;
        value = newValue;
        console.log(`${name} updated`);
        observers.forEach(fn => fn());
    };

    return [get, set]
}

export function createEffect(fn) {
    function run() {
        currentObserver = run;
        fn()
        currentObserver = null;
    };

    run();
}