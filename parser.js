function check(tokens, lineNo) {

    if (tokens.length < 4)
        return "Invalid";

    let type = tokens[0][1];
    let id = tokens[1][1];
    let value = tokens[3][1];

    if (tokens[1][0] !== "ID")
        return "ID error";

    if (tokens[2][1] !== "=")
        return "= error";

    if (tokens[tokens.length - 1][1] !== ";")
        return "; missing";

    let result = addSymbol(id, type, value, lineNo);

    return result === "OK" ? "OK" : result;
}