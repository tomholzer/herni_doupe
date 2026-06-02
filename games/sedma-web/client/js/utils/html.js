window.escapeHtml = function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
};

window.translateStatus = function translateStatus(status) {
    if (status === "waiting") return "čeká";
    if (status === "playing") return "běží";
    if (status === "finished") return "konec";

    return status;
};

window.translateAssistMode = function translateAssistMode(mode) {
    if (mode === "normal") return "normální";
    if (mode === "blind") return "slepý";
    if (mode === "amateur") return "začátečník";

    return mode;
};