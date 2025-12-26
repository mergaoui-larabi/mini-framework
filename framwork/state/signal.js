let currentObserver = null;

// create a signal wich contains a [getter,setter] to some sort of data aka state
export function createSignal(initialValue, name = "signal", debug = false) {
    let value = initialValue;
    const observers = new Set();

    function get() {
        if (currentObserver) {
            observers.add(currentObserver);
            currentObserver.sources.add(observers);
            if (debug) console.log(`[getter] => ${name} tracked current value: ${value}`);
        }
        if (debug) console.log(`[getter] => signal: ${name} has ${observers.size} observers.`)
        return value;
    };

    function set(newValue) {
        if (value === newValue) return;
        value = newValue;
        if (debug) console.log(`[setter] => ${name} updated new value: ${value}`);
        if (debug) console.log(`[setter] => signal: ${name} has ${observers.size} observers.`);
        // very important to use [...observers] a static copy of the set to avoid mutate the set during effect re-runs
        [...observers].forEach(effect => {
            scheduleEffect(effect);
        });
    };

    return [get, set]
}

//create a effect that watches a signal aka observer
export function createEffect(fn) {
    function effect() {
        if (effect.running) return
        effect.running = true;

        cleanUp(effect);
        currentObserver = effect;
        fn()
        currentObserver = null;
        effect.running = false;
    };prevent

    effect.sources = new Set();
    effect.running = false;
    effect();
}

//detach a signal from un effect for a bref moment
export function untrack(fn) {
    const prev = currentObserver;
    currentObserver = null;
    const untracked = fn();
    currentObserver = prev;
    return untracked;
}

//clean up dependencies before each rerun of an effect
export function cleanUp(effect) {
    for (const obeserver of effect.sources) {
        obeserver.delete(effect);
    }
    effect.sources.clear();
}


//schscheduleEffect / batching
const effectQueue = new Set();
let isFlushing = false;

// wait for the JS stack to finish excution than excute the effect int the Microtask level
export function scheduleEffect(effect) {
    effectQueue.add(effect);
    if (!isFlushing) {
        isFlushing = true;
        queueMicrotask(flushEffects);
    }
}

export function flushEffects() {
    try {
        for (const effect of effectQueue) {
            effect();
        }
    } finally {
        effectQueue.clear();
        isFlushing = false;
    }
}

// memo or cashing
export function createMemo(fn, initialValue, name = "memo", debug = false) {
    const [get, set] = createSignal(initialValue, name, debug);
    let firstRun = true;

    createEffect(() => {
        const next = fn();

        if (firstRun || next !== get()) {
            if (debug) console.log(`[memo] ${name} updated:`, next);
            set(next)
            firstRun = false;
        }
    })

    return get;
}