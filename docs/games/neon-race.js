class Racer {
    constructor(x, y, color, controls) {
        this.x = x;
        this.y = y;
        this.width = 50;  // Made car wider
        this.height = 30; // Made car shorter
        this.color = color;
        this.velocity = {
            x: 0,
            y: 0
        };
        this.angle = 0;
        this.speed = 0;
        this.maxSpeed = 7;
        this.acceleration = 0.2;
        this.friction = 0.95;
        this.controls = controls;
        this.currentTrack = 0;
        this.laps = [0, 0, 0];
        this.checkpoints = new Set();
        this.transitioningTrack = false;
        this.transitionAlpha = 1;
    }

    update(canvas, obstacles) {
        if (this.transitioningTrack) {
            this.transitionAlpha -= 0.05;
            if (this.transitionAlpha <= 0) {
                this.transitioningTrack = false;
                this.transitionAlpha = 1;
            }
            return;
        }

        if (this.speed > 0) this.speed *= this.friction;
        if (this.speed < 0) this.speed *= this.friction;
        
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;

        for (let obstacle of obstacles) {
            if (this.checkCollision(obstacle)) {
                this.speed *= -0.5;
            }
        }
    }

    checkCollision(obstacle) {
        return (this.x < obstacle.x + obstacle.width &&
                this.x + this.width > obstacle.x &&
                this.y < obstacle.y + obstacle.height &&
                this.y + this.height > obstacle.y);
    }

    draw(ctx) {
        if (this.transitioningTrack) {
            ctx.globalAlpha = this.transitionAlpha;
        }

        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.angle);
        
        // Draw car body with glow effect
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        // Draw headlights on the front (shorter side)
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        // Left headlight
        ctx.fillRect(this.width/2 - 5, -this.height/4, 5, 5);
        // Right headlight
        ctx.fillRect(this.width/2 - 5, this.height/4 - 5, 5, 5);
        
        // Draw rear lights on the back (shorter side)
        ctx.fillStyle = '#ff0000';
        ctx.shadowColor = '#ff0000';
        // Left rear light
        ctx.fillRect(-this.width/2, -this.height/4, 3, 3);
        // Right rear light
        ctx.fillRect(-this.width/2, this.height/4 - 3, 3, 3);
        
        ctx.shadowBlur = 0;
        ctx.restore();

        if (this.transitioningTrack) {
            ctx.globalAlpha = 1;
        }
    }

    startTrackTransition() {
        this.transitioningTrack = true;
        this.transitionAlpha = 1;
    }
}

class Track {
    constructor(index, obstacles, checkpoints, startPosition) {
        this.index = index;
        this.obstacles = obstacles;
        this.checkpoints = checkpoints;
        this.startPosition = startPosition;
        this.transitionOut = false;
        this.transitionAlpha = 1;
    }

    draw(ctx) {
        if (this.transitionOut) {
            ctx.globalAlpha = this.transitionAlpha;
        }

        // Draw track border
        ctx.strokeStyle = '#00ffff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ffff';
        ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw obstacles with glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ffff';
        ctx.fillStyle = '#003333';
        for (let obstacle of this.obstacles) {
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }

        // Draw checkpoints with different glow effect
        ctx.shadowColor = '#ffff00';
        ctx.strokeStyle = '#ffff00';
        for (let checkpoint of this.checkpoints) {
            ctx.beginPath();
            ctx.arc(checkpoint.x, checkpoint.y, 10, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;

        if (this.transitionOut) {
            ctx.globalAlpha = 1;
        }
    }

    startTransitionOut() {
        this.transitionOut = true;
        this.transitionAlpha = 1;
    }

    update() {
        if (this.transitionOut) {
            this.transitionAlpha -= 0.05;
            return this.transitionAlpha <= 0;
        }
        return false;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.tracks = this.createTracks();
        this.currentTrack = 0;

        this.player1 = new Racer(50, 200, '#00ffff', {
            up: 'KeyW',
            down: 'KeyS',
            left: 'KeyA',
            right: 'KeyD'
        });

        this.player2 = new Racer(50, 300, '#ff00ff', {
            up: 'ArrowUp',
            down: 'ArrowDown',
            left: 'ArrowLeft',
            right: 'ArrowRight'
        });

        this.keys = new Set();
        this.gameOver = false;

        this.setupControls();
        this.animate();
    }

    createTracks() {
        return [
            new Track(0, [
                { x: 200, y: 100, width: 20, height: 400 },
                { x: 400, y: 0, width: 20, height: 300 },
                { x: 600, y: 200, width: 20, height: 400 }
            ], [
                { x: 300, y: 250 },
                { x: 500, y: 150 },
                { x: 700, y: 350 }
            ], { x: 50, y: 200 }),

            new Track(1, [
                { x: 100, y: 150, width: 400, height: 20 },
                { x: 300, y: 300, width: 400, height: 20 },
                { x: 200, y: 400, width: 400, height: 20 }
            ], [
                { x: 250, y: 100 },
                { x: 450, y: 250 },
                { x: 650, y: 400 }
            ], { x: 50, y: 100 }),

            new Track(2, [
                { x: 200, y: 100, width: 20, height: 200 },
                { x: 400, y: 300, width: 200, height: 20 },
                { x: 600, y: 100, width: 20, height: 300 }
            ], [
                { x: 300, y: 200 },
                { x: 500, y: 350 },
                { x: 700, y: 200 }
            ], { x: 50, y: 300 })
        ];
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });
    }

