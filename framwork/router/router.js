// ** event.defaultPrevented — if some other handler already prevented it, don’t interfere.
// ** event.button !== 0 — allow middle/right buttons; only intercept left-click (button 0).
// ** event.metaKey || event.ctrlKey || event.shiftKey || event.altKey — allow user ctrl/cmd+click to open new tab or new window.
// ** link.target === "_blank" (or other targets) → do not intercept.
// ** link.hasAttribute('download') → do not intercept.
// ** href scheme: skip non-HTTP schemes (mailto:, tel:, sms:, javascript:) and skip data: URIs.
// ** link.origin !== location.origin → external link; do not intercept.
// ** If the link only changes the fragment (same path, different #foo) you may want special handling (scroll to fragment) rather than full route change.

import { EventEmitter } from '../event/event_emitter.js'

export class Router {
    static #RouterKey = Symbol('Router constructor key');
    static instance = new Router(Router.#RouterKey);
    #VIEW_ROUTES = {}
    #EVENT_ROUTES = new Map()
    #STORED = new Map()
    #CURRENT_VIEW = null
    #ERROR_HANDLER = null
    #CONTEXT = new Map()
    #SUBSCRIPTIONS = new Map()

    constructor(key) {
        if (key !== Router.#RouterKey) {
            throw new TypeError('Router is not constructable directly.');
        }
    }

    initRouter() {
        document.body.addEventListener('click', this.#handleClick.bind(this));
        window.addEventListener("DOMContentLoaded", () => {
            this.handleRoute(window.location.href, false);
        });

        window.addEventListener('popstate', () => {
            this.handleRoute(window.location.href, false);
        });
    }

    #canPreventDefault(event) {
        return (
            event.defaultPrevented || event.button !== 0 ||
            event.metaKey || event.shiftKey || event.altKey
        );
    }

    #handleClick(event) {
        const link = event.target.closest('a');
        if (!link) return;
        if (this.#canPreventDefault(event)) return;
        const hrefAttr = link.getAttribute('href');
        if (!hrefAttr) return;
        if (link.target && link.target !== '_self') return;
        if (link.hasAttribute('download')) return;
        let url;
        try { url = new URL(hrefAttr, document.baseURI) } catch (err) { return; }
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
        if (url.origin !== location.origin) return;
        if (url.pathname === location.pathname && url.search === location.search && url.hash !== location.hash) return;

        event.preventDefault();
        this.handleRoute(link, true);
    }

    addViewRoute = (route, ViewClass, destroy = true) => {
        this.#VIEW_ROUTES[route] = [() => new ViewClass(), destroy]
    }

    redirect = (route, data = null) => this.handleRoute(route, true, data)

    destroyCurrentView = () => this.#CURRENT_VIEW.destroy()
    getCurrentView = () => this.#CURRENT_VIEW

    addEventRoute(path, event) {
        const url = new URL(path, document.baseURI);
        if (this.#EVENT_ROUTES.get(url.pathname)) throw new Error("already mapped");
        if (this.#STORED.get(url.pathname) || this.#VIEW_ROUTES[url.pathname]) throw new Error("already mapped as view")
        this.#EVENT_ROUTES.set(url.pathname, event)
    }

    async handleRoute(path, pushState = false, data = null) {
        
        const url = new URL(path, document.baseURI);
        let tmp = this.#EVENT_ROUTES.get(url.pathname)

        if (tmp) return EventEmitter.instance.emit(tmp)

        if (this.#CURRENT_VIEW) this.#CURRENT_VIEW.destroy()

        if (this.#STORED.get(url.pathname)) {
            this.#CURRENT_VIEW = this.#STORED.get(url.pathname)
            this.#CURRENT_VIEW.render(data);
            pushState ? history.pushState({}, '', url.href) : 0
            return
        }
        tmp = this.#VIEW_ROUTES[url.pathname];
        if (!tmp) {
            this.redirect("/error", 404)
            return
        }

        const [factory, destroy] = tmp

        if (!factory) {
            console.error(`No route found for: ${url.pathname}`);
            return;
        }

        if (!destroy) {
            this.#STORED.set(url.pathname, factory())
            this.#CURRENT_VIEW = this.#STORED.get(url.pathname)
        } else this.#CURRENT_VIEW = factory();

        if (pushState) history.pushState({}, '', url.href);
        this.#CURRENT_VIEW.render(data);
    }

    setErrorHandler = (errorHanler) => this.#ERROR_HANDLER = errorHanler

    async handleError(err) {  
        if (this.#ERROR_HANDLER) return this.#ERROR_HANDLER(err)
        else throw new Error("no error handler");
    }

    subscribe(key, callback) {
        if (!this.#SUBSCRIPTIONS.has(key)) {
            this.#SUBSCRIPTIONS.set(key, new Set());
        }
        this.#SUBSCRIPTIONS.get(key).add(callback);
    }

    storeValueInContext(name, component) {
        // if (this.#CONTEXT.get(name)) throw new Error(`${name}: already exists`);        
        this.#CONTEXT.set(name, component)

        // Notify all subscribers for this key
        if (this.#SUBSCRIPTIONS.has(name)) {
            this.#SUBSCRIPTIONS.get(name).forEach(callback => {
                try {
                    callback(component);
                } catch (e) {
                    console.error(`Error in reactive update for key "${name}":`, e);
                }
            });
        }
    }

    removeValueFromContext(name) {
        // if (!this.#CONTEXT.get(name)) throw new Error(`${name}:the component does not exists`);
        this.#CONTEXT.delete(name)
    }

    getvalueFromContext(name) {
        const comp = this.#CONTEXT.get(name)
        // if (!comp) throw new Error(`${name}:the component does not exists`);
        return comp
    }

    removeAllValuesFromContext = () => this.#CONTEXT.clear()
}
