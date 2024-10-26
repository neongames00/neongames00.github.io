class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.size = 30;
        this.x = 50;
        this.y = canvas.height - this.size - 10;
        this.dy = 0;
        this.originalJumpForce = -15;
        this.jumpForce = this.originalJumpForce;
        this.gravity = 0.8;
        this.grounded = true;
        this.color = '#00ffff';
        this.jumpsRemaining = 1;
        this.powerUp = null;
        this.powerUpTimer = 0;
        this.ironManCounter = 0;
    }

    jump() {
        if (this.jumpsRemaining > 0) {
            this.dy = this.jumpForce;
            this.jumpsRemaining--;
            this.grounded = false;
        }
    }

    update() {
        this.dy += this.gravity;
        this.y += this.dy;

        if (this.y > this.canvas.height - this.size - 10) {
            this.y = this.canvas.height - this.size - 10;
            this.dy = 0;
            this.grounded = true;
            this.jumpsRemaining = this.powerUp === 'superS' || this.powerUp === 'ironMan' ? 2 : 1;
        }

        if (this.powerUp) {
            this.powerUpTimer--;
            if (this.powerUpTimer <= 0) {
                this.deactivatePowerUp();
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.shadowBlur = 0;

        if (this.powerUp === 'capShield') {
            this.drawShield(ctx);
        } else if (this.powerUp === 'ironMan') {
            this.drawIronManFace(ctx);
        }
    }

    drawShield(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = 'blue';
        ctx.shadowBlur = 20;

        // Outer square shield
        ctx.fillRect(-this.size / 2 - 5, -this.size / 2 - 5, this.size + 10, this.size + 10);
        
        // Inner shield
        ctx.fillStyle = 'white';
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        
        // Inner circle
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawIronManFace(ctx) {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(this.x, this.y, this.size, this.size);
        
        // Face details
        ctx.fillStyle = '#FFD700'; // Gold for the eyes
        ctx.fillRect(this.x + 5, this.y + 5, 8, 4); // Left eye
        ctx.fillRect(this.x + 17, this.y + 5, 8, 4); // Right eye
        ctx.fillRect(this.x + 10, this.y + 15, 10, 5); // Mouth

        // Enhanced face mask design
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(this.x + 5, this.y + 5);
        ctx.lineTo(this.x + 10, this.y);
        ctx.lineTo(this.x + 20, this.y);
        ctx.lineTo(this.x + 25, this.y + 5);
        ctx.lineTo(this.x + 25, this.y + 30);
        ctx.lineTo(this.x + 5, this.y + 30);
        ctx.closePath();
        ctx.fill();

        // Add blue triangle for Iron Man's design
        ctx.fillStyle = '#00BFFF'; // Blue color for the triangle
        ctx.beginPath();
        ctx.moveTo(this.x + 10, this.y + 20); // Top point of triangle
        ctx.lineTo(this.x + 15, this.y + 30); // Bottom right point
        ctx.lineTo(this.x + 5, this.y + 30);  // Bottom left point
        ctx.closePath();
        ctx.fill();
    }

    activatePowerUp(type) {
        this.powerUp = type;
        switch(type) {
            case 'superS':
                this.color = 'red';
                this.powerUpTimer = 11 * 60; // 11 seconds
                this.jumpsRemaining = 2;
                break;
            case 'capShield':
                this.powerUpTimer = 13 * 60; // 13 seconds
                break;
            case 'ironMan':
                this.color = 'red';
                this.powerUpTimer = 11 * 60; // 11 seconds for double jump
                this.ironManCounter = 4;
                this.jumpsRemaining = 2;
                break;
            case 'flash':
                this.color = 'yellow';
                this.powerUpTimer = 12 * 60; // 12 seconds
                this.jumpForce = this.originalJumpForce * 1.35;
                break;
        }
    }

    deactivatePowerUp() {
        if (this.powerUp === 'flash') {
            this.jumpForce = this.originalJumpForce;
        }
        if (this.powerUp !== 'ironMan' || this.ironManCounter === 0) {
            this.powerUp = null;
            this.color = '#00ffff';
        }
    }

    getMaxJumpHeight() {
        return (this.jumpForce * this.jumpForce) / (2 * this.gravity);
    }
}

class Obstacle {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = 20;
        this.height = Math.random() * 100 + 20; // Ensures a minimum height
        this.x = canvas.width;
        this.y = canvas.height - this.height - 10;
        this.speed = 5;
        this.type = Math.random() > 0.5 ? 'normal' : 'spike'; // Different types of obstacles
    }

    update() {
        this.x -= this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = this.type === 'normal' ? '#ff00ff' : '#ff4500'; // Different colors for different types
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.fillStyle;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}

class PowerUp {
    constructor(canvas, playerJumpHeight) {
        this.canvas = canvas;
        this.size = 30;
        this.x = canvas.width;

        // Calculate the maximum height the player can reach
        const maxJumpHeight = canvas.height - playerJumpHeight;

        // Set the y position to be within the player's jump range
        this.y = Math.max(
            maxJumpHeight,
            Math.random() * (canvas.height - this.size - 60) + 30
        );

        this.speed = 5;
        this.type = this.getRandomType();
    }

    getRandomType() {
        const types = ['superS', 'capShield', 'ironMan', 'flash'];
        return types[Math.floor(Math.random() * types.length)];
    }

    update() {
        this.x -= this.speed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        switch(this.type) {
            case 'superS':
                this.drawSuperS(ctx);
                break;
            case 'capShield':
                this.drawStar(ctx); // Draw silver star for Cap's Shield power-up
                break;
            case 'ironMan':
                this.drawTriangle(ctx); // Draw triangle for Iron Man power-up
                break;
            case 'flash':
                this.drawLightning(ctx);
                break;
        }

        ctx.restore();
    }

    drawSuperS(ctx) {
        ctx.fillStyle = 'red';
        ctx.shadowColor = 'yellow';
        ctx.shadowBlur = 20; // Increased glow for the neon effect
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(30, 10);
        ctx.lineTo(25, 30);
        ctx.lineTo(15, 25);
        ctx.lineTo(5, 30);
        ctx.lineTo(0, 10);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw futuristic lines
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(15, 30); // Vertical line through the center
        ctx.stroke();
    }

    drawStar(ctx) {
        ctx.fillStyle = 'silver'; // Silver color for Cap's Shield power-up
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(20, 10);
        ctx.lineTo(30, 10);
        ctx.lineTo(22, 15);
        ctx.lineTo(25, 25);
        ctx.lineTo(15, 20);
        ctx.lineTo(5, 25);
        ctx.lineTo(8, 15);
        ctx.lineTo(0, 10);
        ctx.lineTo(10, 10);
        ctx.closePath();
        ctx.fill();
    }

    drawTriangle(ctx) {
        ctx.fillStyle = '#00BFFF'; // Blue color for the triangle
        ctx.beginPath();
        ctx.moveTo(15, 0); // Top point of triangle
        ctx.lineTo(30, 30); // Bottom right point
        ctx.lineTo(0, 30);  // Bottom left point
        ctx.closePath();
        ctx.fill();
    }

    drawLightning(ctx) {
        ctx.fillStyle = 'yellow';
        ctx.shadowColor = 'orange';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(25, 12);
        ctx.lineTo(20, 12);
        ctx.lineTo(30, 30);
        ctx.lineTo(20, 18);
        ctx.lineTo(25, 18);
        ctx.lineTo(15, 0);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = new Player(this.canvas);
        this.obstacles = [];
        this.powerUps = [];
        this.score = 0;
        this.highScore = localStorage.getItem('neonRunnerHighScore') || 0;
        this.gameOver = false;
        this.obstacleTimer = 0;
        this.powerUpTimer = 0;
        this.scoreMultiplier = 1;
        this.gameSpeed = 1;
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.gameOver) {
                    this.restart();
                } else {
                    this.player.jump();
                }
            }
        });

        document.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameOver) {
                this.restart();
            } else {
                this.player.jump();
            }
        });

        this.animate();
    }

    spawnObstacle() {
        this.obstacles.push(new Obstacle(this.canvas));
    }

    spawnPowerUp() {
        const playerJumpHeight = this.player.getMaxJumpHeight();
        this.powerUps.push(new PowerUp(this.canvas, playerJumpHeight));
    }

    update() {
        if (this.gameOver) return;

        this.player.update();

        this.obstacleTimer++;
        if (this.obstacleTimer > 100 / this.gameSpeed) {
            this.spawnObstacle();
            this.obstacleTimer = 0;
        }

        this.powerUpTimer++;
        if (this.powerUpTimer > 750) { // Spawn power-up every 12.50 seconds
            this.spawnPowerUp();
            this.powerUpTimer = 0;
        }

        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.update();
            if (this.checkCollision(this.player, obstacle)) {
                if (this.player.powerUp === 'capShield') {
                    return false; // Remove the obstacle on collision with shield
                } else if (this.player.powerUp === 'ironMan' && this.player.ironManCounter > 0) {
                    this.player.ironManCounter--;
                    return false; // Remove the obstacle
                } else {
                    this.endGame();
                }
            }
            return obstacle.x > -obstacle.width;
        });

        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.update();
            if (this.checkPowerUpCollision(this.player, powerUp)) {
                this.player.activatePowerUp(powerUp.type);
                return false; // Remove power-up after collection
            }
            return powerUp.x > -powerUp.size;
        });

        if (this.player.powerUp === 'flash') {
            this.gameSpeed = 0.5; // Slow down obstacles
        } else {
            this.gameSpeed = 1;
        }

        this.score += this.scoreMultiplier * this.gameSpeed;
        document.getElementById('score').textContent = Math.floor(this.score / 10);
    }

    checkCollision(player, obstacle) {
        return player.x < obstacle.x + obstacle.width &&
               player.x + player.size > obstacle.x &&
               player.y < obstacle.y + obstacle.height &&
               player.y + player.size > obstacle.y;
    }

    checkPowerUpCollision(player, powerUp) {
        return player.x < powerUp.x + powerUp.size &&
               player.x + player.size > powerUp.x &&
               player.y < powerUp.y + powerUp.size &&
               player.y + player.size > powerUp.y;
    }

    draw() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw ground line with glow
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#00ffff';
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height - 10);
        this.ctx.lineTo(this.canvas.width, this.canvas.height - 10);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        this.player.draw(this.ctx);
        this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));
        this.powerUps.forEach(powerUp => powerUp.draw(this.ctx));
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    endGame() {
        this.gameOver = true;
        const finalScore = Math.floor(this.score / 10);
        if (finalScore > this.highScore) {
            this.highScore = finalScore;
            localStorage.setItem('neonRunnerHighScore', this.highScore);
            document.getElementById('highScore').textContent = this.highScore;
        }
        document.getElementById('finalScore').textContent = finalScore;
        document.getElementById('gameOver').style.display = 'block';
    }

    restart() {
        this.gameOver = false;
        this.score = 0;
        this.scoreMultiplier = 1; // Reset multiplier
        this.obstacles = [];
        this.powerUps = [];
        this.obstacleTimer = 0;
        this.powerUpTimer = 0;
        this.player = new Player(this.canvas);
        document.getElementById('gameOver').style.display = 'none';
    }
}

window.onload = () => {
    new Game();
};

function restartGame() {
    window.game = new Game();
}
