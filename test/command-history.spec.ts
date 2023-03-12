import test from 'ava'
import {CommandHistory} from "../src/frontend/session/command-history"


test("CommandHistory#last()", t => {
  const history = new CommandHistory()
  const commands = ["climb tower", "exp", "info"]
  commands.forEach(cmd =>history.add(cmd))
  t.truthy(history.back() == "exp")
  t.truthy(history.back() == "climb tower")
  t.truthy(history.back() == "info")
})