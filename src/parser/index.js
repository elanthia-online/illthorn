const { addLinks } = require("./add-links")
const { addHilites } = require("./add-hilites")
const Selectors = require("./selectors")
const { normalize } = require("./normalize")

const parser = new DOMParser()
const pp = {
  parsed: require("debug")("illthorn:parser:parsed"),
  raw: require("debug")("illthorn:parser:raw"),
  node: require("debug")("illthorn:parser:sort"),
}

exports.parse = async (session, incoming) => {
  try {
    session.buffer += incoming.toString()
    // continue to buffer
    if (isDanglingStream(session.buffer))
      return { buffered: 1 }

    pp.raw(session.buffer)
    // https://github.com/elanthia-online/illthorn/issues/113
    const string = normalize(session.buffer)
    const doc = parser.parseFromString(
      string.trimEnd(),
      "text/html"
    )

    doc.body.append(...doc.head.childNodes)

    const parsed = sortByNodeType(doc.body)

    await addHilites(parsed.text)
    // linkify doesn't work on documentfragment, ugh
    await Promise.all(
      [...parsed.text.childNodes].map((child) =>
        addLinks(child)
      )
    )
    // clear the buffer
    session.buffer = ""
    return { parsed }
  } catch (err) {
    console.error(err)
    return {}
  }
}

exports.map = (root, selector, cb) =>
  [].map.call(root.querySelectorAll(selector), (ele) =>
    cb(ele)
  )

exports.each = (nodelist, cb) => {
  ;[].forEach.call(nodelist, cb)
  return [].slice.call(nodelist)
}

const isDanglingStream = (buffered) => {
  // todo: this should also match id= attribute
  return (
    (buffered.match(/<pushStream/) || []).length >
    (buffered.match(/<popStream/) || []).length
  )
}

const match_any = (node, selectors) =>
  node &&
  typeof node.matches == "function" &&
  selectors.find((selector) => node.matches(selector))

const match = (node, selector) =>
  node &&
  typeof node.matches == "function" &&
  node.matches(selector)

const flatTree = (ele) => {
  const treeWalker = document.createTreeWalker(
    ele,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    { acceptNode: (_) => NodeFilter.FILTER_ACCEPT },
    false
  )

  const nodes = []

  let currentNode = treeWalker.currentNode
  while (currentNode) {
    currentNode = treeWalker.nextNode()
    if (!currentNode) return nodes
    // skip extra whitespace
    if (
      is_line_break(currentNode) &&
      is_line_break(nodes[nodes.length - 1])
    ) {
      continue
    }

    if (is_meaningful_tag(currentNode)) {
      nodes.push(currentNode)
    }
  }
}

const is_line_break = (node) =>
  node &&
  node.nodeType == Node.TEXT_NODE &&
  node.textContent == "\n"

const has_ancestor = (ele, selectors) => {
  if (ele.nodeType == Node.TEXT_NODE)
    ele = ele.parentElement
  return (
    ele &&
    !!selectors.find((selector) => ele.closest(selector))
  )
}

const is_text_node = (node) =>
  node && node.nodeType == Node.TEXT_NODE

const is_meaningful_tag = (node) => {
  if (
    is_text_node(node) &&
    (node.parentElement.tagName.length == 1 ||
      node.parentElement.tagName == "PRE")
  ) {
    return false
  }
  // <comdef class="room objs">...children
  if (
    node.parentElement &&
    has_ancestor(node, Selectors.STATUS_TAGS_WITH_TEXT)
  ) {
    return false
  }

  if (is_line_break(node)) {
    return false
  }

  if (
    is_text_node(node) &&
    match(node.parentElement, "prompt")
  ) {
    return false
  }

  if (node.parentElement.tagName == 1) {
    return false
  }

  if (
    match_any(
      node.parentElement,
      Selectors.STATUS_TAGS_WITH_TEXT
    )
  ) {
    return false
  }

  if (
    is_text_node(node) &&
    match(node.parentElement, "prompt")
  ) {
    return false
  }

  return true
}

const sortByNodeType = (ele) => {
  const nodes = flatTree(ele)

  const parsed = {
    metadata: document.createDocumentFragment(),
    text: document.createDocumentFragment(),
    prompt: void 0,
  }

  nodes.forEach((node) => {
    if (match(node, "prompt")) {
      return node.remove() // todo: fix prompt handling
    }
    //console.log(node.parentNode, { html: node.outerHTML || node.textContent })
    // handle <b><b></b</b> garbage
    if (
      node.tagName &&
      node.parentElement &&
      node.parentElement.tagName == node.tagName &&
      (node.tagName.length == 1 || node.tagName == "PRE")
    ) {
      node.parentElement.replaceWith(node)
    }

    if (parsed.text.contains(node)) return

    if (
      has_ancestor(
        node,
        Selectors.STATUS_TAGS_WITH_CHILDREN
      )
    ) {
      return
    }

    if (
      match_any(node, Selectors.STATUS_TAGS_WITH_CHILDREN)
    ) {
      return parsed.metadata.append(node)
    }

    if (match_any(node, Selectors.STATUS_TAGS)) {
      node.childNodes.forEach((node) => node.remove())
      return parsed.metadata.append(node)
    }

    if (match_any(node, Selectors.STATUS_TAGS_WITH_TEXT)) {
      return parsed.metadata.append(node)
    }

    if (match(node, "stream")) {
      return parsed.text.append(node)
    }

    if (
      match_any(node, Selectors.TEXT) ||
      node.nodeType == Node.TEXT_NODE
    ) {
      // handled naked text tags by always wrapping in a <pre>
      if (!has_ancestor(node, ["pre"])) {
        if (match(parsed.text.lastElementChild, "pre")) {
          return parsed.text.lastElementChild.appendChild(
            node
          )
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
