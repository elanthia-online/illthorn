const Lens = require("../util/lens")
const Bus  = require("../bus")
const {Tag} = require("@elanthia/koschei")
const Settings = require("../settings")

module.exports = class CharacterState {
  static TAGS =
    [ "prompt"
    , "right"
    , "left"
    , "spell"
    , "roundtime"
    , "compass"
    ]

  static ID_TAGS = 
    [ "mana"
    , "health"
    , "stamina"
    , "spirit"
    , "mindState"
    , "encumlevel"
    , "ActiveSpells"
    ].reduce((acc, id) => Object.assign(acc, {[id]: 1}), {})

  static of (character) {
    return new CharacterState(character)
  }

  static consume (state, tag) {
    if (tag.id && tag.id in CharacterState.ID_TAGS) {  
      //console.log(tag)
      return state.put(tag.id, tag)
    }
    if (tag.children && tag.children.length) tag.children.forEach(child => CharacterState.consume(state, child))
  }

  constructor (character) {
    this._character = character
    this.wire_up()
  }

  by_name (name) {
    return Object.keys(this)
      .filter(key => this[key] instanceof Tag && this[key].name == name)
      .map(key => this[key])
  }

  wire_up () {
    const {parser} = this._character

    parser.on("tag", tag => {
      CharacterState.consume(this, tag)
    })

    parser.on("notification", tag => {
      if (!tag.text || tag.text.length == 0) return

      let silent = false
      if ("sound" in tag.attrs) silent = Settings.cast(tag.attrs.sound)
      silent = Settings.get("mute", silent)

      console.log("silent", silent)
      
      if (tag.text) new Notification(this._character.name + " " + Lens.get(tag, "attrs.title"),
        { ...tag.attrs, silent
        , body   : tag.text
        })
    })

    parser.on("launchurl", tag => {
      console.log(tag)
      //require("electron").shell.openExternal("https://play.net/" + tag.attrs.src)
    })

    CharacterState.TAGS.forEach(tag => 
      parser.on(tag, val => this.put(tag, val)))
  }

  get (prop, fallback) {
    if (prop.toString()[0] == "_") {
      throw new Error(`cannot change private Property(${prop})`)
    }
    
    return Lens.get(this, prop, fallback)
  }

  put (prop, val) {
    Lens.put(this, prop, val)
    Bus.emit(Bus.events.REDRAW)
    return this
  }
}