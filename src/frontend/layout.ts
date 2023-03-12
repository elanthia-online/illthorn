import { CLI } from "./components/cli"
import { Prompt } from "./components/prompt"
import { div } from "./util/dom"

export const app : HTMLDivElement = document.querySelector("#app")!
export const leftActions = div({id: "actions"})
export const sessionsMenu = div({id: "sessions"})
export const currentContext = div({id: "current-context"})

export const commandBar = div({classes: "cli-wrapper"})
export const cli = new CLI()

export const prompt = new Prompt()

export const leftPane = div({id: "app-left-pane"})
export const rightPane = div({id: "app-right-pane"})

export function initLayout () {
  // left side
  leftActions.append(sessionsMenu)
  leftPane.append(leftActions)
  
  // right side
  commandBar.append(prompt, cli)
  rightPane.append(currentContext, commandBar)

  app.append(leftPane, rightPane)
}

