const Hilites = require("../hilites")
const Mark = require("mark.js")
const IO = require("../util/io")

/**
 * Play a sound if a matched element has a sound attribute.
 * @param {Element} ele Element which triggered the match.
 */
function play_sound(ele) {
  const class_name = ele.className
  const group = Hilites.Groups.get(null, {})[class_name]
  if ("sound" in group) {
    var audio = document.createElement("audio")
    audio.style.display = "none"
    audio.src = "file:///" + group.sound
    audio.autoplay = true
    audio.onended = () => audio.remove()
    audio.onerror = (error) => {
      console.log(error)
      audio.remove()
    }
    document.body.append(audio)
  }
}

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
                className: className,
                each: play_sound,
                done: done,
              })
            )
        ),
      new IO()
    )
    .unwrap()
}
