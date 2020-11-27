const pp = require("debug")("illthorn:parser:parsed")

exports.Parsed = () => {
  return {
    metadata: document.createElement("div"),
    text: document.createElement("div"),
    textBuffer: exports.makeTextBuffer(),
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

  pp("appendParsedText(%s)", textEle.outerHTML || textEle.textContent)

  if (textEle.tagName == "PRE") {
    textBuffer.childNodes.length && exports.swapTextBuffer(parsed)
    return text.append(textEle)
  }

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
