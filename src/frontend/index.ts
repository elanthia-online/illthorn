import "./illthorn"
import { reloadHilites } from "./hilites"
import {initLayout} from "./layout"
import { bindMacros } from "./macros"
import { renderAllSessions } from "./session/connect-all"

(async function __illthorn_main () {
  await initLayout()
  await bindMacros()
  await reloadHilites()
  await renderAllSessions()
}())