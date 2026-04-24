"use strict";
function generateTAC(tokens) {

    let tac = [];
    let tempCount = 1;
    let labelCount = 1;

    function newTemp() {
        return "t" + tempCount++;
    }

    function newLabel() {
        return "L" + labelCount++;
    }

    // ================= CONSTANT FOLDING =================
    function fold(a, op, b) {
        if (!isNaN(a) && !isNaN(b)) {
            a = Number(a);
            b = Number(b);

            switch (op) {
                case "+": return a + b;
                case "-": return a - b;
                case "*": return a * b;
                case "/": return a / b;
            }
        }
        return null;
    }

    // ================= EXPRESSION =================
    function evalExpr(expr) {

        let stack = [];
        let ops = [];

        let prec = {
            "||": 0, "&&": 1,
            "==": 2, "!=": 2,
            "<": 3, ">": 3, "<=": 3, ">=": 3,
            "+": 4, "-": 4,
            "*": 5, "/": 5
        };

        function process(op) {
            let b = stack.pop();
            let a = stack.pop();

            // Handle unary operators (e.g. -5)
            if (a === undefined && b !== undefined) {
                let t = newTemp();
                tac.push(`${t} = ${op}${b}`);
                stack.push(t);
                return;
            }

            if (!a || !b) return;

            let folded = fold(a, op, b);

            if (folded !== null) {
                stack.push(folded);
            } else {
                let t = newTemp();
                tac.push(`${t} = ${a} ${op} ${b}`);
                stack.push(t);
            }
        }

        expr.forEach(token => {

            if (!token) return;

            let v = token.value;

            // ✅ IGNORE BAD TOKENS
            if (v === "," || v === "{" || v === "}") return;

            if (token.type === "ID" || token.type === "NUM" || token.type === "STRING" || token.type === "CHAR") {
                stack.push(v);
            }
            else if (v === "(") ops.push(v);
            else if (v === ")") {
                while (ops.length && ops.at(-1) !== "(") {
                    process(ops.pop());
                }
                ops.pop();
            }
            else {
                while (ops.length && prec[ops.at(-1)] >= prec[v]) {
                    process(ops.pop());
                }
                ops.push(v);
            }
        });

        while (ops.length) process(ops.pop());

        return stack.pop();
    }

    // ================= FUNCTION CALL =================
    function handleCall(stmt) {

        let fname = stmt[0].value;

        let args = [];
        let inside = stmt.slice(
            stmt.findIndex(t => t.value === "(") + 1,
            stmt.findIndex(t => t.value === ")")
        );

        let curr = [];

        inside.forEach(t => {
            if (t.value === ",") {
                if (curr.length) args.push(curr);
                curr = [];
            } else curr.push(t);
        });

        if (curr.length) args.push(curr);

        args.forEach(a => {
            let val = evalExpr(a);
            tac.push(`param ${val}`);
        });

        let t = newTemp();
        tac.push(`${t} = call ${fname}, ${args.length}`);
        return t;
    }

    // ================= STATEMENT =================
    function handleStatement(stmt) {

        if (!stmt || stmt.length === 0) return;

        // RETURN
        if (stmt[0]?.value === "return") {
            let val = evalExpr(stmt.slice(1));
            tac.push(`return ${val}`);
            return;
        }

        // FUNCTION CALL
        let isFunc = (stmt[0]?.type === "ID" || stmt[0]?.value === "printf" || stmt[0]?.value === "scanf");
        if (isFunc && stmt.some(t => t.value === "(")) {
            handleCall(stmt);
            return;
        }

        // INCREMENT / DECREMENT
        if (stmt.length >= 2 && stmt[0]?.type === "ID" && (stmt[1]?.value === "++" || stmt[1]?.value === "--")) {
            let op = stmt[1].value === "++" ? "+" : "-";
            tac.push(`${stmt[0].value} = ${stmt[0].value} ${op} 1`);
            return;
        }

        // ASSIGNMENT
        let eq = stmt.findIndex(t => t.value === "=");

        if (eq === -1) return;

        let left = stmt[eq - 1]?.value;
        let val = evalExpr(stmt.slice(eq + 1));

        if (val !== undefined) {
            tac.push(`${left} = ${val}`);
        }
    }

    // ================= SPLIT STATEMENTS =================
    let stmts = [];
    let curr = [];
    let inParen = 0;

    tokens.forEach(t => {

        // ❌ ignore blocks
        if (t.value === "{" || t.value === "}") return;

        if (t.value === "(") inParen++;
        if (t.value === ")") inParen--;

        if (t.value === ";" && inParen === 0) {
            if (curr.length) stmts.push(curr);
            curr = [];
        }
        else if (t.value === "else" && inParen === 0) {
            if (curr.length) stmts.push(curr);
            stmts.push([t]);
            curr = [];
        }
        else {
            curr.push(t);
        }
    });

    if (curr.length) stmts.push(curr);

    // ================= MAIN =================
    for (let i = 0; i < stmts.length; i++) {

        let s = stmts[i];
        if (!s.length) continue;

        // ===== IF =====
        if (s[0].value === "if") {

            let cond = s.slice(
                s.findIndex(t => t.value === "(") + 1,
                s.findIndex(t => t.value === ")")
            );

            let res = evalExpr(cond);

            let L1 = newLabel();
            let L2 = newLabel();

            tac.push(`ifFalse ${res} goto ${L1}`);

            handleStatement(stmts[++i]);

            tac.push(`goto ${L2}`);
            tac.push(`${L1}:`);

            // ✅ SAFE ELSE
            if (stmts[i + 1]?.[0]?.value === "else") {

                let elseStmt = stmts[i + 2];

                if (elseStmt) {
                    handleStatement(elseStmt);
                }

                i += 2;
            }

            tac.push(`${L2}:`);
        }

        // ===== WHILE =====
        else if (s[0].value === "while") {

            let start = newLabel();
            let end = newLabel();

            tac.push(`${start}:`);

            let cond = evalExpr(
                s.slice(
                    s.findIndex(t => t.value === "(") + 1,
                    s.lastIndexOf(t => t.value === ")") !== -1 ? s.lastIndexOf(t => t.value === ")") : s.length
                )
            );

            tac.push(`ifFalse ${cond} goto ${end}`);

            handleStatement(stmts[++i]);

            tac.push(`goto ${start}`);
            tac.push(`${end}:`);
        }

        // ===== FOR =====
        else if (s[0].value === "for") {
            let firstSemi = s.findIndex(t => t.value === ";");
            let secondSemi = s.findIndex((t, idx) => t.value === ";" && idx > firstSemi);
            
            if (firstSemi !== -1 && secondSemi !== -1) {
                let init = s.slice(2, firstSemi);
                let cond = s.slice(firstSemi + 1, secondSemi);
                let inc = s.slice(secondSemi + 1, s.length - 1);
                
                handleStatement(init);
                
                let start = newLabel();
                let end = newLabel();
                
                tac.push(`${start}:`);
                
                let condRes = evalExpr(cond);
                tac.push(`ifFalse ${condRes} goto ${end}`);
                
                handleStatement(stmts[++i]);
                handleStatement(inc);
                
                tac.push(`goto ${start}`);
                tac.push(`${end}:`);
            } else {
                // Malformed for loop fallback
                handleStatement(stmts[++i]);
            }
        }

        // ===== NORMAL =====
        else {
            handleStatement(s);
        }
    }

    return tac;
}
