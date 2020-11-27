const TreeWalker = require("./tree-walker")
const { has_ancestor, match, match_any } = require("../util/dom")
const Selectors = require("./selectors")
const Parsed = require("./parsed")

exports.parse = (session, ele) => {
  //console.log("incoming: \n%s", ele.outerHTML)
  const parsed = Parsed()

  TreeWalker(ele, (node) => {
    if (match(node, "prompt")) {
      node.remove() // todo: fix prompt handling
      return (parsed.prompt = node)
    }

    if (node.parentNode && session.has_focus()) {
      console.log(node.parentNode, {
        html: node.outerHTML || node.textContent,
      })
    }

    if (
      node.tagName &&
      node.parentElement &&
      node.parentElement.tagName == node.tagName &&
      (node.tagName.length == 1 || node.tagName == "PRE")
    ) {
      node.tagName == "PRE"
        ? node.remove()
        : node.parentElement.replaceWith(node)
    }

    if (
      has_ancestor(node, Selectors.STATUS_WITH_CHILDREN) &&
      parsed.metadata.contains(node)
    ) {
      return (
        session.has_focus() && console.log(":skip -> %s", node.outerHTML)
      )
    }

    if (match_any(node, Selectors.STATUS_WITH_CHILDREN)) {
      return parsed.metadata.append(node)
    }

    if (match_any(node, Selectors.STATUS_WITH_TEXT)) {
      return parsed.metadata.append(node)
    }

    if (match_any(node, Selectors.STATUS)) {
      node.childNodes.forEach((node) => node.remove())
      return parsed.metadata.append(node)
    }

    if (parsed.text.contains(node)) return

    if (match(node, "stream")) {
      return parsed.text.append(node)
    }

    if (
      node.nodeType == Node.TEXT_NODE ||
      match_any(node, Selectors.TEXT)
    ) {
      // handled naked text tags by always wrapping in a <pre>
      if (!has_ancestor(node, ["pre"])) {
        if (session.has_focus()) {
          console.log("naked-text: %o", node)
        }

        if (match(parsed.text.lastElementChild, "pre")) {
          return parsed.text.lastElementChild.appendChild(node)
        }

        const pre = document.createElement("pre")
        pre.appendChild(node)
        return parsed.text.appendChild(pre)
      }

      if (match(node, "pre")) {
        ;[].forEach.call(node.children, (child) => {
          if (child.tagName.length == 1) return
          child.remove()
        })
      }

      return parsed.text.append(node)
    }

    console.log({
      unmatched: node.outerHTML,
      parent: node.parentNode,
    })
  })

  return parsed
}
