const parser = new DOMParser()

let BUFFER = (window.FEED_BUFFER = "")

exports.parse = function (incoming, cb) {
  BUFFER += incoming.toString()
  //console.log("raw:\n%s", BUFFER)
  // continue to buffer
  if (isDanglingStream(BUFFER)) return
  //console.time("parser")
  const string = normalize(BUFFER)
  const doc = parser.parseFromString(string, "text/html")

  // clear the buffer
  BUFFER = ""
  console.log(doc.body.innerHTML)
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
