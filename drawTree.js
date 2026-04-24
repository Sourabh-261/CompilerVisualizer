"use strict";

// 🎯 DRAW NODE
function drawNode(ctx, text, x, y) {
    if (text === undefined || text === null) text = "undefined";
    text = String(text); // Ensure it's a string

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

    // Filter out null/empty trees
    let validTrees = trees.filter(t => t !== null && typeof t === "object");
    if (validTrees.length === 0) return;

    // Create a unified Program root to interconnect everything
    let root = {
        val: "Program",
        children: validTrees
    };

    // 1. Assign Y coordinates based on depth
    let gapY = 80;
    assignY(root, 60, gapY);

    // 2. Assign X coordinates based on leaf spacing
    let leafSpacing = 120; // Tighten spacing to fix "blank space"
    let nextLeafX = 0;

    function assignX(node) {
        if (!node) return;
        if (!node.children || node.children.length === 0) {
            node.x = nextLeafX;
            nextLeafX += leafSpacing;
        } else {
            for (let child of node.children) {
                assignX(child);
            }
            let first = node.children[0].x;
            let last = node.children[node.children.length - 1].x;
            node.x = (first + last) / 2;
        }
    }

    assignX(root);

    // Dynamic canvas resize for wide trees
    let requiredWidth = Math.max(1400, nextLeafX + 200);
    if (canvas.width < requiredWidth) {
        canvas.width = requiredWidth;
        // Re-apply context settings after resizing clears them
        ctx.font = "14px Consolas";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
    }

    // 3. Center the entire tree on the canvas
    let shiftX = (canvas.width / 2) - root.x;
    function applyShift(node) {
        if (!node) return;
        node.x += shiftX;
        if (node.children) {
            for (let c of node.children) applyShift(c);
        }
    }
    applyShift(root);

    // 4. Draw lines (first pass)
    function drawAllLines(node) {
        if (!node || !node.children) return;
        for (let child of node.children) {
            if (child) {
                drawLine(ctx, node.x, node.y + 18, child.x, child.y - 18);
                drawAllLines(child);
            }
        }
    }
    drawAllLines(root);

    // 5. Draw nodes (second pass)
    function drawAllNodes(node) {
        if (!node) return;
        drawNode(ctx, node.val, node.x, node.y);
        if (node.children) {
            for (let child of node.children) {
                drawAllNodes(child);
            }
        }
    }
    drawAllNodes(root);
}

function assignY(node, currentY, gapY) {
    if (!node) return;
    node.y = currentY;
    if (node.children) {
        for (let child of node.children) {
            assignY(child, currentY + gapY, gapY);
        }
    }
}