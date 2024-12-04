const WIN_PATTERNS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

const board = document.getElementById('board');
const message = document.getElementById('message');
const oneMoreButton = document.getElementById('oneMoreButton');
const gamesPlayedSpan = document.getElementById('gamesPlayed');
const humanWinsSpan = document.getElementById('humanWins');
const computerWinsSpan = document.getElementById('computerWins');
const drawsSpan = document.getElementById('draws');

const placeMoveSound = document.getElementById('placeMoveSound');
const winSound = document.getElementById('winSound');
const drawSound = document.getElementById('drawSound');
const startGameSound = document.getElementById('startGameSound');
const backgroundMusic = document.getElementById('backgroundMusic');
const toggleSoundEffectsButton = document.getElementById('toggleSoundEffects');
const toggleBackgroundMusicButton = document.getElementById('toggleBackgroundMusic');

let boardState = Array(9).fill(null);
let currentPlayer = 'X';
let humanStarts = true;
let gamesPlayed = 0;
let humanWins = 0;
let computerWins = 0;
let draws = 0;
let soundEffectsEnabled = true;
let backgroundMusicEnabled = true;

function initGame() {
  loadGameData();
  boardState = Array(9).fill(null);
  currentPlayer = humanStarts ? 'X' : 'O';
  message.textContent = '';
  oneMoreButton.style.display = 'none';
  board.querySelectorAll('.cell').forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('X', 'O');
  });
  humanStarts = !humanStarts;
  if (currentPlayer === 'O') {
    setTimeout(computerMove, 500);
  }
  if (backgroundMusicEnabled) {
    backgroundMusic.play();
  }
  if (soundEffectsEnabled) {
    startGameSound.play();
  }
}

function handleClick(event) {
  const cell = event.target;
  const index = parseInt(cell.getAttribute('data-index'));

  if (boardState[index] || checkWinner() || checkDraw()) return;

  updateBoard(index, currentPlayer);

  if (checkWinner()) {
    endGame(`Player ${currentPlayer} wins!`);
    return;
  }

  if (checkDraw()) {
    endGame('It\'s a draw!');
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  if (currentPlayer === 'O') {
    setTimeout(computerMove, 500);
  }
}

function computerMove() {
  let bestScore = -Infinity;
  let move;

  for (let i = 0; i < boardState.length; i++) {
    if (boardState[i] === null) {
      boardState[i] = 'O';
      let score = minimax(boardState, 0, false);
      boardState[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }

  updateBoard(move, 'O');

  if (checkWinner()) {
    endGame('Computer wins!');
    return;
  }

  if (checkDraw()) {
    endGame('It\'s a draw!');
    return;
  }

  currentPlayer = 'X';
}

function minimax(state, depth, isMaximizing) {
  if (checkWinner('O')) return 1;
  if (checkWinner('X')) return -1;
  if (checkDraw()) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < state.length; i++) {
      if (state[i] === null) {
        state[i] = 'O';
        let score = minimax(state, depth + 1, false);
        state[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < state.length; i++) {
      if (state[i] === null) {
        state[i] = 'X';
        let score = minimax(state, depth + 1, true);
        state[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function checkWinner(player = currentPlayer) {
  return WIN_PATTERNS.some(pattern => pattern.every(index => boardState[index] === player));
}

function checkDraw() {
  return boardState.every(cell => cell !== null);
}

function updateBoard(index, player) {
  boardState[index] = player;
  const cell = board.children[index];
  cell.textContent = player;
  cell.classList.add(player);
  if (soundEffectsEnabled) {
    placeMoveSound.play();
  }
}

function endGame(result) {
  message.textContent = result;
  oneMoreButton.style.display = 'block';
  gamesPlayed++;

  if (result.includes('Player')) {
    humanWins++;
    if (soundEffectsEnabled) {
      winSound.play();
    }
  } else if (result.includes('Computer')) {
    computerWins++;
    if (soundEffectsEnabled) {
      winSound.play();
    }
  } else {
    draws++;
    if (soundEffectsEnabled) {
      drawSound.play();
    }
  }

  gamesPlayedSpan.textContent = gamesPlayed;
  humanWinsSpan.textContent = humanWins;
  computerWinsSpan.textContent = computerWins;
  drawsSpan.textContent = draws;

  saveGameData();
}

function saveGameData() {
  const gameData = {
    gamesPlayed,
    humanWins,
    computerWins,
    draws
  };
  localStorage.setItem('ticTacToeGameData', JSON.stringify(gameData));
}

function loadGameData() {
  const gameData = JSON.parse(localStorage.getItem('ticTacToeGameData'));
  if (gameData) {
    gamesPlayed = gameData.gamesPlayed;
    humanWins = gameData.humanWins;
    computerWins = gameData.computerWins;
    draws = gameData.draws;

    gamesPlayedSpan.textContent = gamesPlayed;
    humanWinsSpan.textContent = humanWins;
    computerWinsSpan.textContent = computerWins;
    drawsSpan.textContent = draws;
  }
}

function toggleSoundEffects() {
  soundEffectsEnabled = !soundEffectsEnabled;
}

function toggleBackgroundMusic() {
  backgroundMusicEnabled = !backgroundMusicEnabled;
  if (backgroundMusicEnabled) {
    backgroundMusic.play();
  } else {
    backgroundMusic.pause();
  }
}

toggleSoundEffectsButton.addEventListener('click', toggleSoundEffects);
toggleBackgroundMusicButton.addEventListener('click', toggleBackgroundMusic);

board.addEventListener('click', event => {
  if (event.target.classList.contains('cell')) {
    handleClick(event);
  }
});

oneMoreButton.addEventListener('click', restartGame);

function restartGame() {
  initGame();
}

initGame();
