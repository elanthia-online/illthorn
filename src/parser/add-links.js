const linkifyElement = require("linkifyjs/element")
const Url = require("../util/url")

exports.addLinks = async (ele) => {
  linkifyElement(ele, {
    className: (_, type) => "external-link " + type,
    validate: {
      url: (value) => /^(http)s?:\/\//i.test(value),
    },
    events: {
      click: (e) =>
        e.preventDefault() ||
        Url.open_external_link(e.target.href),
    },
  })
}
