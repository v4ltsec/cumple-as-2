const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");
const startScreen = document.getElementById("start-screen");
const endScreen = document.getElementById("end-screen");
const btnStart = document.getElementById("btn-start");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Game objects
const player = { x: 40, y: canvas.height/2 - 50, width: 12, height: 100, color: "#00d8ff", score: 0 };
const com = { x: canvas.width - 52, y: canvas.height/2 - 50, width: 12, height: 100, color: "#00ff87", score: 0 };
const ball = { x: canvas.width/2, y: canvas.height/2, radius: 10, speed: 7, velocityX: 5, velocityY: 5, color: "#fff" };

let gameActive = false;

function drawRect(x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }
function drawCircle(x, y, r, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2,false); ctx.closePath(); ctx.fill(); }
function drawText(text, x, y, color) { ctx.fillStyle = color; ctx.font = "bold 50px 'Fira Code'"; ctx.fillText(text, x, y); }
function drawNet() {
    for(let i=0; i<=canvas.height; i+=30) { drawRect(canvas.width/2 - 1, i, 2, 15, "rgba(255,255,255,0.1)"); }
}

window.addEventListener('mousemove', e => { if(gameActive) player.y = e.clientY - player.height/2; });
window.addEventListener('touchmove', e => { if(gameActive) player.y = e.touches[0].clientY - player.height/2; });

function resetBall() {
    ball.x = canvas.width/2;
    ball.y = canvas.height/2;
    ball.velocityX = -ball.velocityX;
    ball.speed = 7;
}

function update() {
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // IA Suave
    com.y += ((ball.y - (com.y + com.height/2))) * 0.08;

    // Rebote arriba y abajo
    if(ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) ball.velocityY = -ball.velocityY;

    let target = (ball.x < canvas.width/2) ? player : com;
    if(collision(ball, target)) {
        let collidePoint = (ball.y - (target.y + target.height/2));
        collidePoint = collidePoint / (target.height/2);
        let angleRad = (Math.PI/4) * collidePoint;
        let direction = (ball.x < canvas.width/2) ? 1 : -1;
        
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
        ball.speed += 0.5;
    }

    // Puntos
    if(ball.x - ball.radius < 0) {
        com.score++; resetBall(); checkWin();
    } else if (ball.x + ball.radius > canvas.width) {
        player.score++; resetBall(); checkWin();
    }
}

function collision(b, p) {
    p.top = p.y; p.bottom = p.y + p.height; p.left = p.x; p.right = p.x + p.width;
    b.top = b.y - b.radius; b.bottom = b.y + b.radius; b.left = b.x - b.radius; b.right = b.x + b.radius;
    return b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom;
}

function checkWin() {
    if(player.score >= 3 || com.score >= 3) {
        gameActive = false;
        setTimeout(() => endScreen.classList.remove('hidden'), 500);
    }
}

function render() {
    drawRect(0, 0, canvas.width, canvas.height, "#07090e");
    drawNet();
    drawText(player.score, canvas.width/4, 80, "#00d8ff");
    drawText(com.score, 3*canvas.width/4, 80, "#00ff87");
    
    // Glows
    ctx.shadowBlur = 15;
    ctx.shadowColor = player.color;
    drawRect(player.x, player.y, player.width, player.height, player.color);
    
    ctx.shadowColor = com.color;
    drawRect(com.x, com.y, com.width, com.height, com.color);
    
    ctx.shadowColor = ball.color;
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
    ctx.shadowBlur = 0; // reset
}

function loop() {
    if(gameActive) { update(); render(); }
    requestAnimationFrame(loop);
}

btnStart.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    gameActive = true;
    player.score = 0; com.score = 0;
    resetBall();
    com.x = canvas.width - 52;
    loop();
});
render();
