const elements = {
    serverUrlInput: document.getElementById("serverUrlInput"),
    serverNameInput: document.getElementById("serverNameInput"),
    connectButton: document.getElementById("connectButton"),
    loadServerUrlButton: document.getElementById("loadServerUrlButton"),
    connectionStatus: document.getElementById("connectionStatus"),
    activePlayerName: document.getElementById("activePlayerName"),
    menuButton: document.getElementById("menuButton"),
    menuScreen: document.getElementById("menuScreen"),
    lobbyScreen: document.getElementById("lobbyScreen"),
    gameScreen: document.getElementById("gameScreen"),
    gameNameInput: document.getElementById("gameNameInput"),
    playerNameInput: document.getElementById("playerNameInput"),
    maxPlayersSelect: document.getElementById("maxPlayersSelect"),
    teamModeSelect: document.getElementById("teamModeSelect"),
    assistModeSelect: document.getElementById("assistModeSelect"),
    turnTimeModeSelect: document.getElementById("turnTimeModeSelect"),
    passwordInput: document.getElementById("passwordInput"),
    createGameButton: document.getElementById("createGameButton"),
    gamesList: document.getElementById("gamesList"),
    lobbyTitle: document.getElementById("lobbyTitle"),
    lobbyInfo: document.getElementById("lobbyInfo"),
    playersList: document.getElementById("playersList"),
    readyButton: document.getElementById("readyButton"),
    fillBotsButton: document.getElementById("fillBotsButton"),
    deckButton: document.getElementById("deckButton"),
    deckInfoBadge: document.getElementById("deckInfoBadge"),
    serverSpinner: document.getElementById("serverSpinner"),
    playerTop: document.getElementById("playerTop"),
    playerLeft: document.getElementById("playerLeft"),
    playerRight: document.getElementById("playerRight"),
    playerBottom: document.getElementById("playerBottom"),
    playedCards: document.getElementById("playedCards"),
    discardSlot: document.getElementById("discardSlot"),
    passButton: document.getElementById("passButton"),
    fireButton: document.getElementById("fireButton"),
    nextRoundButton: document.getElementById("nextRoundButton"),
    resultOverlay: document.getElementById("resultOverlay"),
    gameTable: document.getElementById("gameTable"),
    sideGameInfo: document.getElementById("sideGameInfo"),
    sidePlayersInfo: document.getElementById("sidePlayersInfo"),
    desktopSidePanel: document.getElementById("desktopSidePanel"),
    closeSidePanelButton: document.getElementById("closeSidePanelButton"),
    leaveGameSideButton: document.getElementById("leaveGameSideButton"),
    leaveTableSideButton: document.getElementById("leaveTableSideButton"),
    deckModal: document.getElementById("deckModal"),
    deckModalCloseButton: document.getElementById("deckModalCloseButton"),
    deckModalContent: document.getElementById("deckModalContent"),
    toast: document.getElementById("toast")
};

const appState = {
    socket: null,
    currentRoomCode: localStorage.getItem("sedma.roomCode") || "",
    currentPlayerId: localStorage.getItem("sedma.playerId") || "",
    currentGameState: null,
    ready: false,
    deckBadgeTimer: null,
    pilePointsTimer: null,
    showPilePoints: false
};

const suitSymbols = { hearts: "♥", spades: "♠", diamonds: "♦", clubs: "♣" };
const suitNames = { hearts: "Srdce", spades: "Piky", diamonds: "Káry", clubs: "Kříže" };
const suitOrder = ["hearts", "spades", "diamonds", "clubs"];
const rankOrder = ["7", "8", "9", "10", "J", "Q", "K", "A"];

function showScreen(screenName) {
    elements.menuScreen.classList.remove("active");
    elements.lobbyScreen.classList.remove("active");
    elements.gameScreen.classList.remove("active");
    closeSidePanel();

    if (screenName === "menu") elements.menuScreen.classList.add("active");
    if (screenName === "lobby") elements.lobbyScreen.classList.add("active");
    if (screenName === "game") elements.gameScreen.classList.add("active");
}

function openSidePanel() {
    if (!elements.desktopSidePanel) return;
    elements.desktopSidePanel.classList.add("open");
}

