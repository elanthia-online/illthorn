const Lookup = (module.exports = (keys) =>
  keys.reduce(
    (acc, id) => Object.assign(acc, { [id]: 1 }),
    {}
  ))
