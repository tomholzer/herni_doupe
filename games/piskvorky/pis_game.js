const colors = {
    red: "red",
    blue: "blue",
    green: "green",
    gold: "gold"
};

const boardElement = document.getElementById("board");
const statusText = document.getElementById("statusText");

const player1NameInput = document.getElementById("player1Name");
const player2NameInput = document.getElementById("player2Name");
const player1ColorSelect = document.getElementById("player1Color");
const player2ColorSelect = document.getElementById("player2Color");
const threeStoneModeCheckbox = document.getElementById("threeStoneMode");
const removeModeSelect = document.getElementById("removeMode");

const player1DisplayName = document.getElementById("player1DisplayName");
const player2DisplayName = document.getElementById("player2DisplayName");
const player1ScoreEl = document.getElementById("player1Score");
const player2ScoreEl = document.getElementById("player2Score");
const player1Card = document.getElementById("player1Card");
const player2Card = document.getElementById("player2Card");

const startGameBtn = document.getElementById("startGameBtn");
const modeHumanBtn = document.getElementById("modeHumanBtn");
const modeAiBtn = document.getElementById("modeAiBtn");

const menuButton = document.getElementById("menuButton");
const menuPanel = document.getElementById("menuPanel");
const restartGameBtn = document.getElementById("restartGameBtn");
const goHomeBtn = document.getElementById("goHomeBtn");
const closeMenuBtn = document.getElementById("closeMenuBtn");

let vsAi = false;
let board = new Array(9).fill(0);
let currentPlayer = 1;
let gameOver = false;
let score1 = 0;
let score2 = 0;
let history1 = [];
let history2 = [];

function applyPlayerStyles() {
    const p1Color = player1ColorSelect.value;
    const p2Color = player2ColorSelect.value;

    player1DisplayName.textContent = player1NameInput.value || "Hráč 1";
    player2DisplayName.textContent = player2NameInput.value || (vsAi ? "Program" : "Hráč 2");

    player1DisplayName.className = "player-name " + colors[p1Color];
    player2DisplayName.className = "player-name " + colors[p2Color];

    player1Card.style.borderColor = gameOver ? "transparent" : "#475569";
    player2Card.style.borderColor = gameOver ? "transparent" : "#475569";
}

function updateScores() {
    player1ScoreEl.textContent = score1;
    player2ScoreEl.textContent = score2;
}

function createBoard() {
    boardElement.innerHTML = "";

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "board-cell";
        cell.dataset.index = i.toString();
        cell.addEventListener("click", onCellClick);
        boardElement.appendChild(cell);
    }

    renderBoard();
}

function renderBoard() {
    const p1Color = player1ColorSelect.value;
    const p2Color = player2ColorSelect.value;
    const cells = boardElement.querySelectorAll(".board-cell");

    cells.forEach((cell, index) => {
        cell.innerHTML = "";

        if (board[index] === 1) {
            const stone = document.createElement("div");
            stone.className = "stone " + p1Color;
            cell.appendChild(stone);
        }

        if (board[index] === 2) {
            const stone = document.createElement("div");
            stone.className = "stone " + p2Color;
            cell.appendChild(stone);
        }
    });

    if (!gameOver) {
        const currentName = currentPlayer === 1
            ? (player1NameInput.value || "Hráč 1")
            : (player2NameInput.value || (vsAi ? "Program" : "Hráč 2"));

        statusText.textContent = "Tah má: " + currentName;
    }
}

function startNewRound() {
    board = new Array(9).fill(0);
    currentPlayer = 1;
    gameOver = false;
    history1 = [];
    history2 = [];
    applyPlayerStyles();
    createBoard();
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
        if (board[a] !== 0 && board[a] === board[b] && board[b] === board[c]) {
            return board[a];
        }
    }

    return 0;
}

function applyThreeStoneRule(player, placedIndex) {
    if (!threeStoneModeCheckbox.checked) {
        if (player === 1) {
            history1.push(placedIndex);
        } else {
            history2.push(placedIndex);
        }
        return;
    }

    const history = player === 1 ? history1 : history2;
    history.push(placedIndex);

    if (history.length <= 3) {
        return;
    }

    const removable = history.filter(index => index !== placedIndex);
    let removeIndex = removable[removable.length - 1];

    if (removeModeSelect.value === "random") {
        removeIndex = removable[Math.floor(Math.random() * removable.length)];
    }

    board[removeIndex] = 0;

    const removePos = history.indexOf(removeIndex);
    if (removePos >= 0) {
        history.splice(removePos, 1);
    }
}

function endRound(winner) {
    gameOver = true;

    if (winner === 1) {
        score1++;
        statusText.textContent = "Vyhrál " + (player1NameInput.value || "Hráč 1");
    } else if (winner === 2) {
        score2++;
        statusText.textContent = "Vyhrál " + (player2NameInput.value || (vsAi ? "Program" : "Hráč 2"));
    } else {
        statusText.textContent = "Remíza";
    }

    updateScores();
    renderBoard();
}

function onCellClick(event) {
    if (gameOver) return;

    const index = Number(event.currentTarget.dataset.index);
    if (board[index] !== 0) return;

    board[index] = currentPlayer;
    applyThreeStoneRule(currentPlayer, index);

    const winner = getWinner();
    if (winner !== 0) {
        renderBoard();
        endRound(winner);
        return;
    }

    if (!threeStoneModeCheckbox.checked && board.every(cell => cell !== 0)) {
        renderBoard();
        endRound(0);
        return;
    }

    currentPlayer = currentPlayer === 1 ? 2 : 1;
    renderBoard();

    if (vsAi && currentPlayer === 2 && !gameOver) {
        setTimeout(aiMove, 350);
    }
}

function aiMove() {
    if (gameOver) return;

    const freeIndexes = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i] === 0) {
            freeIndexes.push(i);
        }
    }

    if (freeIndexes.length === 0) return;

    const pickedIndex = freeIndexes[Math.floor(Math.random() * freeIndexes.length)];
    board[pickedIndex] = 2;
    applyThreeStoneRule(2, pickedIndex);

    const winner = getWinner();
    if (winner !== 0) {
        renderBoard();
        endRound(winner);
        return;
    }

    if (!threeStoneModeCheckbox.checked && board.every(cell => cell !== 0)) {
        renderBoard();
        endRound(0);
        return;
    }

    currentPlayer = 1;
    renderBoard();
}

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

goHomeBtn.addEventListener("click", function () {
    window.location.href = "../../index.html";
});

window.addEventListener("resize", function () {
    menuPanel.classList.add("hidden");
});

applyPlayerStyles();
updateScores();
createBoard();
statusText.textContent = "Stiskni „Spustit / nové kolo“";