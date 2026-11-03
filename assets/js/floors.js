// The lines between the tower's floors (the resume's sections), dressed after Le Roi et
// l'Oiseau: each a course of the castle terrace's stone, each floor's name cut in a panel
// under it; moss on the stone, and creepers along it, growing as its floor comes into view, stirring
// in a light wind and where the pointer brushes them, fireflies over them by night; and on
// some floors something of the film along the line: one of the town's loudspeakers, gears of
// the palace's machinery, a nest of the Bird's chicks. Each castle (its seed, from
// skyline.js) draws them its own way.
(() => {
    const floors = [...document.querySelectorAll("main .floor")];
    if (!floors.length) return;
    const NS = "http://www.w3.org/2000/svg";
    const LINE = 46, HIGH = 70;                 // the floor's line (its top) and each drawing's height, in pixels
    const TOP = LINE - 3, LOW = LINE + 8;       // the course of stone along it: its top, its underside
    const f = (n) => n.toFixed(1);
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
        const sway = (x, swing, share, drawn) => (random() < share * (coarse.matches ? 0.35 : 1) ? `<g class="sway" style="--amp: ${f(swing)}deg; animation-delay: -${f((span - x) / 110 + rand(0, 0.4))}s">${drawn}</g>` : drawn);
        // a leaf at (x, y), turned a degrees (0 up, 180 hanging down), of uneven size: some dry
        // (drooping, some curled up), some turning
        const leaf = (x, y, a, t = time(x)) => {
            const r = random(), dry = r < 0.11, l = rand(...kind.size) * scale * rand(0.7, 1.25), w = l * 0.42;
            const colour = dry ? pick(DRY) : r < 0.17 ? pick(AUTUMN) : pick(kind.greens), curl = dry && random() < 0.5 ? " scale(1 .6)" : "";
            // its veins: the midrib and two pairs off it (none on wisteria's small leaflets)
            const veins = kind.leaf === "pinnate" || l < 6 ? "" : `<path class="vein" d="M0 ${f(-l * 0.12)} V${f(-l * 0.85)}`
                + [[0.38, 0.6, 0.16], [0.6, 0.45, 0.13]].map(([at, out, up]) => ` M0 ${f(-l * at)} l${f(w * out)} ${f(-l * up)} M0 ${f(-l * at)} l${f(-w * out)} ${f(-l * up)}`).join("") + '" />';
            return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(dry ? rand(140, 220) : a)})${curl}">${sway(x, rand(3, 7), 0.45,
                `<g class="leaf" style="${delay(t)}" data-at="${f(x)} ${f(y)}"><path class="${colour} outline ${kind.leaf === "pinnate" ? "wisp" : "hair"}" d="${LEAVES[kind.leaf](l, w)}" />${veins}</g>`)}</g>`;
        };
        // a flower at (x, y)
        const flower = (x, y, type, t = time(x)) => {
            const drawn = `<g class="flower" style="${delay(t)}" data-at="${f(x)} ${f(y)}">${FLOWERS[type](type === "bud" ? pick(kind.greens) : pick(kind.colours))}</g>`;
            return `<g transform="translate(${f(x)} ${f(y)})">${HANGING.has(type) ? sway(x, rand(6, 10), 1, drawn) : sway(x, rand(2, 4), 0.5, drawn)}</g>`;
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
        const span = (y0, y1) => [Math.min(y0, y1) - 0.5, Math.abs(y1 - y0) + 1];
        const angle = cramped ? rand(98, 112) : rand(135, 165), len = cramped ? rand(13, 16) : rand(16, 20);
        let drawn = `<rect class="c-slate outline hair" x="${cx - 4}" y="${LOW - 1}" width="8" height="3.5" rx=".8" /><path class="cable" d="M${cx} ${LOW + 2.5} V${hang}" />`
            + (random() < 0.5 ? horn(cx + 2, hang + 5, rand(25, 55), rand(8, 10), 3.5, pick(["c-slate", "c-gold"])) : "")
            + horn(cx - 2, hang + 5, angle, len, rand(6, 7), pick(["c-gold", "c-gold", "c-slate"]))
            + `<rect class="c-slate outline thin" x="${cx - 3.5}" y="${hang + 2}" width="7" height="5.5" rx="1" />`;
        if (turned) drawn = `<g transform="translate(${2 * cx} 0) scale(-1 1)">${drawn}</g>`;
        // what it proclaims, just past the mouth of its main horn, on the side it calls to
        const mouth = 2 + (len + 4) * -Math.cos(angle * Math.PI / 180), by = cramped ? TOP - 22 : hang + 5 + (len + 4) * Math.sin(angle * Math.PI / 180) - 7.5;
        const bx = cramped ? Math.max(2, Math.min(w - 94, cx - 46)) : turned ? cx + mouth : cx - mouth - 92;
        return {
            markup: `<g class="speaker touch"><rect class="hit" x="${cx - 42}" y="${LOW - 6}" width="84" height="${hang - LOW + 30}" />${drawn}`
                + `<g class="bubble"><rect x="${f(bx)}" y="${f(by)}" width="92" height="15" rx="7" /><text x="${f(bx + 46)}" y="${f(by + 10.5)}" text-anchor="middle">Long live the King!</text></g></g>`,
            support: { a: [cx, LOW + 2.5], b: [cx, hang], r: 2.2, cover: (y0, y1) => `<path class="cable" d="M${cx} ${f(span(y0, y1)[0])} v${f(span(y0, y1)[1])}" />` },
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
        const ring = (q) => ` M${f(cx + q)} ${f(cy)} A${f(q)} ${f(q)} 0 1 0 ${f(cx - q)} ${f(cy)} A${f(q)} ${f(q)} 0 1 0 ${f(cx + q)} ${f(cy)} Z`;
        const spokes = r < 9 ? 0 : int(3, 6);
        const spoke = (a) => [[hub * 0.8, -1], [rim + 0.6, -1], [rim + 0.6, 1], [hub * 0.8, 1]]
            .map(([q, side], j) => `${j ? "L" : "M"}${f(cx + q * Math.cos(a) - side * 0.9 * Math.sin(a))} ${f(cy + q * Math.sin(a) + side * 0.9 * Math.cos(a))}`).join(" ") + " Z";
        return `<g class="gear" style="--turn: ${f(turn)}turn; transform-box: view-box; transform-origin: ${f(cx)}px ${f(cy)}px"><path class="${colour} outline thin" fill-rule="evenodd" d="${d} Z${spokes ? ring(rim) : ""}" />`
            + (spokes ? `<path class="${colour} outline hair" d="${Array.from({ length: spokes }, (_, k) => spoke(phase + k * 2 * Math.PI / spokes)).join(" ")}" />` : "")
            + `<circle class="${colour} outline thin" cx="${f(cx)}" cy="${f(cy)}" r="${f(hub)}" /><circle class="bolt" cx="${f(cx)}" cy="${f(cy)}" r="${f(hub * 0.45)}" /></g>`;
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
        const spans = (y0, y1) => [Math.min(y0, y1) - 0.5, Math.abs(y1 - y0) + 1];
        let frame = "", support = null, gap = null;
        if (climbing) {
            // iron bars bolted from axle to axle, and a post from the highest axle to the floor
            frame = train.slice(1).map((g, k) => `<path class="bar" d="M${f(train[k].x)} ${f(train[k].y)} L${f(g.x)} ${f(g.y)}" />`).join("");
            const top = train.reduce((m, g) => (g.y < m.y ? g : m)), px = top.x;
            frame += `<path class="bar post" d="M${f(px)} ${f(top.y)} V${TOP}" /><rect class="c-slate outline hair" x="${f(px - 3)}" y="${TOP - 2}" width="6" height="2.5" />`;
            support = {
                a: [px, TOP - 1], b: [px, top.y + 6], r: 2.6,
                cover: (y0, y1) => `<path class="bar post" d="M${f(px)} ${f(spans(y0, y1)[0])} v${f(spans(y0, y1)[1])}" />`,
            };
            gap = [px, px + 4];
        }
        // the height the plant must clear to ride over those in the slot, just above their teeth
        // (and below the line beside them, so it eases off them)
        const tops = train.filter((g) => g.y === sunk).map((g) => [g.x, g.n * PITCH / (2 * Math.PI) + 3.4]);
        return {
            markup: `<clipPath id="floor-slot-${i}"><rect x="0" y="-${HIGH}" width="100%" height="${TOP + 1.5 + HIGH}" /></clipPath>${slot}`
                + `<g clip-path="url(#floor-slot-${i})">${train.map((g) => gear(g.x, g.y, g.n, g.phase, g.turn, pick(METALS))).join("")}</g>${frame}`,
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
        const t = (turn - 90) * Math.PI / 180, r = 3.6, along = (d, side) => [x + d * Math.cos(t) - side * Math.sin(t), y + d * Math.sin(t) + side * Math.cos(t)];
        const [bx, by] = along(r - 0.6, 0), tip = along(r + 4, 0).map(f).join(" "), hinge = `transform-origin: ${f(bx)}px ${f(by)}px`;
        const half = (side) => along(r - 0.8, side).map(f).join(" ");
        return `<path class="tuft" d="M${f(x - 0.8)} ${f(y - r + 0.4)} l-0.7 -1.8 M${f(x)} ${f(y - r)} v-2 M${f(x + 0.8)} ${f(y - r + 0.4)} l0.7 -1.8" />`
            + `<circle class="${pick(FLUFF)} outline hair" cx="${f(x)}" cy="${f(y)}" r="${r}" />`
            + `<circle class="pupil" cx="${f(x - 1.4)}" cy="${f(y + 0.3)}" r=".7" /><circle class="pupil" cx="${f(x + 1.4)}" cy="${f(y + 0.3)}" r=".7" />`
            + `<path class="beak upper c-terracotta outline hair" style="${hinge}" d="M${half(-1.5)} L${tip} L${f(bx)} ${f(by)} Z" />`
            + `<path class="beak lower c-terracotta outline hair" style="${hinge}" d="M${half(1.5)} L${tip} L${f(bx)} ${f(by)} Z" />`;
    };
    // the chicks (or an egg in their midst) along a nest's rim at height y, from x0 to x1
    const brood = (x0, x1, y) => {
        const n = int(2, 4);
        return Array.from({ length: n }, (_, k) => {
            const x = x0 + (x1 - x0) * (n === 1 ? 0.5 : k / (n - 1));
            return random() < 0.15
                ? `<ellipse class="c-pale outline hair" cx="${f(x)}" cy="${f(y + 1.5)}" rx="2.4" ry="3.1" transform="rotate(${f(rand(-25, 25))} ${f(x)} ${f(y + 1.5)})" />`
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
        + "</g>";
    const nest = (i, w, after) => {
        const kind = random(), cx = Math.round(rand(kind < 0.7 ? 40 : Math.min(after + 24, w - 60), w - 34)), span = (y0, y1) => [Math.min(y0, y1) - 0.5, Math.abs(y1 - y0) + 1];
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
                + `<path class="twig rim" d="M${f(cx - r)} ${f(y0)} Q${f(cx)} ${f(y0 - 2.5)} ${f(cx + r)} ${f(y0)}" />`;
            perch = [cx + (random() < 0.5 ? 1 : -1) * (r + 9), TOP];
        } else if (kind < 0.7) {
            // an old flowerpot, cracked, on the line, full of straw
            drawn = brood(cx - 6, cx + 6, TOP - 18.5)
                + `<path class="c-terracotta outline thin" d="M${cx - 10} ${TOP - 13} L${cx - 7.5} ${TOP} H${cx + 7.5} L${cx + 10} ${TOP - 13} Z" />`
                + `<path class="joint" d="M${cx + 3} ${TOP - 13} l-1.5 3 l2 2 l-1.5 3.5" />`
                + `<path class="straw" d="M${cx - 9} ${TOP - 15.5} l-3 -2 M${cx - 6} ${TOP - 16} l-1 -3 M${cx + 7} ${TOP - 16} l2 -2.5 M${cx + 9.5} ${TOP - 15} l3 -1" />`
                + `<rect class="c-terracotta-deep outline thin" x="${cx - 11.5}" y="${TOP - 16}" width="23" height="3.5" />`;
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
                + `<path class="c-thatch outline thin" d="M${cx} ${top} C${cx + 9} ${top + 2} ${cx + 9.5} ${f(top + h * 0.8)} ${cx} ${f(top + h)} C${cx - 9.5} ${f(top + h * 0.8)} ${cx - 9} ${top + 2} ${cx} ${top} Z" />`
                + `<path class="twig" d="${weave}" />`
                + `<ellipse class="c-window-dark outline hair" cx="${f(cx + side * 3)}" cy="${f(hy)}" rx="3.2" ry="3.6" />`
                + chick(cx + side * 3.5, hy + 0.5, side * 70);
            support = { a: [cx, LOW + 2.5], b: [cx, top], r: 1.8, cover: (y0, y1) => `<path class="cable" d="M${cx} ${f(span(y0, y1)[0])} v${f(span(y0, y1)[1])}" />` };
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

    // the thing on each floor that has one (it says what stretch of line it leaves the plants
    // and what they can climb)
    const OBJECTS = { publications: loudspeaker, skills: gears, associations: nest };

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
            let d = `M${f(x)} ${f(y)}`, at = x, tips = "", stalks = "";
            for (let n = int(2, 6); n > 0; n--) {
                const r = rand(1.2, 3), h = r * rand(0.8, 1.4);
                d += ` a${f(r)} ${f(h)} 0 0 ${hang ? 0 : 1} ${f(2 * r)} 0`;
                if (random() < 0.8) tips += `<circle class="${pick(MOSS_LIGHT)}" cx="${f(at + r + rand(-0.5, 0.5))}" cy="${f(y + up * h * 0.6)}" r="${f(r * 0.48)}" />`;
                if (!hang && r > 2.2 && random() < 0.15) {
                    const sx = at + r, sy = y - h, l = rand(2.5, 4.5), lean = rand(-1.2, 1.2);
                    stalks += `<path class="seta" d="M${f(sx)} ${f(sy)} q${f(lean * 0.3)} ${f(-l * 0.6)} ${f(lean)} ${f(-l)}" /><ellipse class="c-hedge-olive" cx="${f(sx + lean)}" cy="${f(sy - l)}" rx=".55" ry=".9" transform="rotate(${f(lean * 12)} ${f(sx + lean)} ${f(sy - l)})" />`;
                }
                at += 2 * r;
            }
            const wisp = hang && random() < 0.35 ? `<path class="beard" d="M${f((x + at) / 2)} ${f(y + 1.5)} q${f(rand(-1.5, 1.5))} ${f(rand(2, 4))} ${f(rand(-1, 1))} ${f(rand(4, 8))}" />` : "";
            return `<g class="moss${hang ? " hang" : ""}" style="--d: ${f(0.1 + 1.6 * x / w)}s"><path class="${pick(MOSS)} moss-edge" d="${d} Z" />${tips}${stalks}${wisp}</g>`;
        };
        let moss = tuft(px1 + 2, LOW + 3, true);
        for (let x = px0 + rand(1, 8); x < w - 6; x += rand(4, 20)) if (random() < lush(x)) moss += tuft(x, TOP + 0.6, false);
        for (let x = px1 + rand(10, 40); x < w - 6; x += rand(24, 80)) if (random() < 0.4 + lush(x) * 0.6) moss += tuft(x, LOW - 0.6, true);
        const paint = document.getElementById("gouache") ? ' filter="url(#gouache)"' : "";
        return [`<g${paint}>${wall}${course}${panel}${field}${edges}</g>`, moss];
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
    let seed = 1, sizes = [];
    // (the castle's scale: 1 where it is drawn a pixel to a unit, less on narrow screens)
    const castleScale = () => Math.min(1, (document.querySelector(".skyline")?.getBoundingClientRect().width || 952) / 952);
    const measured = () => castleScale() + floors.map((floor) => {
        const title = floor.querySelector(".floor-title");
        return `${floor.clientWidth} ${title.offsetWidth} ${title.offsetHeight}`;
    }).join();
    const draw = (again) => {
        // each floor its own kind of plant, shuffled for each castle
        random = seeded(seed);
        const kinds = [...KINDS].sort(() => random() - 0.5), k = castleScale();
        floors.forEach((floor, i) => {
            random = seeded(seed ^ Math.imul(i + 1, 0x9e3779b1));
            const w = floor.clientWidth, end = w - 8;
            scale = w < 520 ? 0.85 : 1;
            // the stone in a drawing of its own (.floor-stone) under the plants' and the things'
            // (.floor-deco), painted once: with them moving over it every frame, its gouache would
            // be painted again each time, which a phone cannot keep up with
            let deco = floor.querySelector(":scope > .floor-deco"), wall = floor.querySelector(":scope > .floor-stone");
            if (!deco) {
                [wall, deco] = ["floor-stone", "floor-deco"].map((name) => {
                    const svg = document.createElementNS(NS, "svg");
                    svg.setAttribute("class", name);
                    svg.setAttribute("aria-hidden", "true");
                    svg.setAttribute("preserveAspectRatio", "none");
                    return svg;
                });
                floor.prepend(wall, deco);
                watch.observe(deco);
            }
            [wall, deco].forEach((svg) => svg.setAttribute("viewBox", `0 0 ${w} ${HIGH}`));
            // the floor's name, in its tablet under the line (its top at the line, as the CSS sets
            // it once the drawing is there); what hangs under the line keeps clear of it
            const title = floor.querySelector(".floor-title"), after = title.offsetLeft + title.offsetWidth;
            named = after;
            const [stone, moss] = masonry(i, w, [title.offsetLeft, LINE + 2 + title.offsetTop, title.offsetWidth, title.offsetHeight], k);
            wall.style.setProperty("--k", k.toFixed(3));
            const thing = OBJECTS[floor.id]?.(i, w, after) ?? { markup: "" };
            const stretches = thing.gap ? [[6, thing.gap[0]], [thing.gap[1], end]] : [[6, end]];
            const grown = plants(stretches.filter(([a, b]) => b - a > 20), end, thing.support, thing.over, kinds[i % kinds.length]);
            // over the stone: its moss, the plants in front of the thing or behind it, the
            // fireflies, what the plants climb
            const ground = thing.behind ? thing.markup + grown.main : grown.main + thing.markup;
            wall.innerHTML = stone;
            deco.innerHTML = `${moss}${ground}${fireflies(end)}${grown.climb}`;
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
        sizes = measured();
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
        if (sizes.length && measured() !== sizes) draw(false);
    });
    resized.observe(document.querySelector("main"));
    floors.forEach((floor) => resized.observe(floor.querySelector(".floor-title")));
    addEventListener("DOMContentLoaded", () => {
        if (!sizes.length) draw(false);
    });

    // the loudspeaker, touched, proclaims
    document.querySelector("main").addEventListener("click", (event) => {
        const speaker = event.target.closest(".speaker");
        if (!speaker || speaker.classList.contains("speaking")) return;
        speaker.classList.add("speaking");
        setTimeout(() => speaker.classList.remove("speaking"), 2500);
    });

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
            if (d > 18 || el.getAnimations().length) return;
            const swing = Math.min(most, speed / 40) * (1 - d / 18) * Math.sign(dx || 1);
            el.animate([0, 1, -0.55, 0.3, -0.12, 0].map((k) => ({ transform: `rotate(${f(swing * k)}deg)` })), { duration: 1100, easing: "ease-out" });
        }));
    }, { passive: true });
})();
