import { CommandHistory } from "../src/renderer/session/command-history"

test("command history / cycle", async () => {
  const history = new CommandHistory()
  history.add("look")
  history.add("exp")
  history.add("info")
  history.back()

  const oneBack = history.read()
  history.resetPosition()
  history.back()
  history.back()
  history.forward()

  expect(oneBack)
    .toEqual(history.read())
})