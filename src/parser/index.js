const parser = new DOMParser()

exports.parse = function (buffer, cb) {
  //console.log("raw:\n%s", buffer.toString())
  //console.time("parser")
  const string = normalize(buffer.toString())
  const doc = parser.parseFromString(string, "text/html")
  //console.timeEnd("parser")
  //console.log("normalized:\n%s", string)
  cb(doc)
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
    .replace(/<\/output>/, "</pre>")

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
