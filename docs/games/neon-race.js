class Car {
    constructor(x, y, color, controls) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 20;
        this.color = color;
        this.controls = controls;
        this.velocity = {
            x: 0,
            y: 0
        };
        this.acceleration = 0.1;
        this.maxSpeed = 5;
        this.driftFactor = 0.9;
        this.checkpoints = 0;
        this.laps = 0;
        this.completedLaps = 0;
        this.isGameOver = false;
        this.speedBoost = false;
    }

    update() {
        // Apply speed boost if active
        if (this.speedBoost) {
            this.maxSpeed = 7; // Increased speed during boost
            setTimeout(() => {
                this.speedBoost = false;
                this.maxSpeed = 5; // Reset to normal speed
            }, 2000); // Boost lasts for 2 seconds
        }

        this.velocity.x *= this.driftFactor; // Apply drift
        this.x += Math.max(Math.min(this.velocity.x, this.maxSpeed), -this.maxSpeed);
        this.y += this.velocity.y;

        // Boundary conditions
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > 800) this.x = 800 - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > 400) this.y = 400 - this.height;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    handleInput(keys) {
        if (keys.has(this.controls.left)) {
            this.velocity.x -= this.acceleration;
        } else if (keys.has(this.controls.right)) {
            this.velocity.x += this.acceleration;
        }

        if (keys.has(this.controls.up)) {
            this.velocity.y -= this.acceleration;
        } else if (keys.has(this.controls.down)) {
            this.velocity.y += this.acceleration;
        }

        // Clamp speed
        this.velocity.x = Math.max(Math.min(this.velocity.x, this.maxSpeed), -this.maxSpeed);
        this.velocity.y = Math.max(Math.min(this.velocity.y, this.maxSpeed), -this.maxSpeed);
    }

    checkCollision(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
}

class Track {
    constructor(checkpoints, finishLine, obstacles) {
        this.checkpoints = checkpoints;
        this.finishLine = finishLine;
        this.obstacles = obstacles;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player1 = new Car(100, 100, '#00ffff', {
            left: 'KeyA',
            right: 'KeyD',
            up: 'KeyW',
            down: 'KeyS'
        });
        this.player2 = new Car(100, 150, '#ff00ff', {
            left: 'ArrowLeft',
            right: 'ArrowRight',
            up: 'ArrowUp',
            down: 'ArrowDown'
        });
        this.tracks = [
            new Track(
                [{ x: 200, y: 200 }, { x: 600, y: 200 }],
                { x: 700, y: 150 },
                [{ x: 300, y: 100, width: 60, height: 20 }, { x: 400, y: 300, width: 60, height: 20 }] // Static obstacles
            ),
            new Track(
                [{ x: 100, y: 100 }, { x: 700, y: 100 }],
                { x: 750, y: 150 },
                [] // No obstacles in this track
            ),
            new Track(
                [{ x: 100, y: 300 }, { x: 600, y: 300 }],
                { x: 700, y: 150 },
                [{ x: 300, y: 200, width: 20, height: 20 }] // Another obstacle
            )
            // Add more tracks as needed
        ];
        this.currentTrack = 0;
        this.startTime = Date.now();
        this.keys = new Set();
        this.gameOver = false;

        this.setupControls();
        this.animate();
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });
    }

    checkCollisions() {
        const playerFinishLine = this.tracks[this.currentTrack].finishLine;

        if (
            this.player1.checkCollision(playerFinishLine)
        ) {
            this.player1.completedLaps++;
            this.checkGameOver(this.player1);
        }

        if (
            this.player2.checkCollision(playerFinishLine)
        ) {
            this.player2.completedLaps++;
            this.checkGameOver(this.player2);
        }

        // Check for obstacle collisions
        this.tracks[this.currentTrack].obstacles.forEach(obstacle => {
            if (this.player1.checkCollision(obstacle)) {
                this.player1.velocity.x = -this.player1.velocity.x; // Reverse player on collision
                this.player1.velocity.y = -this.player1.velocity.y;
            }
            if (this.player2.checkCollision(obstacle)) {
                this.player2.velocity.x = -this.player2.velocity.x; // Reverse player on collision
                this.player2.velocity.y = -this.player2.velocity.y;
            }
        });

        // Check for car collisions
        if (this.player1.checkCollision(this.player2)) {
            this.player1.velocity.x = -this.player1.velocity.x;
            this.player2.velocity.x = -this.player2.velocity.x;
        }
    }

    checkGameOver(player) {
        if (player.completedLaps >= 3) { // Number of laps to win
            player.isGameOver = true;
            this.endGame(player);
        }
    }

    endGame(winner) {
        this.gameOver = true;
        document.getElementById('winner').textContent = `${winner.color === '#00ffff' ? 'Player 1' : 'Player 2'} Wins!`;
        document.getElementById('gameOver').style.display = 'block';
    }

    update() {
        if (this.gameOver) return;

        this.player1.handleInput(this.keys);
        this.player1.update();
        this.player2.handleInput(this.keys);
        this.player2.update();

        this.checkCollisions();
    }

    draw() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw track checkpoints
        this.tracks[this.currentTrack].checkpoints.forEach(cp => {
            this.ctx.fillStyle = 'green';
            this.ctx.fillRect(cp.x, cp.y, 10, 10);
        });

        // Draw finish line
        const finishLine = this.tracks[this.currentTrack].finishLine;
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(finishLine.x, finishLine.y, 5, 20);

        // Draw obstacles
        this.tracks[this.currentTrack].obstacles.forEach(obstacle => {
            this.ctx.fillStyle = 'orange';
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });

        // Draw players
        this.player1.draw(this.ctx);
        this.player2.draw(this.ctx);

        // Draw timer
        const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(`Time: ${elapsedTime}s`, 10, 20);
    }

    animate() {
        this.update();
        this.draw();
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
