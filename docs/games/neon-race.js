class Car {
    constructor(x, y, color, controls) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 15;
        this.color = color;
        this.controls = controls;
        this.angle = 0;
        this.speed = 0;
        this.acceleration = 0;
        this.maxSpeed = 5;
        this.friction = 0.95;
        this.turnSpeed = 0.03;
        this.driftFactor = 0;
        this.checkpoints = new Set();
        this.currentLap = 0;
        this.lapTimes = [];
        this.bestLapTime = Infinity;
        this.isNitroActive = false;
        this.nitroFuel = 100;
        this.ghostTrail = [];
        this.collisionCooldown = 0;
    }

    update() {
        // Update ghost trail
        this.ghostTrail.unshift({ x: this.x, y: this.y, angle: this.angle });
        if (this.ghostTrail.length > 10) this.ghostTrail.pop();

        // Handle nitro
        if (this.isNitroActive && this.nitroFuel > 0) {
            this.maxSpeed = 8;
            this.nitroFuel = Math.max(0, this.nitroFuel - 0.5);
        } else {
            this.maxSpeed = 5;
            this.nitroFuel = Math.min(100, this.nitroFuel + 0.1);
        }

        // Apply physics
        if (this.speed !== 0) {
            const moveX = Math.sin(this.angle) * this.speed;
            const moveY = Math.cos(this.angle) * this.speed;
            
            // Apply drift
            const driftX = moveX * (1 - this.driftFactor);
            const driftY = moveY * (1 - this.driftFactor);
            
            this.x += driftX;
            this.y -= driftY;
        }

        // Apply friction and drift recovery
        this.speed *= this.friction;
        this.driftFactor *= 0.95;

        // Handle collision cooldown
        if (this.collisionCooldown > 0) {
            this.collisionCooldown--;
        }
    }

    draw(ctx) {
        // Draw ghost trail
        this.ghostTrail.forEach((pos, index) => {
            const alpha = (1 - index / this.ghostTrail.length) * 0.3;
            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.rotate(-pos.angle);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
            ctx.globalAlpha = 1;
            ctx.restore();
        });

        // Draw car
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(-this.angle);
        
        // Draw neon glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        // Draw nitro bars
        ctx.fillStyle = this.isNitroActive ? '#ff0' : '#fff';
        ctx.fillRect(-this.width/2, -this.height/2 - 5, (this.width * this.nitroFuel/100), 3);
        
        ctx.restore();
    }

    handleInput(keys) {
        // Acceleration
        if (keys.has(this.controls.up)) {
            this.speed = Math.min(this.speed + 0.2, this.maxSpeed);
        }
        if (keys.has(this.controls.down)) {
            this.speed = Math.max(this.speed - 0.2, -this.maxSpeed/2);
        }

        // Steering
        if (this.speed !== 0) {
            if (keys.has(this.controls.left)) {
                this.angle -= this.turnSpeed * (this.speed > 0 ? 1 : -1);
            }
            if (keys.has(this.controls.right)) {
                this.angle += this.turnSpeed * (this.speed > 0 ? 1 : -1);
            }
        }

        // Nitro
        if (keys.has(this.controls.nitro) && this.nitroFuel > 0) {
            this.isNitroActive = true;
        } else {
            this.isNitroActive = false;
        }

        // Drift
        if (keys.has(this.controls.drift)) {
            this.driftFactor = Math.min(this.driftFactor + 0.1, 0.8);
        }
    }
}

class Track {
    constructor(checkpoints, obstacles, movingObstacles, theme) {
        this.checkpoints = checkpoints;
        this.obstacles = obstacles;
        this.movingObstacles = movingObstacles;
        this.theme = theme;
        this.startLine = checkpoints[0];
        this.finishLine = checkpoints[checkpoints.length - 1];
    }

    update() {
        // Update moving obstacles
        this.movingObstacles.forEach(obstacle => {
            obstacle.update();
        });
    }

    draw(ctx) {
        // Draw track outline with neon effect
        ctx.strokeStyle = this.theme.trackColor;
        ctx.lineWidth = 2;
        ctx.shadowColor = this.theme.trackColor;
        ctx.shadowBlur = 10;
        
        // Draw checkpoints
        this.checkpoints.forEach((checkpoint, index) => {
            ctx.fillStyle = index === 0 ? '#0f0' : 
                          index === this.checkpoints.length - 1 ? '#f00' : '#fff';
            ctx.shadowColor = ctx.fillStyle;
            ctx.fillRect(checkpoint.x - 5, checkpoint.y - 20, 10, 40);
        });

        // Draw static obstacles
        this.obstacles.forEach(obstacle => {
            ctx.fillStyle = this.theme.obstacleColor;
            ctx.shadowColor = this.theme.obstacleColor;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });

        // Draw moving obstacles
        this.movingObstacles.forEach(obstacle => {
            obstacle.draw(ctx);
        });
    }
}

