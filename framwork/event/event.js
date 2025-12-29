
const nodeHandlerRegistry = new WeakMap();

class GlobalEventManager {
    static #GlobalEventManagerKey = Symbol('GlobalEventManager constructor key');
    static instance = new GlobalEventManager(GlobalEventManager.#GlobalEventManagerKey);

    constructor(key) {
        if (key !== GlobalEventManager.#GlobalEventManagerKey) {
            throw new TypeError('GlobalEventManager is not constructable directly.');
        }
        this.root = root;
        this.supportedEvents = ['click', 'input', 'change', 'submit'];
        this.init();
    }


    init() {
        this.supportedEvents.forEach(eventName => {
            this.root.addEventListener(eventName, (e) => this.handleEvent(e), false);
        });
    }

    handleEvent(nativeEvent) {
        let target = nativeEvent.target;
        const eventType = nativeEvent.type;

        while (target && target !== this.root) {
            
            const handlers = nodeHandlerRegistry.get(target);

            if (handlers && handlers[eventType]) {
                handlers[eventType](nativeEvent, target);

                // if (nativeEvent.cancelBubble) return; 
            }

            target = target.parentNode;
        }
    }

    static linkNodeToHandlers(node, eventName, handler) {
        let existingHandlers = nodeHandlerRegistry.get(node) || {};
        existingHandlers[eventName] = handler;
        nodeHandlerRegistry.set(node, existingHandlers);
    }
}
export const eventManager = GlobalEventManager.instance;