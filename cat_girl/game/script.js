const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const endScreen = document.getElementById("endScreen");

const startBtn = document.getElementById("startBtn");
const againBtn = document.getElementById("againBtn");
const continueBtn = document.getElementById("continueBtn");

const board = document.getElementById("board");
const player = document.getElementById("player");
const message = document.getElementById("message");
const chapterText = document.getElementById("chapterText");
const chapterName = document.getElementById("chapterName");
const scoreText = document.getElementById("scoreText");
const barFill = document.getElementById("barFill");
const levelComplete = document.getElementById("levelComplete");
const levelTitle = document.getElementById("levelTitle");
const levelText = document.getElementById("levelText");

const chapters = [
  {
    title: "פרק 1: אוזני חתול",
    instruction: "אספי את כל אוזני החתול",
    item: "assets/item-ears.png",
    playerImage: "assets/girl-1.png",
    count: 5,
    doneTitle: "צמחו לה אוזני חתול",
    doneText: "עכשיו היא שומעת את רחשי הקסם מסביב לבריכה."
  },
  {
    title: "פרק 2: אף ושפם",
    instruction: "אספי את כל קסמי האף והשפם",
    item: "assets/item-whiskers.png",
    playerImage: "assets/girl-2.png",
    count: 6,
    doneTitle: "יש לה אף ושפם חתוליים",
    doneText: "היא מרגישה את הרוח, את הפרחים ואת ריח המים הקסומים."
  },
  {
    title: "פרק 3: זנב פלאי",
    instruction: "אספי את כל קסמי הזנב",
    item: "assets/item-tail.png",
    playerImage: "assets/girl-3.png",
    count: 7,
    doneTitle: "צמח לה זנב פלאי",
    doneText: "הזנב עוזר לה לשמור על שיווי משקל ולרקוד ליד הבריכה."
  },
  {
    title: "פרק 4: לב חתולי",
    instruction: "אספי את כל הלבבות החתוליים",
    item: "assets/item-heart.png",
    playerImage: "assets/girl-4.png",
    count: 8,
    doneTitle: "הקסם הושלם",
    doneText: "היא כבר חצי ילדה וחצי חתולה, בדיוק כמו בסיפור."
  }
];

let chapterIndex = 0;
let collectedInChapter = 0;
let playerX = 50;
let playerY = 72;
let isRunning = false;
let isPaused = false;
let animationFrame = null;
let activeKeys = new Set();
let collectibles = [];
let dragActive = false;
let messageTimer = null;

const basePositions = [
  { x: 16, y: 24 }, { x: 42, y: 22 }, { x: 70, y: 26 }, { x: 84, y: 44 },
  { x: 64, y: 58 }, { x: 34, y: 62 }, { x: 18, y: 76 }, { x: 78, y: 78 }
];

function showScreen(screen) {
  [startScreen, gameScreen, endScreen].forEach((item) => {
    item.classList.toggle("is-active", item === screen);
  });
}

function setMessage(text, temporary = false) {
  window.clearTimeout(messageTimer);
  message.textContent = text;

  if (temporary) {
    messageTimer = window.setTimeout(() => {
      if (isRunning && !isPaused) {
        message.textContent = chapters[chapterIndex].instruction;
      }
    }, 1200);
  }
}

function updatePlayer() {
  player.style.left = `${playerX}%`;
  player.style.top = `${playerY}%`;
}

function updateHud() {
  const chapter = chapters[chapterIndex];
  chapterText.textContent = `${chapterIndex + 1} / ${chapters.length}`;
  chapterName.textContent = chapter.title;
  scoreText.textContent = `${collectedInChapter} / ${chapter.count}`;
  barFill.style.width = `${Math.round((collectedInChapter / chapter.count) * 100)}%`;
}

function createCollectibles() {
  collectibles.forEach((item) => item.remove());
  collectibles = [];

  const chapter = chapters[chapterIndex];
  const positions = basePositions.slice(0, chapter.count);

  positions.forEach((position, index) => {
    const item = document.createElement("img");
    item.className = "collectible";
    item.src = chapter.item;
    item.alt = "קסם לאיסוף";
    item.dataset.index = String(index);
    item.style.left = `${position.x}%`;
    item.style.top = `${position.y}%`;
    item.style.animationDelay = `${(index % 4) * 120}ms`;
    board.appendChild(item);
    collectibles.push(item);
  });
}

function startChapter(index) {
  chapterIndex = index;
  collectedInChapter = 0;
  isPaused = false;
  levelComplete.classList.remove("is-visible");

  player.src = index === 0 ? "assets/girl-0.png" : chapters[index - 1].playerImage;
  playerX = 50;
  playerY = 72;

  updatePlayer();
  updateHud();
  createCollectibles();
  setMessage(chapters[index].instruction, false);
}

