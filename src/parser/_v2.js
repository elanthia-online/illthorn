const {
  Parsed,
  appendParsedText,
  appendParsedMetadata,
  swapTextBuffer,
  cleanUpWhiteSpace,
} = require("./parsed")
const TreeWalker = require("./dom-walker")
// enum of all normalized game tags
const Tags = require("./tags")
const Url = require("../util/url")

const pp = require("debug")("illthorn:parser:v2")
const raw = require("debug")("illthorn:parser:v2:raw")

exports.parse = (session, ele) => {
  const parsed = Parsed(session)
  if (session.has_focus()) raw(ele.innerHTML)
  // single-pass parser
  TreeWalker(ele, onNode.bind(session, parsed))
  // ensure we flush the text buffer
  swapTextBuffer(parsed)
  // since we are processing XML tags from a tcp stream
  // there are a lot of left-over \n tags
  cleanUpWhiteSpace(parsed.text)
  if (session.has_focus()) {
    const t = document.createElement("div")
    t.append(parsed.text.cloneNode(true))
    pp(":text/parsed", t.outerHTML)
    pp(":metadata/parsed", parsed.metadata.outerHTML)
  }
  // validity case for feed
  console.assert(
    ele.innerHTML.trim().length == 0,
    "did not process all feed elements:\n %s",
    ele.innerHTML
  )
  // validity case for buffer
  console.assert(
    parsed.textBuffer.childNodes.length == 0,
    "did not process all buffered text nodes:\n %s",
    parsed.textBuffer.innerHTML
  )
  // return whatever was parsed
  return parsed
}

function onNode(parsed, node) {
  if (this.has_focus && this.has_focus())
    pp(
      "processing %s",
      node.tagName || ":text-node",
      node.outerHTML || node.textContent
    )
  switch (node.tagName) {
    case Tags.SEP:
      return onsep(parsed, node)
    case Tags.PROGRESSBAR:
      return onprogressbar(parsed, node)
    case Tags.LABEL:
      return onlabel(parsed, node)
    case Tags.COMPASS:
      return oncompass(parsed, node)
    case Tags.DIR:
      return ondir(parsed, node)
    case Tags.IMG:
      return onimg(parsed, node)
    case Tags.INDICATOR:
      return onindicator(parsed, node)
    case Tags.PROMPT:
      return onprompt(parsed, node)
    case Tags.CONTAINER:
      return oncontainer(parsed, node)
    case Tags.INV:
      return oninv(parsed, node)
    case Tags.PRE:
      return onpre(parsed, node)
    case Tags.DIALOGDATA:
      return ondialogdata(parsed, node)
    case Tags.STREAMWINDOW:
      return onstreamwindow(parsed, node)
    case Tags.SWITCHQUICKBAR:
      return onswitchquickbar(parsed, node)
    case Tags.OPENDIALOG:
    case Tags.CLOSEDIALOG:
      return onopendialog(parsed, node)
    case Tags.CLEARSTREAM:
      return onclearstream(parsed, node)
    case Tags.MENULINK:
      return onmenulink(parsed, node)
    case Tags.COMPONENT:
      return oncomponent(parsed, node)
    case Tags.COMPDEF:
      return oncomponent(parsed, node)
    case Tags.STREAM:
      return onstream(parsed, node)
    case Tags.DROPDOWNBOX:
      return ondropdownbox(parsed, node)
    case Tags.LINK:
      return onlink(parsed, node)
    case Tags.EXPOSECONTAINER:
      return onexposecontainer(parsed, node)
    case Tags.DELETECONTAINER:
      return ondeletecontainer(parsed, node)
    case Tags.SKIN:
      return onskin(parsed, node)
    case Tags.LAUNCHURL:
      return onlaunchurl(parsed, node)
    case Tags.SPELL:
      return onspell(parsed, node)
    case Tags.RIGHT:
      return onright(parsed, node)
    case Tags.LEFT:
      return onleft(parsed, node)
    case Tags.CASTTIME:
      return oncasttime(parsed, node)
    case Tags.ROUNDTIME:
      return onroundtime(parsed, node)
    case Tags.NAV:
      return onnav(parsed, node)
    // text elements
    case Tags.A:
    case Tags.B:
    case Tags.D:
    case Tags.MARK:
    case undefined:
      return ontext(parsed, node)
    default:
      return onunhandled(parsed, node)
  }
}

const onunhandled = (exports.onunhandled = (_, node) => {
  console.trace(":unhandled(%s) -> %s", node.tagName, node.outerHTML)
  return { err: node }
})

const ontext = (exports.ontext = (parsed, textNode) => {
  const { text, textBuffer, metadata } = parsed
  if (
    text.contains(textNode) ||
    textBuffer.contains(textNode) ||
    metadata.contains(textNode)
  )
    return
  appendParsedText(parsed, textNode)
})

const removeChildren = (parsed, tag) => {
  Array.from(tag.childNodes).forEach((child) => {
    child.remove()
    onNode(parsed, child)
  })
}

const orphan = (exports.orphan = (parsed, tag) => {
  tag || console.trace(":orphan -> %o", tag)
  removeChildren(parsed, tag)
  tag.remove()
})

