const { test, expect } = require("@jest/globals")

jest.mock("../src/util/platform")
const platform = require("../src/util/platform")
platform.isMac.mockImplementation(() => true)

const parse_for_numpad = require("../src/numpad/numpad")

// Order is sorted by key, matching parse_for_numpad
const direction_order = [
  "up",
  "sw",
  "s",
  "se",
  "w",
  "out",
  "e",
  "nw",
  "n",
  "ne",
  "down",
]
const keypresses = []

for (let i = 0; i < direction_order.length; ++i) {
  const index_str = i != 10 ? i.toString() : "Decimal"
  const key = i != 10 ? i.toString() : "."
  keypresses.push({
    key: key,
    code: "Numpad" + index_str,
    direction: direction_order[i],
  })
}

test("Normal input", () => {
  let keypress = new KeyboardEvent("keypress", { key: "1", code: "Key1" })
  expect(parse_for_numpad(keypress)).toBeFalsy()
  keypress = new KeyboardEvent("keypress", { key: "z", code: "KeyZ" })
  expect(parse_for_numpad(keypress)).toBeFalsy()
})

test("Numpad inputs", () => {
  keypresses.forEach((value, _0, _1) => {
    const location = { location: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD }
    const options = Object.assign({}, value, location)
    const keypress = new KeyboardEvent("keypress", options)
    expect(parse_for_numpad(keypress)).toBe(value["direction"])
  })
})

test("Numpad inputs with NumLock enabled", () => {
  keypresses.forEach((value, _0, _1) => {
    const location = { location: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD }
    const options = Object.assign({}, value, location)
    const keypress = new KeyboardEvent("keypress", options)
    keypress.getModifierState = jest.fn(() => true)
    expect(parse_for_numpad(keypress)).toBeFalsy()
  })
})

test("Numpad sneaking on Mac", () => {
  platform.isMac.mockImplementation(() => true)
  platform.isLinux.mockImplementation(() => false)
  platform.isWindows.mockImplementation(() => false)
  keypresses.forEach((value, _0, _1) => {
    const location = {
      location: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD,
      metaKey: true,
    }
    const options = Object.assign({}, value, location)
    const keypress = new KeyboardEvent("keypress", options)
    expect(parse_for_numpad(keypress)).toBe("sneak " + value["direction"])
  })
})

test("Numpad sneaking on Windows", () => {
  platform.isMac.mockImplementation(() => false)
  platform.isLinux.mockImplementation(() => false)
  platform.isWindows.mockImplementation(() => true)
  keypresses.forEach((value, _0, _1) => {
    const location = {
      location: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD,
      altKey: true,
    }
    const options = Object.assign({}, value, location)
    const keypress = new KeyboardEvent("keypress", options)
    expect(parse_for_numpad(keypress)).toBe("sneak " + value["direction"])
  })
})

test("Numpad sneaking on Linux", () => {
  platform.isMac.mockImplementation(() => false)
  platform.isLinux.mockImplementation(() => true)
  platform.isWindows.mockImplementation(() => false)
  keypresses.forEach((value, _0, _1) => {
    const location = {
      location: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD,
      altKey: true,
    }
    const options = Object.assign({}, value, location)
    const keypress = new KeyboardEvent("keypress", options)
    expect(parse_for_numpad(keypress)).toBe("sneak " + value["direction"])
  })
})

test("Numpad familiar commands", () => {
  keypresses.forEach((value, _0, _1) => {
    const location = {
      location: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD,
      ctrlKey: true,
    }
    const options = Object.assign({}, value, location)
    const keypress = new KeyboardEvent("keypress", options)
    expect(parse_for_numpad(keypress)).toBe(
      "tell familiar to go " + value["direction"]
    )
  })
})
