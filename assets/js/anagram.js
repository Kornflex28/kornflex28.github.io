// The name's anagram: hovering over the name, or tapping it, sends its letters flying off
// like a flock of birds, wings beating, one after another, to land spelling "touche.visual",
// the dot of the i flying off on its own to become the full stop; leaving it, or tapping
// again, brings them home. Every flight takes new paths, and twin letters draw lots for their
// spots. Positions are measured in the page's own font, so the flight fits any screen.
(() => {
    const name = document.querySelector(".name");
    if (!name) return;

    const TARGET = "touche.visual";
    const text = name.textContent.trim();
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const WINGS = '<span class="wings"><svg viewBox="0 0 24 8"><path class="wing-left" d="M12 6 Q7 0 1 3" /><path class="wing-right" d="M12 6 Q17 0 23 3" /></svg></span>';

    // One span per letter, with a pair of folded wings. A capital also holds its small
    // letter, shown once it has flown; the i holds a dotless i, shown once its dot has flown.
    name.setAttribute("aria-label", text);
    name.textContent = "";
    const letters = [...text].map((ch) => {
        const span = document.createElement("span");
        span.className = "letter";
        span.setAttribute("aria-hidden", "true");
        if (ch === " ") span.textContent = ch;
        else if (ch !== ch.toLowerCase()) span.innerHTML = `<span class="glyph">${ch}</span><span class="glyph twin small">${ch.toLowerCase()}</span>${WINGS}`;
        else if (ch === "i") span.innerHTML = `<span class="glyph">i</span><span class="glyph twin dotless">ı</span>${WINGS}`;
        else span.innerHTML = `<span class="glyph">${ch}</span>${WINGS}`;
        name.append(span);
        return span;
    });
    // the dot of the i, flying on its own: a full stop with small wings
    const dot = document.createElement("span");
    dot.className = "letter dot";
    dot.setAttribute("aria-hidden", "true");
    dot.innerHTML = `<span class="glyph">.</span>${WINGS}`;
    name.append(dot);
    // each bird beats its wings in its own time
    name.querySelectorAll(".wings path").forEach((wing) => { wing.style.animationDelay = `-${Math.random().toFixed(2)}s`; });

    // The ink of a glyph in the name's font, as a box around its centre, from its origin on
    // the baseline; with without, only the ink that glyph lacks (the dot of i, without ı)
    const ink = (glyph, without) => {
        const style = getComputedStyle(name);
        const size = parseFloat(style.fontSize);
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = Math.ceil(size * 3);
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const paint = (ch) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = `${style.fontWeight} ${size}px ${style.fontFamily}`;
            ctx.fillText(ch, size, size * 2);
            return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        };
        const seen = paint(glyph), hidden = without ? paint(without) : null;
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const k = (y * canvas.width + x) * 4 + 3;
                if (seen[k] < 128 || (hidden && hidden[k] > 64)) continue;
                x0 = Math.min(x0, x); x1 = Math.max(x1, x + 1); y0 = Math.min(y0, y); y1 = Math.max(y1, y + 1);
            }
        }
        if (x0 === Infinity) return null;
        return { x: (x0 + x1) / 2 - size, y: (y0 + y1) / 2 - size * 2, w: x1 - x0 };
    };

    // Where everything lands: the anagram is laid out unseen in the same font, giving each
    // spot in it; the i's dot flies from its place on the i to the full stop's
    let spots = [], homes = [], hop = null;
    const measure = () => {
        const ghost = document.createElement("span");
        ghost.className = "anagram-ghost";
        ghost.innerHTML = [...TARGET].map((ch) => `<span>${ch}</span>`).join("") + '<span class="baseline"></span>';
        name.append(ghost);
        spots = [...ghost.children].map((span) => span.offsetLeft);
        homes = letters.map((span) => span.offsetLeft);
        const baseline = ghost.querySelector(".baseline").offsetTop;
        ghost.remove();

        hop = null;
        const tittle = ink("i", "ı"), stop = ink(".");
        const i = letters.findIndex((span) => span.querySelector(".dotless"));
        if (!tittle || !stop || i < 0) return;
        const at = TARGET.indexOf(".");
        dot.style.left = `${spots[at]}px`;
        dot.style.transformOrigin = `${stop.x}px ${baseline + stop.y}px`;
        hop = {
            letter: i,
            dx: letters[i].offsetLeft + tittle.x - (spots[at] + stop.x),
            dy: tittle.y - stop.y,
            scale: tittle.w / stop.w,
        };
    };

    // Which spot of the anagram each letter flies to: twin letters (the two u) draw lots
    // before every flight away
    const lower = (span) => (span.querySelector(".small") || span.querySelector(".glyph"))?.textContent;
    let spotOf = [];
    const drawLots = () => {
        spotOf = letters.map(() => null);
        new Set(TARGET).forEach((ch) => {
            const places = [...TARGET].flatMap((c, j) => (c === ch ? [j] : []));
            const flock = letters.flatMap((span, i) => (lower(span) === ch ? [i] : []));
            flock.sort(() => Math.random() - 0.5).forEach((i, k) => { if (k < places.length) spotOf[i] = places[k]; });
        });
    };
    const flightOf = (i) => (spotOf[i] == null ? null : spots[spotOf[i]] - homes[i]);

    // One flight of every letter, away to the anagram or back home, each on a path of its
    // own: up in an arc, banking and wandering a little, then down onto its spot
    let flights = [], flown = false;
    const size = () => parseFloat(getComputedStyle(name).fontSize);
    // A flight from one place to another (x, y, scale) along a smooth arc: a cubic Bézier
    // rising on one side and coming down on the other, so even a letter landing close to
    // where it took off loops over rather than turning back sharply. Finely sampled, banking
    // gently on the way.
    const path = (from, to, upward) => {
        const top = Math.min(from[1], to[1]), dx = to[0] - from[0];
        const side = Math.abs(dx) > 1 ? Math.sign(dx) : (Math.random() < 0.5 ? -1 : 1);
        const spread = upward * (0.4 + Math.random() * 0.4);
        const lean = side * (6 + Math.random() * 12);
        const rise = [from[0] + dx * (0.1 + Math.random() * 0.2) - side * spread, top - upward * (1.1 + Math.random() * 0.3)];
        const fall = [to[0] - dx * (0.1 + Math.random() * 0.2) + side * spread, top - upward * (0.8 + Math.random() * 0.3)];
        const bezier = (a, b, c, d, u) => a * (1 - u) ** 3 + 3 * b * u * (1 - u) ** 2 + 3 * c * u * u * (1 - u) + d * u ** 3;
        return Array.from({ length: 33 }, (_, k) => {
            const u = k / 32;
            const x = bezier(from[0], rise[0], fall[0], to[0], u), y = bezier(from[1], rise[1], fall[1], to[1], u);
            const turn = lean * Math.sin(Math.PI * u), scale = from[2] + (to[2] - from[2]) * u;
            return { transform: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${turn.toFixed(2)}deg) scale(${scale.toFixed(3)})` };
        });
    };
    // an opacity switched at the very start of a flight away, or at the very end of a
    // flight home: so the i lacks its dot exactly while the dot is in the air
    const flip = (from, to, away) => (away
        ? [{ opacity: from }, { opacity: to, offset: 0.001 }, { opacity: to }]
        : [{ opacity: from }, { opacity: from, offset: 0.999 }, { opacity: to }]);
    const wingsOut = [{ opacity: 0 }, { opacity: 1, offset: 0.12 }, { opacity: 1, offset: 0.85 }, { opacity: 0 }];

    const takeOff = (away) => {
        const still = reducedMotion.matches;
        if (away) drawLots();
        flights = [];
        letters.forEach((span, i) => {
            const dx = flightOf(i);
            if (dx === null) return;
            const timing = {
                duration: still ? 1 : 900 + Math.random() * 600,
                delay: still ? 0 : Math.random() * 400,
                fill: "both",
                easing: "ease-in-out",
            };
            const home = [0, 0, 1], spot = [dx, 0, 1];
            flights.push(span.animate(path(away ? home : spot, away ? spot : home, size() * (0.3 + Math.random())), timing));
            flights.push(span.querySelector(".wings").animate(wingsOut, timing));
            // a capital turns into its small letter in mid-flight, and back on the way home
            const small = span.querySelector(".small");
            if (small) {
                const [start, end] = away ? [0, 1] : [1, 0];
                flights.push(small.animate([{ opacity: start }, { opacity: start, offset: 0.45 }, { opacity: end, offset: 0.55 }, { opacity: end }], timing));
                flights.push(span.querySelector(".glyph").animate([{ opacity: 1 - start }, { opacity: 1 - start, offset: 0.45 }, { opacity: 1 - end, offset: 0.55 }, { opacity: 1 - end }], timing));
            }
            // the i's dot leaves with the i and comes back with it, on a path of its own, a
            // little higher, a little more wayward
            if (hop && i === hop.letter) {
                const onI = [hop.dx, hop.dy, hop.scale], stop = [0, 0, 1];
                flights.push(dot.animate(path(away ? onI : stop, away ? stop : onI, size() * (0.8 + Math.random())), timing));
                const [before, after] = away ? [0, 1] : [1, 0];   // the dot out of the i
                flights.push(dot.animate(flip(before, after, away), timing));
                flights.push(dot.querySelector(".wings").animate(wingsOut, timing));
                flights.push(span.querySelector(".dotless").animate(flip(before, after, away), timing));
                flights.push(span.querySelector(".glyph").animate(flip(after, before, away), timing));
            }
        });
        // the wings beat only while the letters are in the air
        name.classList.add("is-flying");
        Promise.all(flights.map((anim) => anim.finished)).then(() => name.classList.remove("is-flying"), () => {});
    };

    const fly = (away) => {
        if (away === flown) return;
        flown = away;
        // changing its mind in mid-flight, the flock turns back the way it came
        if (flights.some((anim) => anim.playState === "running")) {
            flights.forEach((anim) => anim.reverse());
            return;
        }
        flights.forEach((anim) => anim.cancel());
        takeOff(away);
    };

    // Mouse: while hovering; touch: each tap
    let pointer = "mouse";
    name.addEventListener("pointerdown", (event) => { pointer = event.pointerType; });
    name.addEventListener("pointerenter", (event) => { if (event.pointerType === "mouse") fly(true); });
    name.addEventListener("pointerleave", (event) => { if (event.pointerType === "mouse") fly(false); });
    name.addEventListener("click", () => { if (pointer !== "mouse") fly(!flown); });

    // Measured again once the font has loaded and whenever the name's size changes; letters
    // already in the anagram are set straight onto their new spots
    let width = 0;
    const settle = () => {
        flights.forEach((anim) => anim.cancel());
        flights = [];
        measure();
        if (!flown) return;
        // letters in the anagram are set straight onto their spots, which they keep: the
        // start of a flight home
        takeOff(false);
        flights.forEach((anim) => { anim.reverse(); anim.finish(); });
    };
    new ResizeObserver(() => {
        if (name.offsetWidth === width) return;
        width = name.offsetWidth;
        settle();
    }).observe(name);
    // the dotless i comes from another part of the font, loaded only when asked for
    const style = getComputedStyle(name);
    document.fonts.load(`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`, "iı.").then(settle, settle);
})();
