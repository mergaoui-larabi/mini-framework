// dom main

import { getDevMode } from "../libs/fetch_config.js";
import { validateDomNode } from "./tags.js";
import { valideHtmlNode } from "../libs/validate_html_node.js";

const devMode = await getDevMode()

const node = {
    tag: "",
    attributes: {},
    children: []
}

export function domAbstracting(node) {
    if (!valideHtmlNode(node)) return
    if (devMode) if (!validateDomNode(node)) return

    if (typeof node === "string") {
        return document.createTextNode(node ?? "");
    }
    const el = document.createElement(node.tag);

    if (node.attributes) {
        for (const [key, value] of Object.entries(node.attributes)) {
            el.setAttribute(key, value);
        }
    }
    if (node.children) {
        for (const child of node.children) {
            el.appendChild(domAbstracting(child));
        }
    }

    return el;
}