function closeSidePanel() {
    elements.desktopSidePanel?.classList.remove("open");
}

function toggleSidePanel() {
    if (elements.desktopSidePanel?.classList.contains("open")) {
        closeSidePanel();
        return;
    }
    openSidePanel();
}

function showToast(text, duration = 2600) {
    elements.toast.textContent = text;
    elements.toast.classList.remove("hidden");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => elements.toast.classList.add("hidden"), duration);
}
function showSpinner() { elements.serverSpinner?.classList.remove("hidden"); }
function hideSpinner() { window.setTimeout(() => elements.serverSpinner?.classList.add("hidden"), 500); }

function connectToServer() {
    const serverUrl = elements.serverUrlInput.value.trim();
    if (!serverUrl) { showToast("Zadej adresu serveru."); return; }
    localStorage.setItem("sedma.serverUrl", serverUrl);
    if (appState.socket) appState.socket.disconnect();

    appState.socket = io(serverUrl, { transports: ["websocket", "polling"] });

    appState.socket.on("connect", () => {
        elements.connectionStatus.textContent = `Připojeno: ${serverUrl}`;
        showToast("Připojeno k serveru.");
        if (appState.currentRoomCode && appState.currentPlayerId) {
            showToast("Máš uloženou rozehranou hru. V seznamu her klikni na Pokračovat.");
        }
    });

    appState.socket.on("disconnect", () => { elements.connectionStatus.textContent = "Odpojeno"; });
    appState.socket.on("lobbyUpdated", renderGamesList);
    appState.socket.on("gameClosed", message => {
        clearLocalGame();
        showScreen("menu");
        showToast(message?.text || "Hra skončila.", 5000);
    });
    appState.socket.on("gameState", state => {
        appState.currentGameState = state;
        if (state.status === "waiting") { renderLobby(state); showScreen("lobby"); return; }
        if (state.status === "playing" || state.status === "finished") { renderGame(state); showScreen("game"); }
    });
}

function ensureSocket() {
    if (!appState.socket || !appState.socket.connected) { showToast("Nejdřív se připoj k serveru."); return false; }
    return true;
}

function createGame() {
    if (!ensureSocket()) return;

    localStorage.setItem("sedma.serverName", elements.serverNameInput.value.trim() || "Sedma server");
    localStorage.setItem("sedma.playerName", elements.playerNameInput.value.trim() || "Hráč");

    showSpinner();

    appState.socket.emit("createGame", {
        name: elements.gameNameInput.value.trim(),
        password: elements.passwordInput.value.trim(),
        maxPlayers: Number(elements.maxPlayersSelect.value),
        assistMode: elements.assistModeSelect.value,
        teamMode: elements.teamModeSelect.value,
        turnTimeMode: elements.turnTimeModeSelect.value,
        creatorName: elements.playerNameInput.value.trim() || "Hráč",
        serverName: elements.serverNameInput.value.trim() || "Sedma server"
    }, response => {
        hideSpinner();

        if (!response?.ok) {
            showToast("Hru se nepodařilo vytvořit.");
            return;
        }

        appState.currentRoomCode = response.roomCode;
        appState.currentPlayerId = response.playerId;
        appState.ready = false;

        localStorage.setItem("sedma.roomCode", response.roomCode);
        localStorage.setItem("sedma.playerId", response.playerId);

        showToast("Hra vytvořena.");

        appState.socket.emit("rejoinGame", {
            roomCode: response.roomCode,
            playerId: response.playerId
        }, joinResponse => {
            if (!joinResponse?.ok) {
                showToast("Nepodařilo se otevřít lobby hry.");
                return;
            }

            showScreen("lobby");
        });
    });
}

function joinGame(roomCode, password = "") {
    if (!ensureSocket()) return;
    const playerName = elements.playerNameInput.value.trim() || "Hráč";
    localStorage.setItem("sedma.playerName", playerName);
    updateActivePlayerName(playerName);
    let finalPassword = password;
    if (!finalPassword) finalPassword = window.prompt("Heslo hry, pokud je potřeba:", "") || "";
    showSpinner();
    appState.socket.emit("joinGame", { roomCode, password: finalPassword, playerName }, response => {
        hideSpinner();
        if (!response?.ok) { showToast(response?.message || "Nelze se připojit do hry."); return; }
        appState.currentRoomCode = response.roomCode;
        appState.currentPlayerId = response.playerId;
        appState.ready = false;
        localStorage.setItem("sedma.roomCode", response.roomCode);
        localStorage.setItem("sedma.playerId", response.playerId);
    });
}

