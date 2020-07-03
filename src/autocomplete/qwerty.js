import List from "../util/list"
import Pipe from "../util/pipe"
/**
 * util for building distance in an XYZ coordinate plane
 * with relation to Qwerty keyboards
 *
 * copied from my typescript library:
 *  https://github.com/elanthia-online/rowan/blob/master/src/autocomplete/qwerty.ts
 */
module.exports = class Qwerty {
  static NORMAL = Qwerty.build_coords({ z: 0 }, [
    `\`1234567890-=`,
    ` qwertyuiop[]\\`,
    ` asdfghjkl;'`,
    ` zxcvbnm,./`,
  ])
  static SHIFT = Qwerty.build_coords({ z: 1 }, [
    `~!@#$%^&*()_+`,
    ` QWERTYUIOP{}|`,
    ` ASDFGHJKL:"`,
    ` ZXCVBNM<>?`,
  ])
  static RUNE_MAP = Object.assign(
    {},
    Qwerty.NORMAL,
    Qwerty.SHIFT
  )
  static EMPTY = ` `
  static EMPTY_DISTANCE = 1.0
  static UNKNOWN_CHAR_DISTANCE = 10.0

  static euclidean_distance([x1, y1, z1], [x2, y2, z2]) {
    return Math.sqrt(
      Math.pow(x1 - x2, 2) +
        Math.pow(y1 - y2, 2) +
        Math.pow(z1 - z2, 2)
    )
  }
  static distance(a, b) {
    if (a == b) return 0
    if (a == Qwerty.EMPTY || b == Qwerty.EMPTY)
      return Qwerty.EMPTY_DISTANCE
    if (!Qwerty.RUNE_MAP[a] || !Qwerty.RUNE_MAP[b])
      return Qwerty.UNKNOWN_CHAR_DISTANCE
    const [coord1, coord2] = [a, b].map(
      (rune) => Qwerty.RUNE_MAP[rune]
    )
    return Qwerty.euclidean_distance(coord1, coord2)
  }
  static to_rune_matrix(runelist) {
    return runelist.map((row) => row.split(""))
  }
  static build_coords({ z = 0 }, layout) {
    return Pipe.of(layout)
      .fmap(Qwerty.to_rune_matrix)
      .fmap(List.reduce, {}, (acc, row, x) =>
        row.reduce(
          (acc, char, y) =>
            Object.assign(acc, { [char]: [x, y, z] }),
          acc
        )
      ).data
  }
  static word_distance(word1, word2) {
    return Pipe.of(
      List.zip(word1.split(""), word2.split(""))
    ).fmap(
      List.reduce,
      0,
      (score, [a, b]) => score + Qwerty.distance(a, b)
    ).data
  }
}
