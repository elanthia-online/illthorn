const parser = new DOMParser()
const pp = {
  parsed: require("debug")("illthorn:parser:parsed"),
  raw: require("debug")("illthorn:parser:raw"),
}

exports.parse = async function (session, incoming) {
  session.buffer += incoming.toString()
  // continue to buffer
  if (isDanglingStream(session.buffer))
    return { buffered: 1 }

  pp.raw(session.buffer)
  // https://github.com/elanthia-online/illthorn/issues/113
  trimLineBreaks(session.buffer)
  const string = normalize(session.buffer)
  const doc = parser.parseFromString(
    string.trimEnd(),
    "text/html"
  )
  // indicators can contain text
  exports.map(doc, "indicator", (indicator) => {
    const text = indicator.innerText.slice(0)
    if (text.length == 0) return
    indicator.innerHTML = pre(text)
  })
  // familiar streams are garbo and need to be compressed
  flatten_familiars(doc.querySelectorAll(".familiar"))

  pp.parsed(doc.body.innerHTML)
  // clear the buffer
  session.buffer = ""
  return { parsed: doc }
}

function flatten_familiars(familiars, root) {
  familiars = [].slice.call(familiars)
  if (familiars.length == 0) return
  if (!root) root = familiars.shift()
  familiars.forEach((ele) => {
    if (ele.className !== "familiar") {
      return root.append(ele)
    }
    ele.remove()
    return flatten_familiars(ele.childNodes, root)
  })
}

function isDanglingStream(buffered) {
  // todo: this should also match id= attribute
  return (
    (buffered.match(/<pushStream/) || []).length >
    (buffered.match(/<popStream/) || []).length
  )
}

function trimLineBreaks(string) {
  return string
    .replace(/^(\r|\n)/g, "")
    .replace(/(\r|\n)$/g, "")
}

exports.trimLineBreaks = trimLineBreaks

function pre(string) {
  return `<pre>${string}</pre>`
}

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
/* recursive visitor */
exports.visitAll = (root, cb) => {
  cb(root)
  if (!root.parentNode && !root.nodeName == "#document")
    return
  root.childNodes.forEach((child) =>
    exports.visitAll(child, cb)
  )
}

exports.each = (nodelist, cb) => {
  ;[].forEach.call(nodelist, cb)
  return [].slice.call(nodelist)
}

exports.allDocumentElements = (doc, cb) =>
  [].slice
    .call(doc.head.childNodes)
    .concat(...doc.body.childNodes)
    .forEach((ele) => requestAnimationFrame(() => cb(ele)))

exports.map = (root, selector, cb) =>
  [].map.call(root.querySelectorAll(selector), (ele) =>
    cb(ele)
  )

exports.pop = (root, selector) =>
  exports.map(root, selector, (ele) => {
    ele.remove()
    return ele
  })
