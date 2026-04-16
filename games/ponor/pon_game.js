console.log("Ponor game.js načten");

const settingsScreen = document.getElementById("settingsScreen");
const gameScreen = document.getElementById("gameScreen");

const playerCountSelect = document.getElementById("playerCount");
const playersContainer = document.getElementById("playersContainer");
const startingOxygenInput = document.getElementById("startingOxygen");
const specialDieEnabledCheckbox = document.getElementById("specialDieEnabled");
const totalStonesInfo = document.getElementById("totalStonesInfo");

const commonCountInput = document.getElementById("commonCount");
const commonValueMinInput = document.getElementById("commonValueMin");
const commonValueMaxInput = document.getElementById("commonValueMax");
const commonLossMinInput = document.getElementById("commonLossMin");
const commonLossMaxInput = document.getElementById("commonLossMax");

const uncommonCountInput = document.getElementById("uncommonCount");
const uncommonValueMinInput = document.getElementById("uncommonValueMin");
const uncommonValueMaxInput = document.getElementById("uncommonValueMax");
const uncommonLossMinInput = document.getElementById("uncommonLossMin");
const uncommonLossMaxInput = document.getElementById("uncommonLossMax");

const rareCountInput = document.getElementById("rareCount");
const rareValueMinInput = document.getElementById("rareValueMin");
const rareValueMaxInput = document.getElementById("rareValueMax");
const rareLossMinInput = document.getElementById("rareLossMin");
const rareLossMaxInput = document.getElementById("rareLossMax");

const artifactsEnabledCheckbox = document.getElementById("artifactsEnabled");
const artifactChanceUncommonInput = document.getElementById("artifactChanceUncommon");
const artifactChanceRareInput = document.getElementById("artifactChanceRare");
const artifactValueBonusInput = document.getElementById("artifactValueBonus");
const artifactLuminaEnabledCheckbox = document.getElementById("artifactLuminaEnabled");
const artifactAtochaEnabledCheckbox = document.getElementById("artifactAtochaEnabled");

const oxygenPocketsEnabledCheckbox = document.getElementById("oxygenPocketsEnabled");
const oxygenPocketChanceCommonInput = document.getElementById("oxygenPocketChanceCommon");
const oxygenPocketChanceRareInput = document.getElementById("oxygenPocketChanceRare");
const oxygenPocketValueInput = document.getElementById("oxygenPocketValue");

const startGameBtn = document.getElementById("startGameBtn");

const scoreboard = document.getElementById("scoreboard");
const statusBar = document.getElementById("statusBar");
const diceDisplayValue = document.getElementById("diceDisplayValue");
const pathBoard = document.getElementById("pathBoard");

const directionButton = document.getElementById("directionButton");
const directionArrow = document.getElementById("directionArrow");
const directionDiver = document.getElementById("directionDiver");
const actionButton = document.getElementById("actionButton");
const singleActionWrap = document.getElementById("singleActionWrap");
const dualActionWrap = document.getElementById("dualActionWrap");
const collectButton = document.getElementById("collectButton");
const skipButton = document.getElementById("skipButton");

const dieModeText = document.getElementById("dieModeText");
const lastRollText = document.getElementById("lastRollText");
const rollPenaltyText = document.getElementById("rollPenaltyText");
const finalMoveText = document.getElementById("finalMoveText");

const settingsMenuButton = document.getElementById("settingsHomeButton");
const settingsMenuPanel = document.getElementById("settingsMenuPanel");
const settingsGoHomeBtn = document.getElementById("settingsGoHomeBtn");
const settingsResetDefaultsBtn = document.getElementById("settingsResetDefaultsBtn");
const settingsCloseMenuBtn = document.getElementById("settingsCloseMenuBtn");

const gameMenuButton = document.getElementById("gameMenuButton");
const gameMenuPanel = document.getElementById("gameMenuPanel");
const resumeGameBtn = document.getElementById("resumeGameBtn");
const restartGameBtn = document.getElementById("restartGameBtn");
const backToSettingsBtn = document.getElementById("backToSettingsBtn");
const goHomeBtn = document.getElementById("goHomeBtn");

const colorOptions = ["red", "blue", "green", "gold"];
const colorTextClassMap = {
    red: "red-text",
    blue: "blue-text",
    green: "green-text",
    gold: "gold-text"
};

