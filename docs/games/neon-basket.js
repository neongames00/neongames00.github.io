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

    update() {
        this.dy += this.gravity;
        this.y += this.dy;

        if (this.y > this.canvas.height - this.size - 10) {
            this.y = this.canvas.height - this.size - 10;
            this.dy = 0;
            this.grounded = true;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }

    shoot() {
        if (this.grounded) {
            // Shooting mechanics can be implemented here
            this.score++;
        }
    }
}

class Hoop {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = 80;
        this.height = 10;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = 100;
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
            new Player(this.canvas, '#00ffff', 'keyboard'),
            new Player(this.canvas, '#ff00ff', 'touch'),
        ];
        this.hoop = new Hoop(this.canvas);
        this.gameOver = false;
        this.timer = 60; // Game duration in seconds
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowLeft') this.players[0].move('left');
            if (e.code === 'ArrowRight') this.players[0].move('right');
            if (e.code === 'Space') this.players[0].jump();
            if (e.code === 'KeyZ') this.players[0].shoot(); // Shoot with 'Z'
        });

        document.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.players[1].jump();
            // Implement touch controls for player 2
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
        this.ctx.fillText(`Player 2 Score: ${this.players[1].score}`, this.canvas.width - 150, 20);
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
