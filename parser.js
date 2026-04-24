function check(tokens, lineNo) {

    if (!tokens || tokens.length === 0)
        return `Line ${lineNo}: Empty line`;

    let firstToken = tokens[0];
    let first = firstToken[1];

    // ================= PREPROCESSOR =================
    if (firstToken[0] === "PREPROCESSOR")
        return `Line ${lineNo}: OK`;

    // ================= CONTROL STATEMENTS =================
    if (["if", "while", "for", "else", "return", "switch", "case", "break", "default"].includes(first))
        return `Line ${lineNo}: OK`;

    // ================= FUNCTION DEFINITION =================
    // Example: int main() {
    if (firstToken[0] === "KEY" && tokens.some(t => t[1] === "(")) {
        return `Line ${lineNo}: OK`;
    }

    // ================= FUNCTION CALL =================
    // Example: printf(...);
    if (firstToken[0] === "ID" && tokens.some(t => t[1] === "(")) {
        return `Line ${lineNo}: OK`;
    }

    // ================= BLOCK SYMBOLS =================
    if (["{", "}"].includes(first))
        return `Line ${lineNo}: OK`;

    // ================= DECLARATION =================
    if (firstToken[0] === "KEY") {

        let hasSemicolon = tokens.some(t => t[1] === ";");
        if (!hasSemicolon)
            return `Line ${lineNo}: Missing ';'`;

        let declared = false;

        for (let i = 1; i < tokens.length; i++) {

            if (tokens[i][0] === "ID") {
                declared = true;

                // Optional initialization
                if (tokens[i + 1]?.[1] === "=") {

                    if (!tokens[i + 2] || tokens[i + 2][1] === ";") {
                        return `Line ${lineNo}: Invalid initialization`;
                    }
                }

                addSymbol(tokens[i][1], first, null, lineNo);
            }
        }

        if (!declared)
            return `Line ${lineNo}: No variable declared`;

        return `Line ${lineNo}: OK`;
    }

// ================= ASSIGNMENT =================
if (firstToken[0] === "ID" && !tokens.some(t => t[1] === "(")) {

    let eqIndex = tokens.findIndex(t => t[1] === "=");

    // ✅ DO NOT force '='
    if (eqIndex === -1) {
        return `Line ${lineNo}: OK`;
    }

    // Must end with ;
    if (tokens[tokens.length - 1][1] !== ";")
        return `Line ${lineNo}: Missing ';'`;

    let rhs = tokens.slice(eqIndex + 1, tokens.length - 1);

    if (rhs.length === 0)
        return `Line ${lineNo}: Incomplete assignment`;

    if (rhs[0]?.[1] === ";")
        return `Line ${lineNo}: Missing value in assignment`;

    return `Line ${lineNo}: OK`;
}
    // ================= DEFAULT =================
    return `Line ${lineNo}: OK`;
}