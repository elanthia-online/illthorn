const Mark = require("mark.js")
const linkifyElement = require("linkifyjs/element")
const Hilites = require("../hilites")
const Url = require("../util/url")
const IO = require("../util/io")

const Selectors = require("./selectors")
const { normalize } = require("./normalize")

const parser = new DOMParser()
const pp = {
  parsed: require("debug")("illthorn:parser:parsed"),
  raw: require("debug")("illthorn:parser:raw"),
  node: require("debug")("illthorn:parser:sort"),
}

exports.parse = async function (session, incoming) {
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

    //await addHilites(parsed.text)
    // linkify doesn't work on documentfragment, ugh
    /*await Promise.all(
      [...parsed.text.childNodes].map((child) =>
        addLinks(child)
      )
    )*/
    // clear the buffer
    session.buffer = ""
    return { parsed }
  } catch (err) {
    console.error(err)
    return {}
  }
}

function isDanglingStream(buffered) {
  // todo: this should also match id= attribute
  return (
    (buffered.match(/<pushStream/) || []).length >
    (buffered.match(/<popStream/) || []).length
  )
}

const match_any = (node, selectors) =>
  typeof node.matches == "function" &&
  selectors.find((selector) => node.matches(selector))

const match = (node, selector) =>
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
    /*if (
      currentNode.nodeType == Node.TEXT_NODE &&
      currentNode.textContent == "\n"
    ) {
      continue // \n control character from a TCP stream
    }*/
    nodes.push(currentNode)
  }
}

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

sortByNodeType = (ele) => {
  const nodes = flatTree(ele).filter((node) => {
    if (
      is_text_node(node) &&
      (node.parentElement.tagName.length == 1 ||
        node.parentElement.tagName == "PRE")
    ) {
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
  })

  const parsed = {
    metadata: document.createElement("div"),
    text: document.createElement("div"),
    prompt: void 0,
  }

  nodes.forEach((node) => {
    //console.log(node.parentNode, { html: node.outerHTML || node.textContent })

    if (
      node.tagName &&
      node.parentElement &&
      node.parentElement.tagName == node.tagName &&
      (node.tagName.length == 1 || node.tagName == "PRE")
    ) {
      // handle <b><b></b</b> garbage
      node.parentElement.replaceWith(node)
    }

    if (parsed.text.contains(node)) return

    //console.log(node.outerHTML || `text(${node.textContent})`)

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
      if (
        node.parentElement &&
        has_ancestor(node, Selectors.STATUS_TAGS_WITH_TEXT)
      ) {
        return // <comdef class="room objs"
      }

      if (match(node, "pre")) {
        ;[].forEach.call(node.children, (child) => {
          if (child.tagName.length == 1) return
          child.remove()
        })
      }

      return parsed.text.append(node)
    }

    console.log({ unmatched: node.outerHTML })
  })

  if (
    parsed.text.childNodes.length == 1 &&
    parsed.text.firstElementChild &&
    parsed.text.firstElementChild.tagName == "PROMPT"
  ) {
    parsed.text.innerHTML = ""
  }

  return parsed
}

exports.map = (root, selector, cb) =>
  [].map.call(root.querySelectorAll(selector), (ele) =>
    cb(ele)
  )

exports.each = (nodelist, cb) => {
  ;[].forEach.call(nodelist, cb)
  return [].slice.call(nodelist)
}

// util to inspect a Node in a compact, meaningful manner
const inspect = (node) =>
  (node.tagName || "#text") +
  (node.id ? "#" + node.id : "") +
  (node.className ? "." + node.className : "")
