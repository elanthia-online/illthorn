function is_function(thing) {
  return typeof thing === "function"
}

function throw_not_function() {
  throw new Error("Function was expected as Argument[0]")
}

var __slice = [].slice

function Pipe(data) {
  if (!(this instanceof Pipe)) return new Pipe(data)

  var pipe = this
  /**
   * the current value of the pipeline
   */
  pipe.data = data
  /**
   * do something with the data but do not mutate the value
   * and discard the result
   */
  pipe.tap = function () {
    var args = __slice.call(arguments),
      fn = args.shift()
    if (fn == Pipe.lift) return pipe.data
    if (is_function(fn)) {
      fn.apply(pipe, [pipe.data].concat(args))
      return pipe
    }
    throw_not_function()
  }
  /**
   * |>
   */
  pipe.into = pipe.fmap = function () {
    var args = __slice.call(arguments),
      fn = args.shift()
    if (fn == Pipe.lift) return pipe.data
    if (is_function(fn))
      return Pipe(fn.apply(pipe, [pipe.data].concat(args)))
    throw_not_function()
  }

  pipe.unwrap = function () {
    return pipe.data
  }

  return pipe
}

module.exports = Pipe

Pipe.of = Pipe

Pipe.lift = function (p) {
  if (p instanceof Pipe) return p.data
  return p
}
// fast apply
Pipe._apply = Pipe.apply = function (fn, args) {
  if (args.length == 0) return fn()
  if (args.length == 1) return fn(args[0])
  if (args.length == 2) return fn(args[0], args[1])
  if (args.length == 3) return fn(args[0], args[1], args[2])
  if (args.length == 4)
    return fn(args[0], args[1], args[2], args[3])
  if (args.length == 5)
    return fn(args[0], args[1], args[2], args[3], args[4])
  throw new Error(
    "Pipe._apply() does not support arity > 5"
  )
}

Pipe.maybe = function (val, fn, _ /*rest*/) {
  if (!val) return val
  return Pipe._apply(
    fn,
    [val].concat(
      __slice.call(arguments, 2, arguments.length)
    )
  )
}

Pipe.curry = function (fn, args, ctx) {
  args = args || []
  if (args.length > fn.length - 1)
    return fn.apply(ctx, args)
  return function curried() {
    var args2 = args.concat(__slice.call(arguments))
    return Pipe.curry(fn, args2, ctx)
  }
}
