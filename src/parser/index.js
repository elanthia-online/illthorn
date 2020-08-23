const Mark = require("mark.js")
const linkifyElement = require("linkifyjs/element")

const Lookup = require("../util/lookup")
const Hilites = require("../hilites")
const Url = require("../util/url")
const IO = require("../util/io")

const parser = new DOMParser()
const pp = {
  parsed: require("debug")("illthorn:parser:parsed"),
  raw: require("debug")("illthorn:parser:raw"),
  node: require("debug")("illthorn:parser:sort"),
}

exports.parse = async function (session, incoming) {
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

  merge(doc.head, doc.body)

  pp.parsed(doc.body.innerHTML)

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
}

function isDanglingStream(buffered) {
  // todo: this should also match id= attribute
  return (
    (buffered.match(/<pushStream/) || []).length >
    (buffered.match(/<popStream/) || []).length
  )
}

const merge = (left, right) => {
  right.append(...left.childNodes)
  return right
}

const TOP_LEVEL_STATUS_TAGS_WITH_TEXT = (exports.TOP_LEVEL_STATUS_TAGS_WITH_TEXT = Lookup(
  ["right", "left", "spell"]
))

const TOP_LEVEL_STATUS_TAGS = (exports.TOP_LEVEL_STATUS_TAGS = Lookup(
  [
    "compass",
    "img",
    "dialogdata",
    "nav",
    "#inv",
    "progressbar",
    "compdef",
    "switchquickbar",
    "dropdownbox",
    "opendialog",
    "component",
    "deletecontainer",
    "inv",
    "streamwindow",
    "clearcontainer",
    "clearstream",
    "roundtime",
    "casttime",
  ]
))

const match_any = (node, selectors) =>
  typeof node.matches == "function" &&
  selectors.find((selector) => node.matches(selector))

const is_status_tag = (node) =>
  match_any(node, Object.keys(TOP_LEVEL_STATUS_TAGS))

const is_status_with_text = (node) =>
  match_any(
    node,
    Object.keys(TOP_LEVEL_STATUS_TAGS_WITH_TEXT)
  )

const is_text_node = (node) =>
  node.nodeType == Node.TEXT_NODE ||
  node.tagName == "PRE" ||
  node.tagName == "PROMPT" ||
  (node.tagName || "").length == 1 ||
  (node.matches && node.matches("stream.thoughts"))

const is_skippable_text = (node) =>
  node.parentNode &&
  node.nodeType == Node.TEXT_NODE &&
  (is_status_with_text(node.parentNode) ||
    is_status_tag(node.parentNode))

const is_nested_text = (node) =>
  node.parentNode && is_text_node(node.parentNode)

const already_will_render = (parsed, node) =>
  parsed.text.contains(node)

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

function pruneLastRecursiveNode(ele) {
  if (ele.lastChild)
    return pruneLastRecursiveNode(ele.lastChild)
  ele.innerText
    ? (ele.innerText = ele.innerText.trimEnd())
    : (ele.textContent = ele.textContent.trimEnd())
  return ele
}

