exports.map = (root, selector, cb) =>
  [].map.call(root.querySelectorAll(selector), (ele) => cb(ele))

exports.each = (nodelist, cb) => {
  ;[].forEach.call(nodelist, cb)
  return [].slice.call(nodelist)
}

exports.match_any = (node, selectors) =>
  node &&
  typeof node.matches == "function" &&
  node.matches(selectors.join(", "))

exports.match = (node, selector) =>
  node && typeof node.matches == "function" && node.matches(selector)

exports.is_line_break = (node) =>
  node && node.nodeType == Node.TEXT_NODE && node.textContent == "\n"

exports.has_ancestor = (ele, selectors) => {
  if (ele.nodeType == Node.TEXT_NODE) ele = ele.parentElement
  return ele && !!ele.closest(selectors.join(", "))
}

exports.is_text_node = (node) => node && node.nodeType == Node.TEXT_NODE
