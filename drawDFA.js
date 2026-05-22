"use strict";

// ============================================
// DFA Visualizer (Canvas Renderer)
// ============================================

/**
 * Draw all unique DFA diagrams for the given tokens.
 * Each token is simulated through its matching DFA, and the
 * state diagram is rendered with the traversal path highlighted.
 */
function drawDFAForTokens(tokens) {
    let canvas = document.getElementById("dfaCanvas");
    if (!canvas) return;

    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!tokens || tokens.length === 0) {
        ctx.fillStyle = "#94a3b8";
        ctx.font = "20px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("No tokens to visualize.", canvas.width / 2, 60);
        return;
    }

    // Deduplicate: show one diagram per unique (DFA, token value)
    let seen = new Set();
    let entries = [];

    for (let tok of tokens) {
        let dfa = getDFAForTokenInternal(tok);
        if (!dfa) continue;
        let key = dfa.name + ":" + tok.value;
        if (seen.has(key)) continue;
        seen.add(key);

        let sim = simulateDFA(dfa, tok.value);
        entries.push({ dfa, token: tok, sim });
    }

    if (entries.length === 0) return;

    // Layout constants
    const DIAGRAM_W = 700;
    const DIAGRAM_H = 340;
    const COLS = 2;
    const PAD_X = 30;
    const PAD_Y = 30;
    const START_Y = 20;

    let rows = Math.ceil(entries.length / COLS);
    let requiredH = START_Y + rows * (DIAGRAM_H + PAD_Y) + 40;
    let requiredW = Math.max(1400, COLS * (DIAGRAM_W + PAD_X) + PAD_X * 2);

    canvas.width = requiredW;
    canvas.height = Math.max(800, requiredH);

    // Re-apply after resize
    ctx = canvas.getContext("2d");
    ctx.textBaseline = "middle";

    entries.forEach((entry, idx) => {
        let col = idx % COLS;
        let row = Math.floor(idx / COLS);
        let offsetX = PAD_X + col * (DIAGRAM_W + PAD_X);
        let offsetY = START_Y + row * (DIAGRAM_H + PAD_Y);

        drawSingleDFA(ctx, entry.dfa, entry.token, entry.sim, offsetX, offsetY, DIAGRAM_W, DIAGRAM_H);
    });
}

/**
 * Map token type (using our lexer's short codes) to DFA.
 */
function getDFAForTokenInternal(token) {
    switch (token.type) {
        case 'KEY': return KEYWORD_DFA;
        case 'ID': return IDENTIFIER_DFA;
        case 'NUM': return NUMBER_DFA;
        case 'OP': return OPERATOR_DFA;
        default: return null; // SYM, PREPROCESSOR, etc. — no DFA
    }
}

/**
 * Draw a single DFA diagram in a bounded region.
 */
