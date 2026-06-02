function bindEvents() {
    elements.connectButton.addEventListener("click", connectToServer);
    elements.createGameButton.addEventListener("click", createGame);
    elements.readyButton.addEventListener("click", setReady);
    elements.fillBotsButton.addEventListener("click", fillBots);

    elements.deckButton.addEventListener(
        "click",
        requestDeckInfo
    );

    elements.discardSlot.addEventListener(
        "click",
        showPilePointsInCard
    );

    elements.passButton?.addEventListener(
        "click",
        passTurn
    );

    elements.fireButton?.addEventListener(
        "click",
        fireGame
    );

    elements.nextRoundButton?.addEventListener(
        "click",
        startNextRound
    );

    elements.loadServerUrlButton?.addEventListener(
        "click",
        loadServerUrlFromConfig
    );
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
        ""
    );

    bindEvents();
}

init();