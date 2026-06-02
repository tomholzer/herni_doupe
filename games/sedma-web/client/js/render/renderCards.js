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

function createCardBackElement() {
    const card = document.createElement("div");
    card.className = "card back";

    return card;
}

function createCardElement(card, clickHandler) {
    const element = document.createElement("div");
    element.className = "card";

    if (card.suit === "hearts" || card.suit === "diamonds") {
        element.classList.add("red");
    }

    element.innerHTML = `
        <div class="card-corner">${escapeHtml(card.rank)}</div>
        <div class="card-suit">${suitSymbols[card.suit] || "?"}</div>
        <div class="card-corner">${escapeHtml(card.rank)}</div>
    `;

    if (clickHandler) {
        element.addEventListener("click", clickHandler);
    }

    return element;
}

function renderRemainingCardsHtml(cards) {
    if (!cards.length) {
        return "<p>V balíku už nejsou žádné karty.</p>";
    }

    const grouped = new Map(
        suitOrder.map(suit => [suit, []])
    );

    for (const card of [...cards].sort(compareCards)) {
        grouped.get(card.suit)?.push(card);
    }

    return `
        <div class="remaining-grid">
            ${suitOrder.map(suit => `
                <div class="remaining-suit-row">
                    <strong>${suitNames[suit]}</strong>
                    ${(grouped.get(suit) || []).map(card => `
                        <span class="mini-card ${card.suit === "hearts" || card.suit === "diamonds" ? "red" : ""}">
                            ${card.rank}<br>${suitSymbols[card.suit]}
                        </span>
                    `).join("")}
                </div>
            `).join("")}
        </div>
    `;
}