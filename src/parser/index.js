const { addLinks } = require("./add-links")
const { addHilites } = require("./add-hilites")
const { normalize } = require("./normalize")
const isDanglingStream = require("./is-dangling-stream")
const _v1 = require("./_v1")
const _v2 = require("./_v2")
const Log = require("./log")

exports.parse = async (session, incoming) => {
  try {
    const parser = new DOMParser()
    session.buffer += incoming.toString()
    // continue to buffer
    if (isDanglingStream(session.buffer)) return { buffered: 1 }

    if (session.has_focus()) Log.raw(session.buffer)
    // https://github.com/elanthia-online/illthorn/issues/113
    const string = normalize(session.buffer)

    if (session.has_focus()) Log.normalized(string)
    const doc = parser.parseFromString(string.trimEnd(), "text/html")

    doc.body.append(...doc.head.childNodes)
    if (session.has_focus()) Log.parsed(doc.body.innerHTML)

    const parsed = _v2.parse(session, doc.body)

    if (session.has_focus()) {
      Log.sorted(
        "metadata:\n%s\ntext:\n%s",
        parsed.metadata.innerHTML,
        parsed.text.innerHTML
      )
    }

    await addHilites(parsed.text)
    // linkify doesn't work on documentfragment, ugh
    await Promise.all(
      [...parsed.text.childNodes].map((child) => addLinks(child))
    )
    // clear the buffer
    session.buffer = ""
    return { parsed }
  } catch (err) {
    console.error(err)
    return {}
  }
}
