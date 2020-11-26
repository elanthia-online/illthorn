const List = require("../util/list")
const Pipe = require("../util/pipe")
const qwerty = require("qwerty")

module.exports = class Autocomplete {
  static MIN_CLOSENESS_SCORE = 25
  /**
   * Suggestion sorting algorithm based on QWERTY keyboard layouts
   * where a lower score indicates similarity to the command we
   * are trying to build a suggestion list for
   */
  static qwerty_distance_suggestions([
    command,
    suggestions,
  ]) {
    return [
      command,
      Autocomplete.qwerty_sort([command, suggestions]),
    ]
  }
  static qwerty_sort([command, suggestions]) {
    return suggestions
      .map((suggestion) =>
        suggestion.padEnd(command.length, " ")
      )
      .map((suggestion) => [
        suggestion,
        qwerty.default.word_distance(command, suggestion),
      ])
      .sort(([, a], [, b]) => a - b)
      .filter(
        ([_, score]) =>
          score < Autocomplete.MIN_CLOSENESS_SCORE
      )
      .map(([suggestion, _]) => suggestion.trimRight())
  }
  static prune([command, suggestions]) {
    return [
      command,
      suggestions.filter((suggestion) =>
        suggestion.startsWith(command)
      ),
    ]
  }
  static lift([_, suggestions]) {
    return suggestions
  }
  static of(command, history) {
    return new Autocomplete(command, history)
  }

  constructor(command, history) {
    const _prepared = Pipe.of([
      command.trim(),
      List.uniq(history).filter(
        (suggestion) => command.trim() !== suggestion.trim()
      ),
    ])
    // best matches are exact
    this.best_matches = _prepared
      .fmap(Autocomplete.prune)
      .fmap(Autocomplete.lift)
      .value()
    // this is more like autocorrect in that it checks for
    // likely mistypes
    this.best_guesses = _prepared
      .fmap(Autocomplete.qwerty_distance_suggestions)
      .fmap(Autocomplete.lift)
      .value()
    // built our list of unique suggestions
    // without altering order
    this.suggestions = List.slice(
      Pipe.of([this.best_matches, this.best_guesses])
        .fmap(List.concat)
        .fmap(List.uniq)
        .value(),
      { end: 9 }
    )
  }
}
