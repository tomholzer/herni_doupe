function renderGame(state) {
    clearPlayerZones();

    if (elements.deckButton) {
        elements.deckButton.classList.toggle(
            "hidden",
            Number(state.deckCount || 0) <= 0
        );
    }

    const me =
        state.players?.find(player => player.isMe);

    updateActivePlayerName(
        me?.name ||
        localStorage.getItem("sedma.playerName") ||
        ""
    );

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

function renderPlayers(state) {
    const mySeat = state.currentPlayerSeat;

    for (const player of state.players) {
        const position =
            getRelativePosition(
                mySeat,
                player.seat,
                state.maxPlayers
            );

        const zone =
            getZoneByPosition(position);

        if (player.isMe) {
            const isMyTurn =
                state.currentTurnSeat === player.seat;

            for (const card of player.hand) {
                const cardElement =
                    createCardElement(
                        card,
                        isMyTurn
                            ? () => playCard(card.id)
                            : null
                    );

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

    label.textContent =
        state.status === "finished"
            ? "Konec hry"
            : (
                state.lastTrickWinnerSeat
                    ? `Bere: ${state.lastTrickWinnerSeat}`
                    : (
                        state.currentTurnSeat
                            ? `Na tahu: ${state.currentTurnSeat}`
                            : "Vyhodnocuji…"
                    )
            );

    elements.playedCards.appendChild(label);

    const positionCounts = {
        bottom: 0,
        top: 0,
        left: 0,
        right: 0
    };

    for (const card of state.tableCards) {
        const pos =
            getRelativePosition(
                mySeat,
                card.seat,
                state.maxPlayers
            );

        positionCounts[pos] += 1;

        const cardElement =
            createCardElement(card, null);

        cardElement.classList.add(
            "table-card",
            `pos-${pos}`,
            `stack-${positionCounts[pos]}`
        );

        elements.playedCards.appendChild(cardElement);
    }
}

function renderDiscardSlot(state) {
    const count =
        state.myWonCardsCount || 0;

    const points =
        state.myPoints || 0;

    elements.discardSlot.classList.toggle(
        "won-pile",
        count > 0
    );

    elements.discardSlot.classList.toggle(
        "empty",
        count <= 0
    );

    elements.discardSlot.disabled =
        count <= 0;

    if (count <= 0) {
        elements.discardSlot.innerHTML = "Odklad";
        return;
    }

    elements.discardSlot.innerHTML =
        appState.showPilePoints
            ? `<div class="won-pile-points">${points}</div>`
            : `<div class="card back small-card"></div>`;
}

function renderActionButtons(state) {
    const showPass =
        state.status === "playing" &&
        !!state.canPass;

    const showFire =
        state.status === "playing" &&
        !!state.canFire;

    if (elements.passButton) {
        elements.passButton.classList.toggle(
            "hidden",
            !showPass
        );

        elements.passButton.disabled =
            !showPass;
    }

    if (elements.fireButton) {
        elements.fireButton.classList.toggle(
            "hidden",
            !showFire
        );

        elements.fireButton.disabled =
            !showFire;

        elements.fireButton.title =
            state.fireRank
                ? `Spálit hru: čtyři karty ${state.fireRank}`
                : "Spálit hru";
    }

    if (elements.nextRoundButton) {
        elements.nextRoundButton.classList.toggle(
            "hidden",
            state.status !== "finished"
        );

        elements.nextRoundButton.disabled =
            state.status !== "finished";
    }
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

    elements.sidePlayersInfo.innerHTML =
        state.players
            .map(player => `
                <div class="side-player">
                    <span class="seat-badge">${player.seat || "?"}</span>
                    <span>
                        ${escapeHtml(player.name)}
                        ${player.isMe ? " (vy)" : ""}
                        ${player.isBot ? " 🤖" : ""}
                        <br>
                        <small>${player.team ? "tým " + player.team : "solo"}</small>
                    </span>
                    <strong>${player.handCount}</strong>
                </div>
            `)
            .join("");
}