function setReady() {
    if (!ensureSocket() || !appState.currentGameState) return;
    appState.ready = !appState.ready;
    showSpinner();
    appState.socket.emit("setReady", {
        roomCode: appState.currentGameState.roomCode,
        playerId: appState.currentPlayerId,
        ready: appState.ready
    });
    hideSpinner();
}

function fillBots() {
    if (!ensureSocket() || !appState.currentGameState) return;
    showSpinner();
    appState.socket.emit("fillBots", {
        roomCode: appState.currentGameState.roomCode,
        playerId: appState.currentPlayerId
    }, response => {
        hideSpinner();
        showToast(response?.ok ? "Počítače doplněny. Teď dej ready." : (response?.message || "Počítače se nepodařilo doplnit."));
    });
}

function requestDeckInfo() {
    if (!ensureSocket() || !appState.currentGameState) return;
    showSpinner();
    appState.socket.emit("requestDeckInfo", {
        roomCode: appState.currentGameState.roomCode,
        playerId: appState.currentPlayerId
    }, response => {
        hideSpinner();
        if (!response?.ok) { showToast(response?.text || "Informace nejsou dostupné."); return; }
        if (response.mode === "normal") showDeckBadge(String(response.deckCount));
        if (response.mode === "blind") showToast(response.text, 3200);
        if (response.mode === "amateur") showDeckModal(response.remainingCards || []);
    });
}

function showDeckBadge(text) {
    elements.deckInfoBadge.textContent = text;
    elements.deckInfoBadge.classList.remove("hidden");
    clearTimeout(appState.deckBadgeTimer);
    appState.deckBadgeTimer = setTimeout(() => elements.deckInfoBadge.classList.add("hidden"), 2200);
}

function showDeckModal(cards) {
    elements.deckModalContent.innerHTML = renderRemainingCardsHtml(cards);
    elements.deckModal.classList.remove("hidden");
}
function closeDeckModal() { elements.deckModal.classList.add("hidden"); }

function updateActivePlayerName(name) {
    if (!elements.activePlayerName) return;
    elements.activePlayerName.textContent = name ? `Hraješ jako: ${name}` : "Nepřihlášen";
}

function playCard(cardId) {
    if (!ensureSocket() || !appState.currentGameState) return;
    showSpinner();
    appState.socket.emit("playCard", { playerId: appState.currentPlayerId, cardId }, response => {
        hideSpinner();
        if (!response?.ok) showToast(response?.message || "Tah se nepodařil.");
    });
}

function passTurn() {
    if (!ensureSocket() || !appState.currentGameState) return;
    showSpinner();
    appState.socket.emit("passTurn", { playerId: appState.currentPlayerId }, response => {
        hideSpinner();
        if (!response?.ok) showToast(response?.message || "PASS se nepodařil.");
    });
}

function fireGame() {
    if (!ensureSocket() || !appState.currentGameState) return;
    showSpinner();
    appState.socket.emit("fireGame", { playerId: appState.currentPlayerId }, response => {
        hideSpinner();
        if (!response?.ok) showToast(response?.message || "FIRE se nepodařil.");
    });
}

function startNextRound() {
    if (!ensureSocket() || !appState.currentGameState) return;
    showSpinner();
    appState.socket.emit("startNextRound", {
        roomCode: appState.currentGameState.roomCode,
        playerId: appState.currentPlayerId
    }, response => {
        hideSpinner();
        if (!response?.ok) showToast(response?.message || "Další kolo se nepodařilo spustit.");
    });
}

