/**
 * this is an async safe wrapper
 * when using core http/sockets in Node.js + a stateful parser
 * it is possible that very short packets are processed faster
 * than very long packets.
 *
 * for example take this ordering:
 * <taters>*10000 -> 1ms
 * <taters> -> 0.1ms
 *
 * it is possible that the second packet to arrive is processed
 * quicker than the first packet, causing a bug where the TCP packets
 * are no longer well ordered
 */
module.exports = function IO(value) {
  if (!(this instanceof IO)) return new IO(value)
  const io = this
  io._work = Promise.resolve(value)
  io.fmap = (fx) => {
    io._work = io._work
      .then(fx)
      .catch((err) => console.error(err))
    return io
  }
  // make it await-able when unwrapped
  io.unwrap = () => io._work
}
