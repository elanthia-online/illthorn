import * as Layout from "./layout"
import {Session, Sessions, renderSession} from "./session"
import { detectScriptingSessions } from "./session/detection"
import "./styles/app.scss"
import "./styles/themes/rogue.scss"

import {bus} from "./app"

Object.assign(window, {Sessions})

bus.subscribeEvent<Session>("session/focus", ({detail: session})=> {
  renderSession(session, Layout.currentContext)
})

~(async () => {
  Layout.init()
  await detectScriptingSessions()
})()
