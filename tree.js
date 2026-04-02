function makeTree(tokens) {

    let arr = [];

    for (let t of tokens) {
        arr.push(t[1]);
    }

    return arr;
}