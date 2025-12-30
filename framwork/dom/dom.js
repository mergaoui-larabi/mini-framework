import { valideHtmlNode } from "../libs/validate_html_node.js";
import { validateDomNode, tagsMapAttributesSet } from "./tags.js";
import { createEffect } from "../state/signal.js";
import { eventManager } from "../event/event.js";

const devMode = false;

// function GenerateTagFunctions() {
//     const tags = {};
//     for (const tag of Object.keys(tagsMapAttributesSet)) {
//         tags[tag] = function ({ attributes = {}, children = [] } = {}) {
//             return domAbstracting({ tag, attributes, children });
//         };
//     }
//     return tags;
// }

// // Step 2: destructure and export as el
// export const el = { ...GenerateTagFunctions() };

// Destructure and export all tags as named exports
// export const {
//     a, abbr, address, area, article, aside, audio, b, base, bdi, bdo,
//     blockquote, body, br, button, canvas, caption, cite, code, col, colgroup,
//     data, datalist, dd, del, details, dfn, dialog, div, dl, dt, em, embed,
//     fieldset, figcaption, figure, footer, form, h1, h2, h3, h4, h5, h6,
//     head, header, hgroup, hr, html, i, iframe, img, input, ins, kbd,
//     label, legend, li, link, main, map, mark, meta, meter, nav, noscript,
//     object, ol, optgroup, option, output, p, param, picture, pre, progress,
//     q, rp, rt, ruby, s, samp, script, section, select, slot, small, source,
//     span, strong, style, sub, summary, sup, table, tbody, td, template, textarea,
//     tfoot, th, thead, time, title, tr, track, u, ul, var: varTag, video, wbr
// } = GenerateTagFunctions();


export function dom(node) {
    if (!valideHtmlNode(node)) return;
    if (devMode && !validateDomNode(node)) return;

    if (typeof node === "string") {
        return document.createTextNode(node ?? "");
    }
    const el = document.createElement(node.tag);
    setAttributes(el, node.attributes);
    appendChildren(el, node.children);

    return el;
}

// Handles attributes, including reactive ones
function setAttributes(el, attributes = {}) {
    for (const [key, value] of Object.entries(attributes)) {
        if (key.startsWith("on") && typeof value === "function") {
            const eventName = key.toLowerCase().substring(2);
            el.addEventListener(eventName, value);
        } else if (typeof value === "function") {
            // reactive attribute
            createEffect(() => el.setAttribute(key, value()));
        } else {
            el.setAttribute(key, value);
        }
    }
}

// Handles children, including reactive text nodes
function appendChildren(el, children = []) {
    for (const child of children) {
        let childEl;

        if (typeof child === "function") {
            // reactive text node
            childEl = document.createTextNode("");
            createEffect(() => {
                childEl.nodeValue = child();
            });
        } else {
            childEl = dom(child);
        }

        if (childEl) el.appendChild(childEl);
    }
}