let players = [];
let stones = [];
let currentPlayerIndex = 0;
let rolledRawValue = 0;
let rolledFinalValue = 0;
let currentPenalty = 0;
let turnPhase = "choose-direction";
let currentSettingsSnapshot = null;

function renderPlayerInputs() {
    const count = Number(playerCountSelect.value);
    playersContainer.innerHTML = "";

    for (let i = 0; i < count; i++) {
        const row = document.createElement("div");
        row.className = "player-config-row";
        row.innerHTML = `
            <input type="text" class="player-name-input" data-player-index="${i}" value="Hráč ${i + 1}" />
            <select class="player-color-input" data-player-index="${i}">
                <option value="red" ${i === 0 ? "selected" : ""}>Červená</option>
                <option value="blue" ${i === 1 ? "selected" : ""}>Modrá</option>
                <option value="green" ${i === 2 ? "selected" : ""}>Zelená</option>
                <option value="gold" ${i === 3 ? "selected" : ""}>Tmavě žlutá</option>
            </select>
        `;
        playersContainer.appendChild(row);
    }
}

function updateTotalStonesInfo() {
    const total =
        Number(commonCountInput.value || 0) +
        Number(uncommonCountInput.value || 0) +
        Number(rareCountInput.value || 0);

    totalStonesInfo.textContent = String(total);
}

function resetSettingsToDefault() {
    playerCountSelect.value = "4";
    startingOxygenInput.value = "20";
    specialDieEnabledCheckbox.checked = false;

    commonCountInput.value = "10";
    commonValueMinInput.value = "1";
    commonValueMaxInput.value = "2";
    commonLossMinInput.value = "0";
    commonLossMaxInput.value = "1";

    uncommonCountInput.value = "10";
    uncommonValueMinInput.value = "3";
    uncommonValueMaxInput.value = "5";
    uncommonLossMinInput.value = "0";
    uncommonLossMaxInput.value = "1";

    rareCountInput.value = "15";
    rareValueMinInput.value = "6";
    rareValueMaxInput.value = "10";
    rareLossMinInput.value = "1";
    rareLossMaxInput.value = "2";

    artifactsEnabledCheckbox.checked = false;
    artifactChanceUncommonInput.value = "12";
    artifactChanceRareInput.value = "20";
    artifactValueBonusInput.value = "2";
    artifactLuminaEnabledCheckbox.checked = true;
    artifactAtochaEnabledCheckbox.checked = true;

    oxygenPocketsEnabledCheckbox.checked = false;
    oxygenPocketChanceCommonInput.value = "10";
    oxygenPocketChanceRareInput.value = "18";
    oxygenPocketValueInput.value = "3";

    renderPlayerInputs();
    updateTotalStonesInfo();
}

function showSettingsScreen() {
    settingsScreen.classList.remove("hidden");
    gameScreen.classList.add("hidden");
    closeAllMenus();
}

function showGameScreen() {
    settingsScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    closeAllMenus();
}

function closeAllMenus() {
    settingsMenuPanel.classList.add("hidden");
    gameMenuPanel.classList.add("hidden");
}

function goHome() {
    window.location.href = "../../index.html";
}

