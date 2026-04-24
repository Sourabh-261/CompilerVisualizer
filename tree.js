"use strict";

function makeTree(tokens) {
    if (!tokens || tokens.length === 0) return null;

    // Remove semicolons and braces
    tokens = tokens.filter(t => t[1] !== ";" && t[1] !== "{" && t[1] !== "}");
    if (tokens.length === 0) return null;

    // Very basic AST builder for simple statements

    // Check for assignment: ID = expr
    let eqIdx = tokens.findIndex(t => t[1] === "=");
    if (eqIdx !== -1) {
        let left = tokens.slice(0, eqIdx);
        let right = tokens.slice(eqIdx + 1);
        return {
            val: "=",
            children: [
                { val: left.map(t => t[1]).join(" "), children: [] },
                parseExpr(right)
            ]
        };
    }

    // Check for control flow: if/while/for ( expr )
    if (tokens[0][1] === "if" || tokens[0][1] === "while" || tokens[0][1] === "for") {
        let keyword = tokens[0][1];
        let expr = tokens.slice(2, tokens.length - 1); // inside ( )
        return {
            val: keyword,
            children: [parseExpr(expr)]
        };
    }

    // Check for return
    if (tokens[0][1] === "return") {
        return {
            val: "return",
            children: [parseExpr(tokens.slice(1))]
        };
    }

    // Check for function call: printf ( expr )
    if ((tokens[0][0] === "ID" || tokens[0][0] === "KEY") && tokens[1] && tokens[1][1] === "(") {
        return {
            val: tokens[0][1] + "()",
            children: [parseExpr(tokens.slice(2, tokens.length - 1))]
        };
    }

    // Default expression fallback
    return parseExpr(tokens);
}

// Simple recursive expression parser for binary operators
function parseExpr(tokens) {
    if (!tokens || tokens.length === 0) return { val: "empty", children: [] };
    if (tokens.length === 1) return { val: tokens[0][1], children: [] };

    // Precedence: lowest to highest
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
        // search backwards to make left-associative
        for (let i = tokens.length - 1; i >= 0; i--) {
            let t = tokens[i][1];
            if (t === ")") parenCount++;
            if (t === "(") parenCount--;

            if (parenCount === 0 && level.includes(t)) {
                return {
                    val: t,
                    children: [
                        parseExpr(tokens.slice(0, i)),
                        parseExpr(tokens.slice(i + 1))
                    ]
                };
            }
        }
    }

    // Strip parens if wrapped completely
    if (tokens[0][1] === "(" && tokens[tokens.length - 1][1] === ")") {
        return parseExpr(tokens.slice(1, tokens.length - 1));
    }

    // ++ / --
    if (tokens.length === 2 && (tokens[1][1] === "++" || tokens[1][1] === "--")) {
        return { val: tokens[1][1], children: [{ val: tokens[0][1], children: [] }] };
    }

    // fallback
    return { val: tokens.map(t => t[1]).join(" "), children: [] };
}