function leaveTable() {
    if (!ensureSocket() || !appState.currentGameState) { clearLocalGame(); showScreen("menu"); return; }
    if (!window.confirm("Odejít od stolu? Pokud hra běží, soupeř vyhraje kontumačně.")) return;
    appState.socket.emit("leaveTable", {
        roomCode: appState.currentGameState.roomCode,
        playerId: appState.currentPlayerId
    }, () => {
        clearLocalGame();
        showScreen("menu");
    });
}
function leaveGame() { leaveTable(); }
function clearLocalGame() {
    appState.currentRoomCode = "";
    appState.currentPlayerId = "";
    appState.currentGameState = null;
    localStorage.removeItem("sedma.roomCode");
    localStorage.removeItem("sedma.playerId");
}

function continueCurrentGame(roomCode = appState.currentRoomCode) {
    if (!ensureSocket()) return;

    if (!appState.currentPlayerId || !roomCode) {
        showToast("Nemám uloženého hráče pro tuto hru.");
        return;
    }

    if (appState.currentGameState && appState.currentGameState.roomCode === roomCode) {
        showScreen(appState.currentGameState.status === "waiting" ? "lobby" : "game");
        return;
    }

    showSpinner();
    appState.socket.emit("rejoinGame", {
        roomCode,
        playerId: appState.currentPlayerId
    }, response => {
        hideSpinner();
        if (!response?.ok) {
            showToast("Do uložené hry se nepodařilo vrátit. Server ji už možná nemá.");
            return;
        }
        showToast("Vráceno do hry.");
    });
}

function renderGamesList(games) {
    elements.gamesList.innerHTML = "";
    if (!games || games.length === 0) {
        elements.gamesList.innerHTML = "<p class='status-text'>Žádná otevřená hra.</p>";
        return;
    }

    for (const game of games) {
        const row = document.createElement("div");
        row.className = "game-row";

        const info = document.createElement("div");
        info.innerHTML = `
            <strong>${escapeHtml(game.name)} ${game.hasPassword ? "🔒" : ""}</strong>
            <small>${game.roomCode} | ${game.playerCount}/${game.maxPlayers} | ${translateStatus(game.status)} | ${translateAssistMode(game.assistMode)}</small>
            <small>Server: ${escapeHtml(game.serverName || "-")} | založil: ${escapeHtml(game.createdByPlayerName || "-")}</small>
        `;

        const button = document.createElement("button");
        button.className = "join-button";
        button.type = "button";

        const isMyStoredGame = game.roomCode === appState.currentRoomCode && !!appState.currentPlayerId;

        if (isMyStoredGame) {
            button.textContent = "Pokračovat";
            button.disabled = false;
            button.addEventListener("click", () => continueCurrentGame(game.roomCode));
        } else {
            button.textContent = "Připojit";
            button.disabled = game.status !== "waiting" || game.playerCount >= game.maxPlayers;
            button.addEventListener("click", () => joinGame(game.roomCode));
        }

        row.appendChild(info);
        row.appendChild(button);
        elements.gamesList.appendChild(row);
    }
}

function renderLobby(state) {
    elements.lobbyTitle.textContent = `Lobby: ${state.name}`;
    elements.lobbyInfo.textContent = `Kód: ${state.roomCode} | Hráči: ${state.players.length}/${state.maxPlayers} | Režim: ${translateAssistMode(state.assistMode)} | Server: ${state.serverName || "-"} | Založil: ${state.createdByPlayerName || "-"}`;
    elements.playersList.innerHTML = "";
    for (const player of state.players) {
        const row = document.createElement("div"); row.className = "player-row";
        row.innerHTML = `<div><strong>${escapeHtml(player.name)} ${player.isMe ? "(já)" : ""} ${player.isBot ? "🤖" : ""}</strong><small>${player.isBot ? "počítač" : (player.connected ? "online" : "offline")}</small></div><div>${player.ready ? "✅ ready" : "⏳ čeká"}</div>`;
        elements.playersList.appendChild(row);
    }
    const me = state.players.find(player => player.isMe);
    appState.ready = !!me?.ready;
    elements.readyButton.textContent = appState.ready ? "Zrušit připravenost" : "Jsem připraven";
}

