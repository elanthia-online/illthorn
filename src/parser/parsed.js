const pp = require("debug")("illthorn:parser:parsed:api")

exports.Parsed = (session) => {
  return {
    metadata: document.createElement("div"),
    text: document.createDocumentFragment(),
    textBuffer: exports.makeTextBuffer(),
    session: session,
    prompt: void 0,
  }
}

exports.makeTextBuffer = () => {
  const textBuffer = document.createElement("pre")
  textBuffer.classList.add("text")
  return textBuffer
}

exports.appendParsedText = (parsed, textEle) => {
  const { text, textBuffer } = parsed
  // skip extra whitespace from linebreaks
  if (
    textBuffer.textContent.trim() == "" &&
    textEle.textContent.trim() == ""
  ) {
    return
  }

  if (textEle.tagName == "PRE") {
    textBuffer.childNodes.length && exports.swapTextBuffer(parsed)
  }

  if (text.contains(textEle)) return

  textBuffer.append(textEle)
}

exports.appendParsedMetadata = (parsed, metadataEle) => {
  const { metadata } = parsed
  exports.swapTextBuffer(parsed)
  metadata.append(metadataEle)
}

exports.swapTextBuffer = (parsed) => {
  const { textBuffer, text } = parsed
  if (textBuffer.childNodes.length == 0) return
  pp("swapTextBuffer(%s)", textBuffer.outerHTML)
  text.append(textBuffer)
  parsed.textBuffer = exports.makeTextBuffer()
}

exports.cleanUpWhiteSpace = (pre) => {
  const lastChild = pre.lastChild
  if (!lastChild) return
  if (lastChild.tagName == "PRE")
    return exports.cleanUpWhiteSpace(lastChild)
  const trimmedText = lastChild.textContent.trimRight()
  if (lastChild.nodeType == Node.TEXT_NODE && trimmedText == "") {
    lastChild.remove()
  }
}