function saveCurrentSettingsSnapshot() {
    const playerNameInputs = document.querySelectorAll(".player-name-input");
    const playerColorInputs = document.querySelectorAll(".player-color-input");

    const playersSettings = [];
    for (let i = 0; i < playerNameInputs.length; i++) {
        playersSettings.push({
            name: playerNameInputs[i].value.trim() || `Hráč ${i + 1}`,
            color: playerColorInputs[i].value || colorOptions[i % colorOptions.length]
        });
    }

    currentSettingsSnapshot = {
        players: playersSettings,
        totalStones:
            Number(commonCountInput.value) +
            Number(uncommonCountInput.value) +
            Number(rareCountInput.value),
        startingOxygen: Number(startingOxygenInput.value),
        specialDieEnabled: specialDieEnabledCheckbox.checked,
        treasureGroups: [
            {
                key: "common",
                label: "Common",
                count: Number(commonCountInput.value),
                valueMin: Number(commonValueMinInput.value),
                valueMax: Number(commonValueMaxInput.value),
                lossMin: Number(commonLossMinInput.value),
                lossMax: Number(commonLossMaxInput.value)
            },
            {
                key: "uncommon",
                label: "Uncommon",
                count: Number(uncommonCountInput.value),
                valueMin: Number(uncommonValueMinInput.value),
                valueMax: Number(uncommonValueMaxInput.value),
                lossMin: Number(uncommonLossMinInput.value),
                lossMax: Number(uncommonLossMaxInput.value)
            },
            {
                key: "rare",
                label: "Rare",
                count: Number(rareCountInput.value),
                valueMin: Number(rareValueMinInput.value),
                valueMax: Number(rareValueMaxInput.value),
                lossMin: Number(rareLossMinInput.value),
                lossMax: Number(rareLossMaxInput.value)
            }
        ],
        artifacts: {
            enabled: artifactsEnabledCheckbox.checked,
            chanceUncommon: Number(artifactChanceUncommonInput.value),
            chanceRare: Number(artifactChanceRareInput.value),
            valueBonus: Number(artifactValueBonusInput.value),
            luminaEnabled: artifactLuminaEnabledCheckbox.checked,
            atochaEnabled: artifactAtochaEnabledCheckbox.checked
        },
        oxygenPockets: {
            enabled: oxygenPocketsEnabledCheckbox.checked,
            chanceCommon: Number(oxygenPocketChanceCommonInput.value),
            chanceRare: Number(oxygenPocketChanceRareInput.value),
            oxygenValue: Number(oxygenPocketValueInput.value)
        }
    };
}

function buildGameFromSettings() {
    saveCurrentSettingsSnapshot();

    players = currentSettingsSnapshot.players.map((item, index) => ({
        id: index + 1,
        name: item.name,
        color: item.color,
        position: 0,
        score: 0,
        oxygen: currentSettingsSnapshot.startingOxygen,
        direction: 1,
        treasures: [],
        artifacts: [],
        luminaUsed: false,
        drowned: false
    }));

    stones = [];
    for (let i = 1; i <= currentSettingsSnapshot.totalStones; i++) {
        stones.push({
            index: i,
            content: {
                type: "common",
                groupKey: "common",
                groupLabel: "Common",
                value: 0,
                loss: 0,
                visualTier: "common"
            },
            revealed: false
        });
    }

    assignStoneContents();

    currentPlayerIndex = 0;
    rolledRawValue = 0;
    rolledFinalValue = 0;
    currentPenalty = 0;
    turnPhase = "choose-direction";

    updateDirectionVisual();
    updateDiceInfo();
    renderScoreboard();
    renderPath();
    updateActionButtons();
    updateStatus(`${players[currentPlayerIndex].name} je na tahu. Nejprve zvol směr.`);
}

function restartGameWithCurrentSettings() {
    if (!currentSettingsSnapshot) {
        return;
    }

    players = currentSettingsSnapshot.players.map((item, index) => ({
        id: index + 1,
        name: item.name,
        color: item.color,
        position: 0,
        score: 0,
        oxygen: currentSettingsSnapshot.startingOxygen,
        direction: 1,
        treasures: [],
        artifacts: [],
        luminaUsed: false,
        drowned: false
    }));

    stones = [];
    for (let i = 1; i <= currentSettingsSnapshot.totalStones; i++) {
        stones.push({
            index: i,
            content: {
                type: "common",
                groupKey: "common",
                groupLabel: "Common",
                value: 0,
                loss: 0,
                visualTier: "common"
            },
            revealed: false
        });
    }

    assignStoneContents();

    currentPlayerIndex = 0;
    rolledRawValue = 0;
    rolledFinalValue = 0;
    currentPenalty = 0;
    turnPhase = "choose-direction";

    updateDirectionVisual();
    updateDiceInfo();
    renderScoreboard();
    renderPath();
    updateActionButtons();
    updateStatus(`${players[currentPlayerIndex].name} je na tahu. Nejprve zvol směr.`);
}

