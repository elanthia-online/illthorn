const Lens = require("../util/lens")
const Bus  = require("../bus")

module.exports = class CharacterState {
  static TAGS =
    [ "prompt"
    , "right"
    , "left"
    , "spell"
    , "roundtime"
    ]

  static ID_TAGS = 
    { dialogdata  : 1
    , indicator   : 1
    , progressbar : 1
    }

  static of (character) {
    return new CharacterState(character)
  }

  constructor (character) {
    this._character = character
    this.wire_up()
  }

  wire_up () {
    const {parser} = this._character

    parser.on("tag", tag => 
      tag.id && tag.name in CharacterState.ID_TAGS && this.put(tag.id, tag))

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
    Bus.emit("redraw")
    return this
  }
}