function drawCFG(tac) {
    let canvas = document.getElementById("cfg");
    if (!canvas) return;
    let ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!tac || tac.length === 0) {
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "20px Consolas";
        ctx.fillText("No TAC generated.", canvas.width / 2 - 100, 100);
        return;
    }

    // ================= 1. IDENTIFY LEADERS & BLOCKS =================
    let leaders = new Set();
    leaders.add(0);

    for (let i = 0; i < tac.length; i++) {
        let line = tac[i];
        if (line.includes("goto")) {
            let parts = line.split(" ");
            let label = parts[parts.length - 1];
            let targetIdx = tac.findIndex(t => t === label + ":");
            if (targetIdx !== -1) leaders.add(targetIdx);
            if (i + 1 < tac.length) leaders.add(i + 1);
        } else if (line.startsWith("return")) {
            if (i + 1 < tac.length) leaders.add(i + 1);
        }
    }

    let sortedLeaders = Array.from(leaders).sort((a, b) => a - b);
    let blocks = [];

    for (let i = 0; i < sortedLeaders.length; i++) {
        let start = sortedLeaders[i];
        let end = i + 1 < sortedLeaders.length ? sortedLeaders[i + 1] : tac.length;
        blocks.push({
            id: i,
            lines: tac.slice(start, end),
            successors: [],
            trueBranch: null,
            falseBranch: null
        });
    }

    // ================= 2. CONSTRUCT EDGES =================
    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i];
        let lastLine = block.lines[block.lines.length - 1];
        
        let targetLabel = null;
        let isIf = false;
        let isUnconditional = false;

        if (lastLine.startsWith("ifFalse")) {
            isIf = true;
            let parts = lastLine.split(" ");
            targetLabel = parts[parts.length - 1];
        } else if (lastLine.startsWith("goto")) {
            isUnconditional = true;
            let parts = lastLine.split(" ");
            targetLabel = parts[parts.length - 1];
        } else if (lastLine.startsWith("return")) {
            continue; // Terminal node
        }

        if (targetLabel) {
            let targetBlock = blocks.find(b => b.lines[0] === targetLabel + ":");
            if (targetBlock) {
                if (isIf) block.falseBranch = targetBlock;
                else block.successors.push(targetBlock);
            }
        }

        if (!isUnconditional && i + 1 < blocks.length) {
            if (isIf) block.trueBranch = blocks[i + 1];
            else block.successors.push(blocks[i + 1]);
        }
    }

    // ================= 3. LAYOUT =================
    let yPos = 60;
    ctx.font = "14px Consolas";

    blocks.forEach(b => {
        b.width = Math.max(150, ...b.lines.map(l => ctx.measureText(l).width + 40));
        b.height = b.lines.length * 22 + 20;
        b.x = canvas.width / 2 - b.width / 2;
        b.y = yPos;
        yPos += b.height + 60; // Vertical gap
    });

    // ================= 4. DRAW EDGES =================
    function drawArrow(x1, y1, x2, y2, color, label = "") {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        // If it's a straight line down
        if (Math.abs(x1 - x2) < 10 && y2 > y1) {
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            
            // Arrowhead
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(x2 - 5, y2 - 10);
            ctx.lineTo(x2 + 5, y2 - 10);
            ctx.fill();

            if (label) {
                ctx.fillText(label, x1 + 10, (y1 + y2) / 2);
            }
        } else {
            // Curved routing for jumps
            ctx.moveTo(x1, y1);
            let ctrlX = x1 + (y2 < y1 ? -200 : 200); // Loop left for back-edges, right for forward jumps
            
            if (label === "True") ctrlX = x1 + 150;
            if (label === "False") ctrlX = x1 - 150;

            ctx.bezierCurveTo(ctrlX, y1 + 20, ctrlX, y2 - 20, x2, y2);
            ctx.stroke();
            
            // Arrowhead (approximate on curve end)
            ctx.beginPath();
            ctx.arc(x2, y2, 4, 0, Math.PI * 2);
            ctx.fill();

            if (label) {
                ctx.fillText(label, ctrlX + (label === "False" ? -40 : 10), (y1 + y2) / 2);
            }
        }
    }

    blocks.forEach(b => {
        let startX = b.x + b.width / 2;
        let startY = b.y + b.height;

        // Normal successor
        b.successors.forEach(succ => {
            let endX = succ.x + succ.width / 2;
            let endY = succ.y;
            drawArrow(startX, startY, endX, endY, "#94a3b8"); // Gray
        });

        // True branch
        if (b.trueBranch) {
            let endX = b.trueBranch.x + b.trueBranch.width / 2;
            let endY = b.trueBranch.y;
            drawArrow(startX + 20, startY, endX, endY, "#4ade80", "True"); // Green
        }

        // False branch
        if (b.falseBranch) {
            let endX = b.falseBranch.x + b.falseBranch.width / 2;
            let endY = b.falseBranch.y;
            drawArrow(startX - 20, startY, endX, endY, "#f87171", "False"); // Red
        }
    });

    // ================= 5. DRAW BLOCKS =================
    blocks.forEach(b => {
        // Draw shadow/glow
        ctx.shadowColor = "rgba(56, 189, 248, 0.2)";
        ctx.shadowBlur = 15;
        
        // Draw box
        ctx.fillStyle = "#1e293b"; // Dark slate
        ctx.strokeStyle = "#38bdf8"; // Light blue border
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.width, b.height, 8);
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0; // Reset shadow for text

        // Draw text
        ctx.fillStyle = "#e2e8f0"; // Light gray text
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        
        b.lines.forEach((line, idx) => {
            // Colorize specific parts of TAC
            if (line.includes(":")) ctx.fillStyle = "#facc15"; // Yellow for labels
            else if (line.startsWith("ifFalse")) ctx.fillStyle = "#f87171"; // Red for conditions
            else if (line.startsWith("goto")) ctx.fillStyle = "#a78bfa"; // Purple for gotos
            else if (line.startsWith("return")) ctx.fillStyle = "#4ade80"; // Green for returns
            else ctx.fillStyle = "#e2e8f0";

            ctx.fillText(line, b.x + 20, b.y + 10 + idx * 22);
        });
    });
}