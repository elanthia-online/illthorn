const parser = new DOMParser()
// this is the private internal state of the parser
const STACK = (exports.stack = [])

exports.parse = function (buffer, cb) {
  const string = normalize(buffer.toString())
  console.log("original:\n%s", buffer.toString())
  console.log("normalized:\n%s", string)
  console.time("parser")

  const doc = parser.parseFromString(string, "text/html")
  each_shallow(doc.head, cb)
  each_shallow(doc.body, cb)
  console.timeEnd("parser")
}

function pre(string) {
  return `<pre>${string}</pre>`
}

function normalize(string) {
  string = string
    .replace(/<style id=""\/>/g, "")
    .replace(/<pushBold\/>/g, "<b>")
    .replace(/<popBold\/>/g, "</b>")
    .replace(`<style `, `<pre `)
    .replace(` id="`, ` class="`)
    .replace(` id='`, ` class='`)

  if (!string.startsWith("<")) return pre(string)
  if (string.startsWith("<b>")) return pre(string)
  if (string.startsWith("<a ")) return pre(string)
  return string
}

function each_shallow(ele, cb) {
  for (const child of ele.childNodes) {
    requestAnimationFrame(() => {
      cb(child)
    })
  }
}

const EDGE_NODES = {
  pre: 1,
  compass: 1,
  inv: 1,
  clearcontainer: 1,
  b: 1,
}

function isEdgeNode(ele) {
  if (!ele.tagName) return true
  return EDGE_NODES[ele.tagName.toLowerCase()]
}
