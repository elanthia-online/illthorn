module.exports = class Occlusion {
  /**
   * Occlusion culling algorithm to ensure only 
   * a minimally perfomant amount of nodes are retained 
   * in the DOM
   */
  static prune (ele, {retain = 2.0} = {}) {
    const pruned    = []
    const threshold = Math.max(ele.clientHeight, 
      Math.round(ele.clientHeight * retain))
   
    while (ele.scrollHeight > threshold) {
      pruned.push(ele.firstChild)
      ele.removeChild(ele.firstChild)
    }
    
    return pruned
  }
}