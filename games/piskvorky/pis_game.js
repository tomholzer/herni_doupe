const colors = {
    red: "red",
    blue: "blue",
    green: "green",
    gold: "gold"
};

const settingsScreen = document.getElementById("settingsScreen");
const gameScreen = document.getElementById("gameScreen");

const boardElement = document.getElementById("board");

const player1NameInput = document.getElementById("player1Name");
const player2NameInput = document.getElementById("player2Name");
const player1ColorSelect = document.getElementById("player1Color");
const player2ColorSelect = document.getElementById("player2Color");
const threeStoneModeCheckbox = document.getElementById("threeStoneMode");
const removeModeSelect = document.getElementById("removeMode");

const player1DisplayName = document.getElementById("player1DisplayName");
const player2DisplayName = document.getElementById("player2DisplayName");

const player1Card = document.getElementById("player1Card");
const player2Card = document.getElementById("player2Card");
const gamePlayer1Name = document.getElementById("gamePlayer1Name");
const gamePlayer2Name = document.getElementById("gamePlayer2Name");

const player1ScoreEl = document.getElementById("player1Score");
const player2ScoreEl = document.getElementById("player2Score");

const boardOverlay = document.getElementById("boardOverlay");
const winnerText = document.getElementById("winnerText");
const confirmWinBtn = document.getElementById("confirmWinBtn");

const startGameBtn = document.getElementById("startGameBtn");
const modeHumanBtn = document.getElementById("modeHumanBtn");
const modeAiBtn = document.getElementById("modeAiBtn");

const menuButton = document.getElementById("menuButton");
const menuPanel = document.getElementById("menuPanel");
const restartGameBtn = document.getElementById("restartGameBtn");
const backToSetupBtn = document.getElementById("backToSetupBtn");
const goHomeBtn = document.getElementById("goHomeBtn");
const closeMenuBtn = document.getElementById("closeMenuBtn");

let vsAi = false;
let board = new Array(9).fill(0);
let inactiveBoard = new Array(9).fill(false);
let currentPlayer = 1;
let gameOver = false;

let score1 = 0;
let score2 = 0;
let pendingWinner = null;

// aktivní kameny, které se počítají do výhry
let history1 = [];
let history2 = [];

// šedý kámen označený k odstranění na začátku dalšího tahu stejného hráče
let pendingRemoval1 = null;
let pendingRemoval2 = null;

function getPlayerName(player) {
    if (player === 1) {
        return player1NameInput.value.trim() || "Hráč 1";
    }

    return player2NameInput.value.trim() || (vsAi ? "Program" : "Hráč 2");
}

function getPlayerColor(player) {
    return player === 1 ? player1ColorSelect.value : player2ColorSelect.value;
}

function getPlayerSymbol(player) {
    return player === 1 ? "O" : "X";
}

function getActiveHistory(player) {
    return player === 1 ? history1 : history2;
}

function getPendingRemoval(player) {
    return player === 1 ? pendingRemoval1 : pendingRemoval2;
}

function setPendingRemoval(player, value) {
    if (player === 1) {
        pendingRemoval1 = value;
    } else {
        pendingRemoval2 = value;
    }
}

function getEffectiveCellValue(index) {
    if (board[index] === 0) return 0;
    if (inactiveBoard[index]) return 0;
    return board[index];
}

function showSettingsScreen() {
    settingsScreen.classList.remove("hidden");
    gameScreen.classList.add("hidden");
    menuPanel.classList.add("hidden");
}

function showGameScreen() {
    settingsScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    menuPanel.classList.add("hidden");
}

function updateScoreUI() {
    player1ScoreEl.textContent = score1;
    player2ScoreEl.textContent = score2;
}

function applyPlayerStyles() {
    const p1Name = getPlayerName(1);
    const p2Name = getPlayerName(2);

    const p1Color = colors[player1ColorSelect.value];
    const p2Color = colors[player2ColorSelect.value];

    player1DisplayName.textContent = p1Name;
    player2DisplayName.textContent = p2Name;

    gamePlayer1Name.textContent = `${p1Name} (O)`;
    gamePlayer2Name.textContent = `${p2Name} (X)`;

    player1DisplayName.className = "player-name " + p1Color;
    player2DisplayName.className = "player-name " + p2Color;

    gamePlayer1Name.className = "game-player-name " + p1Color;
    gamePlayer2Name.className = "game-player-name " + p2Color;

    player1Card.className = "player-card-game " + p1Color;
    player2Card.className = "player-card-game " + p2Color;

    updateActivePlayerUI();
}

