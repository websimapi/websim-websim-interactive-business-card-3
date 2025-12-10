export function initParticles(canvasContainerId, businessCardId) {
    if (window.matchMedia('print').matches) return;

    const businessCard = document.getElementById(businessCardId);
    const container = document.getElementById(canvasContainerId);
    
    if (!businessCard || !container) {
        console.warn('Particles init failed: Elements not found');
        return;
    }

    const particles = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    container.appendChild(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    function Particle(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
    }

    Particle.prototype.update = function() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.size > 0.1) this.size -= 0.1;
    }

    Particle.prototype.draw = function() {
        ctx.fillStyle = 'rgba(57, 255, 20, 0.8)'; // Neon Green
        ctx.strokeStyle = 'rgba(57, 255, 20, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    function createParticles(e) {
        const rect = businessCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        for (let i = 0; i < 5; i++) {
            particles.push(new Particle(x, y));
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].size <= 0.1) {
                particles.splice(i, 1);
                i--;
            }
        }
        requestAnimationFrame(animateParticles);
    }

    businessCard.addEventListener('mousemove', createParticles);
    animateParticles();

    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}