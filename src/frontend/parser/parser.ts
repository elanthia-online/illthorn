import { parseAttrs } from "./tag/attributes"
import { GameTag, makeTag, TagState, normalizeTagName } from "./tag"
import { TagName } from "./tag/names"

export const Busy = Symbol("busy")
export const Ok   = Symbol("ok")

type ParserCursor =
  { idx: number
  }

type ConsumeOpts =
  { delimiter: string
  ; inclusive: boolean
  }

export class Parser {
  static of () {return new Parser}
  pending : GameTag[]
  done : GameTag[]

  constructor () {
    this.pending = []
    this.done = []
  }

  prepareForParse (text : string) {
    return text.replaceAll(`<pushBold/>`, `<b>`)
      .replaceAll(`<popBold/>`, `</b>`)
      .replaceAll("\r", "")
  }

  parse (text : string) {
    text = this.prepareForParse(text)
    const cursor = {idx: 0} as ParserCursor
    let tries = 0
    while (cursor.idx < text.length) {
      tries++
      const char = text[cursor.idx]
      char == "<"
        ? this.handleTagStart(cursor, text)
        : this.handleTextNode(cursor, text)

      if (tries > text.length) {
        throw new Error(`max parser depth of Text.length=${text.length} reached`)
      }
    }

    const parsed = this.done.slice(0)
    this.done.length = 0
    return parsed
  }

  reset () {
    this.pending.length =
    this.done.length = 0
  }

  get isClosed () {
    return this.pending.length == 0
  }

  get lastPendingTag () {
    return this.pending[this.pending.length-1]
  }
  consumeToChar (cursor : ParserCursor, text : string, opts : ConsumeOpts) {
    const startIdx = cursor.idx
    const closeIdx = text.indexOf(opts.delimiter, cursor.idx)
    // advance the state of the cursor
    if (~closeIdx)
      cursor.idx = opts.inclusive ? closeIdx + 1 : closeIdx
    // dangling text
    if (!~closeIdx)
      cursor.idx = text.length
    //console.log("consume(range=%s..%s)", startIdx, cursor.idx)
    return text.slice(startIdx,
      ~closeIdx ? cursor.idx : text.length)
  }

  // div -> a -> text
  // States:
  // 1. empty stack
  // 2. last tag closed
  appendTag (tag : GameTag) : void {
    switch (tag.state) {
      case TagState.CLOSED:
        if (this.pending.length == 0) {
          return void(this.done.push(tag))
        }

        //console.log("adding child(%s) to %s", tag.name, this.lastPendingTag.name)
        return void(this.lastPendingTag.children.push(tag))

      case TagState.OPEN:
        return void(this.pending.push(tag))
      default:
        throw new Error("unknown tag state: " + tag.state)
    }
  }

  handleTagStart (cursor : ParserCursor, text : string) {
    const tagInfo = this.consumeToChar(cursor, text,
      {delimiter: ">", inclusive: true})
    //console.log("tag/start -> ", tagInfo)
    this.parseTag(tagInfo.slice(1, tagInfo.length -1))
  }

  handleTextNode (cursor : ParserCursor, text : string) {
    const textContent = this.consumeToChar(cursor, text,
      {delimiter: "<", inclusive: false})
    //console.log("tag/text -> ", textContent, cursor)
    // console.log("parser/text", textContent)
    const tag = makeTag(":text")
    tag.text = textContent
    tag.state = TagState.CLOSED
    this.appendTag(tag)
  }

  closeTag (tagInfo : string) : void {
    const cursor = {idx: 0}
    const gameName = this.consumeToChar(cursor, tagInfo,
      {delimiter: " ", inclusive: false})
    const tagName = normalizeTagName(gameName)
    const lastTag = this.lastPendingTag

    if (lastTag?.name == tagName) {
      this.lastPendingTag.state = TagState.CLOSED
      const doneTag = this.pending.pop()
      if (!doneTag) return // todo: logical error

      if (this.pending.length == 0) return void(this.done.push(doneTag))
      this.lastPendingTag.children.push(doneTag)
      return
    }

    const closedTag = makeTag(tagName, gameName)
    if (tagName.length < tagInfo.length) {
      closedTag.attrs = parseAttrs(tagInfo.slice(cursor.idx))
    }

    if (!["style", "stream", "b", "output"].includes(tagName)) {
      closedTag.state = TagState.CLOSED
    }

    this.appendTag(closedTag)
  }

  openTag (tagInfo : string) {
    const cursor = {idx: 0}
    const tagName = this.consumeToChar(cursor, tagInfo,
      {delimiter: " ", inclusive: false})

    const tag = makeTag(tagName as TagName, tagName)
    if (tagName.length < tagInfo.length) {
      tag.attrs = parseAttrs(tagInfo.slice(cursor.idx))
    }
    //console.log("parser/open/tag", tag)
    this.appendTag(tag)
  }

  parseTag (tagInfo : string) {
    const isClosure = tagInfo.startsWith("/") || tagInfo.endsWith("/")
    if (isClosure && tagInfo.startsWith("/")) tagInfo = tagInfo.slice(1)
    if (isClosure && tagInfo.endsWith("/")) tagInfo = tagInfo.slice(0, tagInfo.length-1)

    const lastPending = this.pending[this.pending.length-1]
    const lastDone    = this.done[this.done.length-1]

    /*
    if (tagInfo == "b") {
      if (lastPending?.gameName == "pushBold") return
      if (lastPending.name == "b") return
    }

    if (tagInfo == "pushBold") {
      if (lastPending.name == "b") return
    }

    if (tagInfo == "popBold") {
      if (!lastPending) return
    }
    */

    isClosure
      ? this.closeTag(tagInfo)
      : this.openTag(tagInfo)
  }

}
