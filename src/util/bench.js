exports.mark = async function (label, code) {
  console.time(label)
  const value = await code()
  console.timeEnd(label)
  return value
}