function assignStoneContents() {
    const pool = [];

    const commonGroup = currentSettingsSnapshot.treasureGroups.find(x => x.key === "common");
    const uncommonGroup = currentSettingsSnapshot.treasureGroups.find(x => x.key === "uncommon");
    const rareGroup = currentSettingsSnapshot.treasureGroups.find(x => x.key === "rare");

    for (let i = 0; i < (commonGroup?.count ?? 0); i++) {
        pool.push({
            type: "treasure",
            groupKey: "common",
            groupLabel: "Common",
            value: randomInt(commonGroup.valueMin, commonGroup.valueMax),
            loss: randomInt(commonGroup.lossMin, commonGroup.lossMax),
            visualTier: "common"
        });
    }

    for (let i = 0; i < (uncommonGroup?.count ?? 0); i++) {
        pool.push({
            type: "treasure",
            groupKey: "uncommon",
            groupLabel: "Uncommon",
            value: randomInt(uncommonGroup.valueMin, uncommonGroup.valueMax),
            loss: randomInt(uncommonGroup.lossMin, uncommonGroup.lossMax),
            visualTier: "uncommon"
        });
    }

    for (let i = 0; i < (rareGroup?.count ?? 0); i++) {
        pool.push({
            type: "treasure",
            groupKey: "rare",
            groupLabel: "Rare",
            value: randomInt(rareGroup.valueMin, rareGroup.valueMax),
            loss: randomInt(rareGroup.lossMin, rareGroup.lossMax),
            visualTier: "rare"
        });
    }

    for (let i = 0; i < stones.length; i++) {
        stones[i].content = pool[i];
        stones[i].revealed = false;
        stones[i].index = i + 1;
    }
}

function renderScoreboard() {
    scoreboard.innerHTML = "";

    players.forEach((player, index) => {
        const colorTextClass = colorTextClassMap[player.color] || "";
        const activeClass = index === currentPlayerIndex ? ` active-${player.color}` : "";
        const bestTreasure = getBestTreasureValue(player);
        const totalTreasureValue = getTotalTreasureValue(player);
        const oxygenDotsHtml = buildOxygenDotsHtml(
            player.oxygen,
            currentSettingsSnapshot?.startingOxygen ?? 20
        );
        const treasureStackHtml = buildTreasureStackHtml(player);
        const penaltyValue = getPlayerPenalty(player);
        const penaltyClass = penaltyValue > 0 ? " penalty-active" : "";
        const bestTreasureTooltip = getBestTreasureTooltip(player);
        const penaltyTooltip = getPenaltyTooltip(player);

        const card = document.createElement("div");
        card.className = `player-card${activeClass}`;

        card.innerHTML = `
            <div class="player-card-header">
                <div class="player-name ${colorTextClass}" title="Pozice: ${player.position} | Směr: ${player.direction === 1 ? "dolů" : "nahoru"}">
                    ${escapeHtml(player.name)}
                </div>
                <div class="player-badge">${player.id}</div>
            </div>

            <div class="player-oxygen-bar" title="Kyslík: ${player.oxygen}/${currentSettingsSnapshot?.startingOxygen ?? 20}">
                ${oxygenDotsHtml}
            </div>

            <div class="player-card-body">
                <div class="player-best-treasure" title="${escapeHtml(bestTreasureTooltip)}">
                    <div class="player-best-treasure-value">${bestTreasure}</div>
                </div>

                <div class="player-penalty-box${penaltyClass}" title="${escapeHtml(penaltyTooltip)}">
                    ${penaltyValue}
                </div>

                <div class="player-stack-wrap" title="Nesené poklady: ${player.treasures.length}">
                    ${treasureStackHtml}
                    <div class="player-stack-card stack-total">${totalTreasureValue}</div>
                </div>
            </div>
        `;

        scoreboard.appendChild(card);
    });
}

function getBestTreasureValue(player) {
    if (!player.treasures || player.treasures.length === 0) {
        return "-";
    }

    return Math.max(...player.treasures.map(treasure => Number(treasure.value) || 0));
}

function getBestTreasureTooltip(player) {
    if (!player.treasures || player.treasures.length === 0) {
        return "Nejcennější poklad: žádný";
    }

    const bestTreasure = player.treasures.reduce((best, current) => {
        return (Number(current.value) || 0) > (Number(best.value) || 0) ? current : best;
    });

    return `Nejcennější poklad: ${bestTreasure.groupLabel}, hodnota ${bestTreasure.value}, postih ${bestTreasure.loss}`;
}

function getTotalTreasureValue(player) {
    if (!player.treasures || player.treasures.length === 0) {
        return 0;
    }

    return player.treasures.reduce((sum, treasure) => sum + (Number(treasure.value) || 0), 0);
}

function getPlayerPenalty(player) {
    if (!player.treasures || player.treasures.length === 0) {
        return 0;
    }

    return player.treasures.reduce((sum, treasure) => sum + (Number(treasure.loss) || 0), 0);
}

