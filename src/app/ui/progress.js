const m = require("mithril");
const Lens = require("../../util/lens");

module.exports = class Progress {
  static DIVISOR = /(\d+)\/(\d+)$/;

  static parse_percentage(bar) {
    if (typeof bar.text == "string" && bar.text.match(Progress.DIVISOR)) {
      const [_, current, max] = bar.text.match(Progress.DIVISOR);
      return (parseInt(current, 10) / parseInt(max, 10)) * 100;
    }

    if (bar.id == "encumlevel") console.log(bar);

    return parseInt(Lens.get(bar, "attrs.value", 0), 10);
  }

  static classify(percent) {
    if (percent > 66) return "high";
    if (percent > 33) return "medium";
    return "low";
  }

  static classify_down(percent) {
    if (percent > 66) return "low";
    if (percent > 33) return "medium";
    return "high";
  }

  static text(bar) {
    return (
      bar.attrs.text ||
      bar.id.toString().replace("pbar", "").toLowerCase() + " " + percent
    );
  }

  view({ attrs }) {
    const bar = attrs.bar || {};
    const percent =
      "percent" in attrs ? attrs.percent : Progress.parse_percentage(bar);
    const text = "text" in attrs ? attrs.text : Progress.text(bar);

    return m(`li#${bar.id}`, [
      m(`.bar.${Progress.classify(percent)}`, {
        style: { width: percent.toString() + "%" },
      }),
      m(".value", text),
    ]);
  }
};
