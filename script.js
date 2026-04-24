const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* ================= PAUSE BUTTON ================= */
const pauseBtn = document.getElementById("pauseBtn");
pauseBtn.onclick = () => {
    paused = !paused;
    pauseBtn.innerText = paused ? "▶ Resume" : "⏸ Pause";
    if (!paused) startTimer();
};

/* ================= CANVAS ================= */
function resizeCanvas() {
    const oldW = canvas.width || canvas.clientWidth;
    const oldH = canvas.height || canvas.clientHeight;
    canvas.width  = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // Re-position game objects proportionally on resize
    if (paddle.y > 0) {
        paddle.x = (paddle.x / oldW) * canvas.width;
        paddle.y = canvas.height - paddleBottomOffset();
        paddle.w = calcPaddleW();
        paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, paddle.x));
    }
    if (ball.x > 0) {
        ball.x = Math.min(ball.x / oldW * canvas.width, canvas.width  - ball.r);
        ball.y = Math.min(ball.y / oldH * canvas.height, canvas.height - ball.r);
        ball.r = calcBallR();
    }
    brickW = canvas.width / cols;
}
window.addEventListener("resize", resizeCanvas);

/* ================= GAME VARIABLES ================= */
let level = 1;
let score = 0;
let lives = 3;
let paused = true;

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const timeEl  = document.getElementById("time");
const starsEl = document.getElementById("stars");

/* ================= HELPERS (responsive sizing) ================= */
function calcPaddleW() { return Math.max(60, canvas.width * 0.18); }
function calcBallR()   { return Math.max(5,  Math.min(canvas.width, canvas.height) * 0.015); }
function calcBallSpeed() {
    const base = Math.max(2.5, Math.min(canvas.width, canvas.height) * 0.006);
    return base + (level - 1) * 0.3;
}
function paddleBottomOffset() { return Math.max(20, canvas.height * 0.05); }

/* ================= STAR BACKGROUND ================= */
const bgStars = [];
for (let i = 0; i < 120; i++) {
    bgStars.push({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.5 + 0.5,
        s: Math.random() * 0.0004 + 0.0001
    });
}

function drawStars() {
    ctx.fillStyle = "#0b132b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    bgStars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x * canvas.width, star.y * canvas.height, star.r, 0, Math.PI * 2);
        ctx.fill();
        star.y += star.s;
        if (star.y > 1) { star.y = 0; star.x = Math.random(); }
    });
}

/* ================= TIMER ================= */
let levelStartTime = 0;

function startTimer() { levelStartTime = performance.now(); }

function updateTimer() {
    const t = ((performance.now() - levelStartTime) / 1000).toFixed(1);
    timeEl.innerText = t + " s";
}

/* ================= PADDLE ================= */
const paddle = { w: 120, h: 14, x: 0, y: 0, speed: 0 };

/* ================= BALL ================= */
const ball = { r: 8, x: 0, y: 0, dx: 4, dy: -4 };

/* ================= BRICKS ================= */
const rows = 7;
const cols = 14;
const brickH = 22;
let brickW;
let bricks = [];

const brickColors = [
    "#BB9351","#EDCDAF","#C19A6B",
    "#CFB595","#A9846A","#B98663","#A6674C"
];

const patterns = [
    (r,c)=>true,
    (r,c)=>(r+c)%2===0,
    (r,c)=>c%2===0,
    (r,c)=>r%2===0,
    (r,c)=>Math.abs(c-cols/2)>r/2
];

function updateStars() {
    const filled = Math.min(level, 3);
    starsEl.innerText = "★".repeat(filled) + "☆".repeat(3 - filled);
}

function createBricks() {
    brickW = canvas.width / cols;
    bricks = [];
    const p = patterns[Math.min(level - 1, patterns.length - 1)];
    for (let r = 0; r < rows; r++) {
        bricks[r] = [];
        for (let c = 0; c < cols; c++) {
            bricks[r][c] = {
                hit: !p(r, c),
                color: brickColors[r % brickColors.length]
            };
        }
    }
    updateStars();
    startTimer();
}

/* ================= KEYBOARD CONTROLS ================= */
let left = false, right = false;
document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft")  left  = true;
    if (e.key === "ArrowRight") right = true;
});
document.addEventListener("keyup", e => {
    if (e.key === "ArrowLeft")  left  = false;
    if (e.key === "ArrowRight") right = false;
});

/* ================= TOUCH CONTROLS ================= */

// Detect touch device and show on-screen buttons
function isTouchDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}
if (isTouchDevice()) {
    document.getElementById("mobileControls").style.display = "flex";
}

// Drag finger on canvas → paddle follows
canvas.addEventListener("touchmove", e => {
    e.preventDefault();
    const touch  = e.touches[0];
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const touchX = (touch.clientX - rect.left) * scaleX;
    paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, touchX - paddle.w / 2));
}, { passive: false });

canvas.addEventListener("touchstart", e => {
    e.preventDefault();
    const touch  = e.touches[0];
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const touchX = (touch.clientX - rect.left) * scaleX;
    paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, touchX - paddle.w / 2));
}, { passive: false });

// On-screen left / right buttons
const leftBtn  = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

leftBtn.addEventListener("touchstart",  e => { e.preventDefault(); left  = true;  }, { passive: false });
leftBtn.addEventListener("touchend",    e => { e.preventDefault(); left  = false; }, { passive: false });
leftBtn.addEventListener("touchcancel", e => { left  = false; });

