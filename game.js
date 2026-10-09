const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

class Ball {
    constructor(x, y, radius, speedX, speedY) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speedX = speedX;
        this.speedY = speedY;
    }

    draw(color) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
    }

    move() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) {
            this.speedY = -this.speedY;
        }
    }

    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.speedX = -this.speedX;
    }
}

class Paddle {
    constructor(x, y, width, height, isPlayerControlled = false, speed = 5) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isPlayerControlled = isPlayerControlled;
        this.speed = speed;
    }

    draw(color, sumLarge) {
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height + sumLarge);
    }

    move(direction, sumLarge) {
        if (direction === 'up' && this.y > 0) {
            this.y -= this.speed;
        } else if (direction === 'down' && this.y + this.height + sumLarge + sumLarge < canvas.height) {
            this.y += this.speed;
        }
    }

    autoMove(balls) {
        // Filtramos solo las pelotas que se dirigen hacia la paleta de la CPU
        let incomingBalls = balls.filter(b => b.speedX > 0);
        
        // Si hay pelotas viniendo, seguimos a la más cercana; si no, a la más cercana general
        let targetBalls = incomingBalls.length > 0 ? incomingBalls : balls;

        let closestBall = targetBalls[0];
        let minDistance = Math.abs(this.x - targetBalls[0].x);

        for (let i = 1; i < targetBalls.length; i++) {
            let distance = Math.abs(this.x - targetBalls[i].x);
            if (distance < minDistance) {
                minDistance = distance;
                closestBall = targetBalls[i];
            }
        }

        // Movimiento de seguimiento
        const paddleCenter = this.y + this.height / 2;
        if (closestBall.y < paddleCenter - 5) {
            this.y -= this.speed;
        } else if (closestBall.y > paddleCenter + 5) {
            this.y += this.speed;
        }
    }
}

class Game {
    constructor() {
        this.ball = new Ball(canvas.width / 2, canvas.height / 2, 8, 2, 2);
        this.ball2 = new Ball(canvas.width / 2, canvas.height / 2, 12, 1.5, 1.5);
        this.ball3 = new Ball(canvas.width / 2, canvas.height / 2, 6, 1.8, 1.2);
        this.ball4 = new Ball(canvas.width / 2, canvas.height / 2, 18, 1, 1);
        this.ball5 = new Ball(canvas.width / 2, canvas.height / 2, 14, 2, 1);

        this.balls = [this.ball, this.ball2, this.ball3, this.ball4, this.ball5];

        this.paddle1 = new Paddle(0, canvas.height / 2 - 50, 10, 100, true, 5);
        // Le damos más velocidad a la CPU (12) para que sea invencible
        this.paddle2 = new Paddle(canvas.width - 10, canvas.height / 2 - 50, 10, 100, false, 12);
        this.keys = {};
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.ball.draw('#ff0055');
        this.ball2.draw('#00ffcc');
        this.ball3.draw('#ffcc00');
        this.ball4.draw('#a855f7');
        this.ball5.draw('#22c55e');
        
        this.paddle1.draw('green', 100);
        this.paddle2.draw('red', 0);
    }

    update() {
        this.balls.forEach(b => b.move());

        if (this.keys['ArrowUp']) {
            this.paddle1.move('up', 50);
        }
        if (this.keys['ArrowDown']) {
            this.paddle1.move('down', 50);
        }

        this.paddle2.autoMove(this.balls);

        this.balls.forEach(b => {
            if (b.x - b.radius <= this.paddle1.x + this.paddle1.width &&
                b.y >= this.paddle1.y && b.y <= this.paddle1.y + this.paddle1.height + 100) {
                b.speedX = -b.speedX;
            }

            if (b.x + b.radius >= this.paddle2.x &&
                b.y >= this.paddle2.y && b.y <= this.paddle2.y + this.paddle2.height) {
                b.speedX = -b.speedX;
            }

            if (b.x - b.radius <= 0 || b.x + b.radius >= canvas.width) {
                b.reset();
            }
        });
    }

    handleInput() {
        window.addEventListener('keydown', (event) => {
            this.keys[event.key] = true;
        });

        window.addEventListener('keyup', (event) => {
            this.keys[event.key] = false;
        });
    }

    run() {
        this.handleInput();
        const gameLoop = () => {
            this.update();
            this.draw();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }
}

const game = new Game();
game.run();