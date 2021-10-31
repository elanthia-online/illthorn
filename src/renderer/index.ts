import * as Layout from "./layout"
import {Session, Sessions, renderSession, focusSession} from "./session"
import { detectScriptingSessions } from "./session/detection"
import "./styles/app.scss"
import "./styles/themes/rogue.scss"

import {bus} from "./app"

Object.assign(window, {Sessions})

bus.subscribeEvent<Session>("session/focus", ({detail: session})=> {
  renderSession(session, Layout.currentContext)
})

document.addEventListener("keyup", e => {
  //console.log(e)
  if (!e.altKey) return
  const tabPosition = parseInt(e.key, 10)
  if (isNaN(tabPosition)) return
  
  const [_name, session] = Array.from(Sessions)
    .find(([_, sess])=> sess.actionButton.tabNum == tabPosition) || []

  if (session) {
    focusSession(session)
    e.preventDefault()
  }
})

~(async () => {
  Layout.init()
  await detectScriptingSessions()
})()
