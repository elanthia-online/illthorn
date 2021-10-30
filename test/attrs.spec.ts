
import { parseAttrs } from "../src/renderer/parser/tag/attributes"

test("parse attributes", async ()=> {
  const parsed = parseAttrs(` taters="1" tots="that's hot"`)
  expect(parsed)
    .toMatchObject({taters: "1", tots: "that's hot"})
})