const onpre = (exports.onpre = (parsed, pre) => {
  appendParsedText(parsed, pre)

  Array.from(pre.children).forEach((child) => {
    if (child.tagName.length == 1) return
    child.remove()
    onNode(parsed, child)
  })
})

const onprogressbar = (exports.onprogressbar = (parsed, progress) => {
  appendParsedMetadata(parsed, progress)
  removeChildren(parsed, progress)
})

const onnav = (exports.onnav = (parsed, nav) => {
  orphan(parsed, nav)
})

const onopendialog = (exports.onopendialog = (parsed, opendialog) => {
  appendParsedMetadata(parsed, opendialog)
  removeChildren(parsed, opendialog)
})

const onsep = (exports.onsep = (parsed, sep) => {
  orphan(parsed, sep)
})

const onlabel = (exports.onlabel = ({ metadata }, label) => {
  if (metadata.contains(label)) return
  onunhandled({ metadata }, label)
})

const ondir = (exports.ondir = ({ metadata }, dir) => {
  if (metadata.contains(dir)) return
  onunhandled({ metadata }, dir)
})

const onimg = (exports.onimg = (parsed, img) => {
  appendParsedMetadata(parsed, img)
  removeChildren(parsed, img)
})

const onindicator = (exports.onindicator = (parsed, indicator) => {
  appendParsedMetadata(parsed, indicator)
  removeChildren(parsed, indicator)
})

const onclearstream = (exports.onclearstream = (parsed, clearstream) => {
  appendParsedMetadata(parsed, clearstream)
  removeChildren(parsed, clearstream)
})

const onprompt = (exports.onprompt = (parsed, prompt) => {
  parsed.prompt = prompt
  prompt.remove()
})

const onstreamwindow = (exports.onstreamwindow = (
  parsed,
  streamwindow
) => {
  appendParsedMetadata(parsed, streamwindow)
  removeChildren(parsed, streamwindow)
})

const onswitchquickbar = (exports.onswitchquickbar = (
  parsed,
  switchquickbar
) => {
  appendParsedMetadata(parsed, switchquickbar)
  Array.from(switchquickbar.childNodes).forEach((child) => {
    if (child.tagName == Tags.LINK) return
    child.remove()
    onNode(parsed, child)
  })
})

const oncompass = (exports.oncompass = (parsed, compass) => {
  appendParsedMetadata(parsed, compass)

  Array.from(compass.querySelectorAll("dir")).forEach((dir) => {
    compass.append(dir)
  })

  Array.from(compass.querySelectorAll("dir")).forEach((dir) => {
    removeChildren(parsed, dir)
  })
})

const oncontainer = (exports.oncontainer = (parsed, container) => {
  appendParsedMetadata(parsed, container)
  Array.from(container.childNodes).forEach((child) => {
    if (child.tagName == Tags.INV) return
    child.remove()
    onNode(parsed, child)
  })
})

const ondialogdata = (exports.ondialogdata = (parsed, dialogdata) => {
  appendParsedMetadata(parsed, dialogdata)
})

const oninv = (exports.oninv = (parsed, inv) => {
  appendParsedMetadata(parsed, inv)
})

const onmenulink = (exports.onmenulink = (parsed, menulink) => {
  appendParsedMetadata(parsed, menulink)
})

const oncomponent = (exports.oncomponent = (parsed, component) => {
  appendParsedMetadata(parsed, component)
})

const onstream = (exports.onstream = (parsed, stream) => {
  stream.remove()
  switch (stream.className) {
    case "thoughts":
      return appendParsedText(parsed, stream)
    default:
      return appendParsedMetadata(parsed, stream)
  }
})

const ondropdownbox = (exports.ondropdownbox = (parsed, dropdownbox) => {
  appendParsedMetadata(parsed, dropdownbox)
})

const onlink = (exports.onlink = (parsed, link) => {
  appendParsedMetadata(parsed, link)
  removeChildren(parsed, link)
})

const onexposecontainer = (exports.onexposecontainer = (
  parsed,
  exposecontainer
) => {
  appendParsedMetadata(parsed, exposecontainer)
  removeChildren(parsed, exposecontainer)
})

const ondeletecontainer = (exports.ondeletecontainer = (
  parsed,
  deletecontainer
) => {
  appendParsedMetadata(parsed, deletecontainer)
  removeChildren(parsed, deletecontainer)
})

const onskin = (exports.onskin = (parsed, skin) => {
  removeChildren(parsed, skin)
  skin.remove()
})

const onspell = (exports.onspell = (parsed, spell) => {
  appendParsedMetadata(parsed, spell)
})

const onright = (exports.onright = (parsed, right) => {
  appendParsedMetadata(parsed, right)
})

const onleft = (exports.onleft = (parsed, left) => {
  appendParsedMetadata(parsed, left)
})

const oncasttime = (exports.oncasttime = (parsed, casttime) => {
  appendParsedMetadata(parsed, casttime)
  removeChildren(parsed, casttime)
})

const onroundtime = (exports.oncasttime = (parsed, roundtime) => {
  appendParsedMetadata(parsed, roundtime)
  removeChildren(parsed, roundtime)
})

const onlaunchurl = (exports.onlaunchurl = (parsed, launchurl) => {
  launchurl.remove()
  Url.open_external_link(
    "https://www.play.net" + launchurl.attributes.src.value
  )
})
