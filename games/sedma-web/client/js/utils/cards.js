window.suitSymbols = {
    hearts: "♥",
    spades: "♠",
    diamonds: "♦",
    clubs: "♣"
};

window.suitNames = {
    hearts: "Srdce",
    spades: "Piky",
    diamonds: "Káry",
    clubs: "Kříže"
};

window.suitOrder = [
    "hearts",
    "spades",
    "diamonds",
    "clubs"
];

window.rankOrder = [
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A"
];

window.compareCards = function compareCards(a, b) {
    const suitDiff =
        suitOrder.indexOf(a.suit) -
        suitOrder.indexOf(b.suit);

    if (suitDiff !== 0) {
        return suitDiff;
    }

    return (
        rankOrder.indexOf(a.rank) -
        rankOrder.indexOf(b.rank)
    );
};