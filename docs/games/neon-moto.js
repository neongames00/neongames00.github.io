class Motorcycle {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.x = this.canvas.width / 2 - 25;
        this.y = this.canvas.height - 100;
        this.width = 50;
        this.height = 80;
        this.color = '#00ffff';
        this.health = 100;
        this.collisions = 0;
    }

    draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = this.color;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
        this.ctx.shadowBlur = 0;
    }

    move(direction) {
        if (direction === 'left' && this.x > 0) {
            this.x -= 15;
        } else if (direction === 'right' && this.x < this.canvas.width - this.width) {
            this.x += 15;
        }
    }

    hit() {
        this.collisions++;
        this.health -= 20;
        document.getElementById('healthFill').style.width = `${this.health}%`;
    }
}

class Obstacle {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.x = Math.random() * (this.canvas.width - 50);
        this.y = -50;
        this.width = 50;
        this.height = 50;
        this.color = '#ff00ff';
        this.speed = 4 + Math.random() * 2; // Varying speed for obstacles
    }

    draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = this.color;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
        this.ctx.shadowBlur = 0;
    }

    update() {
        this.y += this.speed;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.motorcycle = new Motorcycle(this.canvas);
        this.obstacles = [];
        this.isGameOver = false;

        this.spawnObstacle();
        this.animate();
        this.setupControls();
    }

    spawnObstacle() {
        const obstacle = new Obstacle(this.canvas);
        this.obstacles.push(obstacle);
        setTimeout(() => {
            if (!this.isGameOver) this.spawnObstacle();
        }, 1500); // Spawn an obstacle every 1.5 seconds
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowLeft') this.motorcycle.move('left');
            if (e.code === 'ArrowRight') this.motorcycle.move('right');
        });
    }

    checkCollision() {
        for (const obstacle of this.obstacles) {
            if (obstacle.y + obstacle.height > this.motorcycle.y &&
                obstacle.y < this.motorcycle.y + this.motorcycle.height &&
                obstacle.x + obstacle.width > this.motorcycle.x &&
                obstacle.x < this.motorcycle.x + this.motorcycle.width) {
                this.motorcycle.hit();
                obstacle.y = this.canvas.height + 100; // Move the obstacle off screen
                if (this.motorcycle.collisions >= 5 || this.motorcycle.health <= 0) {
                    this.endGame();
                }
            }
        }
    }

    endGame() {
        this.isGameOver = true;
        document.getElementById('finalScore').textContent = `You hit ${this.motorcycle.collisions} obstacles!`;
        document.getElementById('gameOver').style.display = 'block';
    }

    update() {
        if (this.isGameOver) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.motorcycle.draw();

        for (const obstacle of this.obstacles) {
            obstacle.update();
            obstacle.draw();
            if (obstacle.y > this.canvas.height) {
                this.obstacles.splice(this.obstacles.indexOf(obstacle), 1);
            }
        }

        this.checkCollision();
    }

    animate() {
        this.update();
        requestAnimationFrame(() => this.animate());
    }
}

function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    window.game = new Game();
}

window.onload = () => {
    window.game = new Game();
};
