// 🎯 DRAW NODE
function drawNode(ctx, text, x, y) {

    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#38bdf8";

    ctx.beginPath();
    ctx.roundRect(x - 35, y - 18, 70, 36, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#e2e8f0";
    ctx.fillText(text, x, y);
}


// 🎯 DRAW LINE
function drawLine(ctx, x1, y1, x2, y2) {

    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}


// 🌳 MAIN TREE DRAWER
function drawTree(tree) {

    let canvas = document.getElementById("tree");

    if (!canvas) return;

    let ctx = canvas.getContext("2d");

    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = "13px Consolas";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let startY = 60;
    let gapY = 90;

    let prevLevelNodes = [];

    tree.forEach((line, i) => {

        if (!Array.isArray(line)) line = [line];

        let nodeCount = line.length;

        // dynamic spacing
        let gapX = canvas.width / (nodeCount + 1);
        let y = startY + i * gapY;

        let currentLevelNodes = [];

        line.forEach((token, j) => {

            let x = gapX * (j + 1);

            drawNode(ctx, token, x, y);

            currentLevelNodes.push({ x, y });
        });

        // ✅ BETTER CONNECTION LOGIC
        if (i > 0 && prevLevelNodes.length > 0) {

            currentLevelNodes.forEach((child, index) => {

                // map child to nearest parent
                let parentIndex = Math.floor(index * prevLevelNodes.length / currentLevelNodes.length);
                let parent = prevLevelNodes[parentIndex];

                if (parent) {
                    drawLine(ctx, parent.x, parent.y + 18, child.x, child.y - 18);
                }
            });
        }

        prevLevelNodes = currentLevelNodes;
    });
}