function renderGame(state) {
    clearPlayerZones();
    if (elements.deckButton) elements.deckButton.classList.toggle("hidden", Number(state.deckCount || 0) <= 0);
    const me = state.players?.find(player => player.isMe);
    updateActivePlayerName(me?.name || localStorage.getItem("sedma.playerName") || "");
    renderSidePanel(state);
    renderPlayers(state);
    renderPlayedCards(state);
    renderDiscardSlot(state);
    renderActionButtons(state);
    renderResultOverlay(state);
}

function clearPlayerZones() {
    elements.playerTop.innerHTML = "";
    elements.playerLeft.innerHTML = "";
    elements.playerRight.innerHTML = "";
    elements.playerBottom.innerHTML = "";
    elements.playedCards.innerHTML = "";
}

function getRelativePosition(mySeat, targetSeat, maxPlayers) {
    if (targetSeat === mySeat) return "bottom";
    const diff = (targetSeat - mySeat + maxPlayers) % maxPlayers;
    if (maxPlayers === 2) return "top";
    if (diff === 1) return "right";
    if (diff === 2) return "top";
    if (diff === 3) return "left";
    return "top";
}
function getZoneByPosition(position) {
    if (position === "bottom") return elements.playerBottom;
    if (position === "top") return elements.playerTop;
    if (position === "left") return elements.playerLeft;
    if (position === "right") return elements.playerRight;
    return elements.playerTop;
}

function renderPlayers(state) {
    const mySeat = state.currentPlayerSeat;

    for (const player of state.players) {
        const position = getRelativePosition(mySeat, player.seat, state.maxPlayers);
        const zone = getZoneByPosition(position);

        if (player.isMe) {
            const isMyTurn = state.currentTurnSeat === player.seat;

            for (const card of player.hand) {
                const cardElement = createCardElement(card, isMyTurn ? () => playCard(card.id) : null);
                zone.appendChild(cardElement);
            }

            if (!isMyTurn && state.status === "playing") {
                const prompt = document.createElement("div");
                prompt.className = "play-prompt";
                prompt.textContent = "Nejsem na tahu.";
                zone.appendChild(prompt);
            }
        } else {
            for (let i = 0; i < player.handCount; i++) {
                zone.appendChild(createCardBackElement());
            }
        }
    }
}

function renderPlayedCards(state) {
    const mySeat = state.currentPlayerSeat;

    const label = document.createElement("div");
    label.className = "play-area-label";
    label.textContent = state.status === "finished"
        ? "Konec hry"
        : (state.lastTrickWinnerSeat
            ? `Bere: ${state.lastTrickWinnerSeat}`
            : (state.currentTurnSeat ? `Na tahu: ${state.currentTurnSeat}` : "Vyhodnocuji…"));

    elements.playedCards.appendChild(label);

    const positionCounts = {
        bottom: 0,
        top: 0,
        left: 0,
        right: 0
    };

    for (const card of state.tableCards) {
        const pos = getRelativePosition(mySeat, card.seat, state.maxPlayers);
        positionCounts[pos] += 1;

        const cardElement = createCardElement(card, null);

        cardElement.classList.add(
            "table-card",
            `pos-${pos}`,
            `stack-${positionCounts[pos]}`
        );

        elements.playedCards.appendChild(cardElement);
    }
}

function renderDiscardSlot(state) {
    const count = state.myWonCardsCount || 0;
    const points = state.myPoints || 0;

    elements.discardSlot.classList.toggle("won-pile", count > 0);
    elements.discardSlot.classList.toggle("empty", count <= 0);
    elements.discardSlot.disabled = count <= 0;

    if (count <= 0) {
        elements.discardSlot.innerHTML = "Odklad";
        return;
    }

    elements.discardSlot.innerHTML = appState.showPilePoints
        ? `<div class="won-pile-points">${points}</div>`
        : `<div class="card back small-card"></div>`;
}

function renderActionButtons(state) {
    const showPass = state.status === "playing" && !!state.canPass;
    const showFire = state.status === "playing" && !!state.canFire;

    if (elements.passButton) {
        elements.passButton.classList.toggle("hidden", !showPass);
        elements.passButton.disabled = !showPass;
    }

    if (elements.fireButton) {
        elements.fireButton.classList.toggle("hidden", !showFire);
        elements.fireButton.disabled = !showFire;
        elements.fireButton.title = state.fireRank ? `Spálit hru: čtyři karty ${state.fireRank}` : "Spálit hru";
    }

    if (elements.nextRoundButton) {
        elements.nextRoundButton.classList.toggle("hidden", state.status !== "finished");
        elements.nextRoundButton.disabled = state.status !== "finished";
    }
}

