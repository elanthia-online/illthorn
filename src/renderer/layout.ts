import { div } from "./util/dom"

export const app : HTMLDivElement = document.querySelector("#app")!
export const actionsMenu = div({id: "actions"})
export const currentContext = div({id: "current-context"})

export function init () {
  app.append(actionsMenu, currentContext)
}

