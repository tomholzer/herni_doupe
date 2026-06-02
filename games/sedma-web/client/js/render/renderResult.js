function renderResultOverlay(state) {
    if (!elements.resultOverlay) {
        return;
    }

    if (state.status !== "finished" || !state.result) {
        elements.resultOverlay.className =
            "result-overlay hidden";

        elements.resultOverlay.innerHTML = "";
        return;
    }

    const result = state.result;

    const target = Number(
        result.targetMatchPoints ||
        state.targetMatchPoints ||
        10
    );

    const scoreRows =
        (result.scoreGroups || state.scoreGroups || [])
            .map(group => `
                <div class="result-score-row">
                    <span>${escapeHtml(group.name)}</span>
                    <strong>${group.points} bodů | ${Number(group.matchPoints || 0)}/${target}</strong>
                </div>
            `)
            .join("");

    elements.resultOverlay.className =
        `result-overlay ${result.isFire ? "fire-result" : ""}`;

    elements.resultOverlay.innerHTML = `
        <div class="result-title">${result.isFire ? "🔥 " : ""}${escapeHtml(result.title || "Konec hry")}</div>
        <div class="result-winner">${escapeHtml(result.winnerNames || result.winnerName || "")}</div>
        <div class="result-text">${escapeHtml(result.awardReason || result.text || "")}</div>
        <div class="result-match-points">+${Number(result.awardedMatchPoints || 0)} bodů do hry</div>
        ${scoreRows ? `<div class="result-scores">${scoreRows}</div>` : ""}
        <button class="primary-button result-continue-button" type="button" data-action="next-round">Pokračovat</button>
    `;
}