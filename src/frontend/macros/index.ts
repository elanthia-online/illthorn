import keyboardjs from "keyboardjs"
import { Illthorn } from "../illthorn"
import { currentSession, focusSession } from "../session/helpers"
import { SessionButton } from "../components/session/session-button"
import { IllthornEvent } from "../events"

type MacroProfile =
  | Record<string, string>

export async function loadMacros () : Promise<MacroProfile> {
  const loaded = await window.Settings.get<MacroProfile>("macros")
  if (loaded) return loaded
  return {}
}

export async function bindUserMacros () {
  const macros = await loadMacros()
  Object.entries(macros).forEach(([keyCombo, command])=> {
    console.log("macros:bind -> %s -> %s", keyCombo, command)
    keyboardjs.addListener(keyCombo.toLocaleLowerCase(), ()=> {
      command.split(/\r/).forEach(line => {
        Illthorn.bus.dispatchEvent(IllthornEvent.MACRO, line)
      })
    })
  })
}

export async function unbindUserMacros () {
  const macros = await loadMacros()
  Object.entries(macros).forEach(([keyCombo, _command])=> {
    keyboardjs.unbind(keyCombo)
  })
}

export async function bindMetaMacros () {
  keyboardjs.on("tab", (e) => {
    e?.preventDefault()
    // todo: tab completion
    // console.log(e)
  })

  keyboardjs.on("right", (_) => {
    document.dispatchEvent(new Event("autocomplete/right"))
  })

  "1 2 3 4 5 6 7 8 9".split(" ").forEach((sess_idx) => {
    const idx = parseInt(sess_idx, 10) - 1
    keyboardjs.on(`alt+${sess_idx}`, (e) => {
      e?.preventDefault()
      const buttons = document.querySelectorAll<SessionButton>("illthorn-session-button")
      const button = buttons[idx]
      if (button) focusSession(button.session)
    })
  })

  keyboardjs.on("ctrl+pagedown", (_) => {
    const sess = currentSession()
    sess && sess.ui.feed.scrollToNow()
  })
  // todo: handle scrolling from any focused state
  keyboardjs.on("pageup", (e) => {
    e?.preventDefault()
    const sess = currentSession()
    if (!sess) return
    const ele = sess.ui.feed
    if (!ele) return
    ele.scrollBy(0, ele.clientHeight * -0.8)
    ele.dispatchEvent(new Event("mousewheel"))
  })

  keyboardjs.on("pagedown", (e) => {
    e?.preventDefault()
    const sess = currentSession()
    if (!sess) return
    const ele = sess.ui.feed
    if (!ele) return
    ele.scrollBy(0, ele.clientHeight * 0.8)
    ele.dispatchEvent(new Event("mousewheel"))
  })
}

export async function bindMacros () {
  await bindUserMacros()
  await bindMetaMacros()
}