function updateActivePlayerUI() {
    player1Card.classList.remove("active");
    player2Card.classList.remove("active");

    if (gameOver) return;

    if (currentPlayer === 1) {
        player1Card.classList.add("active");
    } else {
        player2Card.classList.add("active");
    }
}

function createBoard() {
    boardElement.innerHTML = "";

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "board-cell";
        cell.dataset.index = String(i);
        cell.addEventListener("click", onCellClick);
        boardElement.appendChild(cell);
    }

    renderBoard();
}

function renderBoard() {
    const cells = boardElement.querySelectorAll(".board-cell");

    cells.forEach((cell, index) => {
        cell.innerHTML = "";

        if (board[index] === 0) {
            return;
        }

        const player = board[index];
        const mark = document.createElement("span");
        mark.className = `mark ${colors[getPlayerColor(player)]}`;

        if (inactiveBoard[index]) {
            mark.classList.add("inactive");
        }

        mark.textContent = getPlayerSymbol(player);
        cell.appendChild(mark);
    });

    updateActivePlayerUI();
}

function startNewRound() {
    board = new Array(9).fill(0);
    inactiveBoard = new Array(9).fill(false);
    currentPlayer = 1;
    gameOver = false;
    pendingWinner = null;

    history1 = [];
    history2 = [];
    pendingRemoval1 = null;
    pendingRemoval2 = null;

    boardOverlay.classList.add("hidden");

    applyPlayerStyles();
    createBoard();
    beginTurn(1);
}

function removePendingStoneAtTurnStart(player) {
    const pendingIndex = getPendingRemoval(player);

    if (pendingIndex === null || pendingIndex === undefined) {
        return;
    }

    board[pendingIndex] = 0;
    inactiveBoard[pendingIndex] = false;
    setPendingRemoval(player, null);
}

function beginTurn(player) {
    currentPlayer = player;
    removePendingStoneAtTurnStart(player);
    renderBoard();
}

function getWinner() {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (const line of lines) {
        const [a, b, c] = line;

        if (
            getEffectiveCellValue(a) !== 0 &&
            getEffectiveCellValue(a) === getEffectiveCellValue(b) &&
            getEffectiveCellValue(b) === getEffectiveCellValue(c)
        ) {
            return getEffectiveCellValue(a);
        }
    }

    return 0;
}

function applyThreeStoneBetweenTurns(player, placedIndex) {
    if (!threeStoneModeCheckbox.checked) {
        return;
    }

    const history = getActiveHistory(player);

    // SPRÁVNĚ:
    // po položení 3. kamene se hned označí 1 starší kámen
    // => na desce zůstanou 2 aktivní + 1 šedý = 3 viditelné
    if (history.length !== 3) {
        return;
    }

    const removableCandidates = history.filter(index => index !== placedIndex);

    if (removableCandidates.length === 0) {
        return;
    }

    let removeIndex = removableCandidates[0];

    if (removeModeSelect.value === "random") {
        removeIndex = removableCandidates[Math.floor(Math.random() * removableCandidates.length)];
    }

    inactiveBoard[removeIndex] = true;
    setPendingRemoval(player, removeIndex);

    const removePos = history.indexOf(removeIndex);
    if (removePos >= 0) {
        history.splice(removePos, 1);
    }
}

function endRound(winner) {
    gameOver = true;
    pendingWinner = winner;
    renderBoard();

    if (winner === 1) {
        winnerText.textContent = "Vyhrál " + getPlayerName(1);
    } else if (winner === 2) {
        winnerText.textContent = "Vyhrál " + getPlayerName(2);
    } else {
        winnerText.textContent = "Remíza";
    }

    boardOverlay.classList.remove("hidden");
}

function finishTurnAndContinue() {
    const nextPlayer = currentPlayer === 1 ? 2 : 1;
    beginTurn(nextPlayer);

    if (vsAi && currentPlayer === 2 && !gameOver) {
        setTimeout(aiMove, 350);
    }
}

