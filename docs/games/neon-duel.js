class Fighter {
    constructor(x, y, color, facing, controls) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 80;
        this.color = color;
        this.velocity = {
            x: 0,
            y: 0
        };
        this.facing = facing;
        this.controls = controls;
        this.health = 100;
        this.isAttacking = false;
        this.attackBox = {
            width: 60,
            height: 30
        };
        this.attackCooldown = 0;
        this.specialCooldown = 0;
        this.isGrounded = false;
    }

    update(canvas) {
        this.velocity.y += 0.8; // gravity
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Ground collision
        if (this.y + this.height > canvas.height - 10) {
            this.y = canvas.height - this.height - 10;
            this.velocity.y = 0;
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }

        // Wall collision
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;

        // Update cooldowns
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.specialCooldown > 0) this.specialCooldown--;
    }

    draw(ctx) {
        // Draw character
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw attack box if attacking
        if (this.isAttacking) {
            const attackX = this.facing === 'right' ? 
                this.x + this.width : 
                this.x - this.attackBox.width;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(
                attackX,
                this.y + this.height/2,
                this.attackBox.width,
                this.attackBox.height
            );
        }
        ctx.shadowBlur = 0;
    }

    attack() {
        if (this.attackCooldown === 0) {
            this.isAttacking = true;
            setTimeout(() => {
                this.isAttacking = false;
            }, 100);
            this.attackCooldown = 30;
        }
    }

    special() {
        if (this.specialCooldown === 0) {
            this.velocity.y = -15;
            this.velocity.x = this.facing === 'right' ? 15 : -15;
            this.isAttacking = true;
            setTimeout(() => {
                this.isAttacking = false;
            }, 200);
            this.specialCooldown = 120;
        }
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.player1 = new Fighter(100, 200, '#00ffff', 'right', {
            left: 'KeyA',
            right: 'KeyD',
            jump: 'KeyW',
            attack: 'KeyF',
            special: 'KeyG'
        });

        this.player2 = new Fighter(650, 200, '#ff00ff', 'left', {
            left: 'ArrowLeft',
            right: 'ArrowRight',
            jump: 'ArrowUp',
            attack: 'KeyK',
            special: 'KeyL'
        });

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

    handleInput(player) {
        // Movement
        if (this.keys.has(player.controls.left)) {
            player.velocity.x = -5;
            player.facing = 'left';
        } else if (this.keys.has(player.controls.right)) {
            player.velocity.x = 5;
            player.facing = 'right';
        } else {
            player.velocity.x = 0;
        }

        // Jump
        if (this.keys.has(player.controls.jump) && player.isGrounded) {
            player.velocity.y = -15;
        }

        // Attack
        if (this.keys.has(player.controls.attack)) {
            player.attack();
        }

        // Special
        if (this.keys.has(player.controls.special)) {
            player.special();
        }
    }

    checkCollision(attacker, defender) {
        if (!attacker.isAttacking) return;

        const attackBox = {
            x: attacker.facing === 'right' ? 
                attacker.x + attacker.width : 
                attacker.x - attacker.attackBox.width,
            y: attacker.y + attacker.height/2,
            width: attacker.attackBox.width,
            height: attacker.attackBox.height
        };

        if (attackBox.x < defender.x + defender.width &&
            attackBox.x + attackBox.width > defender.x &&
            attackBox.y < defender.y + defender.height &&
            attackBox.y + attackBox.height > defender.y) {
            
            defender.health -= 5;
            this.updateHealthBars();
            
            if (defender.health <= 0) {
                this.endGame(attacker === this.player1 ? 'Player 1' : 'Player 2');
            }
        }
    }

    updateHealthBars() {
        document.getElementById('p1Health').style.width = `${this.player1.health}%`;
        document.getElementById('p2Health').style.width = `${this.player2.health}%`;
    }

    update() {
        if (this.gameOver) return;

        this.handleInput(this.player1);
        this.handleInput(this.player2);

        this.player1.update(this.canvas);
        this.player2.update(this.canvas);

        this.checkCollision(this.player1, this.player2);
        this.checkCollision(this.player2, this.player1);
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw ground with glow effect
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#00ffff';
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height - 10);
        this.ctx.lineTo(this.canvas.width, this.canvas.height - 10);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

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
