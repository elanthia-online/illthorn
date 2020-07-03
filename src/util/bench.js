exports.async_task = async function (label, code) {
  console.time(label)
  await code()
  console.timeEnd(label)
}

exports.task = exports.mark = function (label, code) {
  console.time(label)
  code()
  console.timeEnd(label)
}
