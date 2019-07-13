module.exports = class Command {
  static of (named_arg_tuple, impl) {
    return new Command(named_arg_tuple, impl)
  }

  constructor (named_arg_tuple = [], impl) {
    this.named_arg_tuple = named_arg_tuple
    this.impl = impl
  }

  run (argv) {
    const argument = this.named_arg_tuple.reduce((acc, prop, i)=> Object
      .assign(acc, {[prop]: argv[i]}), {})
    return this.impl(argument)
  }
}