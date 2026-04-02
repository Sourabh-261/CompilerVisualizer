function showSymbolTable(sym) {

    let out = "Name\tType\tValue\tLine\n";
    out += "--------------------------------\n";

    for (let key in sym) {
        let s = sym[key];
        out += `${key}\t${s.type}\t${s.value}\t${s.line}\n`;
    }

    document.getElementById("symbols").textContent = out;
}

function runCompiler() {

    let code = document.getElementById("code").value;

    try {

        let r = compileFull(code);

        showTokens(r.tokens);

        showSymbolTable(r.symbols);

        document.getElementById("errors").textContent =
            r.messages.join("\n");

        drawTree(r.tree);
        drawDFA();

    } catch (e) {
        alert("Error: " + e.message);
    }
}