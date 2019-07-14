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

  static compile_child_substr (parent) {
    // skip for faster renders
    if (parent.text.length > 600) return parent.text

    return (parent.children || []).reduce((compiler, tag)=> {
      const before  = compiler.text.substr(0, tag.start + compiler.offset)
      const after   = compiler.text.substr(tag.end + compiler.offset, compiler.text.length)
      const {hilited, offset} = Compiler.compile_a_tag(tag.id || tag.name, tag.attrs, tag.text)
      const text = before + hilited + after
      return {text, offset : offset + compiler.offset}
    }, {offset: 0, text: parent.text}).text
  }

  static compile_root(tag, body) {
    const pre = document.createElement("pre")
    pre.className = [tag.name || "", tag.id || ""].join(" ").trim()
    pre.innerHTML = body
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
