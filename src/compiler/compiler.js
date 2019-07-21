const Settings = require("../settings")
const Hilites  = require("../hilites")
const Bench    = require("../util/bench")

const CompileEnum =
  { style  : 1
  , text   : 1
  , stream : 1
  , prompt : 1
  }

const DuplicateStream =
  { speech : 1
  , room   : 1
  , inv    : 1
  , bounty : 1
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
    return tag.name == "stream" && tag.id in DuplicateStream
  }
  
  static compile (parent) {
    return Compiler.compile_root(parent, 
      Compiler.compile_child_substr(parent))
  }

  static trim_left (body) {
    let idx = 0
    while (idx < 5) {
      const char = body[idx]
      ++idx
      if (char == " ") continue
      if (char == "\r") return body.trimLeft()
      if (char == "\n") return body.trimLeft()
      return body
    }

    return body
  }

  static compile_child_substr (parent) {
    // skip for faster renders
    if (Settings.get("compiler.run", true) === false) return parent.text
    if (parent.text.length > Settings.get("compiler.max_length", 600)) return parent.text
    
    return (parent.children || []).reduce((compiler, tag)=> {
      const before  = compiler.text.substr(0, tag.start + compiler.offset)
      const after   = compiler.text.substr(tag.end + compiler.offset, compiler.text.length)
      const {hilited, offset} = Compiler.compile_a_tag(tag.id || tag.name, tag.attrs, tag.text)
      const text = before + hilited + after
      return {text, offset : offset + compiler.offset}
    }, {offset: 0, text: parent.text}).text
  }

  static add_hilites (pre) {
    Compiler.add_hilites_v2(pre)
  }

  static add_hilites_v1 (pre) {
    const hilites = Hilites.get()
    const nodes   = pre.childNodes
    const length  = nodes.length
    let i = 0
    // this is so ugly, but it unfortunately 
    // the fastest way I found to make this code run.
    while (i < length) {
      for (const [pattern, group] of hilites) {
        const node = pre.childNodes[i]
        let redraw = false
        // text nodes do not have innerHTML to manipulate so
        // we must generate a new html slice here **if** we found
        // a hilite match
        if (node.nodeName == "#text") {
          const update = node.substringData(0, node.length).replace(pattern, function (match) {
            redraw = true
            return `<span class="${group}">${match}</span>`
          })

          if (redraw) {
            const hilited = document.createElement("span")
            hilited.innerHTML = update
            pre.replaceChild(hilited, node)
          }

        } else {
          node.innerHTML = node.innerHTML.replace(pattern, function (match) {
            return `<span class="${group}">${match}</span>`
          })
        }
      }
      ++i
    }
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
      if (node.nodeName == "#text") Compiler.hilite_text_node(parent, node, hilites, depth + 1)
      if (node.nodeName == "A")     Compiler.hilite_exist_tag(node, hilites, depth + 1)
      if (node.nodeName == "INS")   continue // already processed
    }
  }

  static hilite_text_node (parent, text_node, hilites, depth) {
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

  static hilite_exist_tag (a, hilites) {
    let i = 0
    while (i < hilites.length) {
      const [pattern, group] = hilites[i]
      // return on first-match (same behavior as SF)
      const match = a.innerText.match(pattern)
      if (match && match[0].length == a.innerText.length) { 
        return a.className = group 
      }
      i++
    }
  }

  static compile_root(tag, body) {
    const pre = document.createElement("pre")
    pre.className = [tag.name || "", tag.id || ""].join(" ").trim()
    pre.innerHTML = Compiler.trim_left(body)
    Compiler.add_hilites(pre)
    //Bench.mark(":hilite", function () { Compiler.add_hilites(pre) })
    const frag = document.createDocumentFragment()
    frag.appendChild(pre)
    return frag
  }
  
  static compile_a_tag (kind, attrs = {}, text) {
    const [start, end] = [`<a${Compiler.compile_attrs(kind, attrs)}>`, `</a>`]
    const hilited = `${start}${text}${end}`
    return {hilited, offset : start.length + end.length}
  }

  static compile_attrs (kind, attrs) {
    if (kind == "a" && attrs["exist"]) kind = "exist"
    const klass = ` class="${kind}"`
    if (Object.keys(attrs).length == 0) return klass
    return klass + Object.keys(attrs)
      .reduce((acc,attr) => acc + " " + `data-${attr}=${JSON.stringify(attrs[attr])}`, "")
  }
}
