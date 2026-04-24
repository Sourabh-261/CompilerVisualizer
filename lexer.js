"use strict";
const keywords = [
    "int","float","double","char","bool",
    "if","else","while","for","return",
    "true","false","printf","scanf"
];

const operators = [
    "+","-","*","/","%","=",
    "==","!=","<",">","<=",">=",
    "&&","||","!","++","--",
    "+=","-=","*=","/="
];

const symbols = [";",",","(",")","{","}","[","]"];

function isIdentifier(w){
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(w);
}

function isNumber(w){
    return /^[0-9]+(\.[0-9]+)?$/.test(w);
}

function tokenize(line){

    // ✅ HANDLE #include
    if(line.trim().startsWith("#include")){
        return [{ type: "PREPROCESSOR", value: line.trim() }];
    }

    // remove comments
    line = line.replace(/\/\/.*$/, "");
    line = line.replace(/\/\*.*?\*\//g, "");

    let words = line.match(
        /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'|[a-zA-Z_][a-zA-Z0-9_]*|\d+\.\d+|\d+|==|!=|<=|>=|\+\+|--|\+=|-=|\*=|\/=|&&|\|\||[+\-*/%=<>!;,()[\]{}]/g
    ) || [];

    let tokens = [];

    for(let w of words){

        let type = "";

        if(keywords.includes(w)) type = "KEY";
        else if(operators.includes(w)) type = "OP";
        else if(symbols.includes(w)) type = "SYM";
        else if(/^".*"$/.test(w)) type = "STRING";
        else if(/^'.*'$/.test(w)) type = "CHAR";
        else if(isNumber(w)) type = "NUM";
        else if(isIdentifier(w)) type = "ID";
        else type = "INVALID";

        tokens.push({ type: type, value: w }); // ✅ FIXED
    }

    return tokens;
}
