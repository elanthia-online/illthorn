const m = require("mithril");
const Session = require("../../session");
const Lens = require("../../util/lens");

module.exports = class Hands {
  static KINDS = ["left", "right", "spell"];

  static Lookup = Hands.KINDS.reduce(
    (acc, hand) =>
      Object.assign(acc, {
        [hand]: Lens.of(["state", hand, "text"], Hands.fallback(hand)),
      }),
    {}
  );

  static fallback(hand) {
    switch (hand) {
      case "spell":
        return "None";
      default:
        return "Empty";
    }
  }

  view() {
    const session = Session.focused();

    return (
      session &&
      m(
        "ol#hands",
        Hands.KINDS.map((hand) =>
          m(`li.hand#${hand}`, { key: hand }, Hands.Lookup[hand].get(session))
        )
      )
    );
  }
};
