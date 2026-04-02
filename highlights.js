function getColor(type) {

    if (type === "KEY") return "#569cd6";   // blue
    if (type === "ID") return "#9cdcfe";    // light blue
    if (type === "NUM") return "#b5cea8";   // green
    if (type === "OP") return "#d4d4d4";    // white
    if (type === "SYM") return "#d4d4d4";   // white

    return "#ff5555"; // error
}

function showTokens(allTokens) {

    let table = document.getElementById("tokens");
    let tbody = table.querySelector("tbody");

    tbody.innerHTML = "";

    for (let i = 0; i < allTokens.length; i++) {

        let lineTokens = allTokens[i];

        for (let t of lineTokens) {

            let row = document.createElement("tr");

            let col1 = document.createElement("td");
            col1.textContent = i + 1;

            let col2 = document.createElement("td");
            col2.textContent = t[0];
            col2.style.color = getColor(t[0]);

            let col3 = document.createElement("td");
            col3.textContent = t[1];
            col3.style.color = getColor(t[0]);

            row.appendChild(col1);
            row.appendChild(col2);
            row.appendChild(col3);

            tbody.appendChild(row);
        }
    }
}