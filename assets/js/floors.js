// The lines between the tower's floors (the resume's sections), dressed after Le Roi et
// l'Oiseau: each a course of the castle terrace's stone, each floor's name cut in a panel
// under it; moss on the stone, and creepers along it, growing as its floor comes into view, stirring
// in a light wind and where the pointer brushes them, fireflies over them by night; and on
// each floor something along the line: one of the town's loudspeakers, gears of the
// palace's machinery, a nest of the Bird's chicks, a brass compass, a pile of books under a
// candle, an old bicycle and a street piano. Each castle (its seed, from skyline.js) draws
// them its own way.
(() => {
    const floors = [...document.querySelectorAll("main .floor")];
    if (!floors.length) return;
    const NS = "http://www.w3.org/2000/svg";
    const LINE = 46, HIGH = 70;                 // the floor's line (its top) and each drawing's height, in pixels
    const TOP = LINE - 3, LOW = LINE + 8;       // the course of stone along it: its top, its underside
    const f = (n) => n.toFixed(1);
    // a piece of what a plant climbs (cable, chain, post), from y0 to y1 at x, laid back over its stem
    const cord = (cls, x, y0, y1) => `<path class="${cls}" d="M${f(x)} ${f(Math.min(y0, y1) - 0.5)} v${f(Math.abs(y1 - y0) + 1)}" />`;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    // on touch screens, fewer things sway (each costs the browser a little, every frame)
    const coarse = matchMedia("(pointer: coarse)");
    let scale = 1;                              // the plants' size, smaller on narrow floors
    let named = 0;                              // where the floor's name ends: nothing hangs over it

    // mulberry32, as skyline.js draws its castles
    let random = Math.random;
    const seeded = (s) => () => {
        s = (s + 0x6d2b79f5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const rand = (a, b) => a + (b - a) * random();
    const int = (a, b) => Math.floor(rand(a, b + 1));
    const pick = (list) => list[Math.floor(random() * list.length)];
    // details added to the things on the lines after their first drawing come from draws of
    // their own (aside, a stream for each floor), so the rest of each castle's floors stays
    // what its seed has always given
    let side = Math.random;
    const aside = (draw) => {
        const own = random;
        random = side;
        const drawn = draw();
        random = own;
        return drawn;
    };

    // Climbing plants creeping along the line, after the gardens of the King's palace. Each
    // floor grows one or two, each kind with its own leaves (drawn pointing up from their base,
    // at 0 0: length l, half width w), flowers and stem. A part comes out a little after the one
    // to its left (--d) once its floor is in view, then sways in a light wind, the gusts running
    // along the line from left to right.
    const pointed = (l, w) => `M0 0 Q${f(w)} ${f(-l * 0.45)} 0 ${f(-l)} Q${f(-w)} ${f(-l * 0.45)} 0 0Z`;
    const LEAVES = {
        pointed,
        round: (l, w) => `M0 0 C${f(w * 1.5)} ${f(-l * 0.1)} ${f(w * 1.4)} ${f(-l * 0.9)} 0 ${f(-l)} C${f(-w * 1.4)} ${f(-l * 0.9)} ${f(-w * 1.5)} ${f(-l * 0.1)} 0 0Z`,
        heart: (l, w) => {
            const p = l * 0.2;
            return `M0 0 V${f(-p)} C${f(w * 0.5)} ${f(-p + l * 0.18)} ${f(w * 1.5)} ${f(-p)} ${f(w * 1.1)} ${f(-l * 0.55)} Q${f(w * 0.6)} ${f(-l * 0.85)} 0 ${f(-l)} `
                + `Q${f(-w * 0.6)} ${f(-l * 0.85)} ${f(-w * 1.1)} ${f(-l * 0.55)} C${f(-w * 1.5)} ${f(-p)} ${f(-w * 0.5)} ${f(-p + l * 0.18)} 0 ${f(-p)}Z`;
        },
        ivy: (l, w) => `M0 0 V${f(-l * 0.15)} L${f(w * 1.2)} ${f(-l * 0.3)} L${f(w * 0.55)} ${f(-l * 0.5)} L${f(w * 0.75)} ${f(-l * 0.78)} L0 ${f(-l)} `
            + `L${f(-w * 0.75)} ${f(-l * 0.78)} L${f(-w * 0.55)} ${f(-l * 0.5)} L${f(-w * 1.2)} ${f(-l * 0.3)} L0 ${f(-l * 0.15)}Z`,
        // a stalk of small leaflets in pairs and one at its tip, as wisteria has
        pinnate: (l, w) => {
            let d = `M0 0 V${f(-l)}`;
            for (let k = 1; k <= 3; k++) {
                const y = -l * k / 3.3, s = w * 0.55;
                d += ` M0 ${f(y)} Q${f(s * 1.2)} ${f(y - s * 0.2)} ${f(s * 2)} ${f(y - s * 1.2)} Q${f(s * 0.6)} ${f(y - s * 0.9)} 0 ${f(y)}Z`
                    + ` M0 ${f(y)} Q${f(-s * 1.2)} ${f(y - s * 0.2)} ${f(-s * 2)} ${f(y - s * 1.2)} Q${f(-s * 0.6)} ${f(y - s * 0.9)} 0 ${f(y)}Z`;
            }
            return `${d} M0 ${f(-l)} Q${f(w * 0.45)} ${f(-l * 1.12)} 0 ${f(-l * 1.3)} Q${f(-w * 0.45)} ${f(-l * 1.12)} 0 ${f(-l)}Z`;
        },
    };
    const ring = (n, petal) => Array.from({ length: n }, (_, k) => petal(k * 2 * Math.PI / n)).join("");
    // Flowers, at 0 0 where they leave the stem: those that stand rise on a stalk, those that
    // hang drop below it
    const FLOWERS = {
        // five round petals round a golden heart, as a wild rose
        round: (c) => `<path class="pedicel" d="M0 0 L1 -4" /><g transform="translate(1 -5.5)"><g class="${c} outline hair">`
            + `${ring(5, (a) => `<circle cx="${f(1.7 * Math.cos(a))}" cy="${f(1.7 * Math.sin(a))}" r="1.5" />`)}</g><circle class="c-gold" r=".9" /></g>`,
        // five pointed petals, as jasmine or clematis
        star: (c) => `<path class="pedicel" d="M0 0 L-1 -3.5" /><g transform="translate(-1 -5)">`
            + `${ring(5, (a) => `<path class="${c} outline hair" transform="rotate(${f(a * 180 / Math.PI)})" d="${pointed(3.2, 1.1)}" />`)}<circle class="c-gold" r=".7" /></g>`,
        // a daisy: its rays round a golden heart
        daisy: (c) => `<path class="pedicel" d="M0 0 Q1 -3 .5 -6" /><g transform="translate(.5 -7.5)">`
            + `${ring(8, (a) => `<path class="${c} outline wisp" transform="rotate(${f(a * 180 / Math.PI)})" d="${pointed(3.6, 1.2)}" />`)}<circle class="c-gold outline hair" r="1.4" /></g>`,
        // bindweed's trumpet, seen from the front: a round flower, pale in its throat
        trumpet: (c) => `<path class="pedicel" d="M0 0 Q-1.5 -2 -1 -4.5" /><g transform="translate(-1 -7.5)"><circle class="${c} outline hair" r="3" /><circle class="c-cream" r="1.1" />`
            + `<path class="vein" d="${ring(5, (a) => `M${f(1.2 * Math.cos(a))} ${f(1.2 * Math.sin(a))} L${f(2.8 * Math.cos(a))} ${f(2.8 * Math.sin(a))} `)}" /></g>`,
        // a bellflower hanging from its stalk
        bell: (c) => `<path class="pedicel" d="M0 0 Q1.5 2 1 4" /><path class="${c} outline hair" d="M-1.6 4 Q-2.2 8 -3.2 9.6 Q-1.6 8.9 0 9.8 Q1.6 8.9 3.2 9.6 Q2.2 8 1.6 4 Q0 3 -1.6 4Z" />`,
        // a wisteria raceme: a tapering bunch hanging from its stalk, its small flowers on it
        // paler towards its tip
        cluster: (c) => `<path class="pedicel" d="M0 0 L0 2" /><path class="${c} outline hair" d="M0 1.6 C3.3 2.4 2.7 9 0 14.8 C-2.7 9 -3.3 2.4 0 1.6Z" />`
            + Array.from({ length: 6 }, (_, k) => `<circle class="${k < 3 ? "c-cream" : "c-moon"}" opacity=".55" cx="${f(0.9 * (k % 2 ? 1 : -1) * (1 - k / 7))}" cy="${f(3.6 + k * 1.75)}" r="${f(1.1 - k * 0.1)}" />`).join(""),
        // ivy's berries
        berries: (c) => `<path class="pedicel" d="M0 0 L.5 -2.5" />${[[0, -3.8], [1.8, -3], [0.9, -5.2]].map(([x, y]) => `<circle class="${c} outline hair" cx="${x}" cy="${y}" r="1.2" />`).join("")}`,
        // a bud not yet open
        bud: (c) => `<path class="pedicel" d="M0 0 L.4 -2.5" /><path class="${c} outline hair" d="M.4 -2.5 Q2.2 -4.5 .4 -7.5 Q-1.4 -4.5 .4 -2.5Z" />`,
    };
    const HANGING = new Set(["bell", "cluster"]);
    const AUTUMN = ["c-ochre", "c-gold", "c-terracotta"], DRY = ["c-thatch", "c-terracotta-deep", "c-timber"];
    // the kinds: their leaf (size, spacing, share hanging over the edge, greens), their flower
    // (colours, how often), and whether their stem is woody
    const KINDS = [
        { leaf: "ivy", size: [6, 9], every: [8, 13], hang: 0.35, greens: ["c-hedge-deep", "c-hedge", "c-hedge-olive"], flower: "berries", colours: ["c-blue-deep"], often: 0.08 },
        { leaf: "heart", size: [6, 8.5], every: [9, 14], hang: 0.2, greens: ["c-hedge", "c-hedge-light", "c-green"], flower: "trumpet", colours: ["c-blue", "c-rose", "c-cream"], often: 0.17 },
        { leaf: "pointed", size: [4.5, 7], every: [7, 11], hang: 0.25, greens: ["c-hedge-sage", "c-hedge", "c-hedge-light"], flower: "star", colours: ["c-cream", "c-moon", "c-rose"], often: 0.2 },
        { leaf: "pinnate", size: [9, 12], every: [8, 12], hang: 0.15, greens: ["c-hedge-light", "c-hedge-sage"], flower: "cluster", colours: ["c-rose", "c-blue"], often: 0.24, woody: true },
        { leaf: "round", size: [5.5, 7.5], every: [8, 12], hang: 0.2, greens: ["c-hedge-deep", "c-hedge-olive", "c-hedge"], flower: "round", colours: ["c-rose", "c-red", "c-cream"], often: 0.14, woody: true },
        { leaf: "pointed", size: [5, 7.5], every: [8, 12], hang: 0.2, greens: ["c-hedge", "c-hedge-olive", "c-green"], flower: "bell", colours: ["c-blue", "c-rose", "c-gold"], often: 0.17 },
        { leaf: "round", size: [4, 6], every: [8, 12], hang: 0.3, greens: ["c-hedge-light", "c-green", "c-hedge-sage"], flower: "daisy", colours: ["c-moon", "c-cream"], often: 0.15 },
    ];

    // One plant of a kind from x0 to x1 (span: how far the floor's plants reach, for the order
    // they grow in; winding: how the floor's plants wind round its line; offset: how far
    // round from the floor's other plant; vigour: how leafy and flowering, 1 at the lushest;
    // support: what it goes on to climb at x1, if anything). Its stem and leaves along the
    // line (main), and what climbs the support (climb), drawn over the thing it climbs.
    const plant = (kind, x0, x1, span, winding, offset, vigour, support) => {
        // where it lies at x: along the top of the course, now and then arching up off it, and
        // along some stretches of it (deep: how far, drifting slowly) trailing down over its face
        // in loose loops, as a creeper on a ledge does (not so far down over the floor's name), a
        // little unevenly all along (mid: below it, it is on the face)
        const amp = rand(2.5, 4.5) * scale, wobble = rand(0, 6), mid = TOP + 2;
        const wound = (x) => {
            const s = Math.sin(winding.turn(x) + offset), reach = winding.reach(x + offset * 20), sag = Math.max(0, (-s - 0.45) / 0.55);
            const deep = Math.max(0, Math.min(1, (winding.reach(x * 0.4 + 300 + offset * 90) - 0.55) / 0.45));
            const fall = (0.5 - 0.5 * Math.cos(Math.PI * sag)) * deep * (x > named + 6 ? LOW - TOP + 4 : LOW - TOP - 3);
            return TOP - 1.2 - (0.8 + amp * reach) * Math.max(0, s) + fall - 0.5 * Math.sin(x / 6.3 + wobble) - 0.3 * Math.sin(x / 2.9 + 1.7 * wobble);
        };
        // and lifted over whatever stands in its way there (winding.over: the height it must
        // clear), easing onto it and off it
        const yAt = (x) => {
            const y = wound(x), clear = winding.over(x);
            return clear === Infinity ? y : (y + clear - Math.hypot(y - clear, 5)) / 2;
        };
        // when the stem gets to x, in seconds from its floor coming into view (as a delay)
        const time = (x) => 0.1 + 1.6 * x / span, delay = (t) => `--d: ${f(t)}s`;
        // what the pointer stirs: where it is, how far it swings at most; and what it swings about
        const stir = (x, y, most) => `data-at="${f(x)} ${f(y)} ${most}"`, pivot = (x, y) => `transform-box: view-box; transform-origin: ${f(x)}px ${f(y)}px`;
        // some of the leaves and flowers sway, enough for the plant to look stirred (each one
        // swaying costs the browser a little, every frame)
        // (on the leaf or flower itself, as its class and style: one element for each, set where
        // it leaves the stem (translate), grown (scale) and swayed (rotate) about that point by
        // the CSS, turned by its own transform, so the page has a third as many to lay out and
        // to paint)
        const sway = (x, swing, share) => (random() < share * (coarse.matches ? 0.35 : 1) ? [" sway", `; --amp: ${f(swing)}deg; animation-delay: -${f((span - x) / 110 + rand(0, 0.4))}s`] : ["", ""]);
        // a leaf at (x, y), turned a degrees (0 up, 180 hanging down), of uneven size: some dry
        // (drooping, some curled up), some turning
        const leaf = (x, y, a, t = time(x)) => {
            const r = random(), dry = r < 0.11, l = rand(...kind.size) * scale * rand(0.7, 1.25), w = l * 0.42;
            const colour = dry ? pick(DRY) : r < 0.17 ? pick(AUTUMN) : pick(kind.greens), curl = dry && random() < 0.5 ? " scale(1 .6)" : "";
            // its veins: the midrib and two pairs off it (none on wisteria's small leaflets)
            // (when it snows, a little of it on those turned up)
            const turned = dry ? 180 : a, snowy = document.documentElement.dataset.weather === "snow" && Math.abs(((turned + 540) % 360) - 180) < 80 && random() < 0.6;
            const snow = snowy ? `<ellipse class="snow" cx="0" cy="${f(-l * 0.6)}" rx="${f(w * 0.7)}" ry="${f(l * 0.2)}" />` : "";
            const veins = kind.leaf === "pinnate" || l < 6 ? "" : `<path class="vein" d="M0 ${f(-l * 0.12)} V${f(-l * 0.85)}`
                + [[0.38, 0.6, 0.16], [0.6, 0.45, 0.13]].map(([at, out, up]) => ` M0 ${f(-l * at)} l${f(w * out)} ${f(-l * up)} M0 ${f(-l * at)} l${f(-w * out)} ${f(-l * up)}`).join("") + '" />';
            const turn = `rotate(${f(dry ? rand(140, 220) : a)})${curl}`, [swaying, swung] = sway(x, rand(3, 7), 0.45);
            return `<g class="leaf${swaying}" transform="${turn}" style="translate: ${f(x)}px ${f(y)}px; ${delay(t)}${swung}" data-at="${f(x)} ${f(y)}">`
                + `<path class="${colour} outline ${kind.leaf === "pinnate" ? "wisp" : "hair"}" d="${LEAVES[kind.leaf](l, w)}" />${veins}${snow}</g>`;
        };
        // a flower at (x, y)
        const flower = (x, y, type, t = time(x)) => {
            const drawn = FLOWERS[type](type === "bud" ? pick(kind.greens) : pick(kind.colours));
            const [swaying, swung] = HANGING.has(type) ? sway(x, rand(6, 10), 1) : sway(x, rand(2, 4), 0.5);
            return `<g class="flower${swaying}" style="translate: ${f(x)}px ${f(y)}px; ${delay(t)}${swung}" data-at="${f(x)} ${f(y)}">${drawn}</g>`;
        };
        // a dead twig sticking out of the stem, forked
        const twig = (x, y) => {
            const a = rand(-160, 160) * Math.PI / 180, l = rand(6, 12) * scale, b = a + (random() < 0.5 ? 1 : -1) * rand(0.4, 0.8);
            return `<path class="tendril dead" pathLength="1" style="${delay(time(x))}; ${pivot(x, y)}" ${stir(x, y, 25)} d="M${f(x)} ${f(y)} l${f(l * Math.cos(a))} ${f(l * Math.sin(a))} `
                + `M${f(x + 0.55 * l * Math.cos(a))} ${f(y + 0.55 * l * Math.sin(a))} l${f(0.4 * l * Math.cos(b))} ${f(0.4 * l * Math.sin(b))}" />`;
        };
        // a little bare branch, green, mostly rising, sometimes forked
        const sprig = (x, y) => {
            const a = rand(30, 150) * Math.PI / 180 * (random() < 0.75 ? -1 : 1), l = rand(4, 9) * scale;
            const fork = random() < 0.5 ? ` M${f(x + 0.6 * l * Math.cos(a))} ${f(y + 0.6 * l * Math.sin(a))} l${f(0.35 * l * Math.cos(a + 0.6))} ${f(0.35 * l * Math.sin(a + 0.6))}` : "";
            return `<path class="tendril sprig" pathLength="1" style="${delay(time(x))}; ${pivot(x, y)}" ${stir(x, y, 25)} d="M${f(x)} ${f(y)} l${f(l * Math.cos(a))} ${f(l * Math.sin(a))}${fork}" />`;
        };
        // the stem, through every point of where it lies (each curve's control point set so it
        // passes through the middle one)
        let stem = `M${f(x0)} ${f(yAt(x0))}`;
        for (let x = x0 + 4; x <= x1; x += 4) stem += ` Q${f(x - 2)} ${f(2 * yAt(x - 2) - (yAt(x - 4) + yAt(x)) / 2)} ${f(x)} ${f(yAt(x))}`;
        let parts = "", shootAt = x0 + rand(20, 70) / vigour;
        for (let x = x0 + 4, k = 0; x < x1 - 3; x += rand(...kind.every) / vigour, k++) {
            // (over the floor's name, nothing hanging down onto it)
            const y = yAt(x), clear = x > named + 6, hangs = clear && (random() < kind.hang || (y > mid && random() < 0.5));
            parts += leaf(x, y, hangs ? rand(150, 210) : (k % 2 ? 1 : -1) * rand(25, 75));
            if (random() < kind.often * vigour) parts += flower(x + rand(-1.5, 1.5), y, clear || !HANGING.has(kind.flower) ? kind.flower : "bud");
            else if (kind.flower !== "berries" && random() < kind.often * 0.35) parts += flower(x, y, "bud");
            if (random() < 0.05) parts += twig(x, y);
            if (random() < 0.09) parts += sprig(x, y);
            if (clear && random() < 0.08) {
                const s = random() < 0.5 ? 1 : -1;
                parts += `<path class="tendril" pathLength="1" style="${delay(time(x))}; ${pivot(x, y + 1)}" ${stir(x, y + 1, 25)} d="M${f(x)} ${f(y + 1)} Q${f(x + 3 * s)} ${f(y + 6)} ${f(x)} ${f(y + 9)} Q${f(x - 2.5 * s)} ${f(y + 11)} ${f(x - s)} ${f(y + 8.5)}" />`;
            }
            // now and then a shoot, rising or hanging, leafy, sometimes in flower at its tip,
            // swinging whole when brushed
            if (x > shootAt && x < x1 - 20) {
                shootAt = x + rand(35, 90) / vigour;
                const up = !clear || random() < 0.6, len = (up ? rand(12, 30) : rand(10, 16)) * scale, lean = rand(0.3, 0.9) * (random() < 0.25 ? -1 : 1);
                const ex = x + len * (up ? lean : 0.45), ey = y + (up ? -len * Math.sqrt(1 - lean * lean * 0.5) : len * 0.7);
                let shoot = `<g style="${pivot(x, y)}" ${stir((x + ex) / 2, (y + ey) / 2, 14)}><path class="tendril shoot${kind.woody ? " woody" : ""}" pathLength="1" style="${delay(time(x))}" d="M${f(x)} ${f(y)} Q${f(x + len * rand(-0.2, 0.4))} ${f((y + ey) / 2 + (up ? 2 : -2))} ${f(ex)} ${f(ey)}" />`;
                for (let t = 0.35; t < 1; t += 0.3) shoot += leaf(x + (ex - x) * t, y + (ey - y) * t, (up ? 0 : 180) + (t < 0.6 ? -50 : 50) + rand(-15, 15));
                parts += shoot + (random() < 0.5 ? flower(ex, ey, up && HANGING.has(kind.flower) ? "bud" : kind.flower)
                    : `<path class="tendril" pathLength="1" style="${delay(time(ex))}" d="M${f(ex)} ${f(ey)} q${f(3 * lean)} -4 ${f(1.5 * lean)} -7 q-1.5 -2 -3 0" />`) + "</g>";
            }
        }
        // its tip: a last leaf, a bud, and a tendril curling on
        const tip = (x, y, a, t = time(x)) => leaf(x - 3, y, a, t) + flower(x, y, "bud", t)
            + `<path class="tendril" pathLength="1" style="${delay(t)}; ${pivot(x, y)}" ${stir(x, y, 25)} d="M${f(x)} ${f(y)} Q${f(x + 5)} ${f(y - 2)} ${f(x + 6)} ${f(y - 6)} Q${f(x + 6)} ${f(y - 9)} ${f(x + 3)} ${f(y - 8)} Q${f(x + 1.5)} ${f(y - 6.5)} ${f(x + 3.5)} ${f(y - 5.5)}" />`;
        // the stem, with a lighter line along it where the light catches it, drawn out from t0
        // over t seconds, as its leaves open
        const stems = (d, t0, t) => [`stem${kind.woody ? " woody" : ""}`, `stem gloss${kind.woody ? " on-wood" : ""}`].map((c) => `<path class="${c}" pathLength="1" style="${delay(t0)}; --t: ${f(t)}s" d="${d}" />`).join("");
        const wind = `style="--wind: ${f(rand(3.2, 4.6))}s"`, grown = (drawn) => `<g class="plant" ${wind}>${drawn}</g>`;
        const main = () => grown(stems(stem, time(x0), time(x1) - time(x0)) + parts);
        if (!support) {
            parts += tip(x1, yAt(x1), rand(-70, -30));
            return { main: main(), climb: "" };
        }
        // Climbing the support, from a to b: the stem winds round it (r from its axis), in
        // front of it and behind it by turns, the support's own piece (cover) laid back over
        // the stem where it is behind; leaves where it is in front, a bud and tendril at its end. Climbing
        // up, it starts from where the stem has got to, if that is higher (lifted over something);
        // it climbs once the stem has reached it, over `rise` seconds
        const { a: [ax, from], b: [bx, by], r, cover } = support, ay = by < from ? Math.min(from, yAt(x1)) : from, long = Math.hypot(bx - ax, by - ay);
        const rise = Math.max(0.4, long / 40), when = (t) => time(x1) + rise * t / long;
        const ux = (bx - ax) / long, uy = (by - ay) / long, start = rand(0, 6), pace = rand(4, 6);
        const round = (t) => [ax + ux * t - uy * r * Math.sin(t / pace + start), ay + uy * t + ux * r * Math.sin(t / pace + start)];
        const facing = (t) => Math.cos(t / pace + start) > 0;
        let up = `M${f(x1)} ${f(yAt(x1))}`, covers = "", hidden = null, leaves = "";
        for (let t = 0; t <= long; t += 1) {
            up += ` L${round(t).map(f).join(" ")}`;
            if (!facing(t) && hidden === null) hidden = t;
            if ((facing(t) || t + 1 > long) && hidden !== null) {
                covers += cover(round(hidden)[1], round(t)[1]);
                hidden = null;
            }
        }
        for (let t = rand(2, 4); t < long - 2; t += rand(3.5, 6) / vigour) {
            if (!facing(t)) continue;
            const [x, y] = round(t), side = Math.sin(t / pace + start) > 0 ? 1 : -1;
            leaves += leaf(x, y, Math.atan2(-uy * side, ux * side) * 180 / Math.PI + 90 + rand(-25, 25), when(t));
        }
        const [ex, ey] = round(long);
        leaves += random() < kind.often * 2 ? flower(ex, ey, kind.flower, when(long)) : tip(ex, ey, rand(-70, -30), when(long));
        return { main: main(), climb: grown(stems(up, time(x1), rise) + covers + leaves) };
    };
    // How a floor's plants wind round its line, unevenly, as a real stem does: the turns now
    // tighter, now looser (turn: the angle round the line at x, its pace drifting between
    // two thirds and twice the usual), and now wide, now hugging the line (reach). Both drift
    // slowly and out of step, from sums of a few slow waves. Over: the height they must clear at
    // x, where something stands in their way (Infinity where nothing does).
    const windingOf = (span, over = () => Infinity) => {
        const p = Array.from({ length: 6 }, () => rand(0, 6)), usual = rand(9, 14), step = 0.5, turns = [rand(0, 6)];
        const drift = (x, a, b, c) => (Math.sin(x / 37 + a) + 0.6 * Math.sin(x / 23 + b) + 0.4 * Math.sin(x / 61 + c)) / 2;
        for (let x = step; x <= span + 60; x += step) turns.push(turns[turns.length - 1] + step / usual * (1 + 0.5 * drift(x, p[0], p[1], p[2])));
        return {
            turn: (x) => turns[Math.max(0, Math.min(turns.length - 1, Math.round(x / step)))],
            reach: (x) => Math.max(0.15, 0.7 + 0.45 * drift(x, p[3], p[4], p[5])),
            over,
        };
    };
    // the floor's plants along each stretch of its line left free: its kind, and on longer
    // stretches sometimes another twining with it for a while, half a turn behind it, so the
    // two wind round the line together; each floor's with their own vigour, a few leaves on a
    // thin stem on some floors, lush on others, so the floors do not all look alike
    const plants = (stretches, span, support, over, kind) => {
        const other = pick(KINDS.filter((k) => k !== kind)), winding = windingOf(span, over), vigour = rand(0.45, 1);
        let main = "", climb = "";
        stretches.forEach(([x0, x1], k) => {
            const grown = plant(kind, x0, x1, span, winding, 0, vigour, k === 0 ? support : null);
            if (x1 - x0 > 160 && random() < 0.6 * vigour) {
                const a = x0 + rand(0, (x1 - x0) * 0.4), b = Math.min(x1 - 20, a + rand(120, (x1 - x0) * 0.8));
                const twin = plant(other, a, b, span, winding, Math.PI, vigour);
                main += twin.main;
            }
            main += grown.main;
            climb += grown.climb;
        });
        return { main, climb };
    };

    // The things on some floors' lines, each placed anywhere along it by its floor's draws
    // A brass horn, as the town's loudspeakers and the gramophones of the time had: a narrow
    // throat flaring to a wide bell, dark inside, banded and riveted, from (x, y) pointing
    // `angle` degrees (0 right, 180 left), `len` long, its bell `b` from its axis; and the
    // sound coming out of it when it blares
    const horn = (x, y, angle, len, b, metal = "c-gold") => {
        const t = 1.4, curve = (s, p) => (1 - s) ** 3 * p[0] + 3 * (1 - s) ** 2 * s * p[1] + 3 * (1 - s) * s * s * p[2] + s ** 3 * p[3];
        const along = [0, len * 0.55, len * 0.82, len], across = [t, t, b * 0.4, b];
        // how wide it is a share u of the way along, read off its outline
        const at = (u) => {
            let s = 0;
            while (s < 1 && curve(s, along) < len * u) s += 0.02;
            return curve(s, across);
        };
        const band = (u) => `M${f(len * u)} ${f(-at(u))} Q${f(len * u + 0.8)} 0 ${f(len * u)} ${f(at(u))}`;
        return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(angle)})">`
            + `<path class="${metal} outline thin" d="M0 ${f(-t)} C${f(along[1])} ${f(-t)} ${f(along[2])} ${f(-across[2])} ${f(len)} ${f(-b)} L${f(len)} ${f(b)} C${f(along[2])} ${f(across[2])} ${f(along[1])} ${f(t)} 0 ${f(t)} Z" />`
            + `<path class="band" d="${band(0.3)} ${band(0.62)}" />`
            + `<circle class="rivet" cx="${f(len * 0.3)}" cy="${f(-at(0.3) * 0.5)}" r=".55" /><circle class="rivet" cx="${f(len * 0.62)}" cy="${f(at(0.62) * 0.4)}" r=".55" />`
            + `<ellipse class="c-ochre outline thin" cx="${f(len)}" rx="${f(b * 0.3)}" ry="${f(b)}" /><ellipse class="throat" cx="${f(len + 0.4)}" rx="${f(b * 0.17)}" ry="${f(b * 0.62)}" />`
            + `<path class="waves" d="M${f(len + 4)} ${f(-b * 0.55)} Q${f(len + 6.5)} 0 ${f(len + 4)} ${f(b * 0.55)} M${f(len + 8)} ${f(-b * 0.85)} Q${f(len + 12)} 0 ${f(len + 8)} ${f(b * 0.85)}" /></g>`;
    };

    // One of the town's loudspeakers, hung on its cable under the line, its horns calling down
    // to the publications and talks below: brushed, it blares; touched, it proclaims. It
    // hangs anywhere along the line (w long) past the floor's name (after: where it ends),
    // turned round in the line's left half, or near the name, so its horns call away from it
    // and towards the middle; where the
    // name leaves it little room (on phones), at the line's end, its horn calling down,
    // proclaiming above the line. The floor's plant grows to it and climbs down its cable
    // (support: from where to where, how far round, and its piece of cable to lay back over
    // the stem behind it), then goes on past it (gap: the stretch of line it leaves free).
    const loudspeaker = (i, w, after) => {
        const cramped = w - after < 110;
        const cx = Math.round(cramped ? Math.min(w - 8, Math.max(w - 30, after + 26)) : rand(after + 30, w - 24)), hang = LOW + int(6, 10), turned = !cramped && (cx < w / 2 || cx - after < 120);
        const angle = cramped ? rand(98, 112) : rand(135, 165), len = cramped ? rand(13, 16) : rand(16, 20);
        let drawn = `<rect class="c-slate outline hair" x="${cx - 4}" y="${LOW - 1}" width="8" height="3.5" rx=".8" /><path class="cable" d="M${cx} ${LOW + 2.5} V${hang}" />`
            + (random() < 0.5 ? horn(cx + 2, hang + 5, rand(25, 55), rand(8, 10), 3.5, pick(["c-slate", "c-gold"])) : "")
            + horn(cx - 2, hang + 5, angle, len, rand(6, 7), pick(["c-gold", "c-gold", "c-slate"]))
            + `<rect class="c-slate outline thin" data-snow=".25" x="${cx - 3.5}" y="${hang + 2}" width="7" height="5.5" rx="1" />`
            + `<path class="band" d="M${cx - 2.5} ${hang + 3.6} h5 M${cx - 2.5} ${hang + 5.1} h5 M${cx - 2.5} ${hang + 6.6} h5" />`;
        // a porcelain insulator on its cable, now and then a bird perched on its box
        drawn += aside(() => (random() < 0.6 ? `<ellipse class="c-cream outline hair" cx="${cx}" cy="${f(LOW + 4.5)}" rx="1.5" ry="1" />` : "")
            + (random() < 0.3 ? songbird(cx + 2.6, hang + 2, 1) : ""));
        if (turned) drawn = `<g transform="translate(${2 * cx} 0) scale(-1 1)">${drawn}</g>`;
        // what it proclaims, just past the mouth of its main horn, on the side it calls to
        const mouth = 2 + (len + 4) * -Math.cos(angle * Math.PI / 180), by = cramped ? TOP - 22 : hang + 5 + (len + 4) * Math.sin(angle * Math.PI / 180) - 7.5;
        const bx = cramped ? Math.max(2, Math.min(w - 94, cx - 46)) : turned ? cx + mouth : cx - mouth - 92;
        return {
            markup: `<g class="speaker touch"><rect class="hit" x="${cx - 42}" y="${LOW - 6}" width="84" height="${hang - LOW + 30}" />${drawn}`
                + `<g class="bubble"><rect x="${f(bx)}" y="${f(by)}" width="92" height="15" rx="7" /><text x="${f(bx + 46)}" y="${f(by + 10.5)}" text-anchor="middle">Long live the King!</text></g></g>`,
            support: { a: [cx, LOW + 2.5], b: [cx, hang], r: 2.2, cover: (y0, y1) => cord("cable", cx, y0, y1) },
            gap: [cx, cx + 5],
        };
    };

    // Gears of the palace's machinery, each castle's its own, anywhere along the line, turning
    // as the page scrolls. Their teeth are all PITCH apart, so gears of any size mesh: each one
    // is set against the one it turns, its teeth between the other's, and turns the other way,
    // faster the smaller it is (--turn: how far over the whole page). Either a train of two or
    // three side by side coming up through a slot in the floor; or one in the slot and others
    // climbing from it, held by iron bars bolted across their axles and a post the floor's plant
    // climbs. The plant grows in front of them, riding over the tops of those in the slot.
    const PITCH = 8.5, METALS = ["c-gold", "c-gold", "c-ochre", "c-terracotta", "c-slate", "c-red"];
    // a gear of n teeth round (cx, cy), its first tooth at `phase`: rim and teeth, spokes from
    // its hub (if it is big enough), a bolt at its axle
    const gear = (cx, cy, n, phase, turn, colour) => {
        const r = n * PITCH / (2 * Math.PI), s = Math.PI / n, out = r + 2.2, root = r - 2.2, rim = root - 2.4, hub = Math.max(1.8, r * 0.22);
        let d = "";
        for (let k = 0; k < n; k++) {
            const a = phase + 2 * k * s;
            [[a - s * 0.55, root], [a - s * 0.3, out], [a + s * 0.3, out], [a + s * 0.55, root]].forEach(([t, q], j) => {
                d += `${k || j ? " L" : "M"}${f(cx + q * Math.cos(t))} ${f(cy + q * Math.sin(t))}`;
            });
        }
        const ring = (q, x = cx, y = cy) => ` M${f(x + q)} ${f(y)} A${f(q)} ${f(q)} 0 1 0 ${f(x - q)} ${f(y)} A${f(q)} ${f(q)} 0 1 0 ${f(x + q)} ${f(y)} Z`;
        const spokes = r < 9 ? 0 : int(3, 6);
        const spoke = (a) => [[hub * 0.8, -1], [rim + 0.6, -1], [rim + 0.6, 1], [hub * 0.8, 1]]
            .map(([q, side], j) => `${j ? "L" : "M"}${f(cx + q * Math.cos(a) - side * 0.9 * Math.sin(a))} ${f(cy + q * Math.sin(a) + side * 0.9 * Math.cos(a))}`).join(" ") + " Z";
        // some cast whole, round holes in their web instead of spokes; rivets round some hubs; a
        // groove inside the teeth of some
        const [holed, rivets, groove] = aside(() => [random() < 0.4, r >= 7 && random() < 0.6, random() < 0.5]);
        const mid = (hub + rim) / 2, hole = Math.min((rim - hub) * 0.36, mid * Math.sin(Math.PI / Math.max(spokes, 3)) * 0.62);
        const web = !spokes ? "" : holed
            ? Array.from({ length: spokes }, (_, k) => ring(hole, cx + mid * Math.cos(phase + k * 2 * Math.PI / spokes), cy + mid * Math.sin(phase + k * 2 * Math.PI / spokes))).join("")
            : ring(rim);
        return `<g class="gear" style="--turn: ${f(turn)}turn; transform-box: view-box; transform-origin: ${f(cx)}px ${f(cy)}px"><path class="${colour} outline thin" fill-rule="evenodd" d="${d} Z${web}" />`
            + (spokes && !holed ? `<path class="${colour} outline hair" d="${Array.from({ length: spokes }, (_, k) => spoke(phase + k * 2 * Math.PI / spokes)).join(" ")}" />` : "")
            + (groove ? `<circle class="band" cx="${f(cx)}" cy="${f(cy)}" r="${f(root - 0.9)}" />` : "")
            + `<circle class="${colour} outline thin" cx="${f(cx)}" cy="${f(cy)}" r="${f(hub)}" />`
            + (rivets ? Array.from({ length: 6 }, (_, k) => `<circle class="rivet" cx="${f(cx + (hub + 1.4) * Math.cos(phase + k * Math.PI / 3))}" cy="${f(cy + (hub + 1.4) * Math.sin(phase + k * Math.PI / 3))}" r=".5" />`).join("") : "")
            + `<circle class="bolt" cx="${f(cx)}" cy="${f(cy)}" r="${f(hub * 0.45)}" /></g>`;
    };
    const gears = (i, w) => {
        const climbing = random() < 0.45, count = int(2, 3), sunk = TOP + 4;
        // the gears, each from the one before: teeth, where, its phase set so its teeth fall
        // between the other's at their contact, and how far it turns
        const train = [{ n: climbing ? int(8, 11) : int(9, 15) }];
        train[0].x = 0;
        train[0].y = sunk;
        train[0].phase = rand(0, 6);
        train[0].turn = 2 * (random() < 0.5 ? 1 : -1);
        const side = random() < 0.5 ? 1 : -1;
        for (let k = 1; k < count; k++) {
            const a = train[k - 1], n = climbing ? int(6, 9) : int(7, 14), ra = a.n * PITCH / (2 * Math.PI), rb = n * PITCH / (2 * Math.PI);
            const towards = climbing ? (side > 0 ? -rand(0.55, 0.85) : -Math.PI + rand(0.55, 0.85)) : side > 0 ? 0 : Math.PI;
            const along = (((towards - a.phase) * ra) % PITCH + PITCH) % PITCH;
            train.push({
                n, x: a.x + (ra + rb) * Math.cos(towards), y: a.y + (ra + rb) * Math.sin(towards),
                phase: towards + Math.PI - (PITCH / 2 - along) / rb, turn: -a.turn * a.n / n,
            });
        }
        // never reaching up into the floor above's writing: the highest gear goes if it would
        while (train.length > 2 && Math.min(...train.map((g) => g.y - g.n * PITCH / (2 * Math.PI) - 2.2)) < LINE - 34) train.pop();
        // the train placed along the line, wholly on it
        const xs = train.map((g) => g.x), rs = train.map((g) => g.n * PITCH / (2 * Math.PI) + 2.2);
        const lo = Math.min(...xs.map((x, k) => x - rs[k])), hi = Math.max(...xs.map((x, k) => x + rs[k]));
        const shift = Math.round(rand(10 - lo, w - 10 - hi));
        train.forEach((g) => { g.x += shift; });
        const slot = train.filter((g) => g.y === sunk).map((g) => { const r = g.n * PITCH / (2 * Math.PI) + 2.6; return `<rect class="c-window-dark outline fine" x="${f(g.x - r)}" y="${TOP - 0.5}" width="${f(2 * r)}" height="3" />`; }).join("");
        let frame = "", support = null, gap = null;
        if (climbing) {
            // iron bars bolted from axle to axle, and a post from the highest axle to the floor
            frame = train.slice(1).map((g, k) => `<path class="bar" d="M${f(train[k].x)} ${f(train[k].y)} L${f(g.x)} ${f(g.y)}" />`).join("");
            const top = train.reduce((m, g) => (g.y < m.y ? g : m)), px = top.x;
            frame += `<path class="bar post" d="M${f(px)} ${f(top.y)} V${TOP}" /><rect class="c-slate outline hair" x="${f(px - 3)}" y="${TOP - 2}" width="6" height="2.5" />`;
            support = {
                a: [px, TOP - 1], b: [px, top.y + 6], r: 2.6,
                cover: (y0, y1) => cord("bar post", px, y0, y1),
            };
            gap = [px, px + 4];
        }
        // the height the plant must clear to ride over those in the slot, just above their teeth
        // (and below the line beside them, so it eases off them)
        const tops = train.filter((g) => g.y === sunk).map((g) => [g.x, g.n * PITCH / (2 * Math.PI) + 3.4]);
        // now and then the machinist's oil can left beside them, its spout turned to them
        const oil = aside(() => {
            if (random() > 0.45) return "";
            const s = lo + shift - 18 > 6 ? 1 : hi + shift + 18 < w - 6 ? -1 : 0, x = s > 0 ? lo + shift - 9 : hi + shift + 9;
            return !s ? "" : `<path class="handle" d="M${f(x - s * 3.6)} ${TOP - 4.6} q${-s * 3.2} -1 ${-s * 1.4} -5" />`
                + `<path class="${pick(["c-red", "c-blue-deep", "c-green", "c-ochre"])} outline thin" data-snow=".3" d="M${f(x - 4)} ${TOP} V${TOP - 4.5} Q${f(x - 4)} ${TOP - 7} ${f(x)} ${TOP - 7.5} Q${f(x + 4)} ${TOP - 7} ${f(x + 4)} ${TOP - 4.5} V${TOP} Z" />`
                + `<path class="spout" d="M${f(x + s * 2.4)} ${TOP - 5.6} L${f(x + s * 9)} ${TOP - 11}" /><rect class="c-gold outline hair" x="${f(x - 1.3)}" y="${TOP - 9.2}" width="2.6" height="2" />`
                + `<path class="band" d="M${f(x - 4)} ${TOP - 2} h8" />`;
        });
        return {
            markup: `<clipPath id="floor-slot-${i}"><rect x="0" y="-${HIGH}" width="100%" height="${TOP + 1.5 + HIGH}" /></clipPath>${slot}`
                + `<g clip-path="url(#floor-slot-${i})">${train.map((g) => gear(g.x, g.y, g.n, g.phase, g.turn, pick(METALS))).join("")}</g>${frame}${oil}`,
            support,
            gap,
            across: !gap,
            behind: true,
            over: (x) => Math.min(...tops.map(([gx, R]) => {
                const d = Math.abs(x - gx);
                return d < R ? sunk - Math.sqrt(R * R - d * d) : sunk + (d - R) * 1.5;
            })),
        };
    };

    // A nest of the Bird's chicks, each castle's its own, anywhere along the line: a nest of
    // twigs sitting in the plant, an old cracked flowerpot full of straw, or a woven pouch hung
    // under the line past the floor's name, the plant climbing down its cord. Two to four
    // chicks with their beaks up for food (or peeping out of the pouch), now and then an egg
    // not yet hatched, and often the Bird himself perched beside them in his hat. Brushed, the
    // chicks open their beaks.
    const FLUFF = ["c-ochre", "c-gold", "c-sand", "c-plaster-ochre"];
    // a chick's head at (x, y), its beak pointing `turn` degrees off straight up: two halves
    // meeting at the tip, hinged where they leave the head; a tuft of down on top
    const chick = (x, y, turn) => {
        // each its own size, some dozing, their eyes shut
        const [r, dozing] = aside(() => [rand(3.1, 4.1), random() < 0.2]);
        const eyes = dozing
            ? `<path class="lid" d="M${f(x - 2.1)} ${f(y + 0.2)} q.7 .6 1.4 0 M${f(x + 0.7)} ${f(y + 0.2)} q.7 .6 1.4 0" />`
            : `<circle class="pupil" cx="${f(x - 1.4)}" cy="${f(y + 0.3)}" r=".7" /><circle class="pupil" cx="${f(x + 1.4)}" cy="${f(y + 0.3)}" r=".7" />`;
        const t = (turn - 90) * Math.PI / 180, along = (d, side) => [x + d * Math.cos(t) - side * Math.sin(t), y + d * Math.sin(t) + side * Math.cos(t)];
        const [bx, by] = along(r - 0.6, 0), tip = along(r + 4, 0).map(f).join(" "), hinge = `transform-origin: ${f(bx)}px ${f(by)}px`;
        const half = (side) => along(r - 0.8, side).map(f).join(" ");
        return `<path class="tuft" d="M${f(x - 0.8)} ${f(y - r + 0.4)} l-0.7 -1.8 M${f(x)} ${f(y - r)} v-2 M${f(x + 0.8)} ${f(y - r + 0.4)} l0.7 -1.8" />`
            + `<circle class="${pick(FLUFF)} outline hair" cx="${f(x)}" cy="${f(y)}" r="${r}" />`
            + eyes
            + `<path class="beak upper c-terracotta outline hair" style="${hinge}" d="M${half(-1.5)} L${tip} L${f(bx)} ${f(by)} Z" />`
            + `<path class="beak lower c-terracotta outline hair" style="${hinge}" d="M${half(1.5)} L${tip} L${f(bx)} ${f(by)} Z" />`;
    };
    // the chicks (or an egg in their midst) along a nest's rim at height y, from x0 to x1
    const brood = (x0, x1, y) => {
        const n = int(2, 4);
        return Array.from({ length: n }, (_, k) => {
            const x = x0 + (x1 - x0) * (n === 1 ? 0.5 : k / (n - 1));
            // an egg, speckled, or a chick
            return random() < 0.15
                ? `<g transform="rotate(${f(rand(-25, 25))} ${f(x)} ${f(y + 1.5)})"><ellipse class="c-pale outline hair" cx="${f(x)}" cy="${f(y + 1.5)}" rx="2.4" ry="3.1" />`
                    + aside(() => Array.from({ length: 5 }, () => `<circle class="speck" cx="${f(x + rand(-1.4, 1.4))}" cy="${f(y + 1.5 + rand(-2, 2))}" r="${f(rand(0.25, 0.45))}" />`).join("")) + "</g>"
                : chick(x, y - (k % 2) * 1.5, rand(-35, 35));
        }).join("");
    };
    // the Bird himself, small, perched at (x, y) facing `facing` (1 right, -1 left): dark
    // plumage, a pale breast, a red beak and his grey top hat
    const theBird = (x, y, facing) => `<g transform="translate(${f(x)} ${f(y)}) scale(${facing} 1)">`
        + '<path class="legs" d="M-1 -3.5 V0 M1.5 -3.5 V0" />'
        + '<path class="c-blue-deep outline hair" d="M-4 -6.5 L-11 -4 L-10 -2 L-3.5 -4.5 Z" />'
        + '<ellipse class="c-blue-deep outline hair" cx="0" cy="-7" rx="5.5" ry="4.2" />'
        + '<ellipse class="c-gold" cx="2.6" cy="-6" rx="2.2" ry="2.6" />'
        + '<path class="c-slate outline hair" d="M-4.5 -8.5 Q0 -10 3 -7 Q0 -5 -4.5 -6 Z" />'
        + '<circle class="c-blue-deep outline hair" cx="3.8" cy="-12" r="3.1" />'
        + '<path class="c-red outline hair" d="M6.3 -13 L11.5 -11.6 L6.3 -10.3 Z" />'
        + '<circle class="eye" cx="4.8" cy="-12.6" r=".9" /><circle class="pupil" cx="5.1" cy="-12.6" r=".45" />'
        + '<rect class="c-slate outline hair" x="1.6" y="-19.5" width="4.2" height="4.4" /><rect class="c-slate outline hair" x=".6" y="-15.4" width="6.2" height="1.1" />'
        // now and then a worm in his beak for them
        + aside(() => (random() < 0.4 ? '<path class="worm" d="M10.6 -11.8 q1.6 1.2 .2 2.6 q-1.4 1.4 .4 2.8" />' : ""))
        + "</g>";
    // A small bird of the gardens perched at (x, y) (its feet), facing `facing`: a robin, a blue
    // tit, a sparrow or a goldfinch, its head up or down, pecking
    const SONGBIRDS = [
        { body: "c-timber", breast: "c-terracotta", cap: "c-timber" },
        { body: "c-green", breast: "c-gold", cap: "c-blue" },
        { body: "c-thatch", breast: "c-sand", cap: "c-timber" },
        { body: "c-sand", breast: "c-cream", cap: "c-red" },
    ];
    const songbird = (x, y, facing) => {
        const s = pick(SONGBIRDS), [hx, hy] = random() < 0.25 ? [3.8, -3.6] : [2.6, -6.2];
        return `<g transform="translate(${f(x)} ${f(y)}) scale(${facing} 1)">`
            + '<path class="legs" d="M-.6 -2.2 V0 M.8 -2.2 V0" />'
            + `<path class="${s.body} outline hair" d="M-2.5 -4.2 L-7.5 -3 L-7 -1.8 L-2 -2.8 Z" />`
            + `<ellipse class="${s.body} outline hair" cx="0" cy="-4" rx="3.6" ry="2.6" /><ellipse class="${s.breast}" cx="1.5" cy="-3.4" rx="1.8" ry="1.6" />`
            + '<path class="wing" d="M-2.8 -4.8 Q0 -6 1.4 -4.1 Q-.6 -3 -2.8 -3.6 Z" />'
            + `<circle class="${s.cap} outline hair" cx="${hx}" cy="${hy}" r="2" />`
            + `<path class="c-ochre outline hair" d="M${hx + 1.7} ${f(hy - 0.5)} L${f(hx + 3.6)} ${hy} L${hx + 1.7} ${f(hy + 0.6)} Z" />`
            + `<circle class="pupil" cx="${f(hx + 0.8)}" cy="${f(hy - 0.4)}" r=".45" /></g>`;
    };
    const nest = (i, w, after) => {
        const kind = random(), cx = Math.round(rand(kind < 0.7 ? 40 : Math.min(after + 24, w - 60), w - 34));
        let drawn, support = null, perch = null, hit = [cx - 18, TOP - 26, 36, 28];
        if (kind < 0.45) {
            // twigs woven into a bowl, sitting in the plant: its rim, twigs across it, straw
            // sticking out
            const r = rand(13, 17), y0 = TOP - 8;
            let twigs = "";
            for (let k = 0; k < 9; k++) {
                const a = rand(-0.9, 0.9) * r, b = rand(-0.9, 0.9) * r, ya = y0 + rand(1, 7), yb = y0 + rand(1, 7);
                twigs += ` M${f(cx + a)} ${f(ya)} Q${f(cx + (a + b) / 2)} ${f((ya + yb) / 2 + rand(-2, 2))} ${f(cx + b)} ${f(yb)}`;
            }
            const straw = [-1, 1].map((s) => `M${f(cx + s * r)} ${f(y0)} l${f(s * rand(2, 4))} ${f(-rand(1, 3))} M${f(cx + s * (r - 2))} ${f(y0 + 1)} l${f(s * rand(3, 5))} ${f(rand(-1, 1))}`).join(" ");
            drawn = brood(cx - r * 0.55, cx + r * 0.55, y0 - 2.5)
                + `<path class="c-thatch outline thin" d="M${f(cx - r)} ${f(y0)} C${f(cx - r)} ${f(y0 + 13.3)} ${f(cx + r)} ${f(y0 + 13.3)} ${f(cx + r)} ${f(y0)} Z" />`
                + `<path class="twig" d="${twigs}" /><path class="straw" d="${straw}" />`
                + `<path class="twig rim" d="M${f(cx - r)} ${f(y0)} Q${f(cx)} ${f(y0 - 2.5)} ${f(cx + r)} ${f(y0)}" />`
                // a feather or two caught in its rim, a leaf woven in
                + aside(() => Array.from({ length: int(1, 3) }, () => {
                    const s = random() < 0.5 ? 1 : -1;
                    return `<path class="${pick(["c-cream", "c-pale", "c-blue-deep", "c-sand"])} outline hair" transform="translate(${f(cx + s * rand(0.55, 0.95) * r)} ${f(y0 + 1.5)}) rotate(${f(s * rand(35, 75))})" d="${pointed(rand(5, 7.5), 1.5)}" />`;
                }).join("") + (random() < 0.5 ? `<path class="${pick(["c-hedge", "c-hedge-olive", "c-ochre"])} outline hair" transform="translate(${f(cx + rand(-0.4, 0.4) * r)} ${f(y0 + 6)}) rotate(${f(rand(70, 110) * (random() < 0.5 ? 1 : -1))})" d="${pointed(5.5, 2.2)}" />` : ""));
            perch = [cx + (random() < 0.5 ? 1 : -1) * (r + 9), TOP];
        } else if (kind < 0.7) {
            // an old flowerpot, cracked, on the line, full of straw
            drawn = brood(cx - 6, cx + 6, TOP - 18.5)
                + `<path class="c-terracotta outline thin" d="M${cx - 10} ${TOP - 13} L${cx - 7.5} ${TOP} H${cx + 7.5} L${cx + 10} ${TOP - 13} Z" />`
                + `<path class="joint" d="M${cx + 3} ${TOP - 13} l-1.5 3 l2 2 l-1.5 3.5" />`
                + `<path class="straw" d="M${cx - 9} ${TOP - 15.5} l-3 -2 M${cx - 6} ${TOP - 16} l-1 -3 M${cx + 7} ${TOP - 16} l2 -2.5 M${cx + 9.5} ${TOP - 15} l3 -1" />`
                + `<rect class="c-terracotta-deep outline thin" data-snow=".5" x="${cx - 11.5}" y="${TOP - 16}" width="23" height="3.5" />`
                // a band painted round it, a chip off its rim, moss at its foot, sometimes a
                // daisy come up in the straw
                + aside(() => (random() < 0.55 ? `<path class="${pick(["c-cream", "c-blue", "c-gold", "c-green"])} outline hair" d="M${cx - 8.9} ${TOP - 7.6} H${cx + 8.9} L${cx + 8.6} ${TOP - 5.8} H${cx - 8.6} Z" />` : "")
                    + (random() < 0.5 ? `<path class="chip" d="M${cx + rand(-9, 5)} ${TOP - 16} l2 2.4 l2.2 -2.4 Z" />` : "")
                    + (random() < 0.6 ? `<path class="${pick(MOSS)} moss-edge" d="M${cx - 8} ${TOP} q.6 -2.4 2 -1.6 q1 -2 2.4 -.6 q1.2 -1.2 1.8 .6 Q${cx - 1.4} ${TOP - 0.6} ${cx - 1} ${TOP} Z" />` : "")
                    + (random() < 0.45 ? `<g transform="translate(${cx + 7.5} ${TOP - 15.5}) rotate(12)">${FLOWERS.daisy(pick(["c-cream", "c-moon", "c-gold"]))}</g>` : ""));
            perch = [cx + (random() < 0.5 ? 1 : -1) * 21, TOP];
        } else {
            // a pouch woven of grass, hung on a cord under the line, a chick peeping out of its
            // round door
            const top = LOW + 6, h = rand(17, 21), side = random() < 0.5 ? 1 : -1, hy = top + h * 0.5;
            let weave = "";
            for (let k = 1; k < 5; k++) {
                const y = top + h * k / 5, half = 8 * Math.sin(Math.PI * Math.min(0.92, k / 5 + 0.1));
                weave += ` M${f(cx - half)} ${f(y)} Q${f(cx)} ${f(y + 1.5)} ${f(cx + half)} ${f(y)}`;
            }
            drawn = `<path class="twig" d="M${cx - 2} ${LOW + 1} l2 1.5 l2 -1.5" /><path class="cable" d="M${cx} ${LOW + 2.5} V${top}" />`
                + `<path class="c-thatch outline thin" data-snow=".15" d="M${cx} ${top} C${cx + 9} ${top + 2} ${cx + 9.5} ${f(top + h * 0.8)} ${cx} ${f(top + h)} C${cx - 9.5} ${f(top + h * 0.8)} ${cx - 9} ${top + 2} ${cx} ${top} Z" />`
                + `<path class="twig" d="${weave}" />`
                // loose grass hanging from its bottom
                + aside(() => `<path class="straw" d="${Array.from({ length: int(2, 4) }, () => `M${f(cx + rand(-2.5, 2.5))} ${f(top + h - 0.5)} q${f(rand(-1, 1))} ${f(rand(2, 3))} ${f(rand(-1.5, 1.5))} ${f(rand(3, 6))}`).join(" ")}" />`)
                + `<ellipse class="c-window-dark outline hair" cx="${f(cx + side * 3)}" cy="${f(hy)}" rx="3.2" ry="3.6" />`
                + chick(cx + side * 3.5, hy + 0.5, side * 70);
            support = { a: [cx, LOW + 2.5], b: [cx, top], r: 1.8, cover: (y0, y1) => cord("cable", cx, y0, y1) };
            perch = [cx - side * 12, TOP];
            hit = [cx - 14, LOW - 4, 28, h + 14];
        }
        const bird = random() < 0.45 ? theBird(perch[0], perch[1], perch[0] < cx ? 1 : -1) : "";
        return {
            markup: `<g class="nest touch"><rect class="hit" x="${f(hit[0])}" y="${f(hit[1])}" width="${f(hit[2])}" height="${f(hit[3])}" />${drawn}${bird}</g>`,
            support,
            gap: support ? [cx, cx + 3] : null,
            across: !support,
        };
    };

    // A brass compass, each castle's its own: on a turned stand or a brass tripod on the line,
    // or, past the floor's name, a pocket compass hung on its chain under it, the floor's plant
    // climbing the chain. A milled bezel, a faint rose on its dial, its north marked in red. Its
    // needle turns to the pointer wherever it is on the page, swinging past and settling as a
    // magnetised needle does, and back to the north when the pointer leaves (see below).
    const loop = (x, y, a, b) => [a, b].map((q) => `M${f(x + q)} ${f(y)} A${q} ${q} 0 1 0 ${f(x - q)} ${f(y)} A${q} ${q} 0 1 0 ${f(x + q)} ${f(y)} Z`).join(" ");
    const compass = (i, w, after) => {
        const kind = random(), hung = w - after > 100 && kind < 0.4, tripod = !hung && kind > 0.68;
        const r = hung ? rand(10, 11.5) : tripod ? rand(10.5, 11) : rand(11, 12.5);
        const cx = Math.round(hung ? rand(after + 34, w - 26) : rand(44, w - 34)), cy = hung ? LOW + 9 + r : TOP - (tripod ? 9 : 6) - r, bow = cy - r - 2.6;
        const at = (q, a) => `${f(cx + q * Math.sin(a))} ${f(cy - q * Math.cos(a))}`;
        let ticks = "", milled = "", rose = "";
        for (let k = 0; k < 16; k++) ticks += `M${at(r - 2.6, k * Math.PI / 8)} L${at(r - (k % 4 ? 3.7 : 4.8), k * Math.PI / 8)} `;
        for (let k = 0; k < 40; k++) milled += `M${at(r - 0.15, k * Math.PI / 20)} L${at(r - 0.9, k * Math.PI / 20)} `;
        for (let k = 0; k < 8; k++) rose += `${k ? "L" : "M"}${at(k % 2 ? (r - 5) * 0.24 : r - 5, k * Math.PI / 4)} `;
        const n = r - 3.4, g = r - 3.2;
        let stand;
        if (hung) {
            stand = `<rect class="c-slate outline hair" x="${cx - 3}" y="${LOW - 1}" width="6" height="3" rx=".8" /><path class="chain" d="M${cx} ${LOW + 2} V${f(bow - 2.4)}" />`
                + `<path class="c-gold outline hair" fill-rule="evenodd" d="${loop(cx, bow, 2.4, 1.2)}" /><rect class="c-gold outline hair" x="${cx - 1.6}" y="${f(cy - r - 1.8)}" width="3.2" height="2.2" rx=".5" />`;
        } else if (tripod) {
            const legs = `M${cx} ${f(cy + r - 1)} L${cx - 8.5} ${TOP - 0.6} M${cx} ${f(cy + r - 1)} L${cx + 8.5} ${TOP - 0.6}`;
            stand = `<path class="arm" d="M${cx} ${f(cy + r)} L${cx + 1.5} ${TOP - 0.6}" /><path class="tube-edge" d="${legs}" /><path class="tube" style="stroke: var(--gold)" d="${legs}" />`
                + `<circle class="c-slate outline hair" cx="${cx - 8.5}" cy="${TOP - 0.6}" r=".9" /><circle class="c-slate outline hair" cx="${cx + 8.5}" cy="${TOP - 0.6}" r=".9" />`
                + `<rect class="c-gold outline hair" x="${cx - 2.5}" y="${f(cy + r - 1.5)}" width="5" height="2.6" rx=".6" />`;
        } else {
            stand = `<path class="${pick(["c-timber", "c-timber", "c-terracotta-deep", "c-slate"])} outline thin" d="M${cx - 8} ${TOP} Q${cx - 7} ${TOP - 3} ${cx - 2.2} ${TOP - 3.5} L${cx - 1.8} ${f(cy + r - 1)} H${cx + 1.8} L${cx + 2.2} ${TOP - 3.5} Q${cx + 7} ${TOP - 3} ${cx + 8} ${TOP} Z" />`
                + `<path class="band" d="M${cx - 5} ${TOP - 2.4} h10 M${cx - 1.8} ${f(cy + r + 0.6)} h3.6" />`;
        }
        const drawn = stand
            + `<circle class="c-gold outline thin" data-snow=".16" cx="${cx}" cy="${f(cy)}" r="${f(r)}" /><path class="ticks" d="${milled}" /><circle class="c-ochre" cx="${cx}" cy="${f(cy)}" r="${f(r - 1.2)}" />`
            + `<circle class="dial c-cream outline hair" cx="${cx}" cy="${f(cy)}" r="${f(r - 1.9)}" /><path class="rose" d="${rose}Z" /><path class="ticks" d="${ticks}" />`
            + `<path class="c-red" d="M${at(r - 2.2, 0)} L${at(r - 4.8, -0.13)} L${at(r - 4.8, 0.13)} Z" />`
            + `<g class="needle" style="transform-box: view-box; transform-origin: ${cx}px ${f(cy)}px">`
            + `<path class="c-red outline hair" d="M${cx} ${f(cy - n)} L${cx + 1.8} ${f(cy)} H${cx - 1.8} Z" /><path class="c-slate outline hair" d="M${cx} ${f(cy + n)} L${cx + 1.8} ${f(cy)} H${cx - 1.8} Z" /></g>`
            + `<circle class="c-gold outline hair" cx="${cx}" cy="${f(cy)}" r="1.1" />`
            + `<path class="glint" d="M${f(cx - g * 0.87)} ${f(cy - g * 0.5)} A${f(g)} ${f(g)} 0 0 1 ${f(cx - g * 0.34)} ${f(cy - g * 0.94)}" />`;
        return {
            markup: `<g class="compass">${drawn}</g>`,
            support: hung ? { a: [cx, LOW + 2], b: [cx, bow - 2.4], r: 1.8, cover: (y0, y1) => cord("chain", cx, y0, y1) } : null,
            gap: hung ? [cx, cx + 3] : null,
        };
    };

    // A pile of old books on the line, each castle's its own: spines banded and labelled, or
    // page edges with gilt corners and a ribbon hanging out; a candle burning on top in its brass
    // dish, its wax run down it; beside them, now and then, books standing up, a diploma rolled
    // in its ribbon, an inkwell and its quill, spectacles left on the pile, a bird. Brushed, the
    // flame wavers; touched, it goes out in a wisp of smoke, and lights again.
    const BINDINGS = ["c-red", "c-blue-deep", "c-green", "c-terracotta-deep", "c-ochre", "c-timber", "c-slate"];
    // a book standing at x (its foot on the line), t thick and h tall, leaning `lean` degrees
    // (towards the left when less than 0) about its foot's far corner: its spine turned out
    const upright = (x, t, h, lean) => {
        const bands = Array.from({ length: int(2, 3) }, (_, k) => `M${f(x + 0.5)} ${f(TOP - h * (0.14 + k * 0.32))} h${f(t - 1)}`).join(" ");
        return `<g transform="rotate(${f(lean)} ${f(lean < 0 ? x + t : x)} ${TOP})"><rect class="${pick(BINDINGS)} outline thin" data-snow=".1" x="${f(x)}" y="${f(TOP - h)}" width="${f(t)}" height="${f(h)}" rx=".6" />`
            + `<path class="band" d="${bands}" /><rect class="c-gold" x="${f(x + t * 0.25)}" y="${f(TOP - h * 0.62)}" width="${f(t * 0.5)}" height="${f(h * 0.16)}" /></g>`;
    };
    const books = (i, w) => {
        const cx = Math.round(rand(58, w - 58)), widths = Array.from({ length: int(3, 4) }, () => rand(24, 34)).sort((a, b) => b - a);
        let y = TOP, shift = 0, drawn = "", ribbons = "";
        widths.forEach((bw, k) => {
            const t = rand(3.2, 4.2), x = cx - bw / 2 + shift, colour = pick(BINDINGS);
            y -= t;
            drawn += `<rect class="${colour} outline thin"${k === widths.length - 1 ? ' data-snow=".45"' : ""} x="${f(x)}" y="${f(y)}" width="${f(bw)}" height="${f(t)}" rx=".8" />`;
            if (random() < 0.5) {
                const ends = random() < 0.5 ? [2.2, 3.8] : [2.4];
                drawn += `<path class="band" d="${ends.map((e) => `M${f(x + e)} ${f(y + 0.6)} V${f(y + t - 0.6)} M${f(x + bw - e)} ${f(y + 0.6)} V${f(y + t - 0.6)}`).join(" ")}" />`
                    + `<rect class="${pick(["c-gold", "c-gold", "c-cream"])}" x="${f(x + bw * 0.36)}" y="${f(y + t * 0.3)}" width="${f(bw * rand(0.2, 0.3))}" height="${f(t * 0.4)}" />`;
            } else {
                drawn += `<rect class="c-cream" x="${f(x + 1.4)}" y="${f(y + 0.9)}" width="${f(bw - 2.2)}" height="${f(t - 1.8)}" /><path class="leaves" d="M${f(x + 2)} ${f(y + t / 2)} H${f(x + bw - 1)}" />`
                    + (random() < 0.45 ? `<path class="c-gold" d="M${f(x + bw - 0.3)} ${f(y + 0.3)} v2 l-2 -2 Z M${f(x + bw - 0.3)} ${f(y + t - 0.3)} v-2 l-2 2 Z" />` : "");
                if (random() < 0.4) {
                    const rx = x + bw * rand(0.3, 0.8), l = rand(3, 6);
                    ribbons += `<path class="${pick(["c-red", "c-blue", "c-gold"])}" d="M${f(rx)} ${f(y + t - 0.8)} V${f(y + t + l)} l.7 -.9 l.7 .9 V${f(y + t - 0.8)} Z" />`;
                }
            }
            shift += rand(-2.5, 2.5);
        });
        drawn += ribbons;
        // the candle, its top where it has burnt down to, wax run down its side, in a dish with
        // a ring to carry it by, or a plain saucer with a pool of wax in it
        const sx = cx + shift + rand(-4, 4), ct = y - 1.6 - rand(5, 7), pivot = `transform-box: view-box; transform-origin: ${f(sx)}px ${f(ct - 1)}px`;
        const drip = (dx, d) => `<path class="c-cream outline hair" d="M${f(sx + dx)} ${f(ct + 0.4)} C${f(sx + dx * 1.45)} ${f(ct + d * 0.5)} ${f(sx + dx * 1.5)} ${f(ct + d)} ${f(sx + dx * 1.1)} ${f(ct + d + 0.6)} C${f(sx + dx * 0.7)} ${f(ct + d + 0.6)} ${f(sx + dx * 0.7)} ${f(ct + d * 0.5)} ${f(sx + dx * 0.7)} ${f(ct + 0.4)} Z" />`;
        drawn += (random() < 0.6 ? `<path class="ring-handle" d="M${f(sx + 5.2)} ${f(y - 1.2)} q2.8 -.4 2.6 -2.6 q-.2 -1.6 -1.8 -1" />` : `<ellipse class="c-cream" cx="${f(sx + 0.6)}" cy="${f(y - 1.5)}" rx="3" ry=".6" />`)
            + `<ellipse class="c-gold outline hair" cx="${f(sx)}" cy="${f(y - 0.8)}" rx="5.5" ry="1.3" />`
            + `<rect class="c-cream outline hair" x="${f(sx - 1.7)}" y="${f(ct)}" width="3.4" height="${f(y - 1.6 - ct)}" />`
            + drip(-1.7, rand(1.5, 3.5)) + (random() < 0.5 ? drip(1.7, rand(1, 2.5)) : "")
            + `<path class="wick" d="M${f(sx)} ${f(ct)} l.3 -1.4" />`
            + `<g class="flame" style="${pivot}"><circle class="candle-glow" cx="${f(sx)}" cy="${f(ct - 4)}" r="10" fill="url(#firefly-glow)" />`
            + `<path class="c-gold" d="M${f(sx)} ${f(ct - 0.8)} C${f(sx + 2.2)} ${f(ct - 2)} ${f(sx + 1)} ${f(ct - 4.5)} ${f(sx + 0.2)} ${f(ct - 7)} C${f(sx - 1.2)} ${f(ct - 4.5)} ${f(sx - 2.2)} ${f(ct - 2)} ${f(sx)} ${f(ct - 0.8)} Z" />`
            + `<path class="c-cream" d="M${f(sx)} ${f(ct - 1.2)} C${f(sx + 1)} ${f(ct - 1.8)} ${f(sx + 0.5)} ${f(ct - 3.2)} ${f(sx + 0.1)} ${f(ct - 4.2)} C${f(sx - 0.6)} ${f(ct - 3.2)} ${f(sx - 1)} ${f(ct - 1.8)} ${f(sx)} ${f(ct - 1.2)} Z" /></g>`
            + `<path class="smoke" d="M${f(sx + 0.3)} ${f(ct - 1.6)} q-1.5 -2.5 0 -5 q1.5 -2.5 0 -5" />`;
        // on the top book, at its other end from the candle: spectacles left there, or a bird
        const top = widths[widths.length - 1], ex = sx > cx + shift ? Math.max(cx + shift - top / 2 + 6, sx - 13) : Math.min(cx + shift + top / 2 - 6, sx + 13);
        const thing = random();
        if (thing < 0.3) drawn += `<path class="specs" d="M${f(ex - 3.9)} ${f(y - 1)} a1.9 1.1 0 1 0 3.8 0 a1.9 1.1 0 1 0 -3.8 0 M${f(ex + 0.1)} ${f(y - 1)} a1.9 1.1 0 1 0 3.8 0 a1.9 1.1 0 1 0 -3.8 0 M${f(ex - 0.1)} ${f(y - 1.2)} h.2 M${f(ex + 3.9)} ${f(y - 1.2)} l3 -.6" />`;
        else if (thing < 0.55) drawn += songbird(ex, y, sx > ex ? -1 : 1);
        // beside the pile: on one side an inkwell and its quill, on the other books standing up,
        // or a diploma rolled in its ribbon
        const s = random() < 0.5 ? 1 : -1, edge = cx + s * (widths[0] / 2 + 1.5);
        if (random() < 0.55) {
            const ix = cx + s * (widths[0] / 2 + 7);
            drawn += `<path class="c-cream outline hair" d="M${f(ix)} ${TOP - 6.5} C${f(ix + s)} ${TOP - 12} ${f(ix + s * 5)} ${TOP - 19} ${f(ix + s * 9)} ${TOP - 23} C${f(ix + s * 6)} ${TOP - 17} ${f(ix + s * 4.5)} ${TOP - 12} ${f(ix + s * 1.2)} ${TOP - 8} Z" />`
                + `<path class="quill" d="M${f(ix)} ${TOP - 6} Q${f(ix + s * 4)} ${TOP - 14} ${f(ix + s * 9)} ${TOP - 23}" />`
                + `<path class="${pick(["c-blue-deep", "c-slate", "c-green"])} outline thin" d="M${f(ix - 4)} ${TOP} V${TOP - 4} Q${f(ix - 4)} ${TOP - 5.5} ${f(ix - 2)} ${TOP - 5.5} V${TOP - 7} H${f(ix + 2)} V${TOP - 5.5} Q${f(ix + 4)} ${TOP - 5.5} ${f(ix + 4)} ${TOP - 4} V${TOP} Z" />`;
        }
        const other = random(), o = -s, oe = cx + o * (widths[0] / 2 + 1.5);
        if (other < 0.45) {
            // one standing straight against the pile, sometimes another leaning on it
            const t1 = rand(3.4, 4.6), h1 = rand(14, 19), x1 = o > 0 ? oe : oe - t1;
            if (random() < 0.6) {
                const t2 = rand(3, 4.2), h2 = rand(13, 17), lean = rand(10, 18), x2 = o > 0 ? x1 + t1 + h2 * Math.sin(lean * Math.PI / 180) * 0.8 : x1 - t2 - h2 * Math.sin(lean * Math.PI / 180) * 0.8;
                drawn += upright(x2, t2, h2, o > 0 ? -lean : lean);
            }
            drawn += upright(x1, t1, h1, 0);
        } else if (other < 0.8) {
            const x = o > 0 ? oe + 1 : oe - 17;
            drawn += `<rect class="c-cream outline hair" x="${f(x)}" y="${TOP - 4}" width="16" height="4" rx="2" /><ellipse class="c-sand outline hair" cx="${f(o > 0 ? x + 16 : x)}" cy="${TOP - 2}" rx="1.2" ry="2" />`
                + `<rect class="c-red" x="${f(x + 7)}" y="${TOP - 4.3}" width="2" height="4.6" /><path class="c-red" d="M${f(x + 8)} ${TOP - 0.2} l-2 3 l1.2 .2 Z M${f(x + 8)} ${TOP - 0.2} l2 2.6 l-1.2 .4 Z" />`;
        }
        return { markup: `<g class="books touch"><rect class="hit" x="${cx - 30}" y="${f(ct - 9)}" width="60" height="${f(TOP - ct + 9)}" />${drawn}</g>` };
    };

    // A wheel of n spokes round (x, y), turning about its hub (a bicycle's, a cart's)
    const wheel = (x, y, r, n = 12) => {
        let spokes = "";
        for (let k = 0; k < n; k++) {
            const a = k * 2 * Math.PI / n + 0.13;
            spokes += `M${f(x + 1.1 * Math.cos(a))} ${f(y + 1.1 * Math.sin(a))} L${f(x + (r - 1.4) * Math.cos(a))} ${f(y + (r - 1.4) * Math.sin(a))} `;
        }
        return `<g class="wheel" style="transform-box: view-box; transform-origin: ${f(x)}px ${f(y)}px"><circle class="tyre" cx="${f(x)}" cy="${f(y)}" r="${f(r - 0.8)}" />`
            + `<circle class="rim" cx="${f(x)}" cy="${f(y)}" r="${f(r - 1.6)}" /><path class="spoke" d="${spokes}" /><circle class="c-slate outline hair" cx="${f(x)}" cy="${f(y)}" r="1.1" /></g>`;
    };
    // An old bicycle standing on its stand on the line from x, facing right: a roadster's frame
    // with a gilt line along it, mudguards, a sprung leather saddle, swept-back or straight bars
    // with a bell, a lamp lit by night; sometimes a chain guard, a rack with a parcel or a
    // satchel, a basket with a loaf, a newspaper or flowers, a bird. Touched, its wheels spin.
    const FRAMES = ["c-blue-deep", "c-green", "c-red", "c-slate", "c-terracotta-deep", "c-cream"];
    const bicycle = (x) => {
        const r = rand(9.5, 10.5), L = r * rand(2.45, 2.65), ax = x + r, ay = TOP - r, fx = ax + L, colour = pick(FRAMES), n = pick([16, 18, 20]);
        const p = (px, py) => `${f(px)} ${f(py)}`;
        const bb = [ax + L * 0.42, ay + 1.5], seat = [ax + L * 0.3, ay - r * 1.15], head = [fx - L * 0.14, ay - r * 1.1], low = [fx - L * 0.1, ay - r * 0.55];
        const guard = (cx, a0, a1) => `M${p(cx + (r + 0.6) * Math.cos(a0), ay + (r + 0.6) * Math.sin(a0))} A${f(r + 0.6)} ${f(r + 0.6)} 0 0 1 ${p(cx + (r + 0.6) * Math.cos(a1), ay + (r + 0.6) * Math.sin(a1))}`;
        const swept = random() < 0.65, grip = swept ? [head[0] - 5, head[1] - 4.4] : [head[0] - 3.4, head[1] - 3.6];
        const bars = swept ? `Q${p(head[0] - 1, head[1] - 5)} ${p(...grip)}` : `L${p(...grip)}`;
        const frame = `M${p(...bb)} L${p(...seat)} L${p(...head)} L${p(...low)} Z M${p(...bb)} L${p(ax, ay)} L${p(...seat)} M${p(...low)} Q${p(low[0] + 2.5, ay - r * 0.2)} ${p(fx, ay)}`
            + ` M${p(...seat)} L${p(seat[0] - 0.8, seat[1] - 3)} M${p(...head)} L${p(head[0] + 0.4, head[1] - 3.2)} ${bars}`
            + ` ${guard(ax, -2.9, -0.5)} ${guard(fx, -2.7, -0.3)}`;
        const crank = rand(0, 2 * Math.PI), pedal = [bb[0] + 4.5 * Math.cos(crank), bb[1] + 4.5 * Math.sin(crank)];
        let drawn = `<path class="arm" d="M${p(bb[0] - 1, bb[1] + 1)} L${p(bb[0] - 6, TOP - 0.3)}" />`
            + wheel(ax, ay, r, n) + wheel(fx, ay, r, n)
            + `<path class="chain" d="M${p(bb[0], bb[1] - 3)} L${p(ax, ay - 1.2)} M${p(bb[0], bb[1] + 3)} L${p(ax, ay + 1.2)}" />`
            + `<path class="tube-edge" d="${frame}" /><path class="tube" style="stroke: var(--${colour.slice(2)})" d="${frame}" />`
            + `<path class="pin" d="M${p(seat[0] + 1, seat[1] + 0.4)} L${p(head[0] - 1, head[1] + 0.4)} M${p(bb[0] + 1.5, bb[1] - 1.6)} L${p(low[0] - 1.4, low[1] + 1)}" />`
            + (random() < 0.5 ? `<path class="${colour} outline hair" d="M${p(bb[0] + 2.6, bb[1] - 3.8)} L${p(ax + 1, ay - 2.4)} Q${p(ax - 1.4, ay - 0.6)} ${p(ax + 1.4, ay + 0.8)} L${p(bb[0] + 1, bb[1] - 1)} Z" />` : "")
            + `<circle class="c-slate outline hair" cx="${f(bb[0])}" cy="${f(bb[1])}" r="3" /><path class="arm" d="M${p(...bb)} L${p(...pedal)}" />`
            + `<rect class="c-slate outline hair" x="${f(pedal[0] - 2)}" y="${f(pedal[1] - 0.7)}" width="4" height="1.4" />`
            + `<path class="spring" d="M${p(seat[0] - 3.6, seat[1] - 2.8)} l.6 .7 l-.6 .6 l.6 .6 M${p(seat[0] + 1.2, seat[1] - 2.7)} l.6 .7 l-.6 .6" />`
            + `<path class="${pick(["c-timber", "c-timber", "c-terracotta-deep", "c-slate"])} outline hair" data-snow=".55" d="M${p(seat[0] - 4.8, seat[1] - 3.4)} Q${p(seat[0] - 1, seat[1] - 5.6)} ${p(seat[0] + 2.6, seat[1] - 3.8)} L${p(seat[0] + 0.6, seat[1] - 2.6)} Q${p(seat[0] - 2, seat[1] - 2.4)} ${p(seat[0] - 4.8, seat[1] - 3.4)} Z" />`
            + `<path class="grip" d="M${p(...grip)} l${swept ? "-2.2 .4" : "-.5 -2.2"}" />`
            + `<circle class="c-gold outline hair" cx="${f(head[0] - 1.6)}" cy="${f(head[1] - 5.7)}" r="1.1" />`
            + `<rect class="c-gold outline hair" x="${f(low[0] + 0.6)}" y="${f(low[1] - 2.4)}" width="3.2" height="3" rx="1" /><circle class="lamp outline hair" cx="${f(low[0] + 3.9)}" cy="${f(low[1] - 0.9)}" r="1.3" />`;
        // on the rack over the back wheel, a parcel tied with string or a satchel slung from it;
        // or a bird perched there
        const ry = ay - r - 2, load = random();
        if (load < 0.55) {
            drawn += `<path class="rack" d="M${p(ax - r * 0.7, ry)} H${f(seat[0] - 1.5)} M${p(ax - r * 0.5, ry)} L${p(ax, ay)} M${p(ax + r * 0.3, ry)} L${p(ax, ay)}" />`;
            if (load < 0.25) drawn += `<rect class="${pick(["c-sand", "c-thatch", "c-cream-deep"])} outline hair" data-snow=".3" x="${f(ax - r * 0.6)}" y="${f(ry - 5)}" width="${f(r * 0.9)}" height="5" rx=".4" /><path class="string" d="M${p(ax - r * 0.15, ry - 5)} v5 M${p(ax - r * 0.6, ry - 2.5)} h${f(r * 0.9)}" />`;
            else if (load < 0.4) drawn += `<rect class="c-timber outline hair" x="${f(ax - r * 0.55)}" y="${f(ry)}" width="${f(r * 0.7)}" height="6" rx="1" /><path class="c-terracotta-deep outline hair" d="M${p(ax - r * 0.55, ry)} h${f(r * 0.7)} v2.4 Q${p(ax - r * 0.2, ry + 3.6)} ${p(ax - r * 0.55, ry + 2.4)} Z" /><rect class="c-gold" x="${f(ax - r * 0.25)}" y="${f(ry + 2.2)}" width="1.4" height="1.2" />`;
            else drawn += songbird(ax - r * 0.2, ry, random() < 0.5 ? 1 : -1);
        } else if (load < 0.75) drawn += songbird(ax - r * 0.25, ay - r - 0.9, random() < 0.5 ? 1 : -1);
        if (random() < 0.45) {
            const bx = head[0] + 1.2, by = head[1] - 1.5, what = random();
            drawn += what < 0.35
                ? `<path class="c-ochre outline hair" d="M${p(bx + 1, by - 1)} L${p(bx + 9, by - 6.5)} Q${p(bx + 10.4, by - 6.4)} ${p(bx + 9.8, by - 5.2)} L${p(bx + 2.4, by + 0.6)} Z" /><path class="band" d="M${p(bx + 4, by - 2.4)} l1 .8 M${p(bx + 6, by - 3.8)} l1 .8 M${p(bx + 8, by - 5.2)} l1 .8" />`
                : what < 0.6
                    ? `<path class="c-cream outline hair" d="M${p(bx + 1.5, by - 1)} L${p(bx + 3, by - 6.5)} L${p(bx + 7.6, by - 5.6)} L${p(bx + 7.6, by - 1)} Z" /><path class="leaves" d="M${p(bx + 3.4, by - 4.8)} h3.6 M${p(bx + 3, by - 3.4)} h4 M${p(bx + 2.6, by - 2)} h4.4" />`
                    : [2.5, 5, 7.5].map((dx) => `<path class="pedicel" d="M${p(bx + dx, by)} V${f(by - 2)}" /><circle class="${pick(["c-rose", "c-red", "c-gold", "c-cream", "c-blue"])} outline hair" cx="${f(bx + dx)}" cy="${f(by - 2.6 - random())}" r="1.5" />`).join("");
            drawn += `<path class="c-thatch outline hair" d="M${p(bx, by - 1)} H${f(bx + 9.5)} L${p(bx + 8.5, by + 4.5)} H${f(bx + 1.2)} Z" />`
                + `<path class="twig" d="M${p(bx + 0.5, by + 1.2)} H${f(bx + 9)} M${p(bx + 1, by + 3)} H${f(bx + 8.6)} M${p(bx + 3.5, by - 1)} V${f(by + 4.5)} M${p(bx + 6, by - 1)} V${f(by + 4.5)}" />`;
        }
        return `<g class="bicycle touch"><rect class="hit" x="${f(x - 2)}" y="${f(head[1] - 8)}" width="${f(fx + r - x + 6)}" height="${f(TOP - head[1] + 8)}" />${drawn}</g>`;
    };
    // A street piano on its cart, centred on cx: a painted cabinet lined in gilt under a cornice,
    // a window onto its punched roll, under it a medallion between scrolls or pleated silk, the
    // crank on its side; sometimes a lantern on a bracket, a tin cup hung for coins, a bird on
    // its shafts. Touched, it plays: the crank turns, the roll runs and notes rise from it.
    const PAINTS = ["c-red", "c-green", "c-blue-deep", "c-terracotta-deep", "c-ochre"];
    const streetPiano = (i, cx) => {
        const W = rand(26, 31), H = rand(15, 18), base = TOP - 8, top = base - H, x0 = cx - W / 2, paint = pick(PAINTS), trim = pick(["gold", "gold", "cream"]);
        const wx = x0 + 4, wy = top + 3, ww = W - 8, wh = 6.5, P = 12, spokes = pick([6, 8, 10]);
        // the roll's holes over one turn of it (P high), laid twice so it can run on
        let holes = "";
        for (let c = 0; c < 7; c++) {
            for (let k = int(1, 2); k > 0; k--) {
                const y0 = rand(0, P - 1), l = Math.min(rand(1, 3.5), P - y0);
                [0, P].forEach((o) => { holes += `<rect class="c-window-dark" x="${f(wx + 1 + c * (ww - 2) / 7)}" y="${f(wy + y0 + o)}" width=".9" height="${f(l)}" />`; });
            }
        }
        const ay = wy + wh + 4, axle = `transform-box: view-box; transform-origin: ${f(x0 + W + 0.6)}px ${f(ay)}px`;
        const py = wy + wh + 2.5, ph = base - wy - wh - 4.5, my = py + ph / 2;
        const panel = random() < 0.5
            ? `<rect class="panel" x="${f(x0 + 3)}" y="${f(py)}" width="${f(W - 6)}" height="${f(ph)}" rx="1" /><circle class="c-gold outline hair" cx="${f(cx)}" cy="${f(my)}" r="2.6" />`
                + `<path class="band" d="M${f(cx - 6.5)} ${f(my)} q1.5 -2 3 0 q1 1.2 .4 1.8 M${f(cx + 3.5)} ${f(my)} q1.5 -2 3 0 q1 1.2 .4 1.8" />`
            : `<rect class="${pick(["c-rose", "c-cream", "c-gold", "c-red"])} outline hair" x="${f(x0 + 3)}" y="${f(py)}" width="${f(W - 6)}" height="${f(ph)}" rx="1" />`
                + `<path class="pleats" d="${Array.from({ length: 9 }, (_, k) => `M${f(cx)} ${f(py + ph)} L${f(x0 + 3.4 + (W - 6.8) * k / 8)} ${f(py + 0.4)}`).join(" ")}" /><circle class="c-gold outline hair" cx="${f(cx)}" cy="${f(py + ph - 0.4)}" r="1.4" />`;
        const notes = [0, 1, 2].map((k) => {
            const nx = x0 + 3 + k * 6, ny = top - 3 - (k % 2) * 2, pair = random() < 0.35;
            return `<g class="note" style="--k: ${k}"><ellipse class="note-head" cx="${f(nx)}" cy="${f(ny)}" rx="1.5" ry="1.1" transform="rotate(-20 ${f(nx)} ${f(ny)})" />`
                + (pair ? `<ellipse class="note-head" cx="${f(nx + 3.4)}" cy="${f(ny - 1)}" rx="1.5" ry="1.1" transform="rotate(-20 ${f(nx + 3.4)} ${f(ny - 1)})" /><path class="note-stem" d="M${f(nx + 1.3)} ${f(ny)} V${f(ny - 5)} L${f(nx + 4.7)} ${f(ny - 6)} V${f(ny - 1)}" />`
                    : `<path class="note-stem" d="M${f(nx + 1.3)} ${f(ny)} V${f(ny - 5)} q1.5 1 2 2.5" />`) + "</g>";
        }).join("");
        let drawn = wheel(x0 + 3, TOP - 4.6, 4.6, spokes) + wheel(x0 + W - 3, TOP - 4.6, 4.6, spokes)
            + `<path class="shaft" d="M${f(x0 - 3)} ${f(base + 1.2)} L${f(x0 - 11)} ${f(base - 3)}" /><path class="grip" d="M${f(x0 - 9.4)} ${f(base - 2.2)} L${f(x0 - 11.4)} ${f(base - 3.2)}" />`
            + `<rect class="c-timber outline thin" x="${f(x0 - 3)}" y="${f(base)}" width="${f(W + 6)}" height="2.4" />`
            + `<rect class="${paint} outline thin" x="${f(x0)}" y="${f(top)}" width="${f(W)}" height="${f(H)}" />`
            + `<rect class="lining" style="stroke: var(--${trim})" x="${f(x0 + 1.6)}" y="${f(top + 1.4)}" width="${f(W - 3.2)}" height="${f(H - 2.8)}" rx=".6" />`
            + [[x0 + 1.6, top + 1.4], [x0 + W - 1.6, top + 1.4], [x0 + 1.6, base - 1.4], [x0 + W - 1.6, base - 1.4]].map(([rx, ry]) => `<circle class="c-${trim}" cx="${f(rx)}" cy="${f(ry)}" r=".8" />`).join("")
            + `<path class="c-gold outline hair" data-snow=".6" d="M${f(cx - 6)} ${f(top - 2.2)} Q${f(cx)} ${f(top - 6)} ${f(cx + 6)} ${f(top - 2.2)} Z" /><rect class="c-timber outline thin" data-snow=".5" x="${f(x0 - 1.5)}" y="${f(top - 2.2)}" width="${f(W + 3)}" height="2.4" />`
            + `<clipPath id="floor-roll-${i}"><rect x="${f(wx)}" y="${f(wy)}" width="${f(ww)}" height="${wh}" /></clipPath>`
            + `<rect class="c-gold outline hair" x="${f(wx - 1)}" y="${f(wy - 1)}" width="${f(ww + 2)}" height="${wh + 2}" /><rect class="c-cream" x="${f(wx)}" y="${f(wy)}" width="${f(ww)}" height="${wh}" />`
            + `<g clip-path="url(#floor-roll-${i})"><g class="roll" style="--roll: -${P}px">${holes}</g></g>`
            + panel
            + `<g class="crank" style="${axle}"><path class="arm" d="M${f(x0 + W + 0.6)} ${f(ay)} h5.4" /><circle class="c-timber outline hair" cx="${f(x0 + W + 6)}" cy="${f(ay)}" r="1.3" /></g>`
            + `<circle class="c-slate outline hair" cx="${f(x0 + W + 0.6)}" cy="${f(ay)}" r="1" />`;
        if (random() < 0.4) drawn += `<path class="arm" d="M${f(x0)} ${f(top + 2)} h-4 v1.2" /><rect class="lamp outline hair" x="${f(x0 - 5.6)}" y="${f(top + 3.2)}" width="3.2" height="4" rx=".6" /><path class="c-gold outline hair" d="M${f(x0 - 6)} ${f(top + 3.4)} h4 l-.6 -1 h-2.8 Z" />`;
        if (random() < 0.55) {
            const px = cx + rand(-3, 3);
            drawn += `<path class="cable" d="M${f(px)} ${f(base + 2.4)} v1.4" /><path class="c-slate outline hair" d="M${f(px - 2)} ${f(base + 3.8)} h4 l-.5 3.4 h-3 Z" /><circle class="c-gold" cx="${f(px + 0.6)}" cy="${f(base + 4.2)}" r=".6" />`;
        }
        if (random() < 0.35) drawn += songbird(x0 - 10.6, base - 3.4, random() < 0.5 ? 1 : -1);
        return `<g class="street-piano touch"><rect class="hit" x="${f(x0 - 12)}" y="${f(top - 7)}" width="${f(W + 22)}" height="${f(TOP - top + 7)}" />${drawn}${notes}</g>`;
    };
    // what fills the time outside work: the bicycle and the street piano, each in one half of the line
    const pastimes = (i, w) => {
        const left = random() < 0.5;
        const bike = bicycle(left ? rand(20, w / 2 - 66) : rand(w / 2 + 10, w - 66));
        return { markup: bike + streetPiano(i, left ? rand(w / 2 + 26, w - 30) : rand(30, w / 2 - 26)) };
    };

    // the thing on each floor that has one (it says what stretch of line it leaves the plants
    // and what they can climb). Those that came later draw from draws of their own, so the
    // plants of each castle stay those its seed has always given (aside).
    const OBJECTS = { publications: loudspeaker, skills: gears, associations: nest, experience: compass, education: books, interests: pastimes };
    const LATER = new Set(["experience", "education", "interests"]);

    // In the snow, snow lying on the things along the lines: over each piece marked data-snow
    // (the share of its height it covers from its top), a copy of it in snow, cut off by a soft,
    // uneven edge, as on the castle's roofs
    const snowOn = (deco, i) => deco.querySelectorAll("[data-snow]").forEach((el, k) => {
        const b = el.getBBox(), edge = b.y + b.height * parseFloat(el.dataset.snow), x0 = b.x - 2, x1 = b.x + b.width + 2;
        let d = `M${f(x0)} ${f(b.y - 6)} H${f(x1)} V${f(edge)}`;
        for (let x = x1; x > x0; x -= 1.5) d += ` L${f(x)} ${f(edge + 0.5 * Math.sin(x * 1.3 + k) + (Math.sin(x * 0.5 + 2 * k) > 0.8 ? 0.8 : 0))}`;
        const clip = document.createElementNS(NS, "clipPath");
        clip.id = `floor-snow-${i}-${k}`;
        clip.innerHTML = `<path d="${d} L${f(x0)} ${f(edge)} Z" />`;
        const snow = el.cloneNode();
        snow.setAttribute("class", "snow outline hair");
        snow.setAttribute("clip-path", `url(#${clip.id})`);
        snow.removeAttribute("data-snow");
        el.after(clip, snow);
    });

    const MOSS = ["c-hedge", "c-hedge", "c-hedge-olive", "c-hedge-sage"], MOSS_LIGHT = ["c-hedge-light", "c-hedge-sage"];
    // The floor's line, a course of the stone the castle's terrace is walled with, drawn as the
    // terrace is, at the castle's scale (k): sand-coloured, its courses and stones as tall and
    // long as the terrace's (two courses in the line's height where the castle is drawn small),
    // shaded as the castle shades its walls (#wall, darker under what tops them), the shadow it
    // casts on the wall under it. At its near end the course drops into a panel, one block with
    // it, where the floor's name is cut (box: the name's field, where, and how big): its
    // shoulder curving down from the course's underside, a moulding where the course runs
    // across it, the field sunk in it, shaded the same way, now and then cracked. Round the
    // panel, a patch of the wall it is part of, laid as the terrace is, fading out into the
    // paper as the foundations behind the town do. All of it painted with the castle's
    // gouache, once the castle has drawn it; and the moss on it, to be drawn over it with the
    // plants (it grows with them).
    const masonry = (i, w, [x0, y0, bw, bh], k) => {
        const x1 = x0 + bw, y1 = y0 + bh, px0 = x0 - 6, px1 = x1 + 6, foot = y1 + 5, step = 22 * k, rows = k < 0.7 ? 2 : 1, high = (LOW - TOP) / rows;
        const shade = document.getElementById("wall") ? (box) => `<rect class="shade" fill="url(#wall)" ${box} />` : () => "";
        const boxed = (x, y, width, height) => `x="${f(x)}" y="${f(y)}" width="${f(width)}" height="${f(height)}"`;
        let joints = "";
        for (let r = 0; r < rows; r++) {
            const y = TOP + r * high;
            if (r) joints += `M${f(px1 + 9)} ${f(y)} H${w} `;
            for (let x = px1 + 9 + (r % 2 ? step / 2 : 0) + rand(4, step); x < w - 4; x += step) joints += `M${f(x)} ${f(y)} V${f(y + high)} `;
        }
        const course = `<rect class="c-sand" ${boxed(px0, TOP, w - px0, LOW - TOP)} />${shade(boxed(px0, TOP, w - px0, LOW - TOP))}<path class="joint" d="${joints}" />`;
        // the panel: one block with the course, its shoulder curving down to it
        const shoulder = `C${f(px1 + 3)} ${LOW} ${f(px1)} ${LOW + 2} ${f(px1)} ${LOW + 7}`;
        const panel = `<path class="c-sand" d="M${f(px0)} ${LOW - 0.5} H${f(px1 + 9)} V${LOW} ${shoulder} V${f(foot)} H${f(px0)} Z" />`
            + `<path class="joint" d="M${f(px1 + 9)} ${TOP} V${LOW}" /><path class="moulding" d="M${f(px0)} ${LOW} H${f(px1 + 4)}" />`;
        // the outline round the whole block, the course's shadow on the wall under it
        const edges = `<path class="outline" fill="none" d="M${f(px0)} ${TOP} H${w} V${LOW} H${f(px1 + 9)} ${shoulder} V${f(foot)} H${f(px0)} Z" />`
            + `<rect class="drip" ${boxed(px1 + 9, LOW + 0.75, w - px1 - 9, 2.5)} />`;
        // the name's field, sunk into the panel, a crack running up from the panel's foot
        let field = `<rect class="c-sand" ${boxed(x0, y0, bw, bh)} />${shade(boxed(x0, y0, bw, bh))}${shade(boxed(x0, y0, bw, bh * 0.5))}<rect class="joint" fill="none" ${boxed(x0, y0, bw, bh)} />`;
        if (random() < 0.35) {
            let x = x0 + bw * rand(0.55, 0.9), y = foot, d = `M${f(x)} ${f(y)}`, fork = "";
            for (let s = 0; s < 5; s++) {
                d += ` L${f((x += rand(-1.6, 1.6)))} ${f((y -= rand(1.2, 1.8)))}`;
                if (s === 2) fork = ` M${f(x)} ${f(y)} l${f(rand(1.5, 3) * (random() < 0.5 ? 1 : -1))} ${f(-rand(1, 2))}`;
            }
            field += `<path class="crack" d="${d}${fork}" />`;
        }
        // the wall round it, from the course's underside down past the panel, fading out in an
        // ellipse that fits it (so no edge of it shows)
        const wx0 = px0 - 20, wx1 = px1 + 100, wy0 = LOW + 0.75, wy1 = foot + 22, course11 = 11 * k;
        let grid = "";
        for (let y = wy0 + course11, row = 0; y < wy1 + course11; y += course11, row++) {
            grid += `M${f(wx0)} ${f(y)} H${f(wx1)} `;
            for (let x = wx0 + (row % 2 ? 9 : 20) * k; x < wx1; x += step) grid += `M${f(x)} ${f(y - course11)} V${f(y)} `;
        }
        const area = boxed(wx0, wy0, wx1 - wx0, wy1 - wy0);
        const wall = `<radialGradient id="floor-wall-light-${i}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate(${f((wx0 + wx1) / 2)} ${f(wy0)}) scale(${f((wx1 - wx0) / 2)} ${f(wy1 - wy0)})">`
            + [[0, 0.85], [0.45, 0.6], [0.75, 0.22], [1, 0]].map(([at, o]) => `<stop offset="${at}" stop-color="#fff" stop-opacity="${o}" />`).join("") + "</radialGradient>"
            + `<mask id="floor-wall-${i}" maskUnits="userSpaceOnUse" ${area}><rect ${area} fill="url(#floor-wall-light-${i})" /></mask>`
            + `<g mask="url(#floor-wall-${i})"><rect class="c-sand" ${area} /><path class="joint" d="${grid}" /></g>`;
        // Moss on the stone, coming up as the plants grow: along the course's top in patches, thick
        // in some places and none in others (lush), here and there under it, on the panel's
        // shoulder. Each tuft a few cushions of uneven size, darker below, a few lighter tips on
        // top; out of a few on top, a spore stalk; from some under the course, a wisp of it
        // hanging down.
        const p = [rand(0, 6), rand(0, 6)], lush = (x) => 0.5 + 0.5 * Math.sin(x / 47 + p[0]) * Math.sin(x / 19 + p[1]);
        const tuft = (x, y, hang) => {
            const up = hang ? 1 : -1;
            let d = `M${f(x)} ${f(y)}`, at = x, stalks = "";
            const tips = {};
            for (let n = int(2, 6); n > 0; n--) {
                const r = rand(1.2, 3), h = r * rand(0.8, 1.4);
                d += ` a${f(r)} ${f(h)} 0 0 ${hang ? 0 : 1} ${f(2 * r)} 0`;
                if (random() < 0.8) {
                    const colour = pick(MOSS_LIGHT), cx = at + r + rand(-0.5, 0.5), q = r * 0.48;
                    tips[colour] = `${tips[colour] || ""}M${f(cx - q)} ${f(y + up * h * 0.6)} a${f(q)} ${f(q)} 0 1 0 ${f(2 * q)} 0 a${f(q)} ${f(q)} 0 1 0 ${f(-2 * q)} 0`;
                }
                if (!hang && r > 2.2 && random() < 0.15) {
                    const sx = at + r, sy = y - h, l = rand(2.5, 4.5), lean = rand(-1.2, 1.2);
                    stalks += `<path class="seta" d="M${f(sx)} ${f(sy)} q${f(lean * 0.3)} ${f(-l * 0.6)} ${f(lean)} ${f(-l)}" /><ellipse class="c-hedge-olive" cx="${f(sx + lean)}" cy="${f(sy - l)}" rx=".55" ry=".9" transform="rotate(${f(lean * 12)} ${f(sx + lean)} ${f(sy - l)})" />`;
                }
                at += 2 * r;
            }
            const wisp = hang && random() < 0.35 ? `<path class="beard" d="M${f((x + at) / 2)} ${f(y + 1.5)} q${f(rand(-1.5, 1.5))} ${f(rand(2, 4))} ${f(rand(-1, 1))} ${f(rand(4, 8))}" />` : "";
            return `<g class="moss${hang ? " hang" : ""}" style="--d: ${f(0.1 + 1.6 * x / w)}s"><path class="${pick(MOSS)} moss-edge" d="${d} Z" />${Object.entries(tips).map(([colour, dots]) => `<path class="${colour}" d="${dots}" />`).join("")}${stalks}${wisp}</g>`;
        };
        let moss = tuft(px1 + 2, LOW + 3, true);
        for (let x = px0 + rand(1, 8); x < w - 6; x += rand(4, 20)) if (random() < lush(x)) moss += tuft(x, TOP + 0.6, false);
        for (let x = px1 + rand(10, 40); x < w - 6; x += rand(24, 80)) if (random() < 0.4 + lush(x) * 0.6) moss += tuft(x, LOW - 0.6, true);
        // snow lying along the course's top, its edge soft and uneven, a lump here and there
        let snow = "";
        if (document.documentElement.dataset.weather === "snow") {
            snow = `<path class="snow outline fine" d="M${f(px0 - 1)} ${TOP + 2} L${f(px0)} ${TOP - 1.4}`;
            for (let x = px0 + 4; x < w; x += 4) snow += ` L${f(x)} ${f(TOP - 1.6 - (Math.sin(x * 0.21 + i) > 0.8 ? 1.6 : 0) - 0.4 * Math.sin(x * 0.7))}`;
            snow += ` L${w + 1} ${TOP - 1.4} L${w + 1} ${TOP + 2}`;
            for (let x = w; x > px0; x -= 3) snow += ` L${f(x)} ${f(TOP + 2.2 + 0.9 * Math.sin(x * 0.8 + i) + (Math.sin(x * 0.13 + 3 * i) > 0.9 ? 2.5 : 0))}`;
            snow += " Z\" />";
        }
        const paint = document.getElementById("gouache") ? ' filter="url(#gouache)"' : "";
        return [`<g${paint}>${wall}${course}${panel}${field}${edges}${snow}</g>`, moss];
    };

    // by night, a few fireflies drifting over the plants and glowing on and off (.firefly, as
    // over the castle's gardens)
    const fireflies = (end) => Array.from({ length: Math.round(end / 220) + 1 }, () => {
        const x = rand(10, end), y = TOP - rand(4, 20), drift = (n) => f((random() - 0.5) * n);
        return `<g transform="translate(${f(x)} ${f(y)})"><g class="firefly" style="--dx: ${drift(36)}px; --dy: ${drift(18)}px; `
            + `animation-duration: ${f(rand(5, 10))}s, ${f(rand(6, 11))}s; animation-delay: -${f(rand(0, 8))}s, -${f(rand(0, 10))}s">`
            + '<circle r="6" fill="url(#firefly-glow)" /><circle class="firefly-core" r=".9" /></g></g>';
    }).join("");

    // Each floor's drawing, laid over its line (.floor-deco): the course of stone along it (the
    // floor's own border, kept for when there is no script, hides under it), the floor's name
    // in its stone, the plants and the thing on the line, if any, the fireflies. Drawn again for each castle and whenever
    // the floors or their names change size.
    let seed = 1, sizes = [], boxes = null, k = 1;
    // (the castle's scale: 1 where it is drawn a pixel to a unit, less on narrow screens)
    const castleScale = () => Math.min(1, (document.querySelector(".skyline")?.getBoundingClientRect().width || 952) / 952);
    const measured = () => castleScale() + floors.map((floor) => {
        const title = floor.querySelector(".floor-title");
        return `${floor.clientWidth} ${title.offsetWidth} ${title.offsetHeight}`;
    }).join();
    const prepare = () => {
        // each floor's two drawings: the stone in a drawing of its own (.floor-stone) under the
        // plants' and the things' (.floor-deco), painted once: with them moving over it every
        // frame, its gouache would be painted again each time, which a phone cannot keep up with
        floors.forEach((floor) => {
            if (floor.querySelector(":scope > .floor-deco")) return;
            const [wall, deco] = ["floor-stone", "floor-deco"].map((name) => {
                const svg = document.createElementNS(NS, "svg");
                svg.setAttribute("class", name);
                svg.setAttribute("aria-hidden", "true");
                svg.setAttribute("preserveAspectRatio", "none");
                return svg;
            });
            floor.prepend(wall, deco);
            watch.observe(deco);
            boxes = null;
        });
        // every size read at once, before anything is drawn, so the page is laid out only once
        // (read between the drawings, each read would lay out all the floors drawn before it):
        // each floor's width, and its name's box, in its tablet under the line (its top at the
        // line, as the CSS sets it once the drawing is there). Kept for the next castles, which
        // leave them as they are: measured again only when the page resizes (below), so a new
        // castle reads nothing until it is drawn.
        if (!boxes) {
            k = castleScale();
            boxes = floors.map((floor) => {
                const title = floor.querySelector(".floor-title");
                return [floor.clientWidth, title.offsetLeft, title.offsetTop, title.offsetWidth, title.offsetHeight];
            });
            sizes = k + boxes.map(([w, , , tw, th]) => `${w} ${tw} ${th}`).join();
        }
    };
    const draw = (again) => {
        prepare();
        // each floor its own kind of plant, shuffled for each castle
        random = seeded(seed);
        const kinds = [...KINDS].sort(() => random() - 0.5);
        floors.forEach((floor, i) => {
            random = seeded(seed ^ Math.imul(i + 1, 0x9e3779b1));
            const [w, tx, ty, tw, th] = boxes[i], end = w - 8;
            scale = w < 520 ? 0.85 : 1;
            const deco = floor.querySelector(":scope > .floor-deco"), wall = floor.querySelector(":scope > .floor-stone");
            [wall, deco].forEach((svg) => svg.setAttribute("viewBox", `0 0 ${w} ${HIGH}`));
            // what hangs under the line keeps clear of the floor's name
            const after = tx + tw;
            named = after;
            const [stone, moss] = masonry(i, w, [tx, LINE + 2 + ty, tw, th], k);
            wall.style.setProperty("--k", k.toFixed(3));
            side = seeded(seed ^ Math.imul(i + 13, 0xc2b2ae35));
            const make = () => OBJECTS[floor.id]?.(i, w, after) ?? { markup: "" }, thing = LATER.has(floor.id) ? aside(make) : make();
            const stretches = thing.gap ? [[6, thing.gap[0]], [thing.gap[1], end]] : [[6, end]];
            const grown = plants(stretches.filter(([a, b]) => b - a > 20), end, thing.support, thing.over, kinds[i % kinds.length]);
            // over the stone: its moss, the plants in front of the thing or behind it, the
            // fireflies, what the plants climb
            const ground = thing.behind ? thing.markup + grown.main : grown.main + thing.markup;
            wall.innerHTML = stone;
            deco.innerHTML = `${moss}${ground}${fireflies(end)}${grown.climb}`;
            if (document.documentElement.dataset.weather === "snow") snowOn(deco, i);
            // the leaves, flowers and branches, where they leave the stem and how far they can
            // swing, for the pointer to stir
            deco.parts = [...deco.querySelectorAll("[data-at]")].map((el) => {
                const [x, y, most = 30] = el.dataset.at.split(" ").map(Number);
                return [x, y, most, el];
            });
            // a new castle: the plants grow again once their floor is in view, as on arriving
            // (watched afresh, it is seen at once if it is in view)
            if (again) {
                deco.classList.remove("grown");
                watch.unobserve(deco);
                watch.observe(deco);
            }
        });
    };
    // plants grow once their floor comes into view, and sway only while it is (.awake)
    const watch = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("grown");
        entry.target.classList.toggle("awake", entry.isIntersecting);
    }), { rootMargin: "0px 0px -12% 0px" });

    addEventListener("castle-drawn", ({ detail }) => {
        if (detail === undefined || (detail === seed && sizes.length)) return;
        seed = detail;
        draw(true);
    });
    // (a name changes size when the page's font comes in)
    const resized = new ResizeObserver(() => {
        if (sizes.length && measured() !== sizes) {
            boxes = null;
            draw(false);
        }
    });
    resized.observe(document.querySelector("main"));
    floors.forEach((floor) => resized.observe(floor.querySelector(".floor-title")));
    addEventListener("DOMContentLoaded", () => {
        if (!sizes.length) draw(false);
    });
    // measured now, while the page is still light, before the castle is drawn: drawing the
    // floors for it will then read nothing
    prepare();

    // the things touched: the loudspeaker proclaims, the candle goes out (and lights again),
    // the bicycle's wheels spin, the street piano plays
    const TOUCHED = { speaker: ["speaking", 2500], books: ["snuffed", 2600], bicycle: ["rolling", 2600], "street-piano": ["playing", 3800] };
    document.querySelector("main").addEventListener("click", (event) => {
        const thing = event.target.closest(".touch");
        const [state, time] = Object.entries(TOUCHED).find(([name]) => thing?.classList.contains(name))?.[1] ?? [];
        if (!state || thing.classList.contains(state)) return;
        thing.classList.add(state);
        setTimeout(() => thing.classList.remove(state), time);
    });

    // The compass's needle turns to the pointer wherever it is on the page (a finger's tap on
    // a touch screen), the shorter way round from where it points, and back to the north when
    // the pointer leaves the page
    let at = null, aiming = 0;
    const aim = () => {
        aiming = 0;
        document.querySelectorAll("main .compass .needle").forEach((needle) => {
            const dial = needle.parentNode.querySelector(".dial").getBoundingClientRect();
            const to = at ? Math.atan2(at[0] - dial.left - dial.width / 2, dial.top + dial.height / 2 - at[1]) * 180 / Math.PI : 0, from = needle.turned || 0;
            needle.turned = from + ((to - from + 540) % 360) - 180;
            needle.style.transform = `rotate(${f(needle.turned)}deg)`;
        });
    };
    const point = (event) => {
        at = event.type === "mouseleave" ? null : [event.clientX, event.clientY];
        aiming ||= requestAnimationFrame(aim);
    };
    addEventListener("pointermove", point, { passive: true });
    addEventListener("pointerdown", point, { passive: true });
    document.documentElement.addEventListener("mouseleave", point);

    // Brushed by the pointer, the leaves, flowers and branches near its way since its last move
    // stir, the more the faster it goes, and settle again: each a short swing over its wind
    let last = null;
    addEventListener("pointermove", (event) => {
        const now = event.timeStamp, from = last && now - last.t < 100 ? last : null;
        last = { x: event.clientX, y: event.clientY, t: now };
        if (!from || reducedMotion.matches) return;
        const dx = last.x - from.x, speed = Math.hypot(dx, last.y - from.y) / Math.max(1, now - from.t) * 1000;
        if (speed < 80) return;
        // the floors' drawings it passed over, its way across each, from a to b (all read before
        // any stirs)
        const near = floors.map((floor) => floor.querySelector(":scope > .floor-deco"))
            .filter((deco) => deco?.parts && deco.classList.contains("grown"))
            .filter((deco) => {
                const box = deco.getBoundingClientRect();
                return Math.max(last.y, from.y) > box.top - 18 && Math.min(last.y, from.y) < box.bottom + 18;
            })
            .map((deco) => {
                const screen = deco.getScreenCTM().inverse();
                return [deco, new DOMPoint(from.x, from.y).matrixTransform(screen), new DOMPoint(last.x, last.y).matrixTransform(screen)];
            });
        near.forEach(([deco, a, b]) => deco.parts.forEach(([x, y, most, el]) => {
            // how near its way passed
            const ux = b.x - a.x, uy = b.y - a.y, t = Math.max(0, Math.min(1, ((x - a.x) * ux + (y - a.y) * uy) / (ux * ux + uy * uy || 1)));
            const d = Math.hypot(x - a.x - t * ux, y - a.y - t * uy);
            if (d > 18 || el.getAnimations().some((animation) => animation.id === "stir")) return;
            const swing = Math.min(most, speed / 40) * (1 - d / 18) * Math.sign(dx || 1);
            el.animate([0, 1, -0.55, 0.3, -0.12, 0].map((k) => ({ rotate: `${f(swing * k)}deg` })), { id: "stir", duration: 1100, easing: "ease-out" });
        }));
    }, { passive: true });
})();