function drawSingleDFA(ctx, dfa, token, sim, ox, oy, w, h) {
    // ─── Background Card ───────────────────────────────────
    ctx.save();
    ctx.shadowColor = "rgba(56, 189, 248, 0.15)";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(ox, oy, w, h, 12);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    // ─── Title ─────────────────────────────────────────────
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 15px 'Segoe UI', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(dfa.shortName + " DFA", ox + 16, oy + 22);

    // Token value + result badge
    let accepted = sim.accepted;
    let badge = accepted ? "✓ Accepted" : "✗ Rejected";
    let badgeColor = accepted ? "#4ade80" : "#f87171";

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "14px Consolas, monospace";
    ctx.fillText(`Input: "${token.value}"`, ox + 16, oy + 46);

    ctx.fillStyle = badgeColor;
    ctx.font = "bold 13px 'Segoe UI', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(badge, ox + w - 16, oy + 22);

    // Pattern
    ctx.fillStyle = "#64748b";
    ctx.font = "12px Consolas, monospace";
    ctx.textAlign = "left";
    ctx.fillText("Pattern: " + dfa.pattern, ox + 16, oy + 66);

    // ─── Compute state positions (scaled to fit card) ──────
    let states = dfa.states;

    // Find bounding box of DFA state positions
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let s of states) {
        if (s.x < minX) minX = s.x;
        if (s.x > maxX) maxX = s.x;
        if (s.y < minY) minY = s.y;
        if (s.y > maxY) maxY = s.y;
    }

    let dfaW = maxX - minX || 1;
    let dfaH = maxY - minY || 1;

    // Drawing area within the card
    let drawX = ox + 40;
    let drawY = oy + 85;
    let drawW = w - 80;
    let drawH = h - 120;

    // Scale + translate states into the draw area
    let posMap = {};
    for (let s of states) {
        let nx = drawX + ((s.x - minX) / dfaW) * drawW;
        let ny = drawY + ((s.y - minY) / dfaH) * drawH;
        // Clamp Y to prevent overflow
        ny = Math.max(drawY + 20, Math.min(drawY + drawH - 20, ny));
        posMap[s.id] = { x: nx, y: ny, state: s };
    }

    // ─── Collect visited edges from simulation ─────────────
    let visitedEdges = new Set();
    let visitedStates = new Set();
    let finalStateId = sim.finalState;

    for (let step of sim.steps) {
        if (step.toState) visitedStates.add(step.toState);
        if (step.fromState && step.toState) {
            visitedEdges.add(step.fromState + "->" + step.toState);
        }
    }

    // ─── Draw Transitions ──────────────────────────────────
    let R = 24; // state circle radius

    for (let t of dfa.transitions) {
        let fromPos = posMap[t.from];
        let toPos = posMap[t.to];
        if (!fromPos || !toPos) continue;

        let isActive = visitedEdges.has(t.from + "->" + t.to);

        if (t.isSelfLoop || t.from === t.to) {
            drawSelfLoop(ctx, fromPos.x, fromPos.y, R, t.label, isActive);
        } else {
            drawTransitionArrow(ctx, fromPos.x, fromPos.y, toPos.x, toPos.y, R, t.label, isActive);
        }
    }

    // ─── Draw States ───────────────────────────────────────
    for (let s of states) {
        let pos = posMap[s.id];
        let isVisited = visitedStates.has(s.id);
        let isFinal = s.id === finalStateId;
        let isAccept = s.isAccept;
        let isStart = s.isStart;

        // Start arrow
        if (isStart) {
            ctx.strokeStyle = isVisited ? "#38bdf8" : "#475569";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(pos.x - R - 30, pos.y);
            ctx.lineTo(pos.x - R - 2, pos.y);
            ctx.stroke();
            // Arrowhead
            ctx.fillStyle = isVisited ? "#38bdf8" : "#475569";
            ctx.beginPath();
            ctx.moveTo(pos.x - R - 2, pos.y);
            ctx.lineTo(pos.x - R - 10, pos.y - 5);
            ctx.lineTo(pos.x - R - 10, pos.y + 5);
            ctx.fill();
        }

        // Outer circle (for accept states, draw double circle)
        if (isAccept) {
            ctx.strokeStyle = isFinal && sim.accepted ? "#4ade80" : (isVisited ? "#38bdf8" : "#334155");
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, R + 5, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Main circle
        let fillColor = "#1e293b";
        let strokeColor = "#334155";

        if (isFinal && sim.accepted) {
            fillColor = "rgba(74, 222, 128, 0.15)";
            strokeColor = "#4ade80";
        } else if (isFinal && !sim.accepted) {
            fillColor = "rgba(248, 113, 113, 0.15)";
            strokeColor = "#f87171";
        } else if (isVisited) {
            fillColor = "rgba(56, 189, 248, 0.1)";
            strokeColor = "#38bdf8";
        }

        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, R, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // State label
        ctx.fillStyle = isFinal ? (sim.accepted ? "#4ade80" : "#f87171") : (isVisited ? "#e2e8f0" : "#94a3b8");
        ctx.font = "bold 14px Consolas, monospace";
        ctx.textAlign = "center";
        ctx.fillText(s.label, pos.x, pos.y);

        // State description (small, below)
        if (s.description && s.description !== "Dead State") {
            ctx.fillStyle = "#475569";
            ctx.font = "10px 'Segoe UI', sans-serif";
            ctx.fillText(s.description, pos.x, pos.y + R + 14);
        }
    }

    // ─── Simulation Trace (bottom of card) ─────────────────
    let traceY = oy + h - 28;
    ctx.fillStyle = "#475569";
    ctx.font = "11px Consolas, monospace";
    ctx.textAlign = "left";

    let traceStr = sim.steps
        .filter(s => s.fromState && s.toState && s.inputChar)
        .map(s => `${s.fromState}─'${s.inputChar}'→${s.toState}`)
        .join("  ");

    if (traceStr.length > 80) traceStr = traceStr.substring(0, 77) + "…";
    ctx.fillText("Trace: " + (traceStr || "—"), ox + 16, traceY);
}

/**
 * Draw a transition arrow between two states.
 */
function drawTransitionArrow(ctx, x1, y1, x2, y2, R, label, isActive) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let dist = Math.sqrt(dx * dx + dy * dy);
    let ux = dx / dist;
    let uy = dy / dist;

    // Start and end points (on circle edge)
    let sx = x1 + ux * R;
    let sy = y1 + uy * R;
    let ex = x2 - ux * (R + 2);
    let ey = y2 - uy * (R + 2);

    ctx.strokeStyle = isActive ? "#38bdf8" : "#334155";
    ctx.lineWidth = isActive ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    // Arrowhead
    let angle = Math.atan2(ey - sy, ex - sx);
    let headLen = 10;
    ctx.fillStyle = isActive ? "#38bdf8" : "#334155";
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - headLen * Math.cos(angle - 0.35), ey - headLen * Math.sin(angle - 0.35));
    ctx.lineTo(ex - headLen * Math.cos(angle + 0.35), ey - headLen * Math.sin(angle + 0.35));
    ctx.fill();

    // Label at midpoint
    let mx = (sx + ex) / 2;
    let my = (sy + ey) / 2;
    // Offset perpendicular to the line
    let perpX = -uy * 14;
    let perpY = ux * 14;

    ctx.fillStyle = isActive ? "#e2e8f0" : "#64748b";
    ctx.font = isActive ? "bold 12px Consolas" : "12px Consolas";
    ctx.textAlign = "center";
    ctx.fillText(label, mx + perpX, my + perpY);
}

/**
 * Draw a self-loop above a state.
 */
function drawSelfLoop(ctx, cx, cy, R, label, isActive) {
    let loopR = 16;
    let topY = cy - R - loopR - 2;

    ctx.strokeStyle = isActive ? "#38bdf8" : "#334155";
    ctx.lineWidth = isActive ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.arc(cx, topY, loopR, 0.3, Math.PI * 2 - 0.3);
    ctx.stroke();

    // Arrowhead on the right side of the loop
    let ax = cx + loopR * Math.cos(0.3);
    let ay = topY + loopR * Math.sin(0.3);
    ctx.fillStyle = isActive ? "#38bdf8" : "#334155";
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ax + 3, ay - 9);
    ctx.lineTo(ax + 8, ay + 1);
    ctx.fill();

    // Label
    ctx.fillStyle = isActive ? "#e2e8f0" : "#64748b";
    ctx.font = isActive ? "bold 11px Consolas" : "11px Consolas";
    ctx.textAlign = "center";
    ctx.fillText(label, cx, topY - loopR - 6);
}
