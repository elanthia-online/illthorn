const { is_line_break, has_ancestor, match } = require("../util/dom")

const Options = NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT

const is_meaningful_tag = (node) => {
  if (is_line_break(node)) {
    return NodeFilter.FILTER_REJECT
  }
  // text contained by a prompt is not meaningful
  if (match(node.parentElement, "prompt")) {
    return NodeFilter.FILTER_REJECT
  }

  if (match(node.parentElement, "pre")) {
    return NodeFilter.FILTER_REJECT
  }

  if (match(node.parentElement, "a, b, d")) {
    //console.log("tree-walker(:skip) -> ", node.textContent)
    return NodeFilter.FILTER_REJECT
  }

  return NodeFilter.FILTER_ACCEPT
}

const Acceptor = { acceptNode: is_meaningful_tag }

module.exports = async (ele, cb) => {
  const iterator = document.createNodeIterator(ele, Options, Acceptor)
  let currentNode = iterator.nextNode()
  while (currentNode) {
    currentNode = iterator.nextNode()
    currentNode && cb(currentNode)
  }
}
