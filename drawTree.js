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

    // Filter out null/empty lines
    let validLines = trees.filter(t => t !== null && t.length > 0);

    let currentY = startY;
    let coords = [];

    // First pass: calculate coordinates
    for (let i = 0; i < validLines.length; i++) {
        let tokens = validLines[i];
        let lineCoords = [];

        let tokenCount = tokens.length;

        // Calculate total width based on number of tokens to space them nicely
        let spacing = Math.min(120, (canvas.width - 100) / Math.max(1, tokenCount));

        let startX = (canvas.width / 2) - (spacing * (tokenCount - 1) / 2);

        for (let j = 0; j < tokenCount; j++) {
            let childX = startX + (spacing * j);
            let childY = currentY;
            lineCoords.push({ x: childX, y: childY });
        }
        coords.push(lineCoords);
        currentY += gapY;
    }

    // Second pass: draw lines FIRST so they are behind nodes
    for (let i = 1; i < validLines.length; i++) {
        let parentNode = coords[i - 1][0];
        let children = coords[i];

        for (let child of children) {
            drawLine(ctx, parentNode.x, parentNode.y + 18, child.x, child.y - 18);
        }
    }

    // Third pass: draw the actual nodes
    for (let i = 0; i < validLines.length; i++) {
        let tokens = validLines[i];
        let lineCoords = coords[i];

        for (let j = 0; j < tokens.length; j++) {
            drawNode(ctx, tokens[j], lineCoords[j].x, lineCoords[j].y);
        }
    }
}