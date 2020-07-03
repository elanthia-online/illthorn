exports.to_pojo = function (tag) {
  return {
    name: tag.name,
    attrs: tag.attrs,
    text: tag.text,
    id: tag.id,
    children: tag.children.map(exports.to_pojo),
  };
};
