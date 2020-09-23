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
    nodes.push(currentNode)
  }
}

sortByNodeType = (ele) => {
  const nodes = flatTree(ele)

  const parsed = {
    metadata: document.createElement("div"),
    text: document.createElement("div"),
    prompt: document.createElement("div"),
    streams: document.createElement("div"),
  }

  //console.log(nodes)

  nodes.forEach((node) => {
    if (match(node, "prompt")) {
      node.remove()
      return (parsed.prompt = node)
    }

    if (
      parsed.metadata.contains(node) ||
      parsed.text.contains(node) ||
      parsed.prompt.contains(node) ||
      parsed.streams.contains(node)
    )
      return

    if (match(node, "stream")) {
      console.log({ stream: node })
      return parsed.streams.append(node)
    }

    if (
      match_any(node, Selectors.TEXT) ||
      node.nodeType == Node.TEXT_NODE
    ) {
      //if (node.textContent.trim().length == 0) return
      if (match(node, "pre")) {
        ;[].forEach.call(node.children, (child) => {
          if (child.tagName.length == 1) return
          if (match(child, "pre")) return child.remove()
          child.remove()
        })
      }
      /*const maybeDanglingWhitespace = node.lastChild
      if (maybeDanglingWhitespace && maybeDanglingWhitespace.nodeType == Node.TEXT_NODE) {
        if (maybeDanglingWhitespace.textContent.trimEnd().length == 0) {
          maybeDanglingWhitespace.remove()
        }
      }*/
      console.log({ text: node })
      return parsed.text.append(node)
    }

    if (
      match_any(node, Selectors.STATUS_TAGS_WITH_CHILDREN)
    ) {
      console.log({ status_children: node })
      return parsed.metadata.append(node)
    }

    if (match_any(node, Selectors.STATUS_TAGS)) {
      node.childNodes.forEach((node) => node.remove())
      console.log({ status_solo: node })
      return parsed.metadata.append(node)
    }

    if (match_any(node, Selectors.STATUS_TAGS_WITH_TEXT)) {
      console.log({ status_text: node })
      return parsed.metadata.append(node)
    }

    console.log({ unmatched: node })
  })

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
