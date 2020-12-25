const { test, expect, beforeAll, afterAll } = require("@jest/globals")
let Storage = require("../src/storage")

const startingHistory = ["d", "c", "b", "a"]

let mocks = []
let testHistory

beforeAll(() => {
  mocks.push(
    jest.spyOn(Storage, "get").mockImplementation(() => startingHistory)
  )

  mocks.push(jest.spyOn(Storage, "set").mockImplementation(() => {}))

  // Ensure these are created after the mocks are set up.
  const CommandHistory = require("../src/session/command-history")

  testHistory = CommandHistory.of()
})

afterAll(() => {
  for (let i = 0; i < mocks.length; i++) {
    mocks[i].mockRestore()
  }
})

test("Length works", () => {
  expect(testHistory.length).toBe(startingHistory.length)
})

test("Last index is correct", () => {
  expect(testHistory.length - 1).toBe(testHistory.last_index)
})

test("Head starts where expected", () => {
  expect(testHistory.head()).toBe("d")
})

test("Read values", () => {
  for (let i = 0; i < testHistory.length; i++) {
    expect(testHistory.read(i)).toBe(startingHistory[i])
  }
})

test("Seek matches read", () => {
  for (let i = testHistory.length - 1; i >= 0; i--) {
    testHistory.seek(i)
    expect(testHistory.read()).toBe(startingHistory[i])
  }
})

test("Backwards-forwards cycles", () => {
  for (let i = 0; i < 2 * startingHistory.length - 1; i++) {
    testHistory.back()
    expect(testHistory.read()).toBe(
      startingHistory[(i + 1) % startingHistory.length]
    )
  }
  for (let i = startingHistory.length - 1; i >= 1; i--) {
    testHistory.forward()
    expect(testHistory.read()).toBe(startingHistory[i - 1])
  }
})

test("Add command", () => {
  let newCommand = "e"
  testHistory.add(newCommand)
  expect(testHistory.head()).toBe(newCommand)
})

test("Update command", () => {
  let updatedCommand = "g"
  testHistory.seek(0)
  testHistory.update(updatedCommand)
  expect(testHistory.read()).toBe(updatedCommand)
})

test("Add with empty head", () => {
  testHistory.add("")
  expect(testHistory.head()).toBe("")
  testHistory.add("g")
  expect(testHistory.head()).toBe("g")
  expect(testHistory.read(1)).toBe("g")
})

test("Match command", () => {
  // Chosen to possibly conflict with "g" if broken
  let longCommand = "go door"
  testHistory.add(longCommand)
  expect(testHistory.read(0)).toBe(longCommand)
  expect(testHistory.match("go")).toEqual([longCommand])
})

test("write", () => {
  const { JSDOM } = require("jsdom")
  const dom = new JSDOM()
  let document = dom.window.document
  let command = "out"
  let node = document.createElement("input")
  node.focus = jest.fn()
  node.value = "bad"
  testHistory.update(command)
  testHistory.write(node, {
    forward: false,
    backward: false,
  })
  expect(node.focus).toHaveBeenCalledTimes(1)
  expect(node.value).toBe(command)
  expect(testHistory.read()).toBe(command)

  node.value = "bad"
  testHistory.write(node, { forward: true })
  expect(node.focus).toHaveBeenCalledTimes(2)
  expect(node.value).toBe(command)
  expect(testHistory.read()).toBe("a")

  node.value = "bad"
  testHistory.write(node, { back: true })
  expect(node.focus).toHaveBeenCalledTimes(3)
  expect(node.value).toBe("a")
  expect(testHistory.read()).toBe(command)
})
