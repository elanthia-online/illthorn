import { GameTag } from "../../parser/tag"
import { type FrontendSession as Session } from "../../session/index"

export class Compass extends HTMLElement {
  static DIRS = [
    "",
    "up",
    "",
    "nw",
    "n",
    "ne",
    "w",
    "out",
    "e",
    "sw",
    "s",
    "se",
    "",
    "down",
    "",
  ]

  static MAP = { up: "u", down: "d", out: "o" } as Record<string, string>

  readonly links: HTMLAnchorElement[]
  constructor (readonly session : Session) {
    super()
    this.links = Compass.DIRS.map(dir => {
      const a = document.createElement("a")
      dir && a.classList.add(dir)
      a.textContent = Compass.MAP[dir] || dir
      a.title = dir
      this.append(a)
      return a
    })

    session.bus.subscribeEvent<GameTag>("metadata/compass", ({detail: compass})=> {
      const activeDirs = compass.children.map(({attrs})=> attrs.value)
      //console.log("compass/", activeDirs)
      this.links.forEach(a => {
        a.classList.toggle("on", activeDirs.includes(a.title))
      })

    })
  }
}

window.customElements.define("illthorn-compass", Compass)