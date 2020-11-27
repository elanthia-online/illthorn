const pre = (string) => `<pre>${string}</pre>`

exports.normalize = (string) => {
  string = string
    .replace(/<style id=""\/>/g, "")
    .replace(/<style id="(\w+)"\s?\/>/g, (_, id) => `<pre class="${id}">`)
    .replace(/<streamWindow id="(\w+)(.*)\/>/g, (_, _id) => ``)
    .replace(/<resource picture="(\w+)(.*)\/>/g, (_, _id) => ``)
    .replace(/<pushBold\/>/g, `<b class="monster">`)
    .replace(/<popBold\/>/g, "</b>")
    .replace(/<pushS/g, "<s")
    .replace(/<popStream(.*)\/>/g, "</stream>")
    .replace(/<output/g, "<pre")
    .replace(/<\/output>/g, "</pre>")
    .replace(/<\/preset>/g, "</pre>")
    .replace(/<dir/, "</dir")
    .replace(/<clearContainer/g, "</clearcontainer")
    .replace(/<streamwindow /, "</streamwindow ")
    .replace(/<compass>/, "</pre><compass>")
    .replace(/<preset/g, "<mark")
    .replace(/<clearStream id='inv' ifClosed=''\/>/, "")
    .replace(/\sid="/g, ` class="`)
    .replace(/\sid='/g, ` class='`)
    .replace(/\/>/g, ">")
    .replace(">\n", ">")

  if (!string.startsWith("<")) return pre(string)
  if (string.startsWith("<b ")) return pre(string)
  if (string.startsWith("<a ")) return pre(string)
  return string.trimRight()
}
