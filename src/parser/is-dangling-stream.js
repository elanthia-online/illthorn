module.exports = (buffered) => {
  // todo: this should also match id= attribute
  return (
    (buffered.match(/<pushStream/) || []).length >
    (buffered.match(/<popStream/) || []).length
  )
}
