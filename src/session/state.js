const Lens     = require("../util/lens")
const Bus      = require("../bus")
const {Tag}    = require("@elanthia/koschei")
const Settings = require("../settings")
const TagUtil  = require("../util/tag")

const makeLookup = keys => keys.reduce((acc, id) => Object.assign(acc, {[id]: 1}), {})

module.exports = class SessionState {
  static TAGS =
    [ "prompt"
    , "right"
    , "left"
    , "spell"
    , "roundtime"
    , "compass"
    ]

  static INJURY_IDS =
    makeLookup(
      [ "head", "leftEye", "rightEye", "neck"
      , "chest", "abdomen", "legArm", "rightArm", "leftHand", "rightHand"
      , "leftLeg", "rightLeg", "nsys"
      ])

  static ID_TAGS = 
    makeLookup(
      [ "mana"
      , "health"
      , "stamina"
      , "spirit"
      , "stance"
      , "mindState"
      , "encumlevel"
      , "ActiveSpells"
      , "nextLvlPB"
      //, "injuries"
      ])

  static of (session) {
    return new SessionState(session)
  }

  static consume (state, tag) {
    if (tag.id && tag.id in SessionState.INJURY_IDS) return state.put("injuries." + tag.id, tag)
    if (tag.id && tag.id in SessionState.ID_TAGS) return state.put(tag.id, tag)
    if (tag.children && tag.children.length) tag.children.forEach(child => SessionState.consume(state, child))
  }

  constructor (session) {
    this._session = session
    this.wire_up()
  }

  by_name (name) {
    return Object.keys(this)
      .filter(key => typeof this[key] == "object" && this[key].name == name)
      .map(key => this[key])
  }

  wire_up () {
    const parser = this._session

    parser.on("TAG", tag => {
      SessionState.consume(this, tag)
    })

    parser.on("NOTIFICATION", tag => {
      if (!tag.text || tag.text.length == 0) return

      let silent = false
      if ("sound" in tag.attrs) silent = Settings.cast(tag.attrs.sound)
      silent = Settings.get("mute", silent)
      
      if (tag.text) new Notification(this._session.name + " " + Lens.get(tag, "attrs.title"),
        { ...tag.attrs, silent
        , body   : tag.text
        })
    })

    SessionState.TAGS.forEach(tag => 
      parser.on(tag, val => this.put(tag, val)))
  }

  get (prop, fallback) {
    if (prop.toString()[0] == "_") {
      throw new Error(`cannot change private Property(${prop})`)
    }
    
    return Lens.get(this, prop, fallback)
  }

  put (prop, val) {
    if (val instanceof Tag) val = TagUtil.to_pojo(val)
    Lens.put(this, prop, val)
    Bus.emit(Bus.events.REDRAW)
    return this
  }
}