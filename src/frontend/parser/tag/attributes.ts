enum AttrState {
  IN_ATTRIBUTE_NAME,
  IN_ATTRIBUTE_VALUE,
  HAS_EQUALS,
  IDLE,
}
type Key =
  | string

type Value =
  | string
  | true

export type GemstoneTagAttrs =
  | Record<Key, Value>

export function parseAttrs (contents : string) : GemstoneTagAttrs {
  const attrs : Array<[Key, Value]> = []
  let pendingValue = ""
  let pendingKey   = ""
  let escapeChar   = ""
  let state        = AttrState.IDLE
  Array.from(contents).forEach(char => {
    switch (char) {
      case " ":
        switch (state) {
          case AttrState.IN_ATTRIBUTE_VALUE:
            return pendingValue += char
          case AttrState.IN_ATTRIBUTE_NAME:
            attrs.push([pendingKey, true])
            return (pendingKey = "", pendingValue = "")
          default: return
        }
      case `=`:
        switch (state) {
          case AttrState.IN_ATTRIBUTE_NAME:
            return state = AttrState.HAS_EQUALS
          case AttrState.IN_ATTRIBUTE_VALUE:
            return pendingValue += char
          default: return
        }
      case `"`:
      case `'`:
        switch (state) {
          case AttrState.HAS_EQUALS:
            escapeChar = char
            return state = AttrState.IN_ATTRIBUTE_VALUE
          case AttrState.IN_ATTRIBUTE_VALUE:
            if (escapeChar !== char) {
              return pendingValue += char
            }

            //console.log("Attr/pair", [pendingKey, pendingValue])
            attrs.push([pendingKey, pendingValue])
            state = AttrState.IDLE
            return (pendingKey = "", pendingValue = "", escapeChar = "")

          default: return
        }
      default:
        //console.log([pendingKey, AttrState[state]])
        switch (state) {
          case AttrState.IN_ATTRIBUTE_VALUE:
            return pendingValue += char
          case AttrState.IN_ATTRIBUTE_NAME:
            return pendingKey += char
          case AttrState.IDLE:
            pendingKey += char
            return state = AttrState.IN_ATTRIBUTE_NAME
        }
    }
  })
  //console.log("attrs/parse -> %s", contents, attrs, Object.fromEntries(attrs))
  return Object.fromEntries(attrs)
}
