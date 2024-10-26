class Paddle {
    constructor(x, color) {
        this.x = x;
        this.y = 200; // Start in the middle
        this.width = 10;
        this.height = 80;
        this.color = color;
        this.speed = 5;
        this.score = 0;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    move(up) {
        if (up && this.y > 0) {
            this.y -= this.speed;
        } else if (!up && this.y + this.height < 400) {
            this.y += this.speed;
        }
    }
}

class Ball {
    constructor() {
        this.x = 400;
        this.y = 200;
        this.size = 10;
        this.speedX = 5;
        this.speedY = 5;
        this.speedIncreaseInterval = 5000; // Increase speed every 5 seconds
        this.lastSpeedIncreaseTime = Date.now();
    }

    draw(ctx) {
        ctx.fillStyle = '#2196F3';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    update(paddle1, paddle2) {
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off top and bottom
        if (this.y < 0 || this.y > 400) {
            this.speedY = -this.speedY;
        }

        // Paddle collision
        if (this.x < paddle1.x + paddle1.width && this.y > paddle1.y && this.y < paddle1.y + paddle1.height) {
            this.speedX = -this.speedX;
        } else if (this.x > paddle2.x && this.y > paddle2.y && this.y < paddle2.y + paddle2.height) {
            this.speedX = -this.speedX;
        }

        // Score update
        if (this.x < 0) {
            paddle2.score++;
            this.reset();
        } else if (this.x > 800) {
            paddle1.score++;
            this.reset();
        }

        // Increase speed over time
        this.increaseSpeed();
    }

    increaseSpeed() {
        if (Date.now() - this.lastSpeedIncreaseTime >= this.speedIncreaseInterval) {
            this.speedX *= 1.1; // Increase speed by 10%
            this.speedY *= 1.1; // Increase speed by 10%
            this.lastSpeedIncreaseTime = Date.now();
        }
    }

    reset() {
        this.x = 400;
        this.y = 200;
        this.speedX = 5 * (Math.random() < 0.5 ? 1 : -1);
        this.speedY = 5 * (Math.random() < 0.5 ? 1 : -1);
    }
}

class Game {
    constructor(singlePlayer = false) {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.paddle1 = new Paddle(10, '#00ffff');
        this.paddle2 = new Paddle(780, '#ff00ff');
        this.ball = new Ball();
        this.gameOver = false;
        this.singlePlayer = singlePlayer;

        this.setupControls();
        this.animate();
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyW') this.paddle1.move(true);
            if (e.code === 'KeyS') this.paddle1.move(false);
        });
        if (!this.singlePlayer) {
            window.addEventListener('keydown', (e) => {
                if (e.code === 'ArrowUp') this.paddle2.move(true);
                if (e.code === 'ArrowDown') this.paddle2.move(false);
            });
        }
    }

    updateAI() {
        // Simple AI to control the second paddle
        if (this.ball.y < this.paddle2.y + this.paddle2.height / 2) {
            this.paddle2.move(true);
        } else if (this.ball.y > this.paddle2.y + this.paddle2.height / 2) {
            this.paddle2.move(false);
        }
    }

    updateScore() {
        document.getElementById('score').innerText = `Player 1: ${this.paddle1.score} | Player 2: ${this.paddle2.score}`;
    }

    checkGameOver() {
        if (this.paddle1.score >= 5 || this.paddle2.score >= 5) {
            this.gameOver = true;
            const winner = this.paddle1.score >= 5 ? 'Player 1' : 'Player 2';
            document.getElementById('winner').textContent = `${winner} Wins!`;
            document.getElementById('gameOver').style.display = 'block';
        }
    }

    update() {
        if (this.gameOver) return;

        this.ball.update(this.paddle1, this.paddle2);
        if (this.singlePlayer) this.updateAI();
        this.updateScore();
        this.checkGameOver();
    }

    draw() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.paddle1.draw(this.ctx);
        this.paddle2.draw(this.ctx);
        this.ball.draw(this.ctx);
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

function restartGame(singlePlayer = false) {
    document.getElementById('gameOver').style.display = 'none';
    window.game = new Game(singlePlayer);
}

window.onload = () => {
    // You can change to true for single-player mode
    window.game = new Game(false);
};
