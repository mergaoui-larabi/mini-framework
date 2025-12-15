

export function valideHtmlNode(node) {
    if (typeof node === "string") { return true }
    if (!node) { console.error("you cant render a falsy node", node); return false }
    if (!node.tag) { console.error("you cant render a falsy node", node); return false }
    if (!node.attributes) { console.error("you cant render a falsy node", node); return false }
    if (!Array.isArray(node.children)) { console.error("you cant render a falsy node", node); return false }
    return true
}