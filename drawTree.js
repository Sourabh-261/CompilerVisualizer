function getTreeColor(token) {

    if (token === "int" || token === "float")
        return "#569cd6";

    if (/^[0-9]+$/.test(token))
        return "#b5cea8";

    if (token === "=" || token === ";")
        return "#d4d4d4";

    return "#9cdcfe"; 
}

function drawTree(tree) {

    let c = document.getElementById("tree");
    let ctx = c.getContext("2d");

    ctx.clearRect(0, 0, 400, 200);

    ctx.font = "14px Consolas";

    let y = 30;

    for (let line of tree) {

        let x = 10;

        if (!Array.isArray(line))
            line = [line];

        for (let t of line) {

            ctx.fillStyle = getTreeColor(t); // 🎨 apply color
            ctx.fillText(t, x, y);

            x += 50; // spacing
        }

        y += 30;
    }
}