function getPenaltyTooltip(player) {
    if (!player.treasures || player.treasures.length === 0) {
        return "Postih za nesené poklady: 0";
    }

    const parts = player.treasures.map((treasure, index) =>
        `${index + 1}. ${treasure.groupLabel}: ${treasure.loss}`
    );

    return `Postih za nesené poklady: ${getPlayerPenalty(player)} | ${parts.join(" | ")}`;
}

function buildOxygenDotsHtml(currentOxygen, maxOxygen) {
    const safeMax = Math.max(1, Number(maxOxygen) || 20);
    const safeCurrent = Math.max(0, Math.min(Number(currentOxygen) || 0, safeMax));
    const dots = [];

    for (let i = 0; i < safeMax; i++) {
        const filledClass = i < safeCurrent ? "filled" : "empty";
        dots.push(`<div class="oxygen-dot ${filledClass}"></div>`);
    }

    return dots.join("");
}

function buildTreasureStackHtml(player) {
    if (!player.treasures || player.treasures.length === 0) {
        return `<div class="player-stack-card stack-1">-</div>`;
    }

    const maxVisible = 5;
    const visibleTreasures = player.treasures.slice(0, maxVisible);

    return visibleTreasures.map((treasure, index) => {
        const value = Number(treasure.value) || 0;
        return `<div class="player-stack-card stack-${index + 1}" title="${escapeHtml(`${treasure.groupLabel} | hodnota ${treasure.value} | postih ${treasure.loss}`)}">${value}</div>`;
    }).join("");
}

function getSnakeOrder(length, columns) {
    const rows = Math.ceil(length / columns);
    const ordered = [];

    for (let row = 0; row < rows; row++) {
        const start = row * columns + 1;
        const end = Math.min(start + columns - 1, length);
        const rowItems = [];

        for (let n = start; n <= end; n++) {
            rowItems.push(n);
        }

        if (row % 2 === 1) {
            rowItems.reverse();
        }

        ordered.push(...rowItems);
    }

    return ordered;
}

function getSnakeColumns() {
    const width = window.innerWidth;
    if (width <= 540) return 3;
    if (width <= 780) return 4;
    return 5;
}

function getStoneCssClass(stone) {
    switch (stone.content.visualTier) {
        case "common":
            return "stone-common";
        case "uncommon":
            return "stone-uncommon";
        case "rare":
            return "stone-rare";
        default:
            return "stone-common";
    }
}

function renderPath() {
    pathBoard.innerHTML = "";
    const columns = getSnakeColumns();
    const order = getSnakeOrder(stones.length, columns);

    pathBoard.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

    order.forEach((stoneNumber) => {
        const stone = stones[stoneNumber - 1];
        if (!stone) {
            return;
        }

        const stoneEl = document.createElement("div");
        stoneEl.className = `path-stone ${getStoneCssClass(stone)}`;

        const indexEl = document.createElement("div");
        indexEl.className = "path-index";
        indexEl.textContent = stone.index;

        const stack = document.createElement("div");
        stack.className = "path-player-stack";

        players
            .filter((player) => player.position === stone.index)
            .forEach((player) => {
                const pawn = document.createElement("div");
                pawn.className = `pawn ${player.color}`;
                pawn.title = player.name;
                stack.appendChild(pawn);
            });

        stoneEl.appendChild(indexEl);
        stoneEl.appendChild(stack);
        pathBoard.appendChild(stoneEl);
    });
}

function updateStatus(text) {
    statusBar.textContent = text;
}

function updateDiceDisplay(displayValue, hasPenalty) {
    if (displayValue && displayValue > 0) {
        diceDisplayValue.textContent = String(displayValue);
    } else {
        diceDisplayValue.textContent = "-";
    }

    if (hasPenalty) {
        diceDisplayValue.classList.add("penalty-active");
    } else {
        diceDisplayValue.classList.remove("penalty-active");
    }
}

function updateDirectionVisual() {
    if (players.length === 0) {
        directionArrow.textContent = "⬇";
        directionButton.classList.remove("up");
        directionButton.classList.add("down");
        return;
    }

    const player = players[currentPlayerIndex];

    if (player.direction === 1) {
        directionArrow.textContent = "⬇";
        directionButton.classList.remove("up");
        directionButton.classList.add("down");
    } else {
        directionArrow.textContent = "⬆";
        directionButton.classList.remove("down");
        directionButton.classList.add("up");
    }
}

