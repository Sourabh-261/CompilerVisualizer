document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.createElement("canvas");
    canvas.id = "bg-canvas";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    
    // Style the canvas to sit in the background
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "-1";
    canvas.style.pointerEvents = "none"; // Let clicks pass through to UI

    let w, h;
    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    const mouse = { x: null, y: null, radius: 150 };
    window.addEventListener("mousemove", (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    const chars = ["{", "}", ";", "<", ">", "/", "*", "0", "1", "int", "void", "return"];
    const particles = [];

    class Particle {
        constructor() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = Math.random() * 14 + 10;
            this.char = chars[Math.floor(Math.random() * chars.length)];
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.baseAlpha = Math.random() * 0.3 + 0.1;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > w) this.x = 0;
            if (this.x < 0) this.x = w;
            if (this.y > h) this.y = 0;
            if (this.y < 0) this.y = h;
        }

        draw() {
            let alpha = this.baseAlpha;
            
            // Interactive hover effect
            if (mouse.x != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    // Glow brighter near cursor
                    alpha = this.baseAlpha + (1 - distance / mouse.radius) * 0.5;
                    
                    // Slight repulsion
                    this.x -= dx * 0.01;
                    this.y -= dy * 0.01;
                }
            }

            ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.font = `${this.size}px Consolas`;
            ctx.textAlign = "center";
            ctx.fillText(this.char, this.x, this.y);
        }
    }

    function init() {
        particles.length = 0;
        let numParticles = (w * h) / 15000; // Density
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);
        
        // Draw deep background gradient
        let gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h));
        gradient.addColorStop(0, "#0f172a");
        gradient.addColorStop(1, "#020617");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Connect nearby particles
        connectParticles();

        requestAnimationFrame(animate);
    }

    function connectParticles() {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let dx = particles[a].x - particles[b].x;
                let dy = particles[a].y - particles[b].y;
                let distance = dx * dx + dy * dy;

                if (distance < 12000) {
                    let opacity = 1 - (distance / 12000);
                    ctx.strokeStyle = `rgba(56, 189, 248, ${opacity * 0.15})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    init();
    animate();
});
