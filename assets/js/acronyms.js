// Acronyms show their meaning on hover (abbr title), which a touch screen never has: a tap
// spells one out beside it instead, and another tap folds it back (.is-open)
document.addEventListener("click", (event) => {
    const abbr = event.target.closest("abbr[title]");
    if (abbr) abbr.classList.toggle("is-open");
});
