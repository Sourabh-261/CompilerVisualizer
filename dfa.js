function isIdentifier(w) {

    if (!/[a-zA-Z]/.test(w[0]))
        return false;

    for (let c of w) {
        if (!/[a-zA-Z0-9]/.test(c))
            return false;
    }

    return true;
}

function isNumber(w) {

    for (let c of w) {
        if (!/[0-9]/.test(c))
            return false;
    }

    return true;
}