function startGame() {
  showScreen(gameScreen);
  isRunning = true;
  activeKeys.clear();
  startChapter(0);
  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(loop);
}

function finishGame() {
  isRunning = false;
  isPaused = false;
  cancelAnimationFrame(animationFrame);
  showScreen(endScreen);
}

function completeChapter() {
  const chapter = chapters[chapterIndex];
  isPaused = true;
  player.src = chapter.playerImage;
  player.classList.add("is-changing");

  setTimeout(() => {
    player.classList.remove("is-changing");
  }, 460);

  levelTitle.textContent = chapter.doneTitle;
  levelText.textContent = chapter.doneText;
  levelComplete.classList.add("is-visible");
}

function continueGame() {
  levelComplete.classList.remove("is-visible");

  if (chapterIndex >= chapters.length - 1) {
    finishGame();
    return;
  }

  startChapter(chapterIndex + 1);
}

function rectsTouch(a, b) {
  const ar = a.getBoundingClientRect();
  const br = b.getBoundingClientRect();

  const shrinkA = ar.width * 0.18;
  const shrinkB = br.width * 0.18;

  return !(
    ar.right - shrinkA < br.left + shrinkB ||
    ar.left + shrinkA > br.right - shrinkB ||
    ar.bottom - shrinkA < br.top + shrinkB ||
    ar.top + shrinkA > br.bottom - shrinkB
  );
}

function collect(item) {
  if (isPaused || item.classList.contains("collected")) {
    return;
  }

  item.classList.add("collected");
  collectedInChapter += 1;
  updateHud();
  setMessage(`נאסף ${collectedInChapter} מתוך ${chapters[chapterIndex].count}`, true);

  window.setTimeout(() => {
    item.remove();
  }, 330);

  if (collectedInChapter >= chapters[chapterIndex].count) {
    window.setTimeout(completeChapter, 420);
  }
}

function movePlayer(dx, dy) {
  playerX = Math.max(9, Math.min(91, playerX + dx));
  playerY = Math.max(24, Math.min(84, playerY + dy));
  updatePlayer();
}

function loop() {
  if (!isRunning) {
    return;
  }

  if (!isPaused) {
    const speed = window.innerWidth < 640 ? 1.55 : 1.22;

    if (activeKeys.has("ArrowLeft") || activeKeys.has("left")) {
      movePlayer(-speed, 0);
    }

    if (activeKeys.has("ArrowRight") || activeKeys.has("right")) {
      movePlayer(speed, 0);
    }

    if (activeKeys.has("ArrowUp") || activeKeys.has("up")) {
      movePlayer(0, -speed);
    }

    if (activeKeys.has("ArrowDown") || activeKeys.has("down")) {
      movePlayer(0, speed);
    }

    collectibles.forEach((item) => {
      if (item.isConnected && !item.classList.contains("collected") && rectsTouch(player, item)) {
        collect(item);
      }
    });
  }

  animationFrame = requestAnimationFrame(loop);
}

document.addEventListener("keydown", (event) => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
    event.preventDefault();
    activeKeys.add(event.key);
  }
});

document.addEventListener("keyup", (event) => {
  activeKeys.delete(event.key);
});

document.querySelectorAll(".move-controls button").forEach((button) => {
  const direction = button.dataset.dir;

  button.addEventListener("pointerdown", () => {
    activeKeys.add(direction);
  });

  button.addEventListener("pointerup", () => {
    activeKeys.delete(direction);
  });

  button.addEventListener("pointerleave", () => {
    activeKeys.delete(direction);
  });

  button.addEventListener("pointercancel", () => {
    activeKeys.delete(direction);
  });
});

board.addEventListener("pointerdown", (event) => {
  if (!isRunning || isPaused) {
    return;
  }

  dragActive = true;
  board.setPointerCapture(event.pointerId);
});

board.addEventListener("pointermove", (event) => {
  if (!isRunning || isPaused || !dragActive) {
    return;
  }

  const rect = board.getBoundingClientRect();
  playerX = ((event.clientX - rect.left) / rect.width) * 100;
  playerY = ((event.clientY - rect.top) / rect.height) * 100;
  playerX = Math.max(9, Math.min(91, playerX));
  playerY = Math.max(24, Math.min(84, playerY));
  updatePlayer();
});

board.addEventListener("pointerup", (event) => {
  dragActive = false;

  if (board.hasPointerCapture(event.pointerId)) {
    board.releasePointerCapture(event.pointerId);
  }
});

board.addEventListener("pointercancel", () => {
  dragActive = false;
});

startBtn.addEventListener("click", startGame);
againBtn.addEventListener("click", startGame);
continueBtn.addEventListener("click", continueGame);

updatePlayer();
