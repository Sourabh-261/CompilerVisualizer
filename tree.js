"use strict";

function makeTree(tokens) {
    if(!tokens || tokens.length === 0) return null;
    return tokens.map(t => t[1]);
}