function compileFull(code) {

    sym = {};

    let lines = code.split("\n");

    let all = [];
    let msgs = [];
    let trees = [];

    for (let i = 0; i < lines.length; i++) {

        let l = lines[i].trim();

        if (l === "") continue;

        let t = tokenize(l);

        all.push(t);

        msgs.push(
            "Line " + (i + 1) + " : " + check(t)
        );

        trees.push(
            makeTree(t)
        );
    }

    return {
        tokens: all,
        messages: msgs,
        symbols: getTable(),
        tree: trees
    };
}