function onCellClick(event) {
    if (gameOver) return;

    const index = Number(event.currentTarget.dataset.index);

    if (board[index] !== 0) {
        return;
    }

    // před tahem smaž čekající šedý kámen stejného hráče
    removePendingStoneAtTurnStart(currentPlayer);

    board[index] = currentPlayer;
    inactiveBoard[index] = false;
    getActiveHistory(currentPlayer).push(index);

    const winner = getWinner();
    if (winner !== 0) {
        endRound(winner);
        return;
    }

    if (!threeStoneModeCheckbox.checked && board.every(cell => cell !== 0)) {
        endRound(0);
        return;
    }

    // mezi tahy označ starší kámen k odstranění
    applyThreeStoneBetweenTurns(currentPlayer, index);
    renderBoard();
    finishTurnAndContinue();
}

function getWinningMove(player) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (const line of lines) {
        const [a, b, c] = line;
        const values = [
            getEffectiveCellValue(a),
            getEffectiveCellValue(b),
            getEffectiveCellValue(c)
        ];

        const countPlayer = values.filter(v => v === player).length;
        const emptyIndex = line.find(i => board[i] === 0);

        if (countPlayer === 2 && emptyIndex !== undefined) {
            return emptyIndex;
        }
    }

    return null;
}

function getBestMove() {
    let move = getWinningMove(2);
    if (move !== null) return move;

    move = getWinningMove(1);
    if (move !== null) return move;

    if (board[4] === 0) return 4;

    const corners = [0, 2, 6, 8].filter(i => board[i] === 0);
    if (corners.length > 0) {
        return corners[Math.floor(Math.random() * corners.length)];
    }

    const free = board
        .map((value, index) => value === 0 ? index : null)
        .filter(value => value !== null);

    if (free.length === 0) return null;

    return free[Math.floor(Math.random() * free.length)];
}

function aiMove() {
    if (gameOver) return;

    removePendingStoneAtTurnStart(2);

    const pickedIndex = getBestMove();
    if (pickedIndex === null) {
        return;
    }

    board[pickedIndex] = 2;
    inactiveBoard[pickedIndex] = false;
    history2.push(pickedIndex);

    const winner = getWinner();
    if (winner !== 0) {
        endRound(winner);
        return;
    }

    if (!threeStoneModeCheckbox.checked && board.every(cell => cell !== 0)) {
        endRound(0);
        return;
    }

    applyThreeStoneBetweenTurns(2, pickedIndex);
    renderBoard();
    beginTurn(1);
}

confirmWinBtn.addEventListener("click", function () {
    if (pendingWinner === 1) {
        score1++;
    } else if (pendingWinner === 2) {
        score2++;
    }

    updateScoreUI();
    pendingWinner = null;
    startNewRound();
});

modeHumanBtn.addEventListener("click", function () {
    vsAi = false;
    modeHumanBtn.classList.add("active");
    modeAiBtn.classList.remove("active");

    if (!player2NameInput.value || player2NameInput.value === "Program") {
        player2NameInput.value = "Hráč 2";
    }

    applyPlayerStyles();
});

modeAiBtn.addEventListener("click", function () {
    vsAi = true;
    modeAiBtn.classList.add("active");
    modeHumanBtn.classList.remove("active");

    if (!player2NameInput.value || player2NameInput.value === "Hráč 2") {
        player2NameInput.value = "Program";
    }

    applyPlayerStyles();
});

startGameBtn.addEventListener("click", function () {
    applyPlayerStyles();
    startNewRound();
    showGameScreen();
});

player1NameInput.addEventListener("input", applyPlayerStyles);
player2NameInput.addEventListener("input", applyPlayerStyles);

player1ColorSelect.addEventListener("change", function () {
    applyPlayerStyles();
    renderBoard();
});

player2ColorSelect.addEventListener("change", function () {
    applyPlayerStyles();
    renderBoard();
});

menuButton.addEventListener("click", function () {
    menuPanel.classList.toggle("hidden");
});

closeMenuBtn.addEventListener("click", function () {
    menuPanel.classList.add("hidden");
});

restartGameBtn.addEventListener("click", function () {
    menuPanel.classList.add("hidden");
    startNewRound();
});

backToSetupBtn.addEventListener("click", function () {
    menuPanel.classList.add("hidden");
    showSettingsScreen();
});

goHomeBtn.addEventListener("click", function () {
    window.location.href = "../../index.html";
});

window.addEventListener("resize", function () {
    menuPanel.classList.add("hidden");
});

applyPlayerStyles();
updateScoreUI();
createBoard();
showSettingsScreen();