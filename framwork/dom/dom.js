// dom main

import { getDevMode } from "../libs/fetch_config.js";
import { validateDomNode } from "./tags.js";
import { valideHtmlNode } from "../libs/validate_html_node.js";
import { createEffect } from "../state/signal.js";

const devMode = await getDevMode()

const node = {
    tag: "",
    attributes: {},
    children: []
}

export function domAbstracting(node) {
    if (!valideHtmlNode(node)) return;
    if (devMode) if (!validateDomNode(node)) return;

    // 🔹 static text node
    if (typeof node === "string") {
        return document.createTextNode(node ?? "");
    }

    const el = document.createElement(node.tag);

    // attributes
    if (node.attributes) {
        for (const [key, value] of Object.entries(node.attributes)) {
            if (key.startsWith("on") && typeof value === "function") {
                const eventName = key.toLowerCase().substring(2);
                el.addEventListener(eventName, value);
            }

            // reactive attribute
            else if (typeof value === "function") {
                createEffect(() => {
                    el.setAttribute(key, value());
                });
            }
            else {
                el.setAttribute(key, value);
            }
        }
    }

    // children
    if (node.children) {
        for (const child of node.children) {
            insertChild(el, child);
        }
    }

    return el;
}

function insertChild(parent, child) {
    // null / boolean guard
    if (child == null || child === true || child === false) return;

    // static text
    if (typeof child === "string" || typeof child === "number") {
        parent.appendChild(document.createTextNode(child));
        return;
    }

    // 🔥 reactive text
    if (typeof child === "function") {
        const textNode = document.createTextNode("");
        parent.appendChild(textNode);

        createEffect(() => {
            textNode.data = child() ?? "";
        });

        return;
    }

    // element object
    parent.appendChild(domAbstracting(child));
}

