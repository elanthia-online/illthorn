import { IllthornEvent } from "./events";
import { FrontendSession } from "./session";
import { renderAllSessions } from "./session/connect-all";
import { currentSession, endSession, renderSession } from "./session/helpers";
import { SessionMap } from "./session/map";
import { Bus } from "./util/bus";
import  * as UI from "./layout";

export const Illthorn = window.Illthorn = new class IIllthorn {
  constructor (readonly bus : Bus = new Bus()) {
    this.bus.subscribeEvent<FrontendSession>(IllthornEvent.SESSION_FOCUS, ({detail: session})=> {
      document.title = session.name
      this.renderSession(session)
    })

    this.bus.subscribeEvent<string>(IllthornEvent.MACRO, ({detail: macro})=> {
      UI.cli.handleMacro(macro)
    })

    this.bus.subscribeEvent<string>(IllthornEvent.SUBMIT_ILLTHORN_COMMAND, async e => {
      this.handleCommand(e.detail)
    })
  }

  sessions () {
    return SessionMap
  }

  renderSession (session : FrontendSession) {
    renderSession(session, document.getElementById("current-context"))
  }

  async handleCommand (command : string) {
    switch (command) {
      case ":c": 
        await renderAllSessions()
      case ":dq":
        const sess = currentSession()
        return sess && endSession(sess)
    }
  }
}