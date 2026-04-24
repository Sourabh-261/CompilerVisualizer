"use strict";

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
        trees.push(oldFormat.map(x => x[1]));
    }

    let tac = generateTAC(all);

    // Global Bracket/Paren Check
    let stack = [];
    for (let t of all) {
        if (t.value === "{" || t.value === "(") {
            stack.push(t);
        } else if (t.value === "}") {
            let last = stack.pop();
            if (!last || last.value !== "{") msgs.push(`Global Error: Unmatched '}'`);
        } else if (t.value === ")") {
            let last = stack.pop();
            if (!last || last.value !== "(") msgs.push(`Global Error: Unmatched ')'`);
        }
    }
    stack.forEach(t => msgs.push(`Global Error: Missing closing for '${t.value}'`));

    return {
        tokens: all,
        messages: msgs,
        symbols: getTable(),
        tree: trees,
        tac: tac
    };
}