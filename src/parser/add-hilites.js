const Hilites = require("../hilites")
const Mark = require("mark.js")
const IO = require("../util/io")

exports.addHilites = async (ele) => {
  const hilites = Hilites.get()
  if (hilites.length == 0) return 0
  const mark = new Mark(ele)
  return await hilites
    .reduce(
      (io, [pattern, className]) =>
        io.fmap(
          () =>
            new Promise((done) =>
              mark.markRegExp(pattern, {
                className,
                done,
              })
            )
        ),
      new IO()
    )
    .unwrap()
}
