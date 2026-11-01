// "Now", the end of the current job, gives the time, UTC, to the second: while a mouse points
// at it, or, on a touch screen, from a tap on it until the next tap anywhere or the page is
// left. Touch screens are told apart by what they can do (hover), not by the kind of event: a
// tap on an iPhone also sends mouse events.
(() => {
    const now = document.querySelector(".now");
    if (!now) return;
    const hovers = matchMedia("(hover: hover)");
    let timer = 0;
    const tick = () => { now.textContent = `${new Date().toISOString().slice(0, 19).replace("T", " ")} UTC`; };
    const show = () => {
        if (timer) return;
        tick();
        timer = setInterval(tick, 250);
    };
    const hide = () => {
        clearInterval(timer);
        timer = 0;
        now.textContent = "Now";
    };
    now.addEventListener("pointerenter", () => { if (hovers.matches) show(); });
    now.addEventListener("pointerleave", () => { if (hovers.matches) hide(); });
    now.addEventListener("click", () => { if (!hovers.matches) (timer ? hide : show)(); });
    document.addEventListener("pointerdown", (event) => { if (!now.contains(event.target)) hide(); });
    document.addEventListener("visibilitychange", () => { if (document.hidden) hide(); });
    hovers.addEventListener("change", hide);
})();
