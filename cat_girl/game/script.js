const screens = {
  start: document.getElementById('startScreen'),
  game: document.getElementById('gameScreen'),
  end: document.getElementById('endScreen')
};

const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const board = document.getElementById('board');
const player = document.getElementById('player');
let collectibleItems = [];
const burst = document.getElementById('burst');
const stageLabel = document.getElementById('stageLabel');
const timeText = document.getElementById('timeText');
const storyBubble = document.getElementById('storyBubble');
const progressDots = Array.from(document.querySelectorAll('.progress-dot'));
const endTitle = document.getElementById('endTitle');
const endText = document.getElementById('endText');
const endGirl = document.getElementById('endGirl');

const stages = [
  {
    item: 'assets/item-ears.png',
    stageImage: 'assets/girl-1.png',
    label: 'אוזני חתול',
    instruction: 'אספי קודם את אוזני החתול',
    success: 'יופי. צמחו לה אוזני חתול'
  },
  {
    item: 'assets/item-whiskers.png',
    stageImage: 'assets/girl-2.png',
    label: 'אף ושפם',
    instruction: 'עכשיו אספי את האף והשפם',
    success: 'מקסים. עכשיו יש לה אף ושפם חתוליים'
  },
  {
    item: 'assets/item-tail.png',
    stageImage: 'assets/girl-3.png',
    label: 'זנב פלאי',
    instruction: 'עוד שלב אחד: אספי את הזנב הקסום',
    success: 'איזה יופי. צמח לה זנב פלאי'
  },
  {
    item: 'assets/item-heart.png',
    stageImage: 'assets/girl-4.png',
    label: 'חצי חתולה',
    instruction: 'לבסוף, אספי את הלב החתולי',
    success: 'הקסם הושלם'
  }
];

let currentStage = 0;
let timeLeft = 90;
let playerX = 50;
let playerY = 72;
let running = false;
let dragActive = false;
let animationFrame = null;
let timer = null;
let activeKeys = new Set();
let messageTimeout = null;

function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => {
    el.classList.toggle('is-active', key === name);
  });
}

function updatePlayerPosition() {
  player.style.left = `${playerX}%`;
  player.style.top = `${playerY}%`;
}

function setMessage(text, persistent = false) {
  clearTimeout(messageTimeout);
  storyBubble.textContent = text;
  if (!persistent && running && currentStage < stages.length) {
    messageTimeout = setTimeout(() => {
      storyBubble.textContent = stages[currentStage].instruction;
    }, 1200);
  }
}

function updateHud() {
  timeText.textContent = timeLeft;
  stageLabel.textContent = currentStage === 0 ? 'ילדה רגילה' : stages[currentStage - 1].label;
  progressDots.forEach((dot, index) => {
    dot.classList.toggle('is-active', index === currentStage);
    dot.classList.toggle('is-done', index < currentStage);
  });
}

function placeCollectibles() {
  board.querySelectorAll('.collectible').forEach((item) => item.remove());

  const positions = [
    { x: 18, y: 28 },
    { x: 78, y: 30 },
    { x: 22, y: 70 },
    { x: 76, y: 68 }
  ];

  collectibleItems = stages.map((stage, index) => {
    const item = document.createElement('img');

    item.className = 'collectible';
    item.src = stage.item;
    item.alt = stage.label;
    item.dataset.index = index;

    item.style.left = `${positions[index].x}%`;
    item.style.top = `${positions[index].y}%`;

    board.appendChild(item);
    return item;
  });
}

function resetGame() {
  currentStage = 0;
  timeLeft = 90;
  playerX = 50;
  playerY = 72;
  activeKeys.clear();
  player.src = 'assets/girl-0.png';
  endGirl.src = 'assets/girl-4.png';
  updatePlayerPosition();
  updateHud();
  placeCollectibles();
  setMessage('אספי את כל הקסמים כדי להפוך לחצי חתולה', true);
}

function startGame() {
  resetGame();
  running = true;
  showScreen('game');
  timer = setInterval(() => {
    timeLeft -= 1;
    updateHud();
    if (timeLeft <= 0) {
      finishGame(false);
    }
  }, 1000);
  animationFrame = requestAnimationFrame(loop);
}

function stopGame() {
  running = false;
  clearInterval(timer);
  cancelAnimationFrame(animationFrame);
}

