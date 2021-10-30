import net from "net"
import dns from "dns"
import { Bus } from "../util/bus"
import { Parser } from "../parser/parser"
import { castToHTML } from "../parser/dom"
import { makeSessionUI, SessionUI } from "./ui"
import { GameTag } from "../parser/tag"
import * as App from "../app"
export type SessionOpts =
  { port : number
  ; name : string
  ; host : string
  }
/**
 * all the sessions are stored in this object
 */
export const Sessions : Map<string, Session> = new Map()

export class Session {
  readonly port : number
  hasFocus : boolean
  name : string
  buffer : string
  readonly ui : SessionUI
  readonly parser : Parser
  readonly bus    : Bus
  readonly socket : net.Socket
  constructor({ port, name, host } : SessionOpts) {
    this.port     = port
    this.hasFocus = false
    this.name     = name || port.toString()
    this.socket   = net.connect({ port, host })
    // buffer for incoming game lines
    this.buffer   = ""
    this.parser   = Parser.of()
    // buss must exist before the ui is created
    this.bus      = new Bus
    this.ui       = makeSessionUI(this)
  }
}

export async function makeSession (opts : SessionOpts) {
  let host = "127.0.0.1"
  try {
    host = (await dns.promises.lookup("localhost")).address
  } catch {
    console.warn("Could not resolve localhost, defaulting to %j", host)
  }
  const session = new Session({...opts, host})
  renameSession(session, session.name)
  attachSessionListeners(session)
  //this.bus.dispatchEvent(IllthornEvent.SESSION_NEW, session)
  return session
}
export async function ingestSessionIncoming(session : Session, incoming : string) {
  //console.log(incoming)
  const parsed = session.parser.parse(incoming)//.slice(0, incoming.length-2))
  const {frag, metadata, prompt} = castToHTML(parsed)

  // prompts are special, they are both metadata and rendered inline (sometimes)
  if (prompt) session.bus.dispatchEvent("metadata/prompt", prompt)
  if (frag.hasChildNodes() && frag.textContent?.trim() !== ""){
    session.ui.feed.appendParsed(frag)
  }
  if (!session.ui.feed.has_prompt() && prompt) {
    session.ui.feed.appendParsed(prompt)
  }
  if (metadata.length) metadata.forEach(tag => dispatchMetadata(session, tag))
}

export function closeSession (session : Session) {
  if (!session.ui.feed) return
  const pre = document.createElement("pre")
  pre.classList.add("session-closed")
  pre.innerText = `\n*** ${session.name} / Connection Closed ***`
  const frag = document.createDocumentFragment()
  frag.appendChild(pre)
  session.ui.feed.appendChild(frag)
  Sessions.delete(session.name)
}

export function destroySession(session : Session) {
  Sessions.delete(session.name)
}

export function currentSession () {
  const pair = Array.from(Sessions).find(([_name, sess]) => sess.hasFocus)
  if (pair) return pair[1]
  return pair
}

export function focusSession (session : Session) {
  session.hasFocus = true
  App.bus.dispatchEvent("session/focus", session)
  return session
}

export function renderSession (session : Session, container : HTMLElement) {
  container.append(session.ui.context)
  return session
}

export function renameSession (session : Session, name : string) {
  if (session.name && Sessions.has(session.name)) Sessions.delete(session.name)
  session.name = name
  Sessions.set(session.name, session)
}

export function sendCommandToGame(session : Session, cmd : string, id = "cli") {
  cmd = cmd.toString().trim()
  if (cmd.length == 0) return
  console.log("command=%s", cmd)
  session.socket.write(`${cmd}\r\n`)
  return session
}

export function attachSessionListeners (session : Session) {
  session.socket.on("data", (data) => {
    ingestSessionIncoming(session, data.toString())
  })
  session.socket.on("error", (err) => {
    console.log("session(%s) error: %o", session.name, err)
  })
  session.socket.on("close", (_) => {
    console.log("session(%s) close: %o", session.name, _)
  })
}

export function dispatchMetadata (session : Session, tag : GameTag) {
  const namespace = tag.attrs.id 
    ? [tag.name, tag.attrs.id]
    : [tag.name]
  namespace.unshift("metadata")
  const eventName = namespace.join("/")
  //console.log(eventName, tag)
  session.bus.dispatchEvent(eventName, tag)
  tag.children.forEach(child => {
    if ([":text", "a", "dir", "d"].includes(child.name)) return
    dispatchMetadata(session, child)
  })
}