function sortByNodeType(ele) {
  const nodes = flatTree(ele)

  const parsed = {
    metadata: document.createDocumentFragment(),
    text: document.createDocumentFragment(),
    prompt: void 0,
  }
  // first pass prunes and flattens oddly nested elements
  // example:
  // <pre><pre>content</pre>some other content</pre>
  const writes = []
  for (const node of nodes) {
    if (is_status_tag(node)) node.remove()
    if (is_status_with_text(node)) node.remove()
    if (node.tagName == "PROMPT") {
      node.remove()
      node.classList.add("game")
      parsed.prompt = node
      continue
    }
    // always lift
    if (node.tagName == "PRE") {
      node.remove()
    }
    if (node.tagName == "CASTTIME") {
      const pre = document.createElement("pre")
      pre.append(...node.childNodes)
      writes.push([node, pre])
    }
  }
  // todo: https://github.com/elanthia-online/illthorn/issues/118
  for (const [before, write] of writes) {
    const position = nodes.indexOf(before)
    ~position && nodes.splice(position, 0, write)
  }

  for (const node of nodes) {
    if (!node.tagName && node.textContent.trimEnd() == "") {
      continue
    }

    if (node.tagName == "PROMPT") {
      continue
    }

    if (is_nested_text(node)) {
      continue // <a>#text</a>
    }

    if (is_skippable_text(node)) {
      //pp.node(node, "skippable-text")
      continue // <right>#text</right>
    }

    if (already_will_render(parsed, node)) {
      continue
    }

    if (parsed.metadata.contains(node)) {
      continue
    }

    if (is_status_tag(node) || is_status_with_text(node)) {
      pp.node(
        `:metadata`,
        node.parentElement
          ? "parent=" + inspect(node.parentElement)
          : "",
        inspect(node),
        node.innerHTML || node.textContent
      )
      node.remove()
      parsed.metadata.append(node)
      continue
    }

    if (is_text_node(node)) {
      pp.node(
        `:text`,
        node.parentElement
          ? "parent=" + inspect(node.parentElement)
          : "",
        inspect(node),
        node.innerHTML || node.textContent
      )
      node.remove()
      parsed.text.append(node)
      continue
    }
  }

  const renderableNodes = [...parsed.text.childNodes]

  /* 
    handle top-level text elements that should be collapsed into a <pre>
    example:
      #fragment    ->    #fragment
        #text              pre
        a.exist             #text
        #text               a.exist
                            #text
  */
  if (
    renderableNodes.find((node) => node.tagName !== "pre")
  ) {
    let wrapper = document.createElement("pre")
    renderableNodes.forEach((child) => {
      // insert them correctly in the document stream
      if (child.tagName == "PRE") {
        if (wrapper.hasChildNodes()) {
          parsed.text.insertBefore(wrapper, child)
          wrapper = document.createElement("pre")
        }
        return void 0
      }
      // collect them onto a block element
      child.remove()
      if (child.textContent.trim().length)
        wrapper.append(child)
    })

    if (
      wrapper.hasChildNodes() &&
      !parsed.text.contains(wrapper)
    ) {
      parsed.text.append(wrapper)
    }
  }

  pruneLastRecursiveNode(parsed.text)

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

const pre = (string) => `<pre>${string}</pre>`

function normalize(string) {
  string = string
    .replace(/<style id=""\/>/g, "")
    .replace(/<pushBold\/>/g, `<b class="monster">`)
    .replace(/<popBold\/>/g, "</b>")
    .replace(/<push/g, "<")
    .replace(/<pop/g, "</")
    .replace(/<output/g, "<pre")
    .replace(/<\/output>/g, "</pre>")
    .replace(/<clearContainer/g, "</clearcontainer")
    .replace(/<preset/g, "<pre")
    .replace(/<clearStream id='inv' ifClosed=''\/>/, "")

  string = string.replace(
    /<style id="(\w+)"\s?\/>/g,
    (_, id) => `<pre class="${id}">`
  )

  string = string
    .replace(/ id="/g, ` class="`)
    .replace(/` id='/g, ` class='`)

  if (!string.startsWith("<")) return pre(string)
  if (string.startsWith("<b ")) return pre(string)
  if (string.startsWith("<a ")) return pre(string)
  return string
}
// util to inspect a Node in a compact, meaningful manner
const inspect = (node) =>
  (node.tagName || "#text") +
  (node.id ? "#" + node.id : "") +
  (node.className ? "." + node.className : "")

async function addLinks(ele) {
  linkifyElement(ele, {
    className: (_, type) => "external-link " + type,
    validate: {
      url: (value) => /^(http)s?:\/\//i.test(value),
    },
    events: {
      click: (e) =>
        e.preventDefault() ||
        Url.open_external_link(e.target.href),
    },
  })
}

async function addHilites(ele) {
  const hilites = Hilites.get()
  if (hilites.length == 0) return 0
  const mark = new Mark(ele)
  return await hilites
    .reduce(
      (io, [pattern, className]) =>
        io.fmap(
          () =>
            new Promise((done) =>
              mark.markRegExp(pattern, {
                className,
                done,
              })
            )
        ),
      new IO()
    )
    .unwrap()
}
