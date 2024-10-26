class Block {
    constructor(type) {
        this.type = type;
        this.patterns = {
            I: [[1, 1, 1, 1]],
            O: [[1, 1], [1, 1]],
            T: [[0, 1, 0], [1, 1, 1]],
            S: [[0, 1, 1], [1, 1, 0]],
            Z: [[1, 1, 0], [0, 1, 1]],
            J: [[1, 0, 0], [1, 1, 1]],
            L: [[0, 0, 1], [1, 1, 1]]
        };
        this.pattern = this.patterns[type];
        this.x = 3;
        this.y = 0;
    }

    rotate() {
        const rotated = this.pattern[0].map((_, i) =>
            this.pattern.map(row => row[i]).reverse()
        );
        this.pattern = rotated;
    }
}

class NeonBlocks {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.blockSize = 30;
        this.gridWidth = 10;
        this.gridHeight = 20;
        this.grid = Array(this.gridHeight).fill().map(() => Array(this.gridWidth).fill(0));
        this.colors = {
            I: '#00ffff',
            O: '#ffff00',
            T: '#ff00ff',
            S: '#00ff00',
            Z: '#ff0000',
            J: '#0000ff',
            L: '#ff8800'
        };
        this.score = 0;
        this.gameOver = false;
        this.currentBlock = this.newBlock();
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;
        
        this.init();
    }

    init() {
        document.addEventListener('keydown', this.handleInput.bind(this));
        this.animate(0);
    }

    newBlock() {
        const types = 'IOTSZJL';
        return new Block(types[Math.floor(Math.random() * types.length)]);
    }

    handleInput(e) {
        if (this.gameOver) {
            if (e.key === 'Enter') this.restart();
            return;
        }

        switch(e.key) {
            case 'ArrowLeft':
                if (this.isValidMove(this.currentBlock, -1, 0)) 
                    this.currentBlock.x--;
                break;
            case 'ArrowRight':
                if (this.isValidMove(this.currentBlock, 1, 0))
                    this.currentBlock.x++;
                break;
            case 'ArrowDown':
                if (this.isValidMove(this.currentBlock, 0, 1))
                    this.currentBlock.y++;
                break;
            case 'ArrowUp':
                const originalPattern = [...this.currentBlock.pattern];
                this.currentBlock.rotate();
                if (!this.isValidMove(this.currentBlock, 0, 0))
                    this.currentBlock.pattern = originalPattern;
                break;
        }
    }

    isValidMove(block, offsetX, offsetY) {
        return block.pattern.every((row, y) =>
            row.every((value, x) => {
                const newX = x + block.x + offsetX;
                const newY = y + block.y + offsetY;
                return (
                    !value ||
                    (newX >= 0 &&
                     newX < this.gridWidth &&
                     newY < this.gridHeight &&
                     newY >= 0 &&
                     !this.grid[newY][newX])
                );
            })
        );
    }

    merge() {
        this.currentBlock.pattern.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.grid[y + this.currentBlock.y][x + this.currentBlock.x] = this.currentBlock.type;
                }
            });
        });
    }

    checkLines() {
        let lines = 0;
        for (let y = this.grid.length - 1; y >= 0; y--) {
            if (this.grid[y].every(value => value)) {
                lines++;
                this.grid.splice(y, 1);
                this.grid.unshift(Array(this.gridWidth).fill(0));
            }
        }
        if (lines > 0) {
            this.score += lines * 100;
            document.getElementById('score').textContent = this.score;
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.grid.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.ctx.fillStyle = this.colors[value];
                    this.ctx.shadowBlur = 10;
                    this.ctx.shadowColor = this.colors[value];
                    this.ctx.fillRect(
                        x * this.blockSize,
                        y * this.blockSize,
                        this.blockSize - 1,
                        this.blockSize - 1
                    );
                    this.ctx.shadowBlur = 0;
                }
            });
        });

        // Draw current block
        this.currentBlock.pattern.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.ctx.fillStyle = this.colors[this.currentBlock.type];
                    this.ctx.shadowBlur = 10;
                    this.ctx.shadowColor = this.colors[this.currentBlock.type];
                    this.ctx.fillRect(
                        (x + this.currentBlock.x) * this.blockSize,
                        (y + this.currentBlock.y) * this.blockSize,
                        this.blockSize - 1,
                        this.blockSize - 1
                    );
                    this.ctx.shadowBlur = 0;
                }
            });
        });

        // Draw grid lines with glow
        this.ctx.strokeStyle = '#333';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = '#00ffff';
        for (let i = 0; i <= this.gridWidth; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.blockSize, 0);
            this.ctx.lineTo(i * this.blockSize, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i <= this.gridHeight; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.blockSize);
            this.ctx.lineTo(this.canvas.width, i * this.blockSize);
            this.ctx.stroke();
        }
        this.ctx.shadowBlur = 0;
    }

    update(time = 0) {
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        this.dropCounter += deltaTime;

        if (this.dropCounter > this.dropInterval) {
            if (this.isValidMove(this.currentBlock, 0, 1)) {
                this.currentBlock.y++;
            } else {
                this.merge();
                this.checkLines();
                if (this.grid[0].some(value => value)) {
                    this.gameOver = true;
                    document.getElementById('gameOver').style.display = 'block';
                    document.getElementById('finalScore').textContent = this.score;
                    return;
                }
                this.currentBlock = this.newBlock();
            }
            this.dropCounter = 0;
        }
    }

    animate(time = 0) {
        this.update(time);
        this.draw();
        if (!this.gameOver) {
            requestAnimationFrame(this.animate.bind(this));
        }
    }

    restart() {
        this.grid = Array(this.gridHeight).fill().map(() => Array(this.gridWidth).fill(0));
        this.score = 0;
        this.gameOver = false;
        this.currentBlock = this.newBlock();
        this.dropCounter = 0;
        this.lastTime = 0;
        document.getElementById('score').textContent = '0';
        document.getElementById('gameOver').style.display = 'none';
        this.animate();
    }
}

window.onload = () => {
    new NeonBlocks();
};

function restartGame() {
    window.game = new NeonBlocks();
}
