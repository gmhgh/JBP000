function size(tree, {width, height}) {
  tree.size([height, width]).separation(function (a, b) {
    return 1;
  });
}

export {
  size
}