export function domAbstracting(node) {
    if (!valideHtmlNode(node)) return
    if (devMode) if (!validateDomNode(node)) return

    if (typeof node === "string") {
        return document.createTextNode(node ?? "");
    }
    const el = document.createElement(node.tag);

    if (node.attributes) {
        for (const [key, value] of Object.entries(node.attributes)) {
            // must implement event delegation
            if (key.startsWith("on") && typeof value === "function") {
                const eventName = key.toLowerCase().substring(2);
                el.addEventListener(eventName, value);
            } else {
                el.setAttribute(key, value);
            }
        }
    }
    if (node.children) {
        for (const child of node.children) {
            el.appendChild(domAbstracting(child));
        }
    }

    return el;
}