function updateDiceInfo() {
    if (dieModeText) {
        dieModeText.textContent = currentSettingsSnapshot && currentSettingsSnapshot.specialDieEnabled
            ? "Speciální kostka"
            : "Malá kostka";
    }

    if (lastRollText) {
        lastRollText.textContent = rolledRawValue > 0 ? String(rolledRawValue) : "-";
    }

    if (rollPenaltyText) {
        rollPenaltyText.textContent = currentPenalty > 0 ? String(currentPenalty) : "-";
    }

    if (finalMoveText) {
        finalMoveText.textContent = turnPhase !== "choose-direction" ? String(rolledFinalValue) : "-";
    }

    const shownValue = rolledFinalValue > 0 ? rolledFinalValue : rolledRawValue;
    updateDiceDisplay(shownValue, currentPenalty > 0);
}

function updateActionButtons() {
    const needsChoice = turnPhase === "moved" && canCollectCurrentStone();

    if (needsChoice) {
        singleActionWrap.classList.add("hidden");
        dualActionWrap.classList.remove("hidden");
        return;
    }

    singleActionWrap.classList.remove("hidden");
    dualActionWrap.classList.add("hidden");

    switch (turnPhase) {
        case "choose-direction":
            actionButton.textContent = "Hod";
            break;
        case "moved":
        case "end-allowed":
            actionButton.textContent = "Konec";
            break;
        default:
            actionButton.textContent = "Hod";
            break;
    }
}

function toggleDirection() {
    if (players.length === 0) {
        updateStatus("Nejprve spusť hru.");
        return;
    }

    if (turnPhase !== "choose-direction") {
        updateStatus("Směr lze měnit jen na začátku tahu.");
        return;
    }

    const player = players[currentPlayerIndex];
    player.direction = player.direction === 1 ? -1 : 1;

    updateDirectionVisual();
    renderScoreboard();
    updateStatus(`${player.name} zvolil směr ${player.direction === 1 ? "dolů" : "nahoru"}.`);
}

function getCurrentDieFaces() {
    if (!currentSettingsSnapshot || !currentSettingsSnapshot.specialDieEnabled) {
        return [2, 2, 3, 3, 4, 4];
    }

    return [1, 2, 2, 2, 2, 3, 3, 4, 4, 5];
}

function rollAndMoveCurrentPlayer() {
    if (players.length === 0) {
        updateStatus("Nejprve spusť hru.");
        return;
    }

    if (turnPhase !== "choose-direction") {
        updateStatus("Tah už běží.");
        return;
    }

    const player = players[currentPlayerIndex];
    const dieFaces = getCurrentDieFaces();

    rolledRawValue = dieFaces[Math.floor(Math.random() * dieFaces.length)];
    currentPenalty = getPlayerPenalty(player);
    rolledFinalValue = Math.max(0, rolledRawValue - currentPenalty);

    let stepsDone = 0;
    let currentPos = player.position;

    while (stepsDone < rolledFinalValue) {
        let candidate = currentPos + player.direction;

        if (candidate < 0) {
            candidate = 0;
        }

        if (candidate > stones.length) {
            candidate = stones.length;
        }

        const occupiedByOther = players.some(p => p.id !== player.id && p.position === candidate);

        if (occupiedByOther) {
            currentPos = candidate;
            continue;
        }

        currentPos = candidate;
        stepsDone++;
    }

    player.position = currentPos;

    if (player.position === 0 && player.direction === -1) {
        const deliveredPoints = calculateDeliveredPoints(player);

        if (deliveredPoints > 0) {
            player.score += deliveredPoints;
            player.treasures = [];
            updateStatus(`${player.name} se vrátil na loď a odevzdal poklady za ${deliveredPoints} bodů.`);
        } else {
            updateStatus(`${player.name} se vrátil na loď.`);
        }

        currentPenalty = getPlayerPenalty(player);
        turnPhase = "end-allowed";
    } else {
        turnPhase = "moved";
        updateStatus(`${player.name} hodil ${rolledRawValue}. Postih je ${currentPenalty}. Výsledný pohyb je ${rolledFinalValue}.`);
    }

    updateDiceInfo();
    renderScoreboard();
    renderPath();
    updateActionButtons();
}

