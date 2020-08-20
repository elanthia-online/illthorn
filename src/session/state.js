const m = require("mithril")
const Lens = require("../util/lens")
const Bus = require("../bus")
const pp = require("debug")("illthorn:state")

const makeLookup = (keys) =>
  keys.reduce(
    (acc, id) => Object.assign(acc, { [id]: 1 }),
    {}
  )

module.exports = class SessionState {
  static TAGS = makeLookup([
    "prompt",
    "right",
    "left",
    "spell",
    "compass",
    "style",
  ])

  static MODALS = ["commands"]

  static TIMERS = makeLookup(["roundtime", "casttime"])

  static INJURY_IDS = makeLookup([
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
  ])

  static ID_TAGS = makeLookup([
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
  ])

  static of(session) {
    return new SessionState(session)
  }

  static wants(id) {
    return id in SessionState.ID_TAGS
  }

  static consume(state, tag) {
    const id = tag.id || tag.className || ""
    const tagName = (tag.tagName || "").toLowerCase()
    if (id in SessionState.INJURY_IDS)
      return state.put(
        "injuries." + id,
        tag.cloneNode(true)
      )
    if (id in SessionState.ID_TAGS)
      return state.put(id, tag.cloneNode(true))
    if (tagName in SessionState.TAGS)
      return state.put(tagName, tag.cloneNode(true))

    if (tagName in SessionState.TIMERS) {
      return state.spawn_timer({
        name: tagName,
        end: Lens.get(tag, "attributes.value.value"),
      })
    }

    ~[].forEach.call(tag.childNodes, (node) =>
      SessionState.consume(state, node.cloneNode(true))
    )
  }

  constructor(session) {
    this._session = session
    this._timers = {}
    this._modals = {}
    SessionState.MODALS.forEach(
      (modal) => (this._modals[modal] = false)
    )
  }

  by_name(name) {
    return Object.keys(this)
      .filter(
        (key) =>
          Lens.get(
            this,
            `${key}.tagName`,
            ""
          ).toLowerCase() == name.toLowerCase()
      )
      .map((key) => this[key])
  }

  get(prop, fallback) {
    if (prop.toString()[0] == "_") {
      throw new Error(
        `cannot change private Property(${prop})`
      )
    }

    return Lens.get(this, prop, fallback)
  }

  put(prop, val) {
    Lens.put(this, prop, val)
    Bus.emit(Bus.events.REDRAW)
    return this
  }
  /**
   * spawns an interval based timer that will
   * update its state with seconds remaining
   *
   * examples:
   *   1. State.casttime  -> {remaining: 2}
   *   2. State.roundtime -> {remaining: 6}
   * @param {Tag} param0
   */
  spawn_timer({ name, end }) {
    pp("spawn_timer::", { name, end })
    this._timers[name] = this._timers[name] || {}
    // gs timers are second precision vs millisecond
    this._timers[name].end_epoc_time =
      parseInt(end, 10) * 1000

    this._timers[name].interval =
      this._timers[name].interval ||
      setInterval(() => {
        const end_epoc_time = this._timers[name]
          .end_epoc_time
        // dispose of the timer
        if (Date.now() > end_epoc_time) {
          clearInterval(this._timers[name].interval)
          this._timers[name] = void 0
        }

        const seconds_left = Math.max(
          0,
          Math.ceil((end_epoc_time - Date.now()) / 1000)
        )

        if (seconds_left) {
          this._timers[name].remaining = seconds_left
        }

        // Redraws don't happen on setInterval according to the docs
        // but it's an important time to redraw because a timer just started
        m.redraw()
      }, 1000 / 5) // 5 fps is more than enough for a text-based RPG
  }
}