    handleInput(player) {
        // Acceleration
        if (this.keys.has(player.controls.up)) {
            player.speed = Math.min(player.speed + player.acceleration, player.maxSpeed);
        }
        if (this.keys.has(player.controls.down)) {
            player.speed = Math.max(player.speed - player.acceleration, -player.maxSpeed/2);
        }

        // Steering
        if (this.keys.has(player.controls.left)) {
            player.angle -= 0.05;
        }
        if (this.keys.has(player.controls.right)) {
            player.angle += 0.05;
        }
    }

    checkCheckpoints(player) {
        const track = this.tracks[player.currentTrack];
        for (let checkpoint of track.checkpoints) {
            const dx = player.x + player.width/2 - checkpoint.x;
            const dy = player.y + player.height/2 - checkpoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 30 && !player.checkpoints.has(checkpoint)) {
                player.checkpoints.add(checkpoint);
                
                if (player.checkpoints.size === track.checkpoints.length) {
                    player.laps[player.currentTrack]++;
                    player.checkpoints.clear();
                    
                    if (player.laps[player.currentTrack] >= 3) {
                        // Start transition effect
                        track.startTransitionOut();
                        player.startTrackTransition();
                        
                        setTimeout(() => {
                            player.currentTrack++;
                            if (player.currentTrack >= this.tracks.length) {
                                this.endGame(player === this.player1 ? 'Player 1' : 'Player 2');
                                return;
                            }
                            const newTrack = this.tracks[player.currentTrack];
                            player.x = newTrack.startPosition.x;
                            player.y = newTrack.startPosition.y;
                            player.speed = 0;
                            player.angle = 0;
                        }, 1000);
                    }
                }
            }
        }
    }

    update() {
        if (this.gameOver) return;

        this.handleInput(this.player1);
        this.handleInput(this.player2);

        this.player1.update(this.canvas, this.tracks[this.player1.currentTrack].obstacles);
        this.player2.update(this.canvas, this.tracks[this.player2.currentTrack].obstacles);

        // Update tracks for transition effects
        this.tracks.forEach(track => track.update());

        this.checkCheckpoints(this.player1);
        this.checkCheckpoints(this.player2);

        this.updateProgress();
    }

    updateProgress() {
        document.getElementById('p1Progress').textContent = 
            `Player 1 - Track: ${this.player1.currentTrack + 1}, Laps: ${this.player1.laps[this.player1.currentTrack]}/3`;
        document.getElementById('p2Progress').textContent = 
            `Player 2 - Track: ${this.player2.currentTrack + 1}, Laps: ${this.player2.laps[this.player2.currentTrack]}/3`;
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw only the active tracks
        this.tracks.forEach((track, index) => {
            if (index === this.player1.currentTrack || index === this.player2.currentTrack) {
                track.draw(this.ctx);
            }
        });

        // Draw players
        this.player1.draw(this.ctx);
        this.player2.draw(this.ctx);
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    endGame(winner) {
        this.gameOver = true;
        document.getElementById('winner').textContent = `${winner} Wins!`;
        document.getElementById('gameOver').style.display = 'block';
    }
}

function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    window.game = new Game();
}

window.onload = () => {
    window.game = new Game();
};
