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
        all = all.concat(t);

        // invalid token
        let invalid = t.find(tok => tok.type === "INVALID");

        if (invalid) {
            msgs.push(`Line ${i + 1}: Invalid token '${invalid.value}'`);
            continue;
        }

        let oldFormat = t.map(x => [x.type, x.value]);

        let msg;
        try {
            msg = check(oldFormat, i + 1);
        } catch {
            msg = `Line ${i + 1}: Syntax error`;
        }

        msgs.push(msg);
        trees.push(makeTree(oldFormat));
    }

    let tac = generateTAC(all);

    return {
        tokens: all,
        messages: msgs,
        symbols: getTable(),
        tree: trees,
        tac: tac
    };
}