rightBtn.addEventListener("touchstart",  e => { e.preventDefault(); right = true;  }, { passive: false });
rightBtn.addEventListener("touchend",    e => { e.preventDefault(); right = false; }, { passive: false });
rightBtn.addEventListener("touchcancel", e => { right = false; });

// Prevent page scroll while touching the game area
document.getElementById("gameUI").addEventListener("touchmove", e => e.preventDefault(), { passive: false });

/* ================= DRAW ================= */
function drawBricks() {
    const brickTopOffset = Math.max(30, canvas.height * 0.06);
    bricks.forEach((row, r) => {
        row.forEach((b, c) => {
            if (!b.hit) {
                ctx.fillStyle = b.color;
                ctx.fillRect(
                    c * brickW + 2,
                    r * brickH + brickTopOffset,
                    brickW - 4,
                    brickH - 4
                );
            }
        });
    });
}

function drawPaddle() {
    const radius = paddle.h / 2;
    ctx.fillStyle = "#f1f1f1";
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, radius);
    ctx.fill();
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fillStyle = "gold";
    ctx.fill();
}

/* ================= COLLISION ================= */
function collision() {
    const brickTopOffset = Math.max(30, canvas.height * 0.06);
    bricks.forEach((row, r) => {
        row.forEach((b, c) => {
            if (!b.hit) {
                const bx = c * brickW;
                const by = r * brickH + brickTopOffset;
                if (
                    ball.x > bx &&
                    ball.x < bx + brickW &&
                    ball.y > by &&
                    ball.y < by + brickH
                ) {
                    b.hit = true;
                    ball.dy *= -1;
                    score += 10;
                    scoreEl.innerText = score;
                }
            }
        });
    });
}

/* ================= GAME LOOP ================= */
function gameLoop() {
    if (!paused) {
        drawStars();
        updateTimer();

        // Move paddle
        if (left  && paddle.x > 0)                      paddle.x -= paddle.speed;
        if (right && paddle.x < canvas.width - paddle.w) paddle.x += paddle.speed;

        // Move ball
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Wall bounce
        if (ball.x < ball.r)                  { ball.x = ball.r;                  ball.dx *= -1; }
        if (ball.x > canvas.width - ball.r)   { ball.x = canvas.width - ball.r;   ball.dx *= -1; }
        if (ball.y < ball.r)                  { ball.y = ball.r;                  ball.dy *= -1; }

        // Paddle bounce
        if (
            ball.dy > 0 &&
            ball.y + ball.r > paddle.y &&
            ball.y - ball.r < paddle.y + paddle.h &&
            ball.x > paddle.x &&
            ball.x < paddle.x + paddle.w
        ) {
            ball.dy = -Math.abs(ball.dy);
            // Add angle based on hit position
            const hitPos = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
            ball.dx = hitPos * calcBallSpeed() * 1.2;
        }

        // Ball out of bounds
        if (ball.y > canvas.height + ball.r) {
            lives--;
            livesEl.innerText = "❤️ ".repeat(Math.max(0, lives));
            resetBall();
            if (lives <= 0) {
                document.getElementById("gameOver").style.display = "flex";
                paused = true;
                requestAnimationFrame(gameLoop);
                return;
            }
        }

        collision();

        // Level clear
        if (bricks.flat().every(b => b.hit)) {
            level++;
            const spd = calcBallSpeed();
            ball.dx = ball.dx > 0 ? spd : -spd;
            ball.dy = -spd;
            createBricks();
        }

        drawBricks();
        drawPaddle();
        drawBall();
    } else {
        // Still redraw background while paused so it doesn't freeze visually
        drawStars();
        drawBricks();
        drawPaddle();
        drawBall();
    }

    requestAnimationFrame(gameLoop);
}

/* ================= RESET ================= */
function resetBall() {
    ball.r  = calcBallR();
    const spd = calcBallSpeed();
    ball.x  = canvas.width / 2;
    ball.y  = paddle.y - ball.r - 2;
    ball.dx = spd * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = -spd;
}

/* ================= FULL GAME RESET ================= */
function fullReset() {
    level  = 1;
    score  = 0;
    lives  = 3;
    scoreEl.innerText = score;
    livesEl.innerText = "❤️ ❤️ ❤️";
    document.getElementById("gameOver").style.display = "none";
    init();
    paused = false;
    pauseBtn.innerText = "⏸ Pause";
}

document.getElementById("restartBtn").onclick = fullReset;

/* ================= INIT ================= */
function init() {
    resizeCanvas();
    paddle.w     = calcPaddleW();
    paddle.h     = Math.max(10, canvas.height * 0.022);
    paddle.speed = Math.max(6, canvas.width * 0.012);
    paddle.x     = canvas.width  / 2 - paddle.w / 2;
    paddle.y     = canvas.height - paddleBottomOffset() - paddle.h;

    ball.r = calcBallR();
    createBricks();
    resetBall();
}

/* ================= START BUTTON ================= */
document.getElementById("startBtn").onclick = () => {
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameUI").classList.remove("hidden");
    resizeCanvas();
    init();
    paused = false;
    pauseBtn.innerText = "⏸ Pause";
    startTimer();
};

/* ================= BOOTSTRAP ================= */
// Run init once so canvas size is set up correctly before startBtn is pressed
resizeCanvas();
init();
gameLoop();
