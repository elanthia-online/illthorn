//import {Application} from "spectron"
import { promises } from "fs"
import path from "path"
import {Parser} from "../src/renderer/parser/parser"
import { TagState, GameTag } from "../src/renderer/parser/tag"

const parseXML = async (filename : string, parser? : Parser) => {
  const thisParser = parser || Parser.of()
  const contents = await promises.readFile(path.join(__dirname, "xml", filename))
  const result : GameTag[] = []
  contents.toString().split("\n").forEach(line => {
    const {result: thisResult} = parse(line, thisParser)
    result.push(...thisResult)
  })
  return {result, parser: thisParser}
}

const parse = (text : string, parser? : Parser) => {
  const trueParser = parser || Parser.of()
  const result = 
    trueParser.parse(text)

  if (!Array.isArray((result))) {
    throw new Error("result was not an array")
  }

  return {result, parser: trueParser}
}

test("Parser#parse / simple", async () => {
  const {result} = parse(`<simple></simple>`)
  const [simpleParsed, ...rest] = result

  expect(rest).toMatchObject([])

  expect(simpleParsed)
    .toMatchObject({name: "simple", children: []})
})

test("Parse#parse / simple / text", async ()=> {
  const {result} = parse(`<simple>some text contents</simple>`)
  const [simpleParsedWithText, ...rest] = result

  expect(simpleParsedWithText.state)
    .toBe(TagState.CLOSED)
  expect(rest).toMatchObject([])

  expect(simpleParsedWithText)
    .toMatchObject(
      { name: "simple"
      , children: [{name: ":text", children: []}]
      })
})

test("Parse#parse / simple / a / text", async ()=> {
  const {result} = parse(`<simple><a>some text contents</a></simple>`)
  const [nestedWithText, ...rest] = result
    
  
  expect(rest).toMatchObject([])
  expect(nestedWithText)
    .toMatchObject({ name: "simple"})

  const {children} = nestedWithText
  expect(children)
    .toMatchObject([{name: "a", children: [{name: ":text"}]}])
})

test("Parse#parse / simple / a / b / text", async ()=> {
  const {result} = parse(`<simple><a><b>some text contents</b></a></simple>`)
  const [nestedWithText, ...rest] = result
  
  
  expect(rest).toMatchObject([])
  expect(nestedWithText)
    .toMatchObject({ name: "simple"})

  const {children} = nestedWithText
  expect(children)
    .toMatchObject([{name: "a", children: [
        {name: "b", children: [{name: ":text"}]}]}])
})

test("Parse#parse / simple / (a + text) & (b + text)", async ()=> {
  const {result} = parse(`<simple><a><b>some text</b> contents</a></simple>`)
  const [nestedWithText, ...rest] = result
  
  expect(rest).toMatchObject([])
  expect(nestedWithText)
    .toMatchObject({ name: "simple"})

  const {children: simpleChildren} = nestedWithText
  const [a, ...restOfA] = simpleChildren
  expect(restOfA).toMatchObject([])
  const [b, aText] = a.children

  expect(b)
    .toMatchObject({ name: "b"
                   , children: [{name: ":text", text: "some text"}]
                   })

  expect(aText)
    .toMatchObject({name: ":text", text: " contents"})
})

test("Parser#parse / dialogData", async ()=> {
  const {result} = await parseXML("dialog-data.xml")
  const [clearDialog, dialogWithInfo] = result
  
  expect(clearDialog.attrs)
    .toMatchObject({clear: "t", id: "Active Spells"})

  expect(dialogWithInfo.attrs)
    .toMatchObject({id: "Active Spells"})

  expect(dialogWithInfo.children.map(c => c.name))
    .toContain("progressBar")
})

test("Parser#parse / chunked", async ()=> {
  const {result, parser} = await parseXML("nav.xml")
  const [nav,] = result
  expect(nav.attrs.rm)
    .toBe("18050003")

  const parsedStyle =
    { name: "style"
    , children: [{name: ":text",  text: '[Estate, Athenaeum]'}]
    }
  expect(parser.pending.length)
    .toEqual(1)
  expect(parser.pending[0])
    .toMatchObject(parsedStyle)

  const [style] = parser.parse(`<style id="" />`)
  expect(style)
    .toMatchObject(parsedStyle)
  expect(parser.pending.length)
    .toEqual(0)
})

test("Parser#parse / stream", async ()=> {
  const {result: danglingResult, parser} = await parseXML("stream-push.xml")
  expect(danglingResult)
    .toMatchObject([])
  expect(parser.pending)
    .toMatchObject([{name: "stream"}])

  const {result} = await parseXML("stream-pop.xml", parser)
  expect(result)
    .toMatchObject([
    { name: "stream"
    , children: [{ name: ":text"
                 , text: `[Merchant]-GSIV:Rolfard: "neck worn torc (crumbly) with +5 LOG base, +5 Influence base, +5 max mana, +1 Dex base, MB: 100k"  (18:27:16)`
                 }]
    }])
})

test("Parser#parse / prompt", async ()=> {
  const {result} = await parseXML("prompt.xml")
  const [prompt] = result.reverse()
  expect(result.filter(tag => tag.name == "prompt").length)
    .toEqual(1)
  expect(prompt)
    .toMatchObject(
      { name: "prompt"
      , attrs: {time: "1635432293"}
      , children: [{name: ":text", text: "&gt;"}]
      })
})

test("Parser#parse / speech", async ()=> {
  const {result} = await parseXML("speech.xml")
  // todo: make some assertions
})

test("Parser#parse / mono", async ()=> {
  const {result} = await parseXML("mono.xml")
  expect(result.length)
    .toEqual(1)
})