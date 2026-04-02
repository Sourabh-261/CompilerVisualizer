function drawDFA() {

    let c = document.getElementById("dfa");
    let ctx = c.getContext("2d");

    ctx.clearRect(0, 0, c.width, c.height);

    ctx.font = "14px Consolas";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const startColor = "#4caf50";  
    const normalColor = "#569cd6"; 
    const acceptColor = "#ffd700";  
    const arrowColor = "#ff5555";   
    const textColor = "#ffffff";

    //  STATE POSITIONS
    let q0 = { x: 100, y: 100 };
    let q1 = { x: 250, y: 100 };

    //  DRAW q0 (START STATE)
    ctx.beginPath();
    ctx.fillStyle = startColor;
    ctx.arc(q0.x, q0.y, 30, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.stroke();

    ctx.fillStyle = textColor;
    ctx.fillText("q0", q0.x, q0.y);

    // DRAW q1 (ACCEPT STATE - DOUBLE CIRCLE)
    ctx.beginPath();
    ctx.fillStyle = acceptColor;
    ctx.arc(q1.x, q1.y, 30, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // inner circle (accept)
    ctx.beginPath();
    ctx.arc(q1.x, q1.y, 24, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = "#000";
    ctx.fillText("q1", q1.x, q1.y);

    // ARROW q0 → q1
    ctx.strokeStyle = arrowColor;
    ctx.beginPath();
    ctx.moveTo(q0.x + 30, q0.y);
    ctx.lineTo(q1.x - 30, q1.y);
    ctx.stroke();

    // arrow head
    ctx.beginPath();
    ctx.moveTo(q1.x - 30, q1.y);
    ctx.lineTo(q1.x - 40, q1.y - 5);
    ctx.lineTo(q1.x - 40, q1.y + 5);
    ctx.fillStyle = arrowColor;
    ctx.fill();

    // transition label
    ctx.fillStyle = textColor;
    ctx.fillText("a-z / 0-9", (q0.x + q1.x) / 2, q0.y - 20);

    // START ARROW
    ctx.beginPath();
    ctx.moveTo(q0.x - 60, q0.y);
    ctx.lineTo(q0.x - 30, q0.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(q0.x - 30, q0.y);
    ctx.lineTo(q0.x - 40, q0.y - 5);
    ctx.lineTo(q0.x - 40, q0.y + 5);
    ctx.fillStyle = arrowColor;
    ctx.fill();

    ctx.fillStyle = textColor;
    ctx.fillText("start", q0.x - 60, q0.y - 10);
}