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
        this.balls = []; // Array to hold basketballs
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
        if (this.grounded) {
            const ball = new Ball(this.canvas, this.x + this.size / 2, this.y);
            ball.setPlayer(this); // Assign the shooting player to the ball
            this.balls.push(ball);
        }
    }

    update() {
        this.dy += this.gravity;
        this.y += this.dy;

        if (this.y > this.canvas.height - this.size - 10) {
            this.y = this.canvas.height - this.size - 10;
            this.dy = 0;
            this.grounded = true;
        }

        // Update basketballs
        this.balls.forEach(ball => ball.update());
        // Filter out balls that are off-screen
        this.balls = this.balls.filter(ball => !ball.isOffScreen);
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        this.balls.forEach(ball => ball.draw(ctx)); // Draw basketballs
    }
}

class Ball {
    constructor(canvas, x, y) {
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.dy = -5; // Initial upward velocity
        this.dx = 2; // Horizontal velocity for curve
        this.isOffScreen = false;
        this.scored = false; // To check if the ball has scored
    }

    setPlayer(player) {
        this.player = player; // Reference to the player who shot the ball
    }

    update() {
        this.y += this.dy; // Move the ball
        this.x += this.dx; // Move the ball horizontally
        this.dy += 0.2; // Simulate gravity

        // Check for scoring when the ball touches the net
        if (this.y > this.canvas.height - 50 && !this.scored) {
            const hoop = new Hoop(this.canvas);
            if (this.x > hoop.x && this.x < hoop.x + hoop.width) {
                this.scored = true; // Mark as scored
                this.player.score++; // Update player score
            }
        }

        // Remove ball if it goes off-screen or scored
        if (this.y > this.canvas.height || this.scored) {
            this.isOffScreen = true; // Mark ball for removal
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#FFD700'; // Color for the basketball
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
}

class Hoop {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = 80;
        this.height = 10;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = 150; // Lowered the hoop
    }

    draw(ctx) {
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.players = [
            new Player(this.canvas, '#00ffff', 'keyboard'), // Player 1
            new Player(this.canvas, '#ff00ff', 'touch'), // Player 2
        ];
        this.hoop = new Hoop(this.canvas);
        this.gameOver = false;
        this.timer = 60; // Game duration in seconds
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => {
            // Player 1 Controls
            if (e.code === 'KeyA') this.players[0].move('left');
            if (e.code === 'KeyD') this.players[0].move('right');
            if (e.code === 'KeyW') this.players[0].jump();
            if (e.code === 'KeyF') this.players[0].shoot(); // Shoot with 'F'

            // Player 2 Controls
            if (e.code === 'ArrowLeft') this.players[1].move('left');
            if (e.code === 'ArrowRight') this.players[1].move('right');
            if (e.code === 'ArrowUp') this.players[1].jump();
            if (e.code === 'KeyK') this.players[1].shoot(); // Shoot with 'K'
        });

        this.animate();
    }

    update() {
        this.players.forEach(player => player.update());
        // Update game timer
        if (!this.gameOver) {
            this.timer -= 0.016; // Assuming 60 FPS
            if (this.timer <= 0) this.endGame();
        }
    }

    draw() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.hoop.draw(this.ctx);
        this.players.forEach(player => player.draw(this.ctx));
        this.displayScores();
        this.displayTimer();
    }

    displayScores() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Player 1 Score: ${this.players[0].score}`, 10, 20);
        this.ctx.fillText(`Player 2 Score: ${this.players[1].score}`, this.canvas.width - 160, 20); // Adjusted position for Player 2
    }

    displayTimer() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Time: ${Math.ceil(this.timer)}`, this.canvas.width / 2 - 30, 20);
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
