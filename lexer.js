const keywords = ["int", "float"];
const operators = ["="];
const symbols = [";"];

function tokenize(line) {

    let words = line.match(/[a-zA-Z]+|[0-9]+|=|;/g) || [];

    let t = [];

    for (let w of words) {

        if (keywords.includes(w))
            t.push(["KEY", w]);

        else if (operators.includes(w))
            t.push(["OP", w]);

        else if (symbols.includes(w))
            t.push(["SYM", w]);

        else if (isNumber(w))
            t.push(["NUM", w]);

        else if (isIdentifier(w))
            t.push(["ID", w]);

        else
            t.push(["INVALID", w]);
    }

    return t;
}