module.exports = class List {
  static uniq(list) {
    return list.reduce(
      (acc, member) => {
        if (acc.exists[member]) return acc;
        acc.exists[member] = !!1;
        acc.list.push(member);
        return acc;
      },
      { list: [], exists: {} }
    ).list;
  }

  static uniq_pairs(list, depth = 0) {
    if (list.length < 2) return [];
    const [first, ...rest] = list,
      pairs = rest.map((x, idx) => [first, x, idx + depth]);
    return pairs.concat(uniq_pairs(rest, depth + 1));
  }

  static flatten(...args) {
    return [].concat.apply([], ...args);
  }

  static zip(...lists) {
    lists = lists.sort((a, b) => a.length - b.length);
    const shortest_list = lists[0];
    return shortest_list.reduce((acc, _, i) => {
      acc.push(lists.map((list) => list[i]));
      return acc;
    }, []);
  }

  static reduce(list, start_value, fn) {
    return list.reduce(fn, start_value);
  }

  static map(list, fn) {
    return list.map(fn);
  }

  static filter(list, fn) {
    return list.filter(fn);
  }

  static head(list) {
    return list[0];
  }

  static concat(lists) {
    return List.reduce(lists, [], (acc, list) => acc.concat(list));
  }

  static slice(list, { start = 0, end = list.length }) {
    return list.slice(start, end);
  }

  static inspect(ele) {
    const inspector = this;
    if (typeof inspector == "function") inspector(ele);
    else console.log(ele);
    return ele;
  }
};
