const pre = (string) => `<pre>${string}</pre>`

exports.normalize = (string) => {
  string = string
    .replace(/<style id=""\/>/g, "")
    .replace(
      /<style id="(\w+)"\s?\/>/g,
      (_, id) => `<pre class="${id}">`
    )
    .replace(/<pushBold\/>/g, `<b class="monster">`)
    .replace(/<popBold\/>/g, "</b>")
    .replace(/<push/g, "<")
    .replace(/<pop/g, "</")
    .replace(/<output/g, "<pre")
    .replace(/<\/output>/g, "</pre>")
    .replace(/<clearContainer/g, "</clearcontainer")
    .replace(/<preset/g, "<pre")
    .replace(/<clearStream id='inv' ifClosed=''\/>/, "")
    .replace(/\sid="/g, ` class="`)
    .replace(/\sid='/g, ` class='`)

  if (!string.startsWith("<")) return pre(string)
  if (string.startsWith("<b ")) return pre(string)
  if (string.startsWith("<a ")) return pre(string)
  return string
}
