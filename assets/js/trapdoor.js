// The frog's link drops it through one of the King's trapdoors: touched, the trapdoor opens
// under the frog, it falls through, and its page opens, in a new tab as the link says (or here,
// where the browser holds a late new tab up); a moment later the trapdoor shuts and the frog is
// back. A click with a modifier key, or with motion reduced, simply follows the link.
(() => {
    const link = document.querySelector(".frog-link a");
    if (!link) return;
    const item = link.closest(".frog-link"), trap = item.querySelector(".trapdoor");
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    link.addEventListener("click", (event) => {
        if (reducedMotion.matches || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        if (item.classList.contains("is-falling")) return;
        item.classList.add("is-falling");
        setTimeout(() => trap.classList.add("open"), 150);
        setTimeout(() => {
            const page = window.open(link.href, "_blank");
            if (page) page.opener = null;
            else location.href = link.href;
        }, 800);
        setTimeout(() => {
            trap.classList.remove("open");
            item.classList.remove("is-falling");
        }, 1700);
    });
})();
