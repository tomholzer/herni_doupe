function connectToServer() {
    const serverUrl = elements.serverUrlInput.value.trim();

    if (!serverUrl) {
        showToast("Zadej adresu serveru.");
        return;
    }

    localStorage.setItem("sedma.serverUrl", serverUrl);

    if (appState.socket) {
        appState.socket.disconnect();
    }

    appState.socket = io(serverUrl, {
        transports: ["websocket", "polling"]
    });

    appState.socket.on("connect", () => {
        elements.connectionStatus.textContent = `Připojeno: ${serverUrl}`;
        showToast("Připojeno k serveru.");
    });

    appState.socket.on("disconnect", () => {
        elements.connectionStatus.textContent = "Odpojeno";
    });

    appState.socket.on("lobbyUpdated", renderGamesList);

    appState.socket.on("gameClosed", message => {
        clearLocalGame();
        showScreen("menu");
        showToast(message?.text || "Hra skončila.", 5000);
    });

    appState.socket.on("gameState", state => {
        appState.currentGameState = state;

        if (state.status === "waiting") {
            renderLobby(state);
            showScreen("lobby");
            return;
        }

        if (state.status === "playing" || state.status === "finished") {
            renderGame(state);
            showScreen("game");
        }
    });
}

function ensureSocket() {
    if (!appState.socket || !appState.socket.connected) {
        showToast("Nejdřív se připoj k serveru.");
        return false;
    }

    return true;
}

function createGame() {
    if (!ensureSocket()) {
        return;
    }

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
        });
    });
}

function joinGame(roomCode, password = "") {
    if (!ensureSocket()) {
        return;
    }

    const playerName = elements.playerNameInput.value.trim() || "Hráč";

    localStorage.setItem("sedma.playerName", playerName);
    updateActivePlayerName(playerName);

    let finalPassword = password;

    if (!finalPassword) {
        finalPassword = window.prompt("Heslo hry, pokud je potřeba:", "") || "";
    }

    showSpinner();

    appState.socket.emit("joinGame", {
        roomCode,
        password: finalPassword,
        playerName
    }, response => {
        hideSpinner();

        if (!response?.ok) {
            showToast(response?.message || "Nelze se připojit do hry.");
            return;
        }

        appState.currentRoomCode = response.roomCode;
        appState.currentPlayerId = response.playerId;
        appState.ready = false;

        localStorage.setItem("sedma.roomCode", response.roomCode);
        localStorage.setItem("sedma.playerId", response.playerId);
    });
}

function setReady() {
    if (!ensureSocket() || !appState.currentGameState) {
        return;
    }

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
    if (!ensureSocket() || !appState.currentGameState) {
        return;
    }

    showSpinner();

    appState.socket.emit("fillBots", {
        roomCode: appState.currentGameState.roomCode,
        playerId: appState.currentPlayerId
    }, response => {
        hideSpinner();

        showToast(
            response?.ok
                ? "Počítače doplněny. Teď dej ready."
                : (response?.message || "Počítače se nepodařilo doplnit.")
        );
    });
}

function requestDeckInfo() {
    if (!ensureSocket() || !appState.currentGameState) {
        return;
    }

    showSpinner();

    appState.socket.emit("requestDeckInfo", {
        roomCode: appState.currentGameState.roomCode,
        playerId: appState.currentPlayerId
    }, response => {
        hideSpinner();

        if (!response?.ok) {
            showToast(response?.text || "Informace nejsou dostupné.");
            return;
        }

        if (response.mode === "normal") {
            showDeckBadge(String(response.deckCount));
        }

        if (response.mode === "blind") {
            showToast(response.text, 3200);
        }

        if (response.mode === "amateur") {
            showDeckModal(response.remainingCards || []);
        }
    });
}

function showDeckBadge(text) {
    elements.deckInfoBadge.textContent = text;
    elements.deckInfoBadge.classList.remove("hidden");

    clearTimeout(appState.deckBadgeTimer);

    appState.deckBadgeTimer = setTimeout(
        () => elements.deckInfoBadge.classList.add("hidden"),
        2200
    );
}

function showDeckModal(cards) {
    elements.deckModalContent.innerHTML = renderRemainingCardsHtml(cards);
    elements.deckModal.classList.remove("hidden");
}

function closeDeckModal() {
    elements.deckModal.classList.add("hidden");
}

function updateActivePlayerName(name) {
    if (!elements.activePlayerName) {
        return;
    }

    elements.activePlayerName.textContent =
        name
            ? `Hraješ jako: ${name}`
            : "Nepřihlášen";
}

function playCard(cardId) {
    if (!ensureSocket() || !appState.currentGameState) {
        return;
    }

    showSpinner();

    appState.socket.emit("playCard", {
        playerId: appState.currentPlayerId,
        cardId
    }, response => {
        hideSpinner();

        if (!response?.ok) {
            showToast(response?.message || "Tah se nepodařil.");
        }
    });
}