function finishGame(won) {
  stopGame();
  if (won) {
    endTitle.textContent = 'היא הפכה לחצי חתולה';
    endText.textContent = 'עזרת לה להשלים את כל הקסמים. עכשיו היא יכולה לספר בגאווה שאבא שלה היה חתול ואמא שלה בת אדם.';
    endGirl.src = 'assets/girl-4.png';
    showScreen('end');
  } else {
    endTitle.textContent = 'כמעט הצלחת';
    endText.textContent = 'הזמן נגמר לפני שכל הקסמים נאספו. נסי שוב ותעזרי לה להפוך לחצי חתולה.';
    endGirl.src = currentStage >= 3 ? 'assets/girl-3.png' : currentStage === 2 ? 'assets/girl-2.png' : currentStage === 1 ? 'assets/girl-1.png' : 'assets/girl-0.png';
    showScreen('end');
  }
}

function rectsTouch(a, b) {
  const ar = a.getBoundingClientRect();
  const br = b.getBoundingClientRect();
  return !(ar.right < br.left || ar.left > br.right || ar.bottom < br.top || ar.top > br.bottom);
}

function triggerBurst(item) {
  const itemRect = item.getBoundingClientRect();
  const boardRect = board.getBoundingClientRect();

  burst.style.left = `${itemRect.left - boardRect.left + itemRect.width / 2}px`;
  burst.style.top = `${itemRect.top - boardRect.top + itemRect.height / 2}px`;

  burst.classList.remove('is-active');
  void burst.offsetWidth;
  burst.classList.add('is-active');
}

function collect(item) {
  if (!item || item.classList.contains('collected')) {
    return;
  }

  item.classList.add('collected');
  triggerBurst(item);

  currentStage += 1;

  const nextImageIndex = Math.min(currentStage, stages.length);
  player.src = `assets/girl-${nextImageIndex}.png`;

  updateHud();

  if (currentStage < stages.length) {
    setMessage(`נאסף קסם ${currentStage} מתוך ${stages.length}`);
  }

  if (currentStage >= stages.length) {
    setMessage('הקסם הושלם. היא הפכה לחצי חתולה');
    setTimeout(() => finishGame(true), 850);
  }
}

function movePlayer(dx, dy) {
  playerX = Math.max(10, Math.min(90, playerX + dx));
  playerY = Math.max(22, Math.min(84, playerY + dy));
  updatePlayerPosition();
}

function loop() {
  if (!running) return;

  const speed = window.innerWidth < 640 ? 1.55 : 1.2;

  if (activeKeys.has('ArrowLeft') || activeKeys.has('left')) movePlayer(-speed, 0);
  if (activeKeys.has('ArrowRight') || activeKeys.has('right')) movePlayer(speed, 0);
  if (activeKeys.has('ArrowUp') || activeKeys.has('up')) movePlayer(0, -speed);
  if (activeKeys.has('ArrowDown') || activeKeys.has('down')) movePlayer(0, speed);

  collectibleItems.forEach((item) => {
  if (!item.classList.contains('collected') && rectsTouch(player, item)) {
    collect(item);
  }
});

  animationFrame = requestAnimationFrame(loop);
}

document.addEventListener('keydown', (event) => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
    event.preventDefault();
    activeKeys.add(event.key);
  }
});

document.addEventListener('keyup', (event) => {
  activeKeys.delete(event.key);
});

document.querySelectorAll('.mobile-controls button').forEach((button) => {
  const dir = button.dataset.dir;
  button.addEventListener('pointerdown', () => activeKeys.add(dir));
  button.addEventListener('pointerup', () => activeKeys.delete(dir));
  button.addEventListener('pointerleave', () => activeKeys.delete(dir));
  button.addEventListener('pointercancel', () => activeKeys.delete(dir));
});

board.addEventListener('pointerdown', (event) => {
  if (!running) return;
  dragActive = true;
  board.setPointerCapture(event.pointerId);
});

board.addEventListener('pointermove', (event) => {
  if (!running || !dragActive) return;
  const rect = board.getBoundingClientRect();
  playerX = ((event.clientX - rect.left) / rect.width) * 100;
  playerY = ((event.clientY - rect.top) / rect.height) * 100;
  playerX = Math.max(10, Math.min(90, playerX));
  playerY = Math.max(22, Math.min(84, playerY));
  updatePlayerPosition();
});

board.addEventListener('pointerup', (event) => {
  dragActive = false;
  if (board.hasPointerCapture(event.pointerId)) {
    board.releasePointerCapture(event.pointerId);
  }
});

board.addEventListener('pointercancel', () => {
  dragActive = false;
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

updatePlayerPosition();
updateHud();
placeCollectibles();
