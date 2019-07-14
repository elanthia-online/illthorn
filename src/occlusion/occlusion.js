module.exports = class Occlusion {
  /**
   * Occlusion culling algorithm to ensure only 
   * a minimally perfomant amount of nodes are retained 
   * in the DOM
   */
  static prune (ele, {retain, min_length}) {
    const pruned = []
    // min-items heuristic
    if (ele.childNodes.length < min_length) {
      return pruned
    }

    const threshold = Math.max(ele.clientHeight, 
      Math.round(ele.clientHeight * retain))
   
    while (ele.scrollHeight > threshold) {
      pruned.push(ele.firstChild)
      ele.removeChild(ele.firstChild)
    }
    
    return pruned
  }
}