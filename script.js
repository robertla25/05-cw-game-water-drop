// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let setDrop; // Will determine if a drop is good or bad
let gallons = 0; // Track current gallons in the water can
let gallonsCollected = 0; // Track total gallons collected
let score = 0; // Track the score
let timeLeft = 30;
let timerInterval = null;

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);

const gameContainer = document.getElementById("game-container");
const canWrapper = document.getElementById("can-wrapper");
const waterCan = document.getElementById("water-can");
const gallonsDisplay = document.getElementById("gallons-display");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const resetBtn = document.getElementById("reset-btn");
let canPosition = 370; // Initial left position in px
const canSpeed = 6;   // Pixels to move per key press (reduced for smoother, slower movement)

// Initialize displays
updateScoreDisplay();
updateGallonsDisplay();
timeDisplay.textContent = timeLeft;
resetBtn.style.display = "none";

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  gameRunning = true;
  resetBtn.style.display = "inline-block";
  timeLeft = 30;
  timeDisplay.textContent = timeLeft;
  document.getElementById("start-btn").style.display = "none";
  hidePopup();

  // Create new drops every second (1000 milliseconds)
  dropMaker = setInterval(createDrop, 1000);

  timerInterval = setInterval(() => {
    timeLeft--;
    timeDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  requestAnimationFrame(checkDropCollision);
}

function endGame() {
  gameRunning = false;
  resetBtn.style.display = "none";
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  // Remove all drops
  document.querySelectorAll('.water-drop, .bad-drop').forEach(drop => drop.remove());
  showPopup();
}

function showConfetti() {
  const confettiColors = ['#FFC907', '#2E9DF7', '#8BD1CB', '#4FCB53', '#FF902A', '#F5402C', '#159A48', '#F16061'];
  const container = document.getElementById('game-container');
  for (let i = 0; i < 60; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'absolute';
    confetti.style.width = '12px';
    confetti.style.height = '12px';
    confetti.style.borderRadius = '3px';
    confetti.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.bottom = '0px'; // Start at the bottom
    confetti.style.opacity = 0.85;
    confetti.style.zIndex = 200;
    confetti.style.pointerEvents = 'none';
    const rise = 600 + Math.random() * 200;
    const rotate = Math.random() * 360;
    confetti.animate([
      { transform: `translateY(0) rotate(0deg)`, opacity: 0.85 },
      { transform: `translateY(-${rise}px) rotate(${rotate}deg)`, opacity: 0.85 }
    ], {
      duration: 1200 + Math.random() * 1200,
      easing: 'ease-out',
      fill: 'forwards'
    });
    setTimeout(() => confetti.remove(), 2200);
    container.appendChild(confetti);
  }
}

function showPopup() {
  showConfetti();
  let popup = document.getElementById("game-popup");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "game-popup";
    popup.style.position = "absolute";
    popup.style.top = "50%";
    popup.style.left = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.background = "#fff";
    popup.style.border = "2px solid #2E9DF7";
    popup.style.borderRadius = "16px";
    popup.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)";
    popup.style.padding = "36px 32px 28px 32px";
    popup.style.textAlign = "center";
    popup.style.zIndex = 100;
    popup.innerHTML = `
      <div id="popup-message" style="font-size: 1.5em; margin-bottom: 24px;"></div>
      <button id="play-again-btn" style="padding: 8px 16px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Play Again</button>
    `;
    document.getElementById("game-container").appendChild(popup);
  }
  document.getElementById("popup-message").textContent = `Great job! You collected ${gallonsCollected} gallons and scored ${score} points!`;
  popup.style.display = "block";
  document.getElementById("play-again-btn").onclick = resetGame;
}

function hidePopup() {
  const popup = document.getElementById("game-popup");
  if (popup) popup.style.display = "none";
}

