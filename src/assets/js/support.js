const parseNewick = (s) => {
  var ancestors = [];
  var tree = {};
  var tokens = s.split(/\s*(;|\(|\)|,|:)\s*/);
  // var subtree;
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];
    switch (token) {
      case '(': {// new branchset
        let subtree = {};
        tree.branchset = [subtree];
        ancestors.push(tree);
        tree = subtree;
        break;
      }
      case ',': {// another branch
        let subtree = {};
        ancestors[ancestors.length - 1].branchset.push(subtree);
        tree = subtree;
        break;
      }
      case ')': // optional name next
        tree = ancestors.pop();
        break;
      case ':': // optional length next
        break;
      default:
        var x = tokens[i - 1];
        if (x == ')' || x == '(' || x == ',') {
          tree.name = token;
        } else if (x == ':') {
          tree.length = parseFloat(token);
        }
    }
  }
  return tree;
};

const toPromise = (transition) => {
  let count = 0
  let interrupted = false
  transition.each(() => count++)
  return new Promise(function (resolve) {
    if (count === 0) {
      resolve('ended')
      return
    }
    const check = () => {
      if (--count === 0) {
        resolve(interrupted ? 'interrupted' : 'ended')
      }
    }
    transition.on('end', check)
    transition.on('interrupt', () => {
      interrupted = true
      check()
    })
  })
}

export { parseNewick, toPromise }