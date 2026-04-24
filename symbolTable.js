"use strict";
let sym = {};

function addSymbol(name, type, value, line) {

    if (sym[name]) {
        return "Redeclaration error";
    }

    sym[name] = {
        type: type,
        value: value,
        line: line
    };

    return "OK";
}

function updateSymbol(name, value) {

    if (!sym[name]) {
        return "Undeclared variable";
    }

    sym[name].value = value;
    return "OK";
}

function getTable() {
    return sym;
}
