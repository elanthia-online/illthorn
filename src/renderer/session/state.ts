enum Tags {
  "prompt",
  "right",
  "left",
  "spell",
  "compass",
  "style",
}

enum Timers {
  "roundtime", "casttime"
}

enum Injuries {
"head",
  "leftEye",
  "rightEye",
  "neck",
  "chest",
  "back",
  "abdomen",
  "leftArm",
  "rightArm",
  "leftHand",
  "rightHand",
  "leftLeg",
  "rightLeg",
  "nsys",
}

enum Ids {
  "mana",
  "health",
  "stamina",
  "spirit",
  "stance",
  "mindState",
  "encumlevel",
  "ActiveSpells",
  "nextLvlPB",
  "roomName",
  "pbarStance",
}

export class SessionState {
  readonly store : Map<string, HTMLElement>

  constructor() {
    this.store = new Map()
  }
}

export const consumeState = (state : SessionState, tag : Element) => {
  const id = tag.id || tag.className || ""
  const tagName = (tag.tagName || "").toLowerCase()
  if (id in Injuries)
    // return state.put("injuries." + id, tag.cloneNode(true))
  if (id in Ids)
    // return state.put(id, tag.cloneNode(true))
  if (tagName in Tags)
    // return state.put(tagName, tag.cloneNode(true))
  if (tagName in Timers) {
    // handle timer
  }

  Array.from(tag.children).map((node) =>
    consumeState(state, node.cloneNode(true) as Element)
  )
}