function calculateDeliveredPoints(player) {
    if (player.treasures.length === 0) {
        return 0;
    }

    let total = player.treasures.reduce((sum, treasure) => sum + treasure.value, 0);

    const hasAtocha = player.artifacts.some(a => a.artifactKey === "atocha");
    if (hasAtocha) {
        const maxTreasureValue = Math.max(...player.treasures.map(t => t.value));
        total += maxTreasureValue;
    }

    return total;
}

function canCollectCurrentStone() {
    if (players.length === 0) return false;

    const player = players[currentPlayerIndex];
    if (player.position <= 0 || player.position > stones.length) return false;

    const stone = stones[player.position - 1];
    return !stone.revealed;
}

function maybeDropArtifactForTreasure(stone, player) {
    if (!currentSettingsSnapshot.artifacts.enabled) {
        return null;
    }

    if (stone.content.type !== "treasure") {
        return null;
    }

    let chance = 0;
    let availableArtifacts = [];

    if (stone.content.groupKey === "uncommon") {
        chance = currentSettingsSnapshot.artifacts.chanceUncommon;
        if (currentSettingsSnapshot.artifacts.luminaEnabled) {
            availableArtifacts.push({
                artifactKey: "lumina",
                artifactLabel: "Náhrdelník Luminy"
            });
        }
    }

    if (stone.content.groupKey === "rare") {
        chance = currentSettingsSnapshot.artifacts.chanceRare;
        if (currentSettingsSnapshot.artifacts.atochaEnabled) {
            availableArtifacts.push({
                artifactKey: "atocha",
                artifactLabel: "Zlaté mince z Atochy"
            });
        }
    }

    if (availableArtifacts.length === 0 || chance <= 0) {
        return null;
    }

    const roll = randomInt(1, 100);
    if (roll > chance) {
        return null;
    }

    const artifact = availableArtifacts[Math.floor(Math.random() * availableArtifacts.length)];
    const alreadyHasArtifact = player.artifacts.some(a => a.artifactKey === artifact.artifactKey);

    if (alreadyHasArtifact) {
        return null;
    }

    return artifact;
}

function maybeGetOxygenPocket(stone, player) {
    if (!currentSettingsSnapshot.oxygenPockets.enabled) {
        return 0;
    }

    if (stone.content.type !== "treasure") {
        return 0;
    }

    let chance = 0;

    if (stone.content.groupKey === "common") {
        chance = currentSettingsSnapshot.oxygenPockets.chanceCommon;
    } else if (stone.content.groupKey === "rare") {
        chance = currentSettingsSnapshot.oxygenPockets.chanceRare;
    } else {
        return 0;
    }

    if (chance <= 0) {
        return 0;
    }

    if (player.oxygen >= currentSettingsSnapshot.startingOxygen) {
        return 0;
    }

    const roll = randomInt(1, 100);
    if (roll > chance) {
        return 0;
    }

    const missing = currentSettingsSnapshot.startingOxygen - player.oxygen;
    return Math.min(currentSettingsSnapshot.oxygenPockets.oxygenValue, missing);
}

function collectCurrentStone() {
    if (!canCollectCurrentStone()) {
        updateStatus("Tento kámen už byl prozkoumán.");
        turnPhase = "end-allowed";
        updateActionButtons();
        return;
    }

    const player = players[currentPlayerIndex];
    const stone = stones[player.position - 1];
    stone.revealed = true;

    const droppedArtifact = maybeDropArtifactForTreasure(stone, player);
    const oxygenGain = maybeGetOxygenPocket(stone, player);

    const treasureValueBonus = droppedArtifact ? currentSettingsSnapshot.artifacts.valueBonus : 0;
    const treasureValue = stone.content.value + treasureValueBonus;

    player.treasures.push({
        groupKey: stone.content.groupKey,
        groupLabel: stone.content.groupLabel,
        value: treasureValue,
        loss: stone.content.loss
    });

    const messages = [
        `${player.name} vyzvedl poklad ${stone.content.groupLabel} s hodnotou ${treasureValue}.`
    ];

    if (droppedArtifact) {
        player.artifacts.push({
            artifactKey: droppedArtifact.artifactKey,
            artifactLabel: droppedArtifact.artifactLabel
        });
        messages.push(`Padl artefakt: ${droppedArtifact.artifactLabel}.`);
    }

    if (oxygenGain > 0) {
        player.oxygen += oxygenGain;
        messages.push(`Našel vzduchovou kapsu a doplnil ${oxygenGain} kyslíku.`);
    }

    currentPenalty = getPlayerPenalty(player);

    renderScoreboard();
    updateDiceInfo();
    updateStatus(messages.join(" "));
    turnPhase = "end-allowed";
    updateActionButtons();
}