class MovingObstacle {
    constructor(x, y, width, height, pattern) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.pattern = pattern;
        this.speed = 2;
        this.time = 0;
    }

    update() {
        this.time += 0.02;
        switch(this.pattern) {
            case 'circular':
                this.x += Math.cos(this.time) * this.speed;
                this.y += Math.sin(this.time) * this.speed;
                break;
            case 'horizontal':
                this.x += Math.cos(this.time) * this.speed;
                break;
            case 'vertical':
                this.y += Math.sin(this.time) * this.speed;
                break;
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#ff00ff';
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 15;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;

        // Define tracks
        this.tracks = [
            new Track(
                // Oval track
                [
                    {x: 400, y: 500},  // Start/Finish
                    {x: 700, y: 400},  // Checkpoint 1
                    {x: 400, y: 100},  // Checkpoint 2
                    {x: 100, y: 400}   // Checkpoint 3
                ],
                [
                    {x: 300, y: 200, width: 50, height: 50},
                    {x: 500, y: 400, width: 50, height: 50}
                ],
                [
                    new MovingObstacle(400, 300, 30, 30, 'circular'),
                    new MovingObstacle(200, 200, 30, 30, 'horizontal')
                ],
                {
                    trackColor: '#00ff00',
                    obstacleColor: '#ff00ff'
                }
            ),
            // Add more tracks with different layouts and themes
        ];

        this.currentTrack = 0;
        this.player1 = new Car(400, 480, '#00ffff', {
            left: 'KeyA',
            right: 'KeyD',
            up: 'KeyW',
            down: 'KeyS',
            nitro: 'ShiftLeft',
            drift: 'Space'
        });
        this.player2 = new Car(430, 480, '#ff00ff', {
            left: 'ArrowLeft',
            right: 'ArrowRight',
            up: 'ArrowUp',
            down: 'ArrowDown',
            nitro: 'ShiftRight',
            drift: 'Enter'
        });

        this.keys = new Set();
        this.startTime = Date.now();
        this.raceStarted = false;
        this.countdown = 3;

        this.setupControls();
        this.startCountdown();
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
            e.preventDefault();
        });
        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });
    }

    startCountdown() {
        let count = this.countdown;
        const countInterval = setInterval(() => {
            if (count > 0) {
                // Display countdown
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '48px Arial';
                this.ctx.fillText(count, this.canvas.width/2, this.canvas.height/2);
                count--;
            } else {
                clearInterval(countInterval);
                this.raceStarted = true;
                this.startTime = Date.now();
                this.animate();
            }
        }, 1000);
    }

    checkCollisions() {
        const track = this.tracks[this.currentTrack];
        const players = [this.player1, this.player2];

        players.forEach(player => {
            // Check checkpoint collisions
            track.checkpoints.forEach((checkpoint, index) => {
                if (this.checkPointCollision(player, checkpoint) && 
                    !player.checkpoints.has(index)) {
                    player.checkpoints.add(index);
                    
                    // Complete lap if all checkpoints are collected
                    if (player.checkpoints.size === track.checkpoints.length) {
                        player.currentLap++;
                        player.checkpoints.clear();
                        const lapTime = (Date.now() - this.startTime) / 1000;
                        player.lapTimes.push(lapTime);
                        player.bestLapTime = Math.min(player.bestLapTime, lapTime);
                    }
                }
            });

            // Check obstacle collisions
            [...track.obstacles, ...track.movingObstacles].forEach(obstacle => {
                if (this.checkRectCollision(player, obstacle) && player.collisionCooldown === 0) {
                    player.speed *= -0.5;
                    player.collisionCooldown = 30;
                }
            });
        });

        // Check player collision
        if (this.checkRectCollision(this.player1, this.player2)) {
            const temp = this.player1.speed;
            this.player1.speed = this.player2.speed * 0.8;
            this.player2.speed = temp * 0.8;
        }
    }

    checkPointCollision(player, point) {
        return Math.abs(player.x - point.x) < 20 && 
               Math.abs(player.y - point.y) < 20;
    }

    checkRectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    update() {
        if (!this.raceStarted) return;

        this.player1.handleInput(this.keys);
        this.player2.handleInput(this.keys);
        this.player1.update();
        this.player2.update();
        this.tracks[this.currentTrack].update();
        this.checkCollisions();
    }

    draw() {
        // Clear canvas with dark background
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw track
        this.tracks[this.currentTrack].draw(this.ctx);

        // Draw players
        this.player1.draw(this.ctx);
        this.player2.draw(this.ctx);

        // Draw HUD
        this.drawHUD();
    }

    drawHUD() {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px Arial';
        
        // Player 1 info
        this.ctx.fillText(`P1 Lap: ${this.player1.currentLap}/3`, 10, 20);
        this.ctx.fillText(`Best: ${this.player1.bestLapTime.toFixed(2)}s`, 10, 40);
        
        // Player 2 info
        this.ctx.fillText(`P2 Lap: ${this.player2.currentLap}/3`, 10, 60);
        this.ctx.fillText(`Best: ${this.player2.bestLapTime.toFixed(2)}s`, 10, 80);
        
        // Race time
        const raceTime = (Date.now() - this.startTime) / 1000;
        this.ctx.fillText(`Time: ${raceTime.toFixed(2)}s`, 10, 100);
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize game
window.onload = () => {
    const game = new Game();
};
