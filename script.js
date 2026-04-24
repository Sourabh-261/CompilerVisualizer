// ================= STORE LAST CODE =================
let lastCode = "";

// ================= SYMBOL TABLE =================
function showSymbolTable(sym) {

    let html = `
    <table style="width:100%; border-collapse:collapse;">
        <tr style="color:#38bdf8;">
            <th>Name</th>
            <th>Type</th>
            <th>Value</th>
            <th>Line</th>
        </tr>
    `;

    for (let key in sym) {
        let s = sym[key];

        html += `
        <tr style="text-align:center;">
            <td style="color:#facc15;">${key}</td>
            <td style="color:#a78bfa;">${s.type}</td>
            <td style="color:#4ade80;">${s.value}</td>
            <td style="color:#fb7185;">${s.line}</td>
        </tr>
        `;
    }

    html += "</table>";

    document.getElementById("symbols").innerHTML = html;
}

// ================= MAIN RUN =================
function runCompiler(mode) {

    let code = document.getElementById("code").value;

    // ✅ Save last entered code
    if (mode !== "clear" && mode !== "reset") {
        lastCode = code;
    }

    try {

        let r = compileFull(code);

        // ================= HIDE ALL =================
        document.getElementById("tokens").style.display = "none";
        document.getElementById("symbols").style.display = "none";
        document.getElementById("errors").style.display = "none";
        document.getElementById("tac").style.display = "none";
        document.getElementById("tree").style.display = "none";
        document.getElementById("cfg").style.display = "none";

        // ================= CLEAR OUTPUT =================
        document.querySelector("#tokens tbody").innerHTML = "";
        document.getElementById("symbols").innerHTML = "";
        document.getElementById("errors").innerHTML = "";
        document.getElementById("tac").innerHTML = "";

        let ctxTree = document.getElementById("tree").getContext("2d");
        ctxTree.clearRect(0, 0, 400, 200);

        let ctxCfg = document.getElementById("cfg").getContext("2d");
        ctxCfg.clearRect(0, 0, 1450, 5000);

        // ================= MODES =================
        if (mode === "tokens") {
            document.getElementById("tokens").style.display = "table";
            showTokens(r.tokens);
        }

        else if (mode === "symbols") {
            document.getElementById("symbols").style.display = "block";
            showSymbolTable(r.symbols);
        }

        else if (mode === "errors") {
            document.getElementById("errors").style.display = "block";

            document.getElementById("errors").innerHTML =
                r.messages.map(m =>
                    m.includes("OK")
                        ? `<span style="color:#4ade80;">✔ ${m}</span>`
                        : `<span style="color:#f87171;">❌ ${m}</span>`
                ).join("<br><br>");
        }

        else if (mode === "tree") {
            document.getElementById("tree").style.display = "block";
            drawTree(r.tree);
        }

        else if (mode === "cfg") {
            document.getElementById("cfg").style.display = "block";
            drawCFG(r.tac);
        }

        else if (mode === "tac") {
            document.getElementById("tac").style.display = "block";
            showTAC(r.tac);
        }

        // ================= RESET =================
        else if (mode === "reset") {

            // ✅ Empty editor
            document.getElementById("code").value = "";

            // clear outputs
            document.querySelector("#tokens tbody").innerHTML = "";
            document.getElementById("symbols").innerHTML = "";
            document.getElementById("errors").innerHTML = "";
            document.getElementById("tac").innerHTML = "";
            ctxTree.clearRect(0, 0, 400, 200);
            ctxCfg.clearRect(0, 0, 1450, 5000);
        }

        // ================= CLEAR =================
        else if (mode === "clear") {

            // ✅ Restore last entered code
            document.getElementById("code").value = lastCode;
        }

    } catch (e) {
        console.error(e);
        alert("Error: " + e.message);
    }
}

// ================= TAC =================
function showTAC(tac) {

    let html = `
    <div style="text-align: center;">
        <h3 style="color:#38bdf8;">⚡ Three Address Code</h3>
        <div style="font-family:Consolas; line-height:1.8; display: inline-block; text-align: left;">
    `;

    tac.forEach(line => {

        if (line.includes(":")) {
            html += `<div style="color:#facc15;">${line}</div>`;
        }
        else if (line.startsWith("ifFalse")) {
            html += `<div style="color:#f87171;">${line}</div>`;
        }
        else if (line.startsWith("goto")) {
            html += `<div style="color:#a78bfa;">${line}</div>`;
        }
        else if (line.startsWith("return")) {
            html += `<div style="color:#22c55e;">${line}</div>`;
        }
        else {
            let parts = line.split("=");
            html += `
                <div>
                    <span style="color:#38bdf8;">${parts[0].trim()}</span>
                    <span style="color:#e5e7eb;"> = </span>
                    <span style="color:#4ade80;">${parts[1]?.trim() || ""}</span>
                </div>
            `;
        }
    });

    html += `</div></div>`;
    document.getElementById("tac").innerHTML = html;
}

// ================= ACTIVE BUTTON =================
function setActive(btn) {

    let buttons = document.querySelectorAll(".btn-container button");

    buttons.forEach(b => b.classList.remove("active"));

    btn.classList.add("active");
}

// ================= CLEAR BUTTON =================
function clearAll(btn) {

    runCompiler("clear");

    let buttons = document.querySelectorAll(".btn-container button");
    buttons.forEach(b => b.classList.remove("active"));
}

// ================= RESET BUTTON =================
function resetCode(btn) {

    runCompiler("reset");

    let buttons = document.querySelectorAll(".btn-container button");
    buttons.forEach(b => b.classList.remove("active"));
}