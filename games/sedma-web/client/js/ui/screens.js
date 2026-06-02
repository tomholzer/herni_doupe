window.showScreen = function showScreen(screenName) {
    elements.menuScreen.classList.remove("active");
    elements.lobbyScreen.classList.remove("active");
    elements.gameScreen.classList.remove("active");

    closeSidePanel();

    if (screenName === "menu") {
        elements.menuScreen.classList.add("active");
    }

    if (screenName === "lobby") {
        elements.lobbyScreen.classList.add("active");
    }

    if (screenName === "game") {
        elements.gameScreen.classList.add("active");
    }
};

window.openSidePanel = function openSidePanel() {
    if (!elements.desktopSidePanel) {
        return;
    }

    elements.desktopSidePanel.classList.add("open");
};

window.closeSidePanel = function closeSidePanel() {
    elements.desktopSidePanel?.classList.remove("open");
};

window.toggleSidePanel = function toggleSidePanel() {
    if (elements.desktopSidePanel?.classList.contains("open")) {
        closeSidePanel();
        return;
    }

    openSidePanel();
};