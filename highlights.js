"use strict";
// 🎨 COLOR MAPPING
function getColor(type){

    if(type === "KEY") return "#569cd6";
    if(type === "ID") return "#9cdcfe";
    if(type === "NUM") return "#b5cea8";
    if(type === "STRING") return "#ce9178";
    if(type === "CHAR") return "#d7ba7d";
    if(type === "OP") return "#d4d4d4";
    if(type === "SYM") return "#d4d4d4";
    if(type === "PREPROCESSOR") return "#c586c0";

    return "#ff5555"; // INVALID
}


// 🔥 GROUP TOKENS
function groupTokens(tokens){

    let grouped = {};

    for(let t of tokens){

        let type = t.type;
        let value = t.value;

        if(!grouped[type]){
            grouped[type] = new Set();
        }

        grouped[type].add(value);
    }

    return grouped;
}


// 🔥 DISPLAY TOKENS TABLE
function showTokens(tokens){

    let grouped = groupTokens(tokens);
    let tbody = document.querySelector("#tokens tbody");

    tbody.innerHTML = "";

    for(let type in grouped){

        let values = [...grouped[type]].sort();
        let color = getColor(type);

        let row = document.createElement("tr");

        row.innerHTML = `
            <td>-</td>
            <td style="color:${color}; font-weight:bold">${type}</td>
            <td style="color:${color}">
                ${values.join(", ")} (${values.length})
            </td>
        `;

        tbody.appendChild(row);
    }
}
