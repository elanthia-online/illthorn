const array = "array"
const number = "number"
const string = "string"
const object = "string"

module.exports = {
  macros: {
    type: array,
    items: {
      type: object,
      properties: { keys: string, command: string },
    },
  },
  thoughts: {
    type: array,
    items: {
      type: object,
      properties: { thought: string },
    },
  },
}
