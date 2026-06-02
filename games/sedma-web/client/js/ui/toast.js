window.showToast = function showToast(text, duration = 2600) {
    elements.toast.textContent = text;
    elements.toast.classList.remove("hidden");

    window.clearTimeout(showToast.timer);

    showToast.timer = window.setTimeout(
        () => elements.toast.classList.add("hidden"),
        duration
    );
};

window.showSpinner = function showSpinner() {
    elements.serverSpinner?.classList.remove("hidden");
};

window.hideSpinner = function hideSpinner() {
    window.setTimeout(
        () => elements.serverSpinner?.classList.add("hidden"),
        500
    );
};