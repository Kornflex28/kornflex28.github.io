// Acronyms show their meaning on hover (abbr title), which a touch screen never has: a tap
// spells one out beside it instead, and another tap folds it back (.is-open). From the
// keyboard, each can be reached (Tab), which spells it out while it has the focus (the CSS),
// and Enter or Space leaves it spelt out. Each has its own listener: iOS sends no tap to a
// listener higher up when the element is not a link.
document.querySelectorAll("abbr[title]").forEach((abbr) => {
    abbr.tabIndex = 0;
    abbr.addEventListener("click", () => abbr.classList.toggle("is-open"));
    abbr.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        abbr.classList.toggle("is-open");
    });
});