function skipCurrentStone() {
    if (!canCollectCurrentStone()) {
        endTurn();
        return;
    }

    updateStatus(`${players[currentPlayerIndex].name} se rozhodl poklad nevyzvednout.`);
    turnPhase = "end-allowed";
    updateActionButtons();
}

function applyEndTurnOxygenLoss(player) {
    const oxygenLoss = player.treasures.length;
    if (oxygenLoss > 0) {
        player.oxygen = Math.max(0, player.oxygen - oxygenLoss);
    }

    if (player.oxygen > 0) {
        return;
    }

    const hasLumina = player.artifacts.some(a => a.artifactKey === "lumina");
    if (hasLumina && !player.luminaUsed) {
        player.luminaUsed = true;
        player.oxygen = 1;
        updateStatus(`${player.name} využil Náhrdelník Luminy a získal ještě poslední šanci.`);
        return;
    }

    player.position = 0;
    player.treasures = [];
    player.drowned = true;
    updateStatus(`${player.name} se utopil a přišel o všechny nesené poklady.`);
}

function endTurn() {
    if (players.length === 0) {
        updateStatus("Nejprve spusť hru.");
        return;
    }

    const player = players[currentPlayerIndex];
    applyEndTurnOxygenLoss(player);

    currentPlayerIndex++;
    if (currentPlayerIndex >= players.length) {
        currentPlayerIndex = 0;
    }

    rolledRawValue = 0;
    rolledFinalValue = 0;
    currentPenalty = 0;
    turnPhase = "choose-direction";

    updateDirectionVisual();
    updateDiceInfo();
    renderScoreboard();
    renderPath();
    updateActionButtons();

    updateStatus(`${players[currentPlayerIndex].name} je na tahu. Nejprve zvol směr.`);
}

function handleSingleAction() {
    if (turnPhase === "choose-direction") {
        rollAndMoveCurrentPlayer();
        return;
    }

    if (turnPhase === "moved" || turnPhase === "end-allowed") {
        endTurn();
    }
}

function randomInt(min, max) {
    const a = Math.min(Number(min), Number(max));
    const b = Math.max(Number(min), Number(max));
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

playerCountSelect.addEventListener("change", renderPlayerInputs);

[
    commonCountInput,
    uncommonCountInput,
    rareCountInput
].forEach(input => {
    input.addEventListener("input", updateTotalStonesInfo);
    input.addEventListener("change", updateTotalStonesInfo);
});

startGameBtn.addEventListener("click", function () {
    try {
        buildGameFromSettings();
        showGameScreen();
    } catch (error) {
        console.error("Chyba při spuštění hry:", error);
        alert("Chyba při spuštění hry. Otevři F12 > Console.");
    }
});

directionButton.addEventListener("click", toggleDirection);
actionButton.addEventListener("click", handleSingleAction);
collectButton.addEventListener("click", collectCurrentStone);
skipButton.addEventListener("click", skipCurrentStone);

settingsMenuButton.addEventListener("click", function () {
    settingsMenuPanel.classList.toggle("hidden");
});

settingsGoHomeBtn.addEventListener("click", goHome);

settingsResetDefaultsBtn.addEventListener("click", function () {
    resetSettingsToDefault();
    closeAllMenus();
});

settingsCloseMenuBtn.addEventListener("click", function () {
    closeAllMenus();
});

gameMenuButton.addEventListener("click", function () {
    gameMenuPanel.classList.toggle("hidden");
});

resumeGameBtn.addEventListener("click", function () {
    closeAllMenus();
});

restartGameBtn.addEventListener("click", function () {
    restartGameWithCurrentSettings();
    closeAllMenus();
});

backToSettingsBtn.addEventListener("click", function () {
    showSettingsScreen();
});

goHomeBtn.addEventListener("click", goHome);

window.addEventListener("resize", function () {
    closeAllMenus();
    if (!gameScreen.classList.contains("hidden")) {
        renderPath();
    }
});

resetSettingsToDefault();
showSettingsScreen();
updateDiceInfo();
updateActionButtons();
updateStatus("Nejprve nastav hru a stiskni Spustit hru.");