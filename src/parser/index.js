const parser = new DOMParser()

let BUFFER = (window.FEED_BUFFER = "")

exports.parse = function (incoming, cb) {
  BUFFER += incoming.toString()
  //console.log("raw:\n%s", BUFFER)
  // continue to buffer
  if (isDanglingStream(BUFFER)) return
  if (BUFFER.includes("room"))
    console.log("raw:\n%s", BUFFER)
  //console.time("parser")
  const string = normalize(BUFFER)
  const doc = parser.parseFromString(string, "text/html")
  console.log("parsed:\n%s", doc.body.innerHTML)
  // clear the buffer
  BUFFER = ""
  cb(doc)
  //console.timeEnd("parser")
}

function isDanglingStream(buffered) {
  // todo: this should also match id= attribute
  return (
    buffered.includes("<pushStream") &&
    !buffered.includes("<popStream")
  )
}

function pre(string) {
  return `<pre>${string}</pre>`
}

function normalize(string) {
  string = string
    .replace(/<style id=""\/>/g, "")
    .replace(/<pushBold\/>/g, `<b class="monster">`)
    .replace(/<popBold\/>/g, "</b>")
    .replace(/<push/, "<")
    .replace(/<pop/, "<")
    .replace(/<output/g, "<pre")
    .replace(/<\/output>/g, "</pre>")
    .replace(/<clearContainer/g, "</clearcontainer")
    .replace(/<preset/g, "<pre")

  string = string.replace(
    /<style id="(\w+)"\s?\/>/g,
    (_, id) => `<pre class="${id}">`
  )

  string = string
    .replace(` id="`, ` class="`)
    .replace(` id='`, ` class='`)

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
  return nodelist
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
