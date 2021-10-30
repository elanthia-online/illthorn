/**
this casts GameTags to HTMLElements
 */
import { replaceAll } from "../util/string"
import { GameTag } from "./tag"

export type Renderable =
  { frag     : DocumentFragment
  ; metadata : GameTag[]
  ; prompt?  : Element
  }

export function castToHTML (tags : GameTag[]) {
  const result : Renderable = 
    { frag     : document.createDocumentFragment()
    , metadata : []
    , prompt   : void 0
    }
  tags.forEach((tag, idx) => {
    switch (tag.name) {
      case "a":
      case "b":
      case "d":
      case "preset":
        return createInlineElement(result.frag, tag)
      case ":text":
        const lastTag = tags[idx-1]
        if (result.metadata.includes(lastTag) && tag.text == "\n") {
          return // noop to prevent double whitespace
        }
        return createInlineElement(result.frag, tag)
      case "style":
      case "output":
        return createStyledTag(result.frag, tag)
      case "prompt":
        return createPrompt(result, tag)
      default:
        return result.metadata.push(tag)
    }
  })

  return result
}

export function createPrompt (result : Renderable, tag : GameTag) {
  const prompt = document.createElement(tag.name)
  prompt.textContent = tag.children[0]?.text?.replace("&gt;", ">")
  Object.entries(tag.attrs).forEach(([attr, val])=> {
    prompt.setAttribute(attr, val.toString())
  })
  result.prompt = prompt
}

export function createInlineElement (frag : DocumentFragment, tag : GameTag) : void {
  const parent = frag.lastElementChild || document.createElement("pre")
  if (!frag.contains(parent)) frag.append(parent)
  createChildInline(parent, tag)
}

export function createStyledTag (frag : DocumentFragment, tag : GameTag) : void {
  const pre = document.createElement("pre")
  const styles = Object.values(tag.attrs) as string[]
  pre.classList.add(...styles)
  tag.children.forEach(child => createChildInline(pre, child))
  frag.append(pre)
}

export function createPresetTag (frag : DocumentFragment, tag : GameTag) : void {
  const span = document.createElement("span")
  const styles = Object.values(tag.attrs) as string[]
  span.classList.add(...styles)
  tag.children.forEach(child => createChildInline(span, child))
  frag.append(span)
}

export function createChildInline (parent : Element, tag : GameTag) {
  if (tag.name == ":text") return createTextNode(parent, tag)
  
  const ele = document.createElement(
    tag.name == "preset"
      ? "span"
      : tag.name)
  // add the preset style to the span
  ~(tag.name == "preset" && 
   tag.attrs.id && 
   typeof tag.attrs.id == "string" && 
   ele.classList.add(tag.attrs.id))
  tag.children.forEach(child => createChildInline(ele, child))
  parent.append(ele)
}

export function createTextNode (parent : Element, tag : GameTag) {
  // decode html entities, this is safe because we are using createTextNode
  // **never** do this with innerHTML
  const text = document.createTextNode(decodeHTMLEntities(tag.text))
  parent.appendChild(text)
}

export function decodeHTMLEntities (text : string) : string {
  return [["&gt;", ">"], ["&lt;", "<"], ["&quot;", `"`], ["&amp;", "&"]]
    .reduce((text, [encoded, decoded]) => replaceAll(text, encoded, decoded), text)
} 