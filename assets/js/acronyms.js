// Acronyms show their meaning on hover (abbr title), which a touch screen never has: a tap
// spells one out beside it instead, and another tap folds it back (.is-open). Each has its own
// listener: iOS sends no tap to a listener higher up when the element is not a link.
document.querySelectorAll("abbr[title]").forEach((abbr) => {
    abbr.addEventListener("click", () => abbr.classList.toggle("is-open"));
});
