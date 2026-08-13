const choices = ["piedra", "papel", "tijera", "lagarto", "spock"];
const emojis = {
  piedra: "🪨",
  papel: "📄",
  tijera: "✂️",
  lagarto: "🦎",
  spock: "🖖"
};

const winsAgainst = {
  piedra: ["tijera", "lagarto"],
  papel: ["piedra", "spock"],
  tijera: ["papel", "lagarto"],
  lagarto: ["spock", "papel"],
  spock: ["tijera", "piedra"]
};

// Estado del juego
let playerScore = 0;
let computerScore = 0;
let currentMode = 3;        // 3, 5, 7 o 0 (infinito)
let currentDifficulty = "easy";
let gameOver = false;

// Elementos
const menuScreen = document.getElementById("menu-screen");
const optionsScreen = document.getElementById("options-screen");
const gameScreen = document.getElementById("game-screen");

const playerScoreEl = document.getElementById("player-score");
const computerScoreEl = document.getElementById("computer-score");
const playerHandEl = document.getElementById("player-hand");
const computerHandEl = document.getElementById("computer-hand");
const messageEl = document.getElementById("message");
const modeInfoEl = document.getElementById("mode-info");
const choiceButtons = document.querySelectorAll(".choice-btn");

// Botones de navegación
document.getElementById("btn-start").addEventListener("click", () => {
  showScreen("options");
});

document.getElementById("btn-back-menu").addEventListener("click", () => {
  showScreen("menu");
});

document.getElementById("btn-play").addEventListener("click", () => {
  startGame();
});

document.getElementById("btn-back-options").addEventListener("click", () => {
  showScreen("options");
  resetScores();
});

document.getElementById("btn-reset").addEventListener("click", () => {
  resetScores();
  messageEl.textContent = "Elige tu jugada";
  messageEl.className = "";
  playerHandEl.textContent = "❓";
  computerHandEl.textContent = "❓";
  choiceButtons.forEach(b => {
    b.classList.remove("selected");
    b.disabled = false;
  });
  gameOver = false;
});

// Selección de modo y dificultad
document.querySelectorAll("[data-mode]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-mode]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentMode = parseInt(btn.dataset.mode);
  });
});

document.querySelectorAll("[data-difficulty]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-difficulty]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentDifficulty = btn.dataset.difficulty;
  });
});

// Jugada del jugador
choiceButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (gameOver) return;
    const playerChoice = btn.dataset.choice;
    playRound(playerChoice);
  });
});

function showScreen(name) {
  menuScreen.classList.remove("active");
  optionsScreen.classList.remove("active");
  gameScreen.classList.remove("active");

  if (name === "menu") menuScreen.classList.add("active");
  if (name === "options") optionsScreen.classList.add("active");
  if (name === "game") gameScreen.classList.add("active");
}

function startGame() {
  resetScores();
  gameOver = false;

  // Texto del modo
  if (currentMode === 0) {
    modeInfoEl.textContent = "Modo Infinito";
  } else {
    modeInfoEl.textContent = `Mejor de ${currentMode}`;
  }

  playerHandEl.textContent = "❓";
  computerHandEl.textContent = "❓";
  messageEl.textContent = "Elige tu jugada";
  messageEl.className = "";
  choiceButtons.forEach(b => {
    b.classList.remove("selected");
    b.disabled = false;
  });

  showScreen("game");
}

function resetScores() {
  playerScore = 0;
  computerScore = 0;
  updateScore();
}

function updateScore() {
  playerScoreEl.textContent = playerScore;
  computerScoreEl.textContent = computerScore;
}

function playRound(playerChoice) {
  choiceButtons.forEach(b => b.classList.remove("selected"));
  document.querySelector(`[data-choice="${playerChoice}"]`).classList.add("selected");

  playerHandEl.classList.add("shake");
  computerHandEl.classList.add("shake");

  // Deshabilitar botones mientras se resuelve
  choiceButtons.forEach(b => b.disabled = true);

  setTimeout(() => {
    const computerChoice = getComputerChoice(playerChoice);

    playerHandEl.textContent = emojis[playerChoice];
    computerHandEl.textContent = emojis[computerChoice];

    playerHandEl.classList.remove("shake");
    computerHandEl.classList.remove("shake");

    const result = getResult(playerChoice, computerChoice);
    showResult(result, playerChoice, computerChoice);

    // Volver a habilitar si no ha terminado la partida
    if (!gameOver) {
      choiceButtons.forEach(b => b.disabled = false);
    }
  }, 450);
}

function getComputerChoice(playerChoice) {
  // Fácil → totalmente aleatorio
  if (currentDifficulty === "easy") {
    return choices[Math.floor(Math.random() * 5)];
  }

  // Normal → 70% aleatorio, 30% intenta ganar
  if (currentDifficulty === "normal") {
    if (Math.random() < 0.7) {
      return choices[Math.floor(Math.random() * 5)];
    }
  }

  // Difícil (y a veces en normal) → intenta ganar
  // Busca una opción que le gane al jugador
  const winningMoves = [];
  for (const move of choices) {
    if (winsAgainst[move].includes(playerChoice)) {
      winningMoves.push(move);
    }
  }
  if (winningMoves.length > 0) {
    return winningMoves[Math.floor(Math.random() * winningMoves.length)];
  }

  return choices[Math.floor(Math.random() * 5)];
}

function getResult(player, computer) {
  if (player === computer) return "draw";
  if (winsAgainst[player].includes(computer)) return "win";
  return "lose";
}

function showResult(result, player, computer) {
  messageEl.className = "";

  if (result === "win") {
    playerScore++;
    messageEl.textContent = `¡Ganaste! ${emojis[player]} vence a ${emojis[computer]}`;
    messageEl.classList.add("win");
  } else if (result === "lose") {
    computerScore++;
    messageEl.textContent = `Perdiste... ${emojis[computer]} vence a ${emojis[player]}`;
    messageEl.classList.add("lose");
  } else {
    messageEl.textContent = `Empate con ${emojis[player]}`;
    messageEl.classList.add("draw");
  }

  updateScore();
  checkGameEnd();
}

function checkGameEnd() {
  if (currentMode === 0) return; // modo infinito

  const needed = Math.ceil(currentMode / 2);

  if (playerScore >= needed) {
    gameOver = true;
    messageEl.textContent = `🎉 ¡Has ganado la partida! (\( {playerScore}- \){computerScore})`;
    messageEl.className = "win";
    choiceButtons.forEach(b => b.disabled = true);
  } else if (computerScore >= needed) {
    gameOver = true;
    messageEl.textContent = `😢 Has perdido la partida (\( {playerScore}- \){computerScore})`;
    messageEl.className = "lose";
    choiceButtons.forEach(b => b.disabled = true);
  }
}

// Service Worker (opcional)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
