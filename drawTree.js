"use strict";

// 🎯 DRAW NODE
function drawNode(ctx, text, x, y) {
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#38bdf8";

    // Dynamic width based on text length
    let width = Math.max(70, ctx.measureText(text).width + 30);

    ctx.beginPath();
    ctx.roundRect(x - width / 2, y - 18, width, 36, 10);
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
function drawTree(trees) {
    let canvas = document.getElementById("tree");
    if (!canvas) return;

    let ctx = canvas.getContext("2d");

    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = "14px Consolas";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let startY = 60;
    let gapY = 80;

    // Filter out null/empty trees
    trees = trees.filter(t => t !== null);

    let currentY = startY;
    let prevY = null;

    for (let root of trees) {
        let depth = getDepth(root);

        // Base offset depends on depth to prevent overlap at lower levels
        let initialOffset = Math.pow(2, depth - 1) * 35;

        // Draw sequence line between tree segments
        if (prevY !== null) {
            ctx.strokeStyle = "#4ade80"; // Neon green for program flow
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, prevY + 18);
            ctx.lineTo(canvas.width / 2, currentY - 18);
            ctx.stroke();
            ctx.setLineDash([]); // reset dash for normal child lines
        }

        // Draw this statement's tree
        drawHierarchical(ctx, root, canvas.width / 2, currentY, initialOffset, gapY);

        prevY = currentY;

        // Move down for the next statement
        currentY += (depth * gapY) + 60;
    }
}

function getDepth(node) {
    if (!node) return 0;
    if (!node.children || node.children.length === 0) return 1;
    return 1 + Math.max(...node.children.map(getDepth));
}

function drawHierarchical(ctx, node, x, y, offset, gapY) {
    if (!node) return;

    if (node.children && node.children.length > 0) {
        let childCount = node.children.length;

        // Calculate starting X for children so they are centered around parent
        let startX = x - (offset * (childCount - 1) / 2);

        for (let i = 0; i < childCount; i++) {
            let childX = startX + (offset * i);
            let childY = y + gapY;

            // Draw line to child
            drawLine(ctx, x, y + 18, childX, childY - 18);

            // Recurse (reduce offset for deeper levels)
            drawHierarchical(ctx, node.children[i], childX, childY, offset / 1.8, gapY);
        }
    }

    // Draw the node on top of lines
    drawNode(ctx, node.val, x, y);
}
