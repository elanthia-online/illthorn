const Settings = require("../settings")
const Hilites  = require("../hilites")
const Bench    = require("../util/bench")
const Lens     = require("../util/lens")
const m        = require("mithril")

const open_external_link = url => {
  console.log("opening:url(%s)", url)
  require('electron').shell.openExternal(url)
  return false
}

const CompileEnum =
  { style  : 1
  , text   : 1
  , stream : 1
  , prompt : 1
  , output : 1
  , preset : 1
  , b      : 1
  , d      : 1
  }

const DuplicateStream =
  { speech : 1
  , room   : 1
  , inv    : 1
  , bounty : 1
  }

const LinkRegex =
  /(\b(?:https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig

const UNTRUSTED_TAG_IDS =
  {   speech: 1
  , thoughts: 1
  }

module.exports = class Compiler {
  static is_empty (tag) {
    return tag.text.trim().length == 0
  }

  static can_compile (tag) {
    if (Compiler.is_empty(tag)) return false
    return tag.name in CompileEnum
  }

  static cannot_compile (tag) {
    return Compiler.is_doubled(tag) || !Compiler.can_compile(tag)
  }

  static is_doubled (tag) {
    return ~tag.name.toLowerCase().indexOf("stream") && tag.id in DuplicateStream
  }
  
  static compile (parent, cb) {
    Compiler.compile_child_substr(parent, 
      children => {
        Compiler.compile_root(parent, children, cb)
      })
  }

  static trim_left (tag, body) {
    return body
  }

  static compile_child_substr (parent, cb) {
    requestAnimationFrame(function () {
      // skip for faster renders
      if (Settings.get("compiler.run", true) === false) return cb(parent.text)
      if (parent.text.length > Settings.get("compiler.max_length", 800)) return cb(parent.text)
      
      return cb((parent.children || []).reduce((compiler, tag)=> {
        const before  = compiler.text.substr(0, tag.start + compiler.offset)
        const after   = compiler.text.substr(tag.end + compiler.offset, compiler.text.length)
        const {hilited, offset} = Compiler.compile_a_tag(tag.id || tag.name, tag.attrs, tag.text)
        const text = before + hilited + after
        return {text, offset : offset + compiler.offset}
      }, {offset: 0, text: parent.text}).text)
    })
  }

  static add_hilites (pre) {
    Compiler.add_hilites_v2(pre)
  }

  static add_hilites_v2 (parent, hilites = Hilites.get(), depth = 0) {
    if (depth >= Settings.get("compiler.max_depth", 4)) return // max recursion depth
    const nodes  = parent.childNodes
    const length = nodes.length
    let i        = 0
    //if (depth > 0) console.log("Recursive(%o) Children(%o)", parent.nodeName, nodes)
    while (i < length) {
      const node = nodes[i]
      ++i // in
      if (node.nodeName == "#text") Compiler.hilite_safe_text_node(parent, node, hilites, depth + 1)
      if (node.nodeName == "A")     Compiler.hilite_exist_tag(node, hilites, depth + 1)
      if (node.nodeName == "INS")   continue // already processed
    }
  }

  static hilite_safe_text_node (parent, text_node, hilites, depth) {
    let i = 0;
    const text = text_node.substringData(0, text_node.length)
    
    while (i < hilites.length) {
      const [pattern, group] = hilites[i]
      i++
      if (text.match(pattern)) {
        const update = text.replace(pattern, function (match) { return `<ins class="${group}">${match}</ins>` })
        const hilited = document.createElement("span")
        hilited.innerHTML = update
        parent.replaceChild(hilited, text_node)
        return Compiler.add_hilites_v2(hilited, hilites, depth + 1)
      }
    }
  }

  static hilite_unsafe_text (text, hilites = Hilites.get()) {
    let i = 0;
    
    
    while (i < hilites.length) {
      const [pattern, group] = hilites[i]
      i++
      if (text.match(pattern)) {
        text = text.replace(pattern, function (match) { return `<ins class="${group}">${match}</ins>` })
      }
    }

    return text
  }

  static hilite_exist_tag (a, hilites) {
    a.innerHTML = Compiler.hilite_unsafe_text(a.innerText, hilites)
  }

  static linkify (str) {
    str = Compiler.hilite_unsafe_text(str)

    return str.split(LinkRegex).map(part => {
      if (part.startsWith("https://") || part.startsWith("http://")) {
        return m("a.external-link"
          , {href: "#", onclick: open_external_link.bind(0, part)}
          , "link:" + part)
      }
     return m("webview", m.trust(str))
    })
  }

  static compile_root(tag, body, cb) {
    const pre = document.createElement("pre")
    pre.className = [tag.name || "", tag.id || ""].join(" ").trim()
  
    m.render(pre, 
      UNTRUSTED_TAG_IDS[tag.id] 
        ? Compiler.linkify(body) // content from other players and not the game engine
        : m.trust(body))
    Compiler.add_hilites(pre)
    const frag = document.createDocumentFragment()
    frag.appendChild(pre)
    cb(frag)
  }
  
  static compile_a_tag (kind, attrs = {}, text) {
    const [start, end] = [`<a${Compiler.compile_attrs(kind, attrs)}>`, `</a>`]
    const hilited = `${start}${text}${end}`
    return {hilited, offset : start.length + end.length}
  }

  static compile_attrs (kind, attrs) {
    if (kind == "a" && attrs["exist"]) kind = "exist"
    if (attrs.id) kind = `${kind} ${attrs.id}`
    const klass = ` class="${kind}"`
    if (Object.keys(attrs).length == 0) return klass
    return klass + Object.keys(attrs)
      .reduce((acc,attr) => acc + " " + `data-${attr}=${JSON.stringify(attrs[attr])}`, "")
  }
}
