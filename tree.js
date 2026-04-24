"use strict";

function makeTree(tokens) {
    if (!tokens || tokens.length === 0) return null;

    let hasSemi = tokens[tokens.length - 1][1] === ";";
    
    // Remove semicolons and braces for internal parsing, but we can add them to the tree!
    let coreTokens = tokens.filter(t => t[1] !== ";" && t[1] !== "{" && t[1] !== "}");
    if (coreTokens.length === 0) return null;

    let root = { val: "Statement", children: [] };

    // Check for variable declaration: int a = 5;
    if (["int", "float", "char", "void"].includes(coreTokens[0][1])) {
        root.children.push({ val: "Type", children: [{ val: coreTokens[0][1], children: [] }] });
        
        // parse the rest as declaration list or assignment
        let rest = coreTokens.slice(1);
        root.children.push(parseDecl(rest));
    }
    // Check for assignment
    else if (coreTokens.findIndex(t => t[1] === "=") !== -1) {
        root.children.push(parseAssignment(coreTokens));
    }
    // Check for control flow
    else if (["if", "while", "for"].includes(coreTokens[0][1])) {
        let keyword = coreTokens[0][1];
        root.children.push({ val: "Keyword", children: [{ val: keyword, children: [] }] });
        let expr = coreTokens.slice(2, coreTokens.length - 1);
        root.children.push({ val: "Condition", children: [parseExpr(expr)] });
    }
    else if (coreTokens[0][1] === "return") {
        root.children.push({ val: "Keyword", children: [{ val: "return", children: [] }] });
        root.children.push(parseExpr(coreTokens.slice(1)));
    }
    else {
        root.children.push(parseExpr(coreTokens));
    }

    if (hasSemi) {
        root.children.push({ val: "Punct", children: [{ val: ";", children: [] }] });
    }

    return root;
}

function parseDecl(tokens) {
    let eqIdx = tokens.findIndex(t => t[1] === "=");
    if (eqIdx !== -1) {
        let left = tokens.slice(0, eqIdx);
        let right = tokens.slice(eqIdx + 1);
        return {
            val: "Init",
            children: [
                { val: "Id", children: [{ val: left.map(t => t[1]).join(" "), children: [] }] },
                { val: "Op", children: [{ val: "=", children: [] }] },
                parseExpr(right)
            ]
        };
    }
    return { val: "Decl", children: [{ val: "Id", children: [{ val: tokens.map(t=>t[1]).join(" "), children: [] }] }] };
}

function parseAssignment(tokens) {
    let eqIdx = tokens.findIndex(t => t[1] === "=");
    let left = tokens.slice(0, eqIdx);
    let right = tokens.slice(eqIdx + 1);
    return {
        val: "Assign",
        children: [
            { val: "Id", children: [{ val: left.map(t => t[1]).join(" "), children: [] }] },
            { val: "Op", children: [{ val: "=", children: [] }] },
            parseExpr(right)
        ]
    };
}

function parseExpr(tokens) {
    if (!tokens || tokens.length === 0) return { val: "Empty", children: [] };
    if (tokens.length === 1) {
        let type = tokens[0][0] === "NUM" ? "Literal" : "Id";
        return { val: type, children: [{ val: tokens[0][1], children: [] }] };
    }

    // Function call
    if ((tokens[0][0] === "ID" || tokens[0][0] === "KEY") && tokens[1] && tokens[1][1] === "(") {
        return {
            val: "Call",
            children: [
                { val: "Id", children: [{ val: tokens[0][1], children: [] }] },
                { val: "Args", children: [parseExpr(tokens.slice(2, tokens.length - 1))] }
            ]
        };
    }

    const ops = [
        [","],
        ["||"],
        ["&&"],
        ["==", "!=", "<", ">", "<=", ">="],
        ["+", "-"],
        ["*", "/", "%"]
    ];

    let parenCount = 0;
    for (let level of ops) {
        for (let i = tokens.length - 1; i >= 0; i--) {
            let t = tokens[i][1];
            if (t === ")") parenCount++;
            if (t === "(") parenCount--;

            if (parenCount === 0 && level.includes(t)) {
                return {
                    val: "BinExpr",
                    children: [
                        parseExpr(tokens.slice(0, i)),
                        { val: "Op", children: [{ val: t, children: [] }] },
                        parseExpr(tokens.slice(i + 1))
                    ]
                };
            }
        }
    }

    // Strip parens
    if (tokens[0][1] === "(" && tokens[tokens.length - 1][1] === ")") {
        return parseExpr(tokens.slice(1, tokens.length - 1));
    }

    return { val: "Expr", children: [{ val: tokens.map(t => t[1]).join(" "), children: [] }] };
}