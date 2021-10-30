export class Pane extends HTMLElement {

}

export function makePane (id : string) {
  const pane = new Pane()
  pane.id = id
  return pane
}

window.customElements.define("illthorn-pane", Pane)