import { FrontendSession, type FrontendSession as Session } from "."
import { type GameTag } from "../parser/tag"
import { Illthorn } from "../illthorn"
import { SessionMap } from "./map"
import { sessionsMenu } from "../layout"
import { IllthornEvent } from "../events"

export function endSession (session : Session) {
  if (!session.ui.feed) return
  //session.socket.end()
  const pre = document.createElement("pre")
  pre.classList.add("session-closed")
  pre.innerText = `\n*** ${session.name} / Connection Closed ***`
  const frag = document.createDocumentFragment()
  frag.appendChild(pre)
  session.ui.feed.appendChild(frag)
  SessionMap.delete(session.name)
  renderSessionsMenu()
}

export function currentSession () : FrontendSession | undefined  {
  const pair = Array.from(SessionMap).find(([_name, sess]) => sess.hasFocus)
  if (pair) return pair[1]
  return undefined
}

export function focusSession (session : Session) {
  if (session.hasFocus) return session // noop
  Array.from(SessionMap).forEach(([_, otherSession])=> {
    otherSession.hasFocus = otherSession == session
  })

  Illthorn.bus.dispatchEvent(IllthornEvent.SESSION_FOCUS, session)
  return session
}

export function renderSession (session : Session, container : HTMLElement) {
  container.innerHTML = ""
  container.append(session.ui.context)
  session.ui.feed.scrollToNow()
  return session
}

export function sendCommandToGame(session : Session, cmd : string, id = "cli") {
  cmd = cmd.toString().trim()
  if (cmd.length == 0) return
  //console.log("command=%s", cmd)
  const prompt = session.ui.feed.querySelector("prompt:last-child")
  if (prompt) prompt.textContent += cmd
  session.sendCommand(cmd)
  return session
}

export function dispatchMetadata (session : Session, tag : GameTag) {
  if (tag.name == "LaunchURL") return handleLaunchUrl(tag)
  if (tag.name == "notification") return handleNotification(session, tag)
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

export function handleLaunchUrl (tag : GameTag) {
  const url = "https://www.play.net" + tag.attrs.src
  window.open(url, "_blank")
}

export function handleNotification (session : Session, tag : GameTag) {
  const {attrs} = tag
  new Notification(session.name + " / " + attrs.title + "", attrs)
}

export function renderSessionsMenu () {
  sessionsMenu.innerHTML = ""

  Array.from(SessionMap)
    .map(([name, session])=> session)
    .sort((a, b) => a.port - b.port)
    .forEach(sess => sessionsMenu.append(sess.actionButton))
}
