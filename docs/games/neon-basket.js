class Player {
    constructor(canvas, color, controlScheme) {
        this.canvas = canvas;
        this.size = 30;
        this.x = controlScheme === 'keyboard' ? 50 : canvas.width - 80;
        this.y = canvas.height - this.size - 10;
        this.dy = 0;
        this.jumpForce = -15;
        this.gravity = 0.8;
        this.grounded = true;
        this.color = color;
        this.controlScheme = controlScheme;
        this.score = 0;
        this.balls = [];
    }

    jump() {
        if (this.grounded) {
            this.dy = this.jumpForce;
            this.grounded = false;
        }
    }

    move(direction) {
        if (direction === 'left') this.x -= 5;
        if (direction === 'right') this.x += 5;
        this.x = Math.max(0, Math.min(this.x, this.canvas.width - this.size));
    }

    shoot() {
        // Removed the grounded check to allow shooting while jumping
        const ball = new Ball(this.canvas, this.x + this.size / 2, this.y);
        ball.setPlayer(this);
        
        // Determine shot direction based on player position relative to hoop
        const hoopCenterX = this.canvas.width / 2;
        const shootingLeft = this.x > hoopCenterX;
        
        // Adjust initial velocities for higher arc and directed towards hoop
        ball.dy = -10; // Increased upward velocity
        ball.dx = shootingLeft ? -4 : 4; // Direction based on position
        
        this.balls.push(ball);
    }

    update() {
        this.dy += this.gravity;
        this.y += this.dy;

        if (this.y > this.canvas.height - this.size - 10) {
            this.y = this.canvas.height - this.size - 10;
            this.dy = 0;
            this.grounded = true;
        }

        this.balls.forEach(ball => ball.update());
        this.balls = this.balls.filter(ball => !ball.isOffScreen);
    }

    draw(ctx) {
        // Add neon glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        
        // Reset shadow for other drawings
        ctx.shadowBlur = 0;
        
        this.balls.forEach(ball => ball.draw(ctx));
    }
}

class Ball {
    constructor(canvas, x, y) {
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.dy = -10;
        this.dx = 2;
        this.isOffScreen = false;
        this.scored = false;
    }

    setPlayer(player) {
        this.player = player;
    }

    update() {
        this.y += this.dy;
        this.x += this.dx;
        this.dy += 0.2;

        // More precise scoring detection - check if ball touches the net
        const hoop = new Hoop(this.canvas);
        const ballBottom = this.y + this.radius;
        const ballTop = this.y - this.radius;
        
        if (ballBottom >= hoop.y && ballTop <= hoop.y + hoop.height && 
            this.x > hoop.x && this.x < hoop.x + hoop.width && !this.scored) {
            this.scored = true;
            this.player.score++;
        }

        if (this.y > this.canvas.height || this.scored) {
            this.isOffScreen = true;
        }
    }

    draw(ctx) {
        // Add neon glow effect
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        ctx.shadowBlur = 0;
    }
}

class Hoop {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = 80;
        this.height = 10;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = 150;
    }

    draw(ctx) {
        // Add neon glow effect for the hoop
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ffffff'; // Changed to white
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.players = [
            new Player(this.canvas, '#00ffff', 'keyboard'),
            new Player(this.canvas, '#ff00ff', 'touch'),
        ];
        this.hoop = new Hoop(this.canvas);
        this.gameOver = false;
        this.timer = 60;
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => {
            // Player 1 Controls
            if (e.code === 'KeyA') this.players[0].move('left');
            if (e.code === 'KeyD') this.players[0].move('right');
            if (e.code === 'KeyW') this.players[0].jump();
            if (e.code === 'KeyF') this.players[0].shoot();

            // Player 2 Controls
            if (e.code === 'ArrowLeft') this.players[1].move('left');
            if (e.code === 'ArrowRight') this.players[1].move('right');
            if (e.code === 'ArrowUp') this.players[1].jump();
            if (e.code === 'KeyK') this.players[1].shoot();
        });

        this.animate();
    }

    update() {
        this.players.forEach(player => player.update());
        if (!this.gameOver) {
            this.timer -= 0.016;
            if (this.timer <= 0) this.endGame();
        }
    }

    draw() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw floor line with neon glow
        this.ctx.shadowColor = '#ffffff';
        this.ctx.shadowBlur = 15;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height - 5);
        this.ctx.lineTo(this.canvas.width, this.canvas.height - 5);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
        
        this.hoop.draw(this.ctx);
        this.players.forEach(player => player.draw(this.ctx));
        this.displayScores();
        this.displayTimer();
    }

    displayScores() {
        this.ctx.shadowColor = '#ffffff';
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Player 1 Score: ${this.players[0].score}`, 10, 20);
        this.ctx.fillText(`Player 2 Score: ${this.players[1].score}`, this.canvas.width - 200, 20); // Moved more to the left
        this.ctx.shadowBlur = 0;
    }

    displayTimer() {
        this.ctx.shadowColor = '#ffffff';
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Time: ${Math.ceil(this.timer)}`, this.canvas.width / 2 - 30, 20);
        this.ctx.shadowBlur = 0;
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    endGame() {
        this.gameOver = true;
        alert(`Game Over! Player 1 Score: ${this.players[0].score}, Player 2 Score: ${this.players[1].score}`);
    }
}

window.onload = () => {
    new Game();
};