function renderResultOverlay(state) {
    if (!elements.resultOverlay) return;

    if (state.status !== "finished" || !state.result) {
        elements.resultOverlay.className = "result-overlay hidden";
        elements.resultOverlay.innerHTML = "";
        return;
    }

    const result = state.result;
    const target = Number(result.targetMatchPoints || state.targetMatchPoints || 10);
    const scoreRows = (result.scoreGroups || state.scoreGroups || []).map(group => `
        <div class="result-score-row">
            <span>${escapeHtml(group.name)}</span>
            <strong>${group.points} bodů | ${Number(group.matchPoints || 0)}/${target}</strong>
        </div>
    `).join("");

    elements.resultOverlay.className = `result-overlay ${result.isFire ? "fire-result" : ""}`;
    elements.resultOverlay.innerHTML = `
        <div class="result-title">${result.isFire ? "🔥 " : ""}${escapeHtml(result.title || "Konec hry")}</div>
        <div class="result-winner">${escapeHtml(result.winnerNames || result.winnerName || "")}</div>
        <div class="result-text">${escapeHtml(result.awardReason || result.text || "")}</div>
        <div class="result-match-points">+${Number(result.awardedMatchPoints || 0)} bodů do hry</div>
        ${scoreRows ? `<div class="result-scores">${scoreRows}</div>` : ""}
        <button class="primary-button result-continue-button" type="button" data-action="next-round">Pokračovat</button>
    `;
}

function renderSidePanel(state) {
    elements.sideGameInfo.innerHTML = `
        <div><strong>Hra:</strong> ${escapeHtml(state.name)}</div>
        <div><strong>Server:</strong> ${escapeHtml(state.serverName || "-")}</div>
        <div><strong>Založil:</strong> ${escapeHtml(state.createdByPlayerName || "-")}</div>
        <div><strong>ID:</strong> ${escapeHtml(state.roomCode)}</div>
        <div><strong>Režim:</strong> ${translateAssistMode(state.assistMode)}</div>
        <div><strong>Balík:</strong> klikni na balíček</div>
    `;
    elements.sidePlayersInfo.innerHTML = state.players.map(player => `
        <div class="side-player">
            <span class="seat-badge">${player.seat || "?"}</span>
            <span>${escapeHtml(player.name)}${player.isMe ? " (vy)" : ""}${player.isBot ? " 🤖" : ""}<br><small>${player.team ? "tým " + player.team : "solo"}</small></span>
            <strong>${player.handCount}</strong>
        </div>
    `).join("");
}

function createCardBackElement() {
    const card = document.createElement("div");
    card.className = "card back";
    return card;
}
function createCardElement(card, clickHandler) {
    const element = document.createElement("div");
    element.className = "card";
    if (card.suit === "hearts" || card.suit === "diamonds") element.classList.add("red");
    element.innerHTML = `<div class="card-corner">${escapeHtml(card.rank)}</div><div class="card-suit">${suitSymbols[card.suit] || "?"}</div><div class="card-corner">${escapeHtml(card.rank)}</div>`;
    if (clickHandler) {
        element.addEventListener("click", clickHandler);
    }
    return element;
}

function renderRemainingCardsHtml(cards) {
    if (!cards.length) return "<p>V balíku už nejsou žádné karty.</p>";
    const grouped = new Map(suitOrder.map(suit => [suit, []]));
    for (const card of [...cards].sort(compareCards)) grouped.get(card.suit)?.push(card);
    return `<div class="remaining-grid">${suitOrder.map(suit => `
        <div class="remaining-suit-row">
            <strong>${suitNames[suit]}</strong>
            ${(grouped.get(suit) || []).map(card => `<span class="mini-card ${card.suit === "hearts" || card.suit === "diamonds" ? "red" : ""}">${card.rank}<br>${suitSymbols[card.suit]}</span>`).join("")}
        </div>`).join("")}</div>`;
}
function compareCards(a, b) {
    const suitDiff = suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
    if (suitDiff !== 0) return suitDiff;
    return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
}

