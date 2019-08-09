module.exports = class Occlusion {
  static CONTEXT = void 0
  /**
  * reasonable upper bound for recursion in a single frame
  * 
  * we know we can only ever add 1 entry at a time
  */
  static UPPER_RECURSION_LIMIT = 3
  /**
   * Occlusion culling algorithm to ensure only 
   * a minimally perfomant amount of nodes are retained 
   * in the DOM
   */
  static prune (ele, {retain, min_length, start = performance.now(), depth = 1}) {
    if (Occlusion.CONTEXT && Occlusion.CONTEXT !== start) return
    // reentrant lock
    Occlusion.CONTEXT = start
    // recursion should always have an upper frame limit
    // in languages without tail-call optimization
    if (depth >= Occlusion.UPPER_RECURSION_LIMIT) {
      return Occlusion.CONTEXT = void 0
    }
    // min-items heuristic
    if (ele.childNodes.length < min_length) {
      return Occlusion.CONTEXT = void 0
    }
    // we have to check the threshold for this recursive frame
    const threshold = Math.max(ele.clientHeight, 
      Math.round(ele.clientHeight * retain))
    // stop recursion if we are are our height threshold  
    if (ele.scrollHeight <= threshold) {
      return Occlusion.CONTEXT = void 0
    }
    // Simply pop one child off the edge of the rendered DOMList
    // and schedule another operation, this allows other operations
    // to be scheduled (like scroll events) without a Stop The World problem
    setTimeout(function () {
      //console.log("Occlusion(:tick, ms: %s, depth: %s)", performance.now() - start, depth)
      ele.firstChild && ele.removeChild(ele.firstChild)
      console.log("Prune(count: %s)", ele.childElementCount)
      Occlusion.prune(ele, {retain, min_length, start, depth: ++depth})
    }, 0)
  }
}