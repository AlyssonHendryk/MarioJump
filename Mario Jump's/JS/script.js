const board = document.querySelector('.game-board');
const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe');
const coin = document.querySelector('.coin');
const livesElement = document.querySelector('#lives');
const coinsElement = document.querySelector('#coins');
const scoreElement = document.querySelector('#score');
const finalScore = document.querySelector('#finalScore');
const finalCoins = document.querySelector('#finalCoins');
const startScreen = document.querySelector('#startScreen');
const gameOverScreen = document.querySelector('#gameOverScreen');

const GROUND = 0, GRAVITY = 1850, JUMP_POWER = 900;
let gameState = 'menu', lives = 3, coins = 0, score = 0, marioY = GROUND, marioVelocity = 0;
let pipeX = 0, coinX = -60, coinY = 95, speed = 330, lastFrame = 0, invulnerableUntil = 0;

function place(element, left, bottom) { if (left !== null) element.style.left = `${left}px`; element.style.bottom = `${bottom}px`; }
function updateHud() { livesElement.textContent = lives; coinsElement.textContent = coins; scoreElement.textContent = Math.floor(score); }
function resetObstacle() {
    pipeX = board.clientWidth + 80 + Math.random() * 180;
    coinX = pipeX + 100 + Math.random() * 150;
    coinY = 80 + Math.random() * 145;
    place(pipe, pipeX, GROUND); place(coin, coinX, coinY);
}
function resetGame() {
    lives = 3; coins = 0; score = 0; speed = 330; marioY = GROUND; marioVelocity = 0;
    mario.src = './Images/mario.gif'; mario.style.width = ''; mario.style.marginLeft = ''; mario.classList.remove('hit');
    place(mario, null, marioY); resetObstacle(); updateHud();
}
function startGame() {
    resetGame(); gameState = 'playing'; startScreen.classList.add('hidden'); gameOverScreen.classList.add('hidden');
    board.focus(); lastFrame = performance.now(); requestAnimationFrame(gameLoop);
}
function jump() { if (gameState === 'playing' && marioY <= GROUND + 2) marioVelocity = JUMP_POWER; }
function overlaps(a, b) { return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top; }
function endGame() {
    gameState = 'gameover';
    // Preserva a altura do Mario: não confunde posição horizontal do cano com "bottom".
    place(mario, null, marioY); mario.src = './Images/game-over.png'; mario.style.width = '75px'; mario.style.marginLeft = '50px';
    finalScore.textContent = Math.floor(score); finalCoins.textContent = coins; gameOverScreen.classList.remove('hidden');
}
function loseLife(now) {
    if (now < invulnerableUntil) return;
    lives -= 1; updateHud();
    if (!lives) return endGame();
    invulnerableUntil = now + 900; mario.classList.add('hit'); resetObstacle();
    window.setTimeout(() => mario.classList.remove('hit'), 750);
}
function gameLoop(now) {
    if (gameState !== 'playing') return;
    const delta = Math.min((now - lastFrame) / 1000, .05); lastFrame = now;
    marioVelocity -= GRAVITY * delta; marioY = Math.max(GROUND, marioY + marioVelocity * delta); if (marioY === GROUND) marioVelocity = 0; place(mario, null, marioY);
    speed = 330 + Math.min(score * .65, 300); // desafio progressivo no estilo Dino.
    pipeX -= speed * delta; coinX -= speed * delta; place(pipe, pipeX, GROUND); place(coin, coinX, coinY); score += speed * delta / 12;
    if (pipeX < -pipe.offsetWidth) resetObstacle(); if (coinX < -coin.offsetWidth) coinX = -60;
    const marioBox = mario.getBoundingClientRect();
    if (overlaps(marioBox, pipe.getBoundingClientRect())) loseLife(now);
    if (coinX > -coin.offsetWidth && overlaps(marioBox, coin.getBoundingClientRect())) { coins += 1; score += 50; coinX = -60; }
    updateHud(); requestAnimationFrame(gameLoop);
}
document.addEventListener('keydown', (event) => {
    if (['Space', 'ArrowUp', 'KeyW'].includes(event.code)) { event.preventDefault(); jump(); }
    if (event.code === 'KeyR' && gameState === 'gameover') startGame();
});
document.querySelector('#startButton').addEventListener('click', startGame);
document.querySelector('#restartButton').addEventListener('click', startGame);
