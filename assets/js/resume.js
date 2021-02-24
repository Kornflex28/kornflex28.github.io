document
    .querySelector(".overlay__btn.overlay__btn--transparent.top")
    .addEventListener("click", () => {
        window.scroll({ top: 0, behavior: 'smooth' });
    });