function passTurn() {
    if (!ensureSocket() || !appState.currentGameState) {
        return;
    }

    showSpinner();

    appState.socket.emit("passTurn", {
        playerId: appState.currentPlayerId
    }, response => {
        hideSpinner();

        if (!response?.ok) {
            showToast(response?.message || "PASS se nepodařil.");
        }
    });
}

function fireGame() {
    if (!ensureSocket() || !appState.currentGameState) {
        return;
    }

    showSpinner();

    appState.socket.emit("fireGame", {
        playerId: appState.currentPlayerId
    }, response => {
        hideSpinner();

        if (!response?.ok) {
            showToast(response?.message || "FIRE se nepodařil.");
        }
    });
}

function startNextRound() {
    if (!ensureSocket() || !appState.currentGameState) {
        return;
    }

    showSpinner();

    appState.socket.emit("startNextRound", {
        roomCode: appState.currentGameState.roomCode,
        playerId: appState.currentPlayerId
    }, response => {
        hideSpinner();

        if (!response?.ok) {
            showToast(response?.message || "Další kolo se nepodařilo spustit.");
        }
    });
}

function leaveTable() {
    if (!ensureSocket() || !appState.currentGameState) {
        clearLocalGame();
        showScreen("menu");
        return;
    }

    if (!window.confirm("Odejít od stolu?")) {
        return;
    }

    appState.socket.emit("leaveTable", {
        roomCode: appState.currentGameState.roomCode,
        playerId: appState.currentPlayerId
    }, () => {
        clearLocalGame();
        showScreen("menu");
    });
}

function leaveGame() {
    leaveTable();
}

function clearLocalGame() {
    appState.currentRoomCode = "";
    appState.currentPlayerId = "";
    appState.currentGameState = null;

    localStorage.removeItem("sedma.roomCode");
    localStorage.removeItem("sedma.playerId");
}

function continueCurrentGame(roomCode = appState.currentRoomCode) {
    if (!ensureSocket()) {
        return;
    }

    if (!appState.currentPlayerId || !roomCode) {
        showToast("Nemám uloženého hráče pro tuto hru.");
        return;
    }

    if (
        appState.currentGameState &&
        appState.currentGameState.roomCode === roomCode
    ) {
        showScreen(
            appState.currentGameState.status === "waiting"
                ? "lobby"
                : "game"
        );

        return;
    }

    showSpinner();

    appState.socket.emit("rejoinGame", {
        roomCode,
        playerId: appState.currentPlayerId
    }, response => {
        hideSpinner();

        if (!response?.ok) {
            showToast("Do uložené hry se nepodařilo vrátit.");
            return;
        }

        showToast("Vráceno do hry.");
    });
}

function showPilePointsInCard() {
    if (
        !appState.currentGameState ||
        (appState.currentGameState.myWonCardsCount || 0) <= 0
    ) {
        return;
    }

    appState.showPilePoints = true;
    renderDiscardSlot(appState.currentGameState);

    clearTimeout(appState.pilePointsTimer);

    appState.pilePointsTimer = setTimeout(() => {
        appState.showPilePoints = false;

        if (appState.currentGameState) {
            renderDiscardSlot(appState.currentGameState);
        }
    }, 2200);
}

function setDeckPosition(position) {
    elements.gameTable.classList.remove(
        "deck-pos-left",
        "deck-pos-center",
        "deck-pos-right"
    );

    elements.gameTable.classList.add(`deck-pos-${position}`);

    localStorage.setItem("sedma.deckPosition", position);

    document.querySelectorAll(".deck-pos-button").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.deckPosition === position
        );
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
    } catch (error) {
        console.error(error);
        showToast("Chyba při načítání adresy serveru.");
    }
}

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

    elements.deckModal.addEventListener("click", event => {
        if (event.target === elements.deckModal) {
            closeDeckModal();
        }
    });

    elements.menuButton.addEventListener("click", toggleSidePanel);
    elements.closeSidePanelButton?.addEventListener("click", closeSidePanel);
    elements.leaveGameSideButton.addEventListener("click", leaveGame);
    elements.leaveTableSideButton.addEventListener("click", leaveTable);

    elements.loadServerUrlButton?.addEventListener(
        "click",
        loadServerUrlFromConfig
    );

    document.querySelectorAll(".deck-pos-button").forEach(button => {
        button.addEventListener(
            "click",
            () => setDeckPosition(button.dataset.deckPosition)
        );
    });

    elements.resultOverlay?.addEventListener("click", event => {
        const button = event.target.closest('[data-action="next-round"]');

        if (button) {
            startNextRound();
        }
    });
}

async function init() {
    elements.serverUrlInput.value = "";

    const savedPlayerName =
        localStorage.getItem("sedma.playerName");

    if (savedPlayerName) {
        elements.playerNameInput.value = savedPlayerName;
    }

    updateActivePlayerName(
        savedPlayerName ||
        elements.playerNameInput.value ||
        ""
    );

    const savedServerName =
        localStorage.getItem("sedma.serverName");

    if (savedServerName) {
        elements.serverNameInput.value = savedServerName;
    }

    setDeckPosition(
        localStorage.getItem("sedma.deckPosition") ||
        "center"
    );

    bindEvents();
}

init();