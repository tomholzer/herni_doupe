function renderGamesList(games) {
    elements.gamesList.innerHTML = "";

    if (!games || games.length === 0) {
        elements.gamesList.innerHTML =
            "<p class='status-text'>Žádná otevřená hra.</p>";
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

        const isMyStoredGame =
            game.roomCode === appState.currentRoomCode &&
            !!appState.currentPlayerId;

        if (isMyStoredGame) {
            button.textContent = "Pokračovat";
            button.disabled = false;
            button.addEventListener(
                "click",
                () => continueCurrentGame(game.roomCode)
            );
        } else {
            button.textContent = "Připojit";
            button.disabled =
                game.status !== "waiting" ||
                game.playerCount >= game.maxPlayers;

            button.addEventListener(
                "click",
                () => joinGame(game.roomCode)
            );
        }

        row.appendChild(info);
        row.appendChild(button);

        elements.gamesList.appendChild(row);
    }
}

function renderLobby(state) {
    elements.lobbyTitle.textContent =
        `Lobby: ${state.name}`;

    elements.lobbyInfo.textContent =
        `Kód: ${state.roomCode} | Hráči: ${state.players.length}/${state.maxPlayers} | Režim: ${translateAssistMode(state.assistMode)} | Server: ${state.serverName || "-"} | Založil: ${state.createdByPlayerName || "-"}`;

    elements.playersList.innerHTML = "";

    for (const player of state.players) {
        const row = document.createElement("div");
        row.className = "player-row";

        row.innerHTML = `
            <div>
                <strong>${escapeHtml(player.name)} ${player.isMe ? "(já)" : ""} ${player.isBot ? "🤖" : ""}</strong>
                <small>${player.isBot ? "počítač" : (player.connected ? "online" : "offline")}</small>
            </div>
            <div>${player.ready ? "✅ ready" : "⏳ čeká"}</div>
        `;

        elements.playersList.appendChild(row);
    }

    const me = state.players.find(player => player.isMe);

    appState.ready = !!me?.ready;

    elements.readyButton.textContent =
        appState.ready
            ? "Zrušit připravenost"
            : "Jsem připraven";
}