function setDeckPosition(position) {
    elements.gameTable.classList.remove("deck-pos-left", "deck-pos-center", "deck-pos-right");
    elements.gameTable.classList.add(`deck-pos-${position}`);
    localStorage.setItem("sedma.deckPosition", position);
    document.querySelectorAll(".deck-pos-button").forEach(button => button.classList.toggle("active", button.dataset.deckPosition === position));
}

function showPilePointsInCard() {
    if (!appState.currentGameState || (appState.currentGameState.myWonCardsCount || 0) <= 0) return;

    appState.showPilePoints = true;
    renderDiscardSlot(appState.currentGameState);

    clearTimeout(appState.pilePointsTimer);
    appState.pilePointsTimer = setTimeout(() => {
        appState.showPilePoints = false;
        if (appState.currentGameState) renderDiscardSlot(appState.currentGameState);
    }, 2200);
}

function translateStatus(status) { if (status === "waiting") return "čeká"; if (status === "playing") return "běží"; if (status === "finished") return "konec"; return status; }
function translateAssistMode(mode) { if (mode === "normal") return "normální"; if (mode === "blind") return "slepý"; if (mode === "amateur") return "začátečník"; return mode; }
function escapeHtml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }

function bindEvents() {
    elements.connectButton.addEventListener("click", connectToServer);
    elements.createGameButton.addEventListener("click", createGame);
    elements.readyButton.addEventListener("click", setReady);
    elements.fillBotsButton.addEventListener("click", fillBots);
    elements.deckButton.addEventListener("click", requestDeckInfo);
    elements.discardSlot.addEventListener("click", showPilePointsInCard);
    elements.passButton?.addEventListener("click", passTurn);
    elements.fireButton?.addEventListener("click", fireGame);
    elements.nextRoundButton?.addEventListener("click", startNextRound);
    elements.deckModalCloseButton.addEventListener("click", closeDeckModal);
    elements.deckModal.addEventListener("click", event => { if (event.target === elements.deckModal) closeDeckModal(); });
    elements.menuButton.addEventListener("click", toggleSidePanel);
    elements.closeSidePanelButton?.addEventListener("click", closeSidePanel);
    elements.leaveGameSideButton.addEventListener("click", leaveGame);
    elements.leaveTableSideButton.addEventListener("click", leaveTable);
    elements.loadServerUrlButton?.addEventListener(
        "click",
        loadServerUrlFromConfig
    );
    document.querySelectorAll(".deck-pos-button").forEach(button => button.addEventListener("click", () => setDeckPosition(button.dataset.deckPosition)));
    elements.resultOverlay?.addEventListener("click", event => {
        const button = event.target.closest('[data-action="next-round"]');
        if (button) startNextRound();
    });
}
async function loadServerUrlFromConfig() {
    try {
        const response = await fetch(
            "config/server.json?t=" + Date.now(),
            {
                cache: "no-store"
            }
        );

        if (!response.ok) {
            showToast("Nepodařilo se načíst adresu serveru.");
            return;
        }

        const config = await response.json();

        if (!config.serverUrl) {
            showToast("server.json neobsahuje serverUrl.");
            return;
        }

        elements.serverUrlInput.value = config.serverUrl;
        showToast("Adresa serveru načtena.");
    }
    catch (error) {
        console.error(error);
        showToast("Chyba při načítání adresy serveru.");
    }
}

async function init() {
    elements.serverUrlInput.value = "";

    const savedPlayerName =
        localStorage.getItem("sedma.playerName");

    if (savedPlayerName) {
        elements.playerNameInput.value =
            savedPlayerName;
    }

    updateActivePlayerName(
        savedPlayerName ||
        elements.playerNameInput.value ||
        ""
    );

    const savedServerName =
        localStorage.getItem("sedma.serverName");

    if (savedServerName) {
        elements.serverNameInput.value =
            savedServerName;
    }

    setDeckPosition(
        localStorage.getItem("sedma.deckPosition")
        || "center"
    );

    bindEvents();
}

init();
