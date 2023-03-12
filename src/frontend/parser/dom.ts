/**
this casts GameTags to HTMLElements
 */
import { GameTag } from "./tag"

export type Renderable =
  { frag     : DocumentFragment
  ; metadata : GameTag[]
  }

export function castToHTML (tags : GameTag[]) {
  const result : Renderable =
    { frag     : document.createDocumentFragment()
    , metadata : []
    }
  tags.forEach((tag, idx) => handleTag(tag, idx, tags, result.frag, result.metadata))
  return result
}

export function handleTag (tag : GameTag,
                           idx : number,
                           tags : GameTag[],
                           frag : DocumentFragment,
                           metadata : GameTag[] = []) {
  switch (tag.name) {
      case "a":
      case "b":
      case "d":
      case "preset":
        return createInlineElement(frag, tag)
      case ":text":
        const lastTag = tags[idx-1]
        if (metadata.includes(lastTag) && tag.text == "\n") {
          return // noop to prevent double whitespace
        }
        return createInlineElement(frag, tag)
      case "style":
      case "output":
        return createStyledTag(frag, tag)
      case "stream":
        metadata.push(tag)
        return handleStreamTag(frag, tag)
      case "prompt":
        return metadata.push(tag)
      default:
        return metadata.push(tag)
    }
}

export function createPrompt (tag : GameTag) {
  const prompt = document.createElement(tag.name)
  prompt.textContent = tag.children[0]?.text?.replace("&gt;", ">")
  Object.entries(tag.attrs).forEach(([attr, val])=> {
    prompt.setAttribute(attr, val.toString())
  })
  return prompt
}

export function createInlineElement (frag : DocumentFragment, tag : GameTag) : void {
  const parent = frag.lastElementChild || document.createElement("pre")
  if (!frag.contains(parent)) frag.append(parent)
  createChildInline(parent, tag)
}

export function createStyledTag (frag : DocumentFragment, tag : GameTag) : void {
  const pre = document.createElement("pre")
  const styles = Object.values(tag.attrs) as string[]
  try { pre.classList.add(...styles) } catch (err) {}
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

  ~["exist", "href", "cmd"].forEach(attr => {
    const attrVal = tag.attrs[attr]
    if (attrVal) {
      ele.setAttribute(attr, attrVal + "")
      if (attr == "href") ele.setAttribute("target", "_blank")
    }

  })

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
    .reduce((text, [encoded, decoded]) => text.replaceAll(encoded, decoded), text)
}


export function handleStreamTag (frag : DocumentFragment, tag : GameTag): void {
  switch (tag.attrs.id) {
    case "speech":
    case "bounty":
    case "inv":
    case "room":
      return // noop / these are duplicated
    default:
      console.log("stream/detected", tag.attrs.id)
      const streamEle = document.createElement("pre")
      const streamFrag = document.createDocumentFragment()
      const styles = Object.values(tag.attrs) as string[]
      streamEle.classList.add(...styles)

      tag.children
        .forEach((tag, idx) => handleTag(tag, idx, tag.children, streamFrag, []))
      streamEle.append(streamFrag)
      frag.append(streamEle)
  }
}
