import { valideHtmlNode } from "../libs/validate_html_node.js";
import { validateDomNode } from "./tags.js";
import { GlobalEventManager } from "../event/event.js";

const devMode = false;

export function domAbstracting(node) {
    if (!valideHtmlNode(node)) return;
    if (devMode && !validateDomNode(node)) return;

    if (typeof node === "string") {
        return document.createTextNode(node ?? "");
    }

    const el = document.createElement(node.tag);

    if (node.attributes) {
        for (const [key, value] of Object.entries(node.attributes)) {

            if (key.startsWith("on") && typeof value === "function") {
                const eventName = key.toLowerCase().substring(2);
                GlobalEventManager.linkNodeToHandlers(el, eventName, value);

            } else {
                el.setAttribute(key, value);
            }
        }
    }

    if (node.children) {
        for (const child of node.children) {
            const childEl = domAbstracting(child);
            if (childEl) el.appendChild(childEl);
        }
    }

    return el;
}