function resetGame() {
  gallons = 0;
  score = 0;
  gallonsCollected = 0;
  updateGallonsDisplay();
  updateScoreDisplay();
  timeLeft = 30;
  timeDisplay.textContent = timeLeft;
  hidePopup();
  // Remove all drops
  document.querySelectorAll('.water-drop, .bad-drop').forEach(drop => drop.remove());
  startGame();
}

function createDrop() {
  // Randomly set setDrop to 0 (good) or 1 (bad)
  setDrop = Math.random() < 0.5 ? 0 : 1;

  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  drop.className = setDrop === 0 ? "water-drop" : "bad-drop";

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  // Subtract 60 pixels to keep drops fully inside the container
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall for 4 seconds
  drop.style.animationDuration = "4s";

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });
}

// Water can movement logic
gallonsDisplay.textContent = gallons;
scoreDisplay.textContent = score;

function moveCan(direction) {
  const containerWidth = gameContainer.offsetWidth;
  const canWidth = canWrapper.offsetWidth;
  if (direction === "left") {
    canPosition = Math.max(0, canPosition - canSpeed);
  } else if (direction === "right") {
    canPosition = Math.min(containerWidth - canWidth, canPosition + canSpeed);
  }
  canWrapper.style.left = canPosition + "px";
}

function updateGallonsDisplay() {
  gallonsDisplay.textContent = gallons;
}

function updateScoreDisplay() {
  scoreDisplay.textContent = score;
}

let moveInterval = null;
let moveDirection = null;

function startMoving(direction) {
  if (moveInterval && moveDirection === direction) return;
  stopMoving();
  moveDirection = direction;
  moveInterval = setInterval(() => moveCan(direction), 15); // ~60fps
}

function stopMoving() {
  clearInterval(moveInterval);
  moveInterval = null;
  moveDirection = null;
}

document.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  if (e.key === "ArrowLeft") {
    startMoving("left");
  } else if (e.key === "ArrowRight") {
    startMoving("right");
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" && moveDirection === "left") {
    stopMoving();
  } else if (e.key === "ArrowRight" && moveDirection === "right") {
    stopMoving();
  }
});

let scoreMessage = document.getElementById("score-message");
let scoreMessageTimeout = null;

function showScoreMessage(gallonsValue, customPoints = null) {
  if (!scoreMessage) return;
  const points = customPoints !== null ? customPoints : gallonsValue ** 2;
  scoreMessage.textContent = `${gallonsValue} gallons = ${points} points`;
  if (scoreMessageTimeout) clearTimeout(scoreMessageTimeout);
  scoreMessageTimeout = setTimeout(() => {
    scoreMessage.textContent = "";
  }, 1000);
}

function checkDropCollision() {
  const drops = document.querySelectorAll('.water-drop, .bad-drop');
  const canRect = canWrapper.getBoundingClientRect();
  drops.forEach(drop => {
    const dropRect = drop.getBoundingClientRect();
    // Check for collision
    if (
      dropRect.bottom > canRect.top &&
      dropRect.top < canRect.bottom &&
      dropRect.right > canRect.left &&
      dropRect.left < canRect.right
    ) {
      if (drop.classList.contains('water-drop')) {
        gallons += 1;
        if (gallons >= 5) {
          showScoreMessage(gallons);
          gallonsCollected += gallons;
          score += gallons ** 2;
          updateScoreDisplay();
          gallons = 0;
        }
        updateGallonsDisplay();
      } else if (drop.classList.contains('bad-drop')) {
        if (gallons === 0) {
          showScoreMessage(0, -4);
          score -= 4;
          if (score < 0) score = 0;
          updateScoreDisplay();
        } else {
          showScoreMessage(gallons);
          gallonsCollected += gallons;
          score += gallons ** 2;
          updateScoreDisplay();
        }
        gallons = 0;
        updateGallonsDisplay();
      }
      drop.remove();
    }
  });
  requestAnimationFrame(checkDropCollision);
}

document.getElementById("reset-btn").addEventListener("click", resetGame);
