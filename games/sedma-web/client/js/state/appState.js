window.appState = {
    socket: null,
    currentRoomCode: localStorage.getItem("sedma.roomCode") || "",
    currentPlayerId: localStorage.getItem("sedma.playerId") || "",
    currentGameState: null,
    ready: false,
    deckBadgeTimer: null,
    pilePointsTimer: null,
    showPilePoints: false
};