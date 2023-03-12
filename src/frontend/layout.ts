import { div } from "./util/dom"

export const app : HTMLDivElement = document.querySelector("#app")!
export const leftActions = div({id: "actions"})
export const sessionsMenu = div({id: "sessions"})
export const currentContext = div({id: "current-context"})


export const leftPane = div({id: "app-left-pane"})
export const rightPane = div({id: "app-right-pane"})

export function initLayout () {
  // left side
  leftActions.append(sessionsMenu)
  leftPane.append(leftActions)
  
  // right side

  rightPane.append(currentContext, )

  app.append(leftPane, rightPane)
}

