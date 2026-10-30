// Draws a castle: a tall pale column standing on a stone terrace, carrying round clusters of
// turrets, with trimmed shrubs, an arcade and Escher-like flights of stairs, under a few
// faint clouds, painted with a gouache-like texture. Every piece keeps its own space, and
// pieces are drawn back to front by depth.
//
// The drawing reaches further left than the page column. Narrow screens show its right-hand
// part only; wide screens show all of it, its far left end being the elevator's top station:
// a pavilion on the terrace where the cabin docks, right above the elevator shaft
// (elevator.js).
//
// Each castle comes from a seed shown as a short ID under the drawing: typing another ID there
// redraws the castle in place, and ?castle=<ID> draws that castle on load. Without it, a new
// castle is drawn on every load. The same ID only gives the same castle as long as this
// generator is unchanged.
//
// Replaces the static drawing in .skyline, which stays as the no-JS fallback.
(() => {
    const svg = document.querySelector(".skyline");
    if (!svg) return;

    // --- Seeded randomness -----------------------------------------------------------

    // mulberry32: small, fast, and good enough to draw castles; seeded by each drawing
    let state = 0;
    const random = () => {
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    // One unit is 1/16 rem on wide screens, where the drawing runs from 15.5rem left of the
    // page column to its right edge. CORE is the part shown on narrow screens, from the
    // elevator's station to past the column; DOCK is where the elevator shaft runs, 13rem left
    // of the column on wide screens (see _resume-styles.scss)
    const W = 952, H = 270, CORE = [16, 736], DOCK = 40;
    const rand = (min, max) => min + random() * (max - min);
    const int = (min, max) => Math.floor(rand(min, max + 1));
    const pick = (items) => items[int(0, items.length - 1)];
    const chance = (p) => random() < p;
    const f = (n) => n.toFixed(1);

    // Depth layers, drawn back to front
    const SKY = 0, COLUMN = 1, FACE = 2, BACK = 3, SHRUBS = 4, WALL = 5, RAIL = 6, TURRETS = 7, GROUND = 8;
    const parts = [];
    let layer = SKY;
    const add = (s) => parts.push([layer, parts.length, s]);
    const on = (z, draw) => { const previous = layer; layer = z; draw(); layer = previous; };

    const ROOFS = ["c-blue", "c-blue", "c-blue", "c-blue-deep", "c-blue-deep", "c-red", "c-gold", "c-green"];
    const DOMES = ["c-gold", "c-gold", "c-rose", "c-green", "c-blue"];
    const WALLS = ["c-cream", "c-cream", "c-cream", "c-cream", "c-sand", "c-sand", "c-rose"];
    const STEPS = ["c-cream", "c-cream", "c-sand", "c-rose", "c-terracotta"];
    const FLAGS = ["c-red", "c-red", "c-gold", "c-blue-deep"];

    // A fictive time of day for each castle, taken from its seed apart from the drawing's own
    // draws (so a castle stays the same): which side the light comes from (-1 left, 0 above,
    // 1 right), which way and how far shadows fall, and where the sun stands (x, y, radius).
    // The sky's and the light's colours come with it in the CSS ([data-moment], _theme.scss).
    const MOMENTS = [
        { name: "dawn", side: -1, shadow: [11, 3], sun: [170, 160, 20] },
        { name: "morning", side: -1, shadow: [7, 4], sun: [150, 70, 15] },
        { name: "noon", side: 0, shadow: [2, 6], sun: [660, 30, 13] },
        { name: "afternoon", side: 1, shadow: [-7, 4], sun: [760, 80, 15] },
        { name: "golden", side: 1, shadow: [-10, 3], sun: [830, 175, 19] },
        { name: "dusk", side: 1, shadow: [-12, 2.5], sun: [885, 210, 22] },
    ];
    const momentOf = (seed) => MOMENTS[(Math.imul(seed, 2654435761) >>> 0) % MOMENTS.length];

    // The moon's phase, taken from the seed the same way: the lit share of its disc, and the
    // side lit (1 right, waxing; -1 left, waning)
    const PHASES = [[0.25, 1], [0.5, 1], [0.75, 1], [1, 1], [0.75, -1], [0.5, -1], [0.25, -1]];
    const phaseOf = (seed) => PHASES[(Math.imul(seed ^ 0x5bd1e995, 0x27d4eb2d) >>> 0) % PHASES.length];
    // The lit part of a moon of radius r at (x, y): down the limb on the lit side, and back up
    // the terminator, an ellipse that narrows as the quarters come and widens as it fills,
    // never quite straight
    const moonLit = (x, y, r, [lit, side]) => {
        const rx = r * Math.max(0.22, Math.abs(1 - 2 * lit)), limb = side > 0 ? 1 : 0, back = (lit < 0.5) === (side > 0) ? 0 : 1;
        return `M${f(x)} ${f(y - r)} A${f(r)} ${f(r)} 0 0 ${limb} ${f(x)} ${f(y + r)} A${f(rx)} ${f(r)} 0 0 ${back} ${f(x)} ${f(y - r)} Z`;
    };

    // Space already used, as boxes {x0, y0, x1, y1}
    const used = [];
    const box = (x0, y0, x1, y1) => ({ x0, y0, x1, y1 });
    const hits = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
    const isFree = (b) => used.every((u) => !hits(u, b));
    const use = (b) => { used.push(b); return b; };

    // The tips of the roofs' needles, where pennants may fly
    const tips = [];

    // --- Building blocks -------------------------------------------------------------

    // A faint cloud, kept out of the drawing in a picture of its own so it can drift across
    // the sky without the castle being repainted: its shapes and their bounds
    const cloud = (x, y, w) => {
        const h = w * 0.14;
        let shapes = `<ellipse cx="${f(x + w / 2)}" cy="${f(y)}" rx="${f(w / 2)}" ry="${f(h / 2)}" />`;
        let top = y - h / 2;
        for (let i = 0, n = int(2, 3); i < n; i++) {
            const r = rand(0.12, 0.2) * w * 0.6, cy = y - r * 0.58;
            shapes += `<circle cx="${f(x + w * rand(0.25, 0.75))}" cy="${f(cy)}" r="${f(r)}" />`;
            top = Math.min(top, cy - r);
        }
        return { x: x - 2, y: top - 2, w: w + 4, h: y + h / 2 - top + 4, shapes, tone: pick(["", "warm", "bright"]) };
    };

    // A window; at night some are lit, their light spilling softly on the wall around them
    // (.window-glow), and the others stay dark. glow is the spill's radius, small enough to
    // stay on the wall.
    const window_ = (cx, y, glow = 6, w = 4, h = 8) => {
        const r = w / 2;
        const lit = chance(0.45);
        add(`<ellipse class="window-glow${lit ? "" : " is-off"}" cx="${f(cx)}" cy="${f(y + h / 2)}" rx="${f(glow)}" ry="${f(glow * 1.5)}" fill="url(#window-light)" />`);
        add(`<path class="${lit ? "c-window" : "c-window-dark"}" d="M${f(cx - r)} ${f(y + h)} V${f(y + r)} A${f(r)} ${f(r)} 0 0 1 ${f(cx + r)} ${f(y + r)} V${f(y + h)} Z" />`);
    };

    const windows = (x, yt, w, h) => {
        const cols = w > 34 ? [x + w * 0.32, x + w * 0.68] : [x + w / 2];
        const glow = Math.min(8, (cols.length > 1 ? w * 0.32 : w / 2) - 0.5);
        for (let y = yt + 8; y < yt + h - 10; y += 16) cols.forEach((cx) => window_(cx, y, glow));
    };

    // Volume: a piece marked data-shade gets a shaded copy laid over it once drawn (see the
    // end): "cyl" for towers and cones, "sphere" for domes and balls, "wall" for flat walls
    // in the shadow of what tops them, "lit" for hedges lit from above, "face" for what stands
    // on the column, lit as the column itself is.

    // The shadow a roof casts across the top of its tower, curved like the tower's face
    const eave = (x, top, w) => add(`<path class="eave" d="M${f(x + 1)} ${f(top)} H${f(x + w - 1)} V${f(top + 5)} Q${f(x + w / 2)} ${f(top + 9)} ${f(x + 1)} ${f(top + 5)} Z" />`);

    // A round tower's body: straight, shaded as a cylinder
    const towerBody = (cls, x, top, w, h) => {
        add(`<rect class="${cls} outline" data-shade="cyl" x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h)}" />`);
        eave(x, top, w);
    };

    const cone = (x, yt, w, h, cls, needle) => {
        const cx = x + w / 2;
        add(`<path class="${cls} outline" data-shade="cyl" d="M${f(x - 3)} ${f(yt)} Q${f(cx)} ${f(yt - h * 0.3)} ${f(cx)} ${f(yt - h)} Q${f(cx)} ${f(yt - h * 0.3)} ${f(x + w + 3)} ${f(yt)} Z" />`);
        add(`<line class="outline thin" x1="${f(cx)}" y1="${f(yt - h)}" x2="${f(cx)}" y2="${f(yt - h - needle)}" />`);
        if (w >= 18) tips.push({ x: cx, y: yt - h - needle });
    };

    const onion = (x, yt, w, cls) => {
        const cx = x + w / 2;
        const top = yt - w * 1.15;
        add(`<path class="${cls} outline" data-shade="sphere" d="M${f(x - 2)} ${f(yt)} C${f(x - w * 0.2)} ${f(yt - w * 0.6)} ${f(cx)} ${f(yt - w * 0.7)} ${f(cx)} ${f(top)} C${f(cx)} ${f(yt - w * 0.7)} ${f(x + w * 1.2)} ${f(yt - w * 0.6)} ${f(x + w + 2)} ${f(yt)} Z" />`);
        add(`<line class="outline thin" x1="${f(cx)}" y1="${f(top)}" x2="${f(cx)}" y2="${f(top - 6)}" />`);
    };

    // An arched door, its sill at base
    const door = (cx, base, w = 8, h = 14) => {
        const r = w / 2;
        add(`<path class="c-arch outline thin" d="M${f(cx - r)} ${f(base)} V${f(base - h + r)} A${f(r)} ${f(r)} 0 0 1 ${f(cx + r)} ${f(base - h + r)} V${f(base)} Z" />`);
    };

    // The column the face's flights climb round (set by each drawing), and the side its
    // shadows fall to: -1 left, 1 right
    let drum = null, shadowSide = 1;

    // A thin flight of stairs seen from the side, with a sloping underside, climbing from its
    // foot (x, y) towards dir. On the column (round), its steps follow the drum: evenly spaced
    // in angle, so they narrow towards its edges as they turn away; it takes the column's own
    // light, and casts a faint shadow on it.
    const flight = (x, y, steps, sw, sh, dir, colour, round = false) => {
        const end = x + dir * sw * steps;
        const turn = (v) => Math.asin(Math.max(-1, Math.min(1, (v - drum.cx) / drum.r)));
        const at = (k) => (round
            ? drum.cx + drum.r * Math.sin(turn(x) + (turn(end) - turn(x)) * k / steps)
            : x + (end - x) * k / steps);
        let d = `M${f(x)} ${f(y)}`;
        for (let i = 0; i < steps; i++) d += ` V${f(y - sh * (i + 1))} H${f(at(i + 1))}`;
        d += ` V${f(y - sh * (steps - 1) + 4)} L${f(at(1))} ${f(y + 4)} L${f(x)} ${f(y + 4)} Z`;
        if (round) add(`<path class="eave" transform="translate(${2 * shadowSide} 2.5)" d="${d}" />`);
        add(`<path class="${colour} outline thin"${round ? ' data-shade="face"' : ""} d="${d}" />`);
    };

    // A grand staircase seen from the front, coming down the terrace wall from its top to the
    // ground: steps widening as they come down, sometimes a red runner, and a parapet on each
    // side ending on a post with a gilded ball. Returns the opening it needs in the balustrade.
    const grandStairs = (cx, top, wt, colour, runner) => {
        const n = Math.round((H - top) / 4.5), sh = (H - top) / n, wb = wt + n * 5;
        for (let i = 0; i < n; i++) {
            const y = top + i * sh, hw = (wt + (wb - wt) * (i + 1) / n) / 2;
            add(`<rect class="${colour} outline thin" x="${f(cx - hw)}" y="${f(y)}" width="${f(2 * hw)}" height="${f(sh)}" />`);
            if (runner) add(`<rect class="c-red outline thin" x="${f(cx - hw * 0.35)}" y="${f(y)}" width="${f(hw * 0.7)}" height="${f(sh)}" />`);
        }
        [-1, 1].forEach((side) => {
            const xt = cx + side * wt / 2, xb = cx + side * wb / 2, post = xb + side * 2.5;
            add(`<path class="c-cream outline thin" d="M${f(xt)} ${f(top - 9)} L${f(xb)} ${f(H)} L${f(xb + side * 5)} ${f(H)} L${f(xt + side * 5)} ${f(top - 9)} Z" />`);
            add(`<rect class="c-cream outline thin" data-shade="cyl" x="${f(post - 4)}" y="${f(H - 16)}" width="8" height="16" />`);
            add(`<circle class="c-gold outline thin" data-shade="sphere" cx="${f(post)}" cy="${f(H - 19)}" r="3" />`);
        });
        return [cx - wt / 2 - 5, cx + wt / 2 + 5];
    };

    // A ledge jutting from the column, its top at y
    const ledge = (x0, x1, y, colour) => add(`<rect class="${colour} outline thin" data-shade="face" x="${f(x0)}" y="${f(y)}" width="${f(x1 - x0)}" height="3" />`);

    // Trimmed shrubs, their foot at base, each in one of a few close greens
    const GREENS = ["c-hedge", "c-hedge", "c-hedge-light", "c-hedge-sage", "c-hedge-olive"];
    const crenelHedge = (x, base, w, h) => {
        let d = `M${f(x)} ${f(base)} V${f(base - h)}`;
        for (let mx = x + 2; mx + 7 <= x + w - 2; mx += 12) d += ` H${f(mx)} v-5 h7 v5`;
        d += ` H${f(x + w)} V${f(base)} Z`;
        add(`<path class="${pick(GREENS)} outline thin" data-shade="lit" d="${d}" />`);
        return box(x, base - h - 5, x + w, base);
    };
    const boxHedge = (x, base, w, h) => {
        add(`<rect class="${pick(GREENS)} outline thin" data-shade="lit" x="${f(x)}" y="${f(base - h)}" width="${f(w)}" height="${f(h)}" rx="4" />`);
        return box(x, base - h, x + w, base);
    };
    const coneShrub = (x, base, w, h) => {
        const cx = x + w / 2, r = w * 0.22;
        add(`<path class="${pick(["c-hedge-deep", "c-hedge-deep", "c-hedge-olive"])} outline thin" data-shade="cyl" d="M${f(x)} ${f(base)} L${f(cx)} ${f(base - h)} L${f(x + w)} ${f(base)} Z" />`);
        add(`<circle class="${pick(GREENS)} outline thin" data-shade="sphere" cx="${f(cx)}" cy="${f(base - h - r + 1)}" r="${f(r)}" />`);
        return box(x, base - h - 2 * r, x + w, base);
    };
    const domeShrub = (x, base, w) => {
        const h = w * 0.55;
        add(`<path class="${pick(GREENS)} outline thin" data-shade="sphere" d="M${f(x)} ${f(base)} Q${f(x)} ${f(base - h)} ${f(x + w / 2)} ${f(base - h)} Q${f(x + w)} ${f(base - h)} ${f(x + w)} ${f(base)} Z" />`);
        return box(x, base - h, x + w, base);
    };
    // A clipped ball, sometimes two, on a slim trunk in a terracotta pot
    const topiary = (x, base, w) => {
        const cx = x + w / 2, r = w / 2, two = chance(0.4), top = base - w * (two ? 2.7 : 1.9);
        add(`<line class="outline thin" x1="${f(cx)}" y1="${f(base - 5)}" x2="${f(cx)}" y2="${f(top + r)}" />`);
        if (two) add(`<circle class="${pick(GREENS)} outline thin" data-shade="sphere" cx="${f(cx)}" cy="${f(base - w * 1.0)}" r="${f(r * 0.75)}" />`);
        add(`<circle class="${pick(GREENS)} outline thin" data-shade="sphere" cx="${f(cx)}" cy="${f(top + r)}" r="${f(r)}" />`);
        add(`<rect class="c-terracotta outline thin" x="${f(cx - w * 0.3)}" y="${f(base - 5)}" width="${f(w * 0.6)}" height="5" />`);
        return box(x, top, x + w, base);
    };

    // A white arcade with pointed arches and a hedge on top
    const arcade = (x, base, w, h) => {
        add(`<rect class="c-cream outline" data-shade="wall" x="${f(x)}" y="${f(base - h)}" width="${f(w)}" height="${f(h)}" />`);
        const n = Math.max(2, Math.floor(w / 26));
        const aw = w / n * 0.6, gap = (w - n * aw) / (n + 1);
        for (let i = 0; i < n; i++) {
            const ax = x + gap + i * (aw + gap), yb = base - h * 0.55;
            add(`<path class="c-arch" d="M${f(ax)} ${f(base)} V${f(yb)} Q${f(ax)} ${f(yb - aw * 0.5)} ${f(ax + aw / 2)} ${f(yb - aw * 0.8)} Q${f(ax + aw)} ${f(yb - aw * 0.5)} ${f(ax + aw)} ${f(yb)} V${f(base)} Z" />`);
        }
        crenelHedge(x - 2, base - h, w + 4, 7);
    };

    // A stone wall with mortar joints
    const terraceWall = (x0, x1, top) => {
        add(`<rect class="c-sand outline" data-shade="wall" x="${f(x0)}" y="${f(top)}" width="${f(x1 - x0)}" height="${f(H - top)}" />`);
        let row = 0;
        for (let y = top + 11; y < H - 4; y += 11, row++) {
            add(`<line class="joint" x1="${f(x0)}" y1="${f(y)}" x2="${f(x1)}" y2="${f(y)}" />`);
            for (let x = x0 + (row % 2 ? 9 : 20); x < x1 - 4; x += 22) {
                add(`<line class="joint" x1="${f(x)}" y1="${f(y - 11)}" x2="${f(x)}" y2="${f(y)}" />`);
            }
        }
    };
    // An arched stone viaduct carrying the terrace from x0 on past x1, its arches open on the sky
    const viaduct = (x0, x1, top) => {
        const deck = 9, pier = 10, span = int(30, 40), r = Math.min(span / 2, (H - top - deck) * 0.75);
        const spring = top + deck + r;
        let d = `M${f(x0)} ${f(top)} H${f(x1)} V${H} H${f(x0)} Z`;
        for (let x = x0 + pier; x < x1; x += span + pier) {
            d += ` M${f(x)} ${H} V${f(spring)} A${f(r)} ${f(r)} 0 0 1 ${f(x + 2 * r)} ${f(spring)} V${H} Z`;
        }
        add(`<path class="c-sand outline" data-shade="wall" fill-rule="evenodd" d="${d}" />`);
        add(`<line class="joint" x1="${f(x0)}" y1="${f(top + deck - 2)}" x2="${f(x1)}" y2="${f(top + deck - 2)}" />`);
    };

    // A white balustrade along [x0, x1], leaving an opening where stairs arrive
    const balustrade = (x0, x1, base, opening) => {
        const runs = opening ? [[x0, opening[0]], [opening[1], x1]].filter(([a, b]) => b - a > 8) : [[x0, x1]];
        runs.forEach(([a, b]) => {
            add('<g class="outline thin">');
            for (let x = a + 3; x < b - 2; x += 5) add(`<line x1="${f(x)}" y1="${f(base - 8)}" x2="${f(x)}" y2="${f(base)}" />`);
            add('</g>');
            add(`<rect class="c-cream outline thin" x="${f(a)}" y="${f(base - 11)}" width="${f(b - a)}" height="3" />`);
        });
    };

    // The elevator's top station, centred on cx: a pavilion whose arched opening has its sill
    // on the terrace floor, so the cabin stands in it, with the pulley under the arch
    const PAVILION = 24;                                // half its width
    const PULLEY = 46, PULLEY_R = 2.5;                  // its pulley's height above the floor, its radius
    const pavilion = (cx, base) => {
        const x0 = cx - PAVILION, w = 2 * PAVILION, top = base - 60, r = 16, spring = base - 34;
        add(`<path class="${pick(WALLS)} outline" data-shade="cyl" fill-rule="evenodd" d="M${x0} ${base} V${top} H${x0 + w} V${base} Z M${cx - r} ${base} V${spring} A${r} ${r} 0 0 1 ${cx + r} ${spring} V${base} Z" />`);
        eave(x0, top, w);
        add(`<circle class="c-gold outline thin" cx="${cx}" cy="${base - PULLEY}" r="${PULLEY_R}" />`);
        const domed = chance(0.3), roof = w * rand(0.8, 1.2);
        if (domed) onion(x0, top, w, pick(DOMES));
        else cone(x0, top, w, roof, pick(ROOFS), 10);
        return box(x0 - 4, top - (domed ? w * 1.15 + 6 : roof + 12), x0 + w + 4, base);
    };

    // A street lamp beside the station, its lantern lit at night (.lamp, .lamp-glow)
    const lamp = (x, base) => {
        add(`<rect class="c-slate outline thin" x="${f(x - 3)}" y="${f(base - 4)}" width="6" height="4" />`);
        add(`<rect class="c-slate outline thin" x="${f(x - 1.2)}" y="${f(base - 41)}" width="2.4" height="37" />`);
        add(`<path class="lamp outline thin" d="M${f(x - 4)} ${f(base - 42)} L${f(x - 5.5)} ${f(base - 52)} H${f(x + 5.5)} L${f(x + 4)} ${f(base - 42)} Z" />`);
        add(`<line class="outline thin" x1="${f(x)}" y1="${f(base - 42)}" x2="${f(x)}" y2="${f(base - 52)}" />`);
        cone(x - 4, base - 52, 8, 7, "c-slate", 4);
        on(GROUND, () => add(`<circle class="lamp-glow" cx="${f(x)}" cy="${f(base - 47)}" r="30" fill="url(#glow)" />`));
        return box(x - 8, base - 64, x + 8, base);
    };

    // Buildings standing on the terrace. Each gives its width w, its full height h above base
    // with its roof, and draws itself from its left edge x.
    const roofed = (x, top, w, domed, roof) => {
        if (domed) onion(x, top, w, pick(DOMES));
        else cone(x, top, w, roof, pick(ROOFS), 10);
    };
    const roofHeight = (w, domed, roof) => (domed ? w * 1.15 + 6 : roof + 12);
    const BUILDINGS = [
        // a plain tower with windows
        (base) => {
            const w = int(24, 36), body = int(50, 90), domed = chance(0.3), roof = w * rand(1.3, 2.2);
            return {
                w, h: body + roofHeight(w, domed, roof), draw: (x) => {
                    towerBody(pick(WALLS), x, base - body, w, body);
                    windows(x, base - body, w, body - 10);
                    roofed(x, base - body, w, domed, roof);
                },
            };
        },
        // two towers joined high up by a small arched bridge with a rail
        (base) => {
            const w1 = int(20, 28), w2 = int(20, 28), gap = int(26, 44), b1 = int(60, 100), b2 = int(60, 100);
            const d1 = chance(0.3), d2 = chance(0.3), r1 = w1 * rand(1.3, 2), r2 = w2 * rand(1.3, 2);
            const deck = base - Math.min(b1, b2) + int(14, 24), wall = pick(WALLS);
            return {
                w: w1 + gap + w2, h: Math.max(b1 + roofHeight(w1, d1, r1), b2 + roofHeight(w2, d2, r2)), draw: (x) => {
                    const x2 = x + w1 + gap, a = x + w1, mid = (a + x2) / 2;
                    [[x, w1, b1, d1, r1], [x2, w2, b2, d2, r2]].forEach(([tx, w, b, d, r]) => {
                        towerBody(wall, tx, base - b, w, b);
                        windows(tx, base - b, w, b - 10);
                        roofed(tx, base - b, w, d, r);
                    });
                    add(`<path class="c-cream outline thin" d="M${f(a)} ${f(deck)} H${f(x2)} V${f(deck + 10)} Q${f(mid)} ${f(deck + 2)} ${f(a)} ${f(deck + 10)} Z" />`);
                    add('<g class="outline thin">');
                    for (let px = a + 4; px < x2 - 2; px += 5) add(`<line x1="${f(px)}" y1="${f(deck - 6)}" x2="${f(px)}" y2="${f(deck)}" />`);
                    add(`<line x1="${f(a)}" y1="${f(deck - 6)}" x2="${f(x2)}" y2="${f(deck - 6)}" />`);
                    add('</g>');
                },
            };
        },
        // an open belvedere: a dome on slim columns, over a low plinth
        (base) => {
            const w = int(30, 42), ch = int(20, 28), domed = chance(0.4), dome = w * rand(0.5, 0.65);
            return {
                w, h: 8 + ch + (domed ? w * 1.15 + 6 : dome + 10), draw: (x) => {
                    const top = base - 8 - ch, n = w > 36 ? 4 : 3;
                    add(`<rect class="c-cream outline thin" x="${f(x)}" y="${f(base - 4)}" width="${w}" height="4" />`);
                    for (let i = 0; i < n; i++) {
                        add(`<rect class="c-cream outline thin" x="${f(x + 3 + i * (w - 9) / (n - 1))}" y="${f(top + 4)}" width="3" height="${ch}" />`);
                    }
                    add(`<rect class="c-cream outline" x="${f(x - 2)}" y="${f(top)}" width="${w + 4}" height="4" />`);
                    if (domed) onion(x, top, w, pick(DOMES));
                    else {
                        add(`<path class="${pick(DOMES)} outline" data-shade="sphere" d="M${f(x)} ${f(top)} Q${f(x)} ${f(top - dome)} ${f(x + w / 2)} ${f(top - dome)} Q${f(x + w)} ${f(top - dome)} ${f(x + w)} ${f(top)} Z" />`);
                        add(`<line class="outline thin" x1="${f(x + w / 2)}" y1="${f(top - dome)}" x2="${f(x + w / 2)}" y2="${f(top - dome - 8)}" />`);
                    }
                },
            };
        },
        // a slender tower with a balcony near its top, under a long needle roof
        (base) => {
            const w = int(14, 18), body = int(95, 130), roof = w * rand(2.4, 3.2);
            return {
                w: w + 8, h: body + roof + 14, draw: (x) => {
                    const tx = x + 4, top = base - body, bal = top + int(16, 24);
                    towerBody(pick(WALLS), tx, top, w, body);
                    window_(tx + w / 2, top + 5);
                    windows(tx, bal + 4, w, body - (bal - top) - 8);
                    add('<g class="outline thin">');
                    for (let px = x + 2; px < x + w + 7; px += 4) add(`<line x1="${f(px)}" y1="${f(bal - 6)}" x2="${f(px)}" y2="${f(bal)}" />`);
                    add(`<line x1="${f(x)}" y1="${f(bal - 6)}" x2="${f(x + w + 8)}" y2="${f(bal - 6)}" />`);
                    add('</g>');
                    add(`<rect class="c-cream outline thin" x="${f(x)}" y="${f(bal)}" width="${w + 8}" height="3" />`);
                    cone(tx, top, w, roof, pick(ROOFS), 12);
                },
            };
        },
    ];

    // --- Composition -----------------------------------------------------------------

    // Draws the castle of a seed in place of the current drawing
    const draw = (seed) => {
        state = seed | 0;
        const moment = momentOf(seed);
        document.documentElement.dataset.moment = moment.name;
        parts.length = 0;
        used.length = 0;
        tips.length = 0;

        // The column stands in the core, well clear of the station; the terrace runs from the
        // station to past it
        const colW = int(46, 64);
        const colX = int(CORE[0] + 260, CORE[1] - 170 - colW);
        const tTop = H - int(30, 42);                       // terrace floor
        const tx0 = DOCK - PAVILION - 6;
        const tx1 = Math.min(W - 70, colX + colW + int(150, 400));
        use(box(colX - 4, 0, colX + colW + 4, tTop));       // the column

        // a few faint clouds, each drifting slowly to and fro (.clouds)
        const sky = [], gardens = [];                   // gardens: the shrubs' boxes, for the fireflies
        for (let i = 0, n = int(3, 6); i < n; i++) sky.push(cloud(rand(10, W - 170), rand(30, 150), rand(90, 160)));

        // the elevator's station on the terrace, and the groove its shaft runs down in the wall
        on(BACK, () => use(pavilion(DOCK, tTop)));
        on(TURRETS, () => use(lamp(DOCK + PAVILION + 8, tTop)));
        on(RAIL, () => add(`<rect class="c-arch outline thin" x="${DOCK - 5}" y="${tTop}" width="10" height="${H - tTop}" />`));

        // the great pale column, rising from the terrace to the top of the page
        on(COLUMN, () => {
            add(`<rect class="c-cream-deep" data-shade="cyl" id="castle-column" x="${colX}" y="0" width="${colW}" height="${tTop}" />`);
            add(`<line class="outline thin" x1="${colX}" y1="0" x2="${colX}" y2="${tTop}" />`);
            add(`<line class="outline thin" x1="${colX + colW}" y1="0" x2="${colX + colW}" y2="${tTop}" />`);
        });

        // often, a grand staircase down the front of the terrace, somewhere it has room: away
        // from the station, and well clear of the column and the flights on its face
        let opening = null;
        on(RAIL, () => {
            if (!chance(0.85)) return;
            const wt = int(26, 34), colour = pick(STEPS), runner = chance(0.4);
            for (let i = 0; i < 40; i++) {
                const cx = rand(DOCK + PAVILION + 110, tx1 - 60);
                if (cx + 80 > colX && cx - 80 < colX + colW) continue;
                if (!isFree(box(cx - 50, tTop - 14, cx + 50, H))) continue;
                opening = grandStairs(cx, tTop, wt, colour, runner);
                use(box(opening[0] - 6, tTop - 14, opening[1] + 6, tTop));
                return;
            }
        });

        on(WALL, () => terraceWall(tx0, tx1, tTop));

        // Escher-like flights on the face of the column: one climbs from the terrace to a ledge
        // with a door; sometimes a second one climbs back from that ledge to a higher ledge and
        // door. Everything stays within the column's face.
        let faceTop = tTop;                                 // top of the flights on the column's face
        drum = { cx: colX + colW / 2, r: colW / 2 };
        shadowSide = Math.sign(moment.shadow[0]) || 1;
        on(FACE, () => {
            if (!chance(0.75)) return;
            const dir = chance(0.5) ? 1 : -1;
            const sw = 5, sh = 6, margin = 4, ledgeW = 13;
            const n1 = Math.floor((colW - 2 * margin - ledgeW) / sw);
            const start = dir > 0 ? colX + margin : colX + colW - margin;
            const top1 = { x: start + dir * n1 * sw, y: tTop - n1 * sh };
            const colour = pick(STEPS);
            flight(start, tTop, n1, sw, sh, dir, colour, true);
            const l1 = [top1.x, top1.x + dir * ledgeW].sort((a, b) => a - b);
            ledge(l1[0], l1[1], top1.y, colour);
            let highest = top1.y - 14;
            if (n1 >= 5 && chance(0.55)) {
                // the second flight starts on the inner end of the first ledge, the door on its outer end
                const n2 = n1 - 2, colour2 = pick(STEPS);
                const top2 = { x: top1.x - dir * n2 * sw, y: top1.y - n2 * sh };
                flight(top1.x, top1.y, n2, sw, sh, -dir, colour2, true);
                const l2 = [top2.x, top2.x - dir * ledgeW].sort((a, b) => a - b);
                ledge(l2[0], l2[1], top2.y, colour2);
                door((l2[0] + l2[1]) / 2, top2.y);
                highest = top2.y - 14;
            }
            door(top1.x + dir * (ledgeW - 5), top1.y);
            use(box(colX - 2, highest - 4, colX + colW + 2, tTop));
            faceTop = highest;
        });

        // A few touches on the column, after the palace's great tower: now and then a cornice
        // curving round it over its shadow, a few tall windows above the face's flights, and
        // sometimes a balcony with its door. Drawn from a draw of its own, so the rest of each
        // castle stays the one its seed has always given.
        on(COLUMN, () => {
            const kept = state;
            state = (seed ^ 0x2545f491) | 0;
            const cx = colX + colW / 2, sag = colW * 0.07;
            // a band round the column, its edges curving down as seen from a little above
            const band = (y, h, x0 = colX, x1 = colX + colW) => {
                const mid = (x0 + x1) / 2, dip = 2 * sag * (x1 - x0) / colW;
                return `M${f(x0)} ${f(y)} Q${f(mid)} ${f(y + dip)} ${f(x1)} ${f(y)} V${f(y + h)} Q${f(mid)} ${f(y + h + dip)} ${f(x0)} ${f(y + h)} Z`;
            };
            const cornice = chance(0.3) ? faceTop - int(45, 80) : null;
            if (cornice !== null) {
                add(`<path class="eave" d="${band(cornice + 3, 4)}" />`);
                add(`<path class="c-cream outline thin" data-shade="cyl" d="${band(cornice, 3)}" />`);
            }
            // below and above the cornice: windows, or once a balcony, well above the terrace
            let balcony = chance(0.55);
            const bounds = cornice === null ? [faceTop, -20] : [faceTop, cornice, -20];
            for (let i = 0; i + 1 < bounds.length; i++) {
                const low = bounds[i] - 4, high = bounds[i + 1] + 10, room = low - high;
                if (room < 22) continue;
                if (balcony && room >= 30 && high > 10 && low < tTop - 60) {
                    balcony = false;
                    const floor = low - 4, bw = colW * 0.3;
                    door(cx, floor, 8, 15);
                    add(`<path class="c-cream outline thin" d="M${f(cx - bw * 0.7)} ${f(floor + 3)} Q${f(cx)} ${f(floor + 13)} ${f(cx + bw * 0.7)} ${f(floor + 3)} Z" />`);
                    add(`<path class="c-cream outline thin" data-shade="cyl" d="${band(floor, 3, cx - bw, cx + bw)}" />`);
                    add('<g class="outline fine">');
                    for (let px = cx - bw + 1.5; px < cx + bw - 1; px += 2.6) add(`<line x1="${f(px)}" y1="${f(floor - 6)}" x2="${f(px)}" y2="${f(floor + sag * 0.6)}" />`);
                    add('</g>');
                    add(`<path class="outline thin" fill="none" d="M${f(cx - bw)} ${f(floor - 6)} Q${f(cx)} ${f(floor - 6 + 2 * sag * 0.6)} ${f(cx + bw)} ${f(floor - 6)}" />`);
                    continue;
                }
                if (chance(0.6)) window_(cx, high + (room - 12) / 2, Math.min(8, colW / 2 - 1), 5, 12);
            }
            state = kept;
        });

        // an arcade on the terrace, beside the column
        on(BACK, () => {
            if (!chance(0.6)) return;
            const w = int(80, 130), h = int(36, 52);
            const x = chance(0.5) ? colX + colW + int(14, 40) : colX - int(14, 40) - w;
            const b = box(x - 4, tTop - h - 12, x + w + 4, tTop);
            const clear = !opening || x + w < opening[0] - 4 || x > opening[1] + 4;
            if (x >= tx0 + 6 && x + w <= tx1 - 6 && clear && isFree(b)) { use(b); arcade(x, tTop, w, h); }
        });

        // two to four buildings along the terrace, well apart, and away from the column so the
        // turrets keep room to hang
        on(BACK, () => {
            for (let k = pick([2, 3, 3, 4]); k > 0; k--) {
                const building = pick(BUILDINGS)(tTop);
                for (let i = 0; i < 40; i++) {
                    const x = rand(tx0 + 6, tx1 - 6 - building.w);
                    if (x + building.w > colX - 70 && x < colX + colW + 70) continue;
                    if (opening && x + building.w > opening[0] - 10 && x < opening[1] + 10) continue;
                    const b = box(x - 14, tTop - building.h, x + building.w + 14, tTop);
                    if (!isFree(b)) continue;
                    use(b);
                    building.draw(x);
                    break;
                }
            }
        });

        // trimmed shrubs along the terrace
        const shrubsAt = (base) => [
            () => { const w = int(40, 80), h = int(12, 18); return { w, h: h + 5, draw: (x) => crenelHedge(x, base, w, h) }; },
            () => { const w = int(24, 50), h = int(10, 16); return { w, h, draw: (x) => boxHedge(x, base, w, h) }; },
            () => { const w = int(14, 20), h = int(26, 38); return { w, h: h + w * 0.44, draw: (x) => coneShrub(x, base, w, h) }; },
            () => { const w = int(16, 26); return { w, h: w * 0.55, draw: (x) => domeShrub(x, base, w) }; },
            () => { const w = int(10, 14); return { w, h: w * 2.7, draw: (x) => topiary(x, base, w) }; },
        ];
        on(SHRUBS, () => {
            const shrubs = shrubsAt(tTop);
            for (let i = 0, n = Math.round(int(3, 6) * (tx1 - tx0) / 450); i < n; i++) {
                const shrub = pick(shrubs)();
                for (let tries = 0; tries < 30; tries++) {
                    const x = rand(tx0 + 6, tx1 - 6 - shrub.w);
                    if (opening && x + shrub.w > opening[0] - 3 && x < opening[1] + 3) continue;
                    if (!isFree(box(x - 3, tTop - shrub.h, x + shrub.w + 3, tTop))) continue;
                    gardens.push(use(shrub.draw(x)));
                    break;
                }
            }
        });

        // When the terrace stops well short of the right edge, the castle goes on: either an
        // arched viaduct carrying the terrace out of the picture, towards the rest of the
        // kingdom, or a lower garden terrace reached by a short flight against the end wall
        let railEnd = tx1;
        if (W - tx1 > 120) {
            if (chance(0.5)) {
                on(WALL, () => viaduct(tx1, W + 10, tTop));
                railEnd = W + 10;
            } else {
                const low = tTop + int(10, 14), n = Math.round((low - tTop) / 5), foot = tx1 + n * 5;
                on(WALL, () => terraceWall(tx1, W + 10, low));
                on(SHRUBS, () => flight(foot, low, n, 5, (low - tTop) / n, -1, pick(STEPS)));
                on(RAIL, () => balustrade(foot + 4, W + 10, low));
                railEnd = tx1 - 10;
                // its garden: a few shrubs, and sometimes a small building
                const room = (x, w, h) => isFree(box(x - 3, low - h, x + w + 3, low)) && x > foot + 6 && x + w < W - 20;
                if (chance(0.5)) on(BACK, () => {
                    const building = pick([BUILDINGS[0], BUILDINGS[2], BUILDINGS[3]])(low);
                    for (let i = 0; i < 20; i++) {
                        const x = rand(foot + 10, W - 20 - building.w);
                        if (!room(x - 10, building.w + 20, building.h)) continue;
                        use(box(x - 10, low - building.h, x + building.w + 10, low));
                        building.draw(x);
                        break;
                    }
                });
                on(SHRUBS, () => {
                    const shrubs = shrubsAt(low);
                    for (let i = 0, k = int(2, 4); i < k; i++) {
                        const shrub = pick(shrubs)();
                        for (let tries = 0; tries < 30; tries++) {
                            const x = rand(foot + 8, W - 20 - shrub.w);
                            if (!room(x, shrub.w, shrub.h)) continue;
                            gardens.push(use(shrub.draw(x)));
                            break;
                        }
                    }
                });
            }
        }
        on(RAIL, () => balustrade(DOCK + PAVILION, railEnd, tTop, opening));

        // The turret clusters: one to three small round heaps hanging from the column, on either
        // side. Each grows inside a rounded area beside the column; a turret hangs either from the
        // column (its body overlapping the column's edge) or from a turret already hung, below,
        // above or beside it. Turrets may run off the top of the drawing, like the column.
        const ceiling = -70, floorY = tTop - 14;
        const turretBox = (t) => box(t.x - 4, t.yt - (t.onion ? t.w * 1.15 + 6 : t.roof + t.needle + 2), t.x + t.w + 4, t.yt + t.h + t.w * 0.55 + 4);
        const newTurret = (w) => {
            const isOnion = chance(0.3);
            return {
                w, h: w * rand(1.0, 1.7), onion: isOnion,
                roof: w * rand(1.0, 1.8), needle: rand(5, 12),
                roofColour: isOnion ? pick(DOMES) : pick(ROOFS),
                wall: pick(WALLS),
            };
        };

        // the column is the turrets' support, so it doesn't count as an obstacle for them
        const obstacles = used.slice(1);
        const turrets = [];

        // Two overlapping turrets: the lower one is nearer and drawn in front. Its roof may cover
        // the bottom of the upper one, as long as the upper one's roof and the top of its body
        // stay visible; one right below another leaves at least the upper half of it visible
        const roofTip = (t) => t.yt - (t.onion ? t.w * 1.15 : t.roof);
        const fits = (t, o) => {
            if (!hits(turretBox(o), turretBox(t))) return true;
            const apart = Math.abs(o.x + o.w / 2 - (t.x + t.w / 2));
            const [upper, lower] = o.yt < t.yt ? [o, t] : [t, o];
            if (apart >= 0.55 * (o.w + t.w) / 2) return true;
            if (apart < 0.35 * Math.min(o.w, t.w)) return roofTip(lower) > upper.yt + upper.h * 0.5;
            return roofTip(lower) > upper.yt + upper.h * 0.3 && lower.yt > upper.yt + upper.h * 0.6;
        };

        // band: the range of heights the cluster's centre may take
        const cluster = (out, count, band) => {
            const edge = out < 0 ? colX : colX + colW;
            const R = rand(40, 62);
            const Ry = R * rand(1.0, 1.4);
            const cy = rand(Math.max(band[0], 10), Math.min(band[1], floorY - Ry * 0.6));
            const cx = edge + out * R * rand(0.35, 0.55);
            const inside = (t) => ((t.x + t.w / 2 - cx) / R) ** 2 + ((t.yt + t.h / 2 - cy) / Ry) ** 2 <= 1;
            const mine = [];
            for (let tries = 0; mine.length < count && tries < 2500; tries++) {
                const parent = mine.length && chance(0.75) ? pick(mine) : null;
                let t;
                if (parent) {
                    // below, above or beside the parent, about its size
                    t = newTurret(Math.max(14, Math.round(parent.w * rand(0.7, 1.05))));
                    const pcx = parent.x + parent.w / 2;
                    const roofLength = (u) => u.yt - roofTip(u);
                    const where = random();
                    if (where < 0.4) {
                        // below, in front: its roof covers the bottom of the parent
                        t.x = pcx + rand(-0.35, 0.35) * parent.w - t.w / 2;
                        t.yt = parent.yt + parent.h * rand(0.5, 0.75) + roofLength(t);
                    } else if (where < 0.7) {
                        // above, behind: the parent's roof covers its bottom
                        t.x = pcx + rand(-0.35, 0.35) * parent.w - t.w / 2;
                        t.yt = parent.yt - roofLength(parent) - t.h * rand(0.5, 0.75);
                    } else {
                        // beside
                        t.x = pcx + (chance(0.5) ? 1 : -1) * (parent.w + t.w) / 2 * rand(0.6, 0.95) - t.w / 2;
                        t.yt = parent.yt + rand(-0.5, 0.5) * parent.h;
                    }
                } else {
                    // hanging from the column's edge, near the cluster's centre height
                    t = newTurret(pick([22, 26, 30, 34, 38]));
                    t.x = out < 0 ? edge - t.w * rand(0.55, 0.8) : edge - t.w * rand(0.2, 0.45);
                    t.yt = cy + rand(-0.7, 0.4) * Ry - t.h / 2;
                }
                if (!inside(t)) continue;
                const b = turretBox(t);
                if (b.x0 < CORE[0] + 2 || b.x1 > CORE[1] - 2 || b.y0 < ceiling || b.y1 > floorY) continue;
                // stay on the cluster's side of the column
                if (out < 0 ? t.x + t.w > edge + t.w * 0.5 : t.x < edge - t.w * 0.5) continue;
                if (obstacles.some((o) => hits(o, b))) continue;
                if (!turrets.concat(mine).every((o) => fits(t, o))) continue;
                mine.push(t);
            }
            turrets.push(...mine);
        };

        // one to three clusters, alternating sides; those on the same side share its height
        const first = chance(0.5) ? 1 : -1;
        const sides = [first, -first, chance(0.5) ? 1 : -1].slice(0, pick([1, 2, 2, 2, 3, 3]));
        [1, -1].forEach((out) => {
            const here = sides.filter((s) => s === out).length;
            const top = 10, bottom = floorY - 50, band = (bottom - top) / Math.max(1, here);
            for (let k = 0; k < here; k++) cluster(out, int(4, 8), [top + k * band, top + (k + 1) * band]);
        });

        // nearer turrets (lower) drawn last
        on(TURRETS, () => turrets.sort((a, b) => (a.yt + a.h) - (b.yt + b.h)).forEach((t) => {
            const { x, yt, w, h } = t;
            const yb = yt + h, cx = x + w / 2, tip = yb + w * 0.55;
            add('<g data-turret="">');
            add(`<path class="${t.wall} outline" data-shade="cyl" d="M${f(x)} ${f(yt)} V${f(yb)} Q${f(x)} ${f(yb + w * 0.25)} ${f(cx)} ${f(tip)} Q${f(x + w)} ${f(yb + w * 0.25)} ${f(x + w)} ${f(yb)} V${f(yt)} Z" />`);
            add(`<path class="outline thin" fill="none" d="M${f(x)} ${f(yb)} Q${f(cx)} ${f(yb + w * 0.12)} ${f(x + w)} ${f(yb)}" />`);
            eave(x, yt, w);
            add(`<circle class="c-gold outline thin" cx="${f(cx)}" cy="${f(tip + 2)}" r="1.8" />`);
            windows(x, yt, w, h);
            if (t.onion) onion(x, yt, w, t.roofColour);
            else cone(x, yt, w, t.roof, t.roofColour, t.needle);
            add('</g>');
        }));

        on(GROUND, () => add(`<line class="outline" x1="0" y1="${H - 1}" x2="${W}" y2="${H - 1}" />`));

        // Draw back to front, with a painted texture multiplied into the flat colours, like
        // gouache on paper: a fine mottle, and broad uneven patches as left by a brush; then the
        // colour of the moment's light (.daylight). The arithmetic products keep see-through
        // edges from being greyed by the texture.
        const drawing = parts.sort((a, b) => a[0] - b[0] || a[1] - b[1]).map((p) => p[2]).join("");
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        // for elevator.js: the terrace floor, the pulley's foot and the shaft's place
        svg.dataset.dock = (tTop / H).toFixed(4);
        svg.dataset.pulley = ((tTop - PULLEY + PULLEY_R) / H).toFixed(4);
        svg.dataset.dockX = (DOCK / W).toFixed(4);
        // the shading laid over rounded pieces, sized to each piece and lit from the moment's side
        const stops = (list) => list.map(([at, tone, alpha]) => `<stop offset="${at}" class="shade-${tone}" stop-opacity="${alpha}" />`).join("");
        const cylinder = stops([[0, "dark", 0.22], [0.28, "light", 0.3], [0.5, "light", 0], [0.52, "dark", 0], [1, "dark", 0.42]]);
        const shading = `
            <linearGradient id="cyl"${moment.side > 0 ? ' x1="1" x2="0"' : ""}>${cylinder}</linearGradient>
            <linearGradient id="face" gradientUnits="userSpaceOnUse" y1="0" y2="0" x1="${moment.side > 0 ? colX + colW : colX}" x2="${moment.side > 0 ? colX : colX + colW}">${cylinder}</linearGradient>
            <radialGradient id="sphere" cx="${0.5 + 0.14 * moment.side}" cy="0.3" r="0.8">${stops([[0, "light", 0.4], [0.45, "light", 0], [0.5, "dark", 0], [1, "dark", 0.4]])}</radialGradient>
            <linearGradient id="wall" x2="0" y2="1">${stops([[0, "dark", 0.32], [0.22, "dark", 0], [0.7, "dark", 0], [1, "dark", 0.14]])}</linearGradient>
            <radialGradient id="firefly-glow"><stop offset="0" class="glow" stop-opacity="0.9" /><stop offset="0.35" class="glow" stop-opacity="0.35" /><stop offset="1" class="glow" stop-opacity="0" /></radialGradient>
            <radialGradient id="glow"><stop offset="0" class="glow" stop-opacity="0.7" /><stop offset="0.25" class="glow" stop-opacity="0.35" /><stop offset="1" class="glow" stop-opacity="0" /></radialGradient>
            <radialGradient id="window-light"><stop offset="0" class="glow" stop-opacity="0.85" /><stop offset="0.5" class="glow" stop-opacity="0.45" /><stop offset="1" class="glow" stop-opacity="0" /></radialGradient>
            <linearGradient id="lit" x2="0" y2="1">${stops([[0, "light", 0.32], [0.45, "light", 0], [0.5, "dark", 0], [1, "dark", 0.3]])}</linearGradient>`;
        const pct = (v, of) => `${(100 * v / of).toFixed(2)}%`;
        // the sun where the moment puts it, with a soft halo; by night, the moon in its phase,
        // the rest of its disc faintly seen
        const [sx, sy, sr] = moment.sun;
        const sun = `<svg class="sun" viewBox="${sx - 3 * sr} ${sy - 3 * sr} ${6 * sr} ${6 * sr}" style="left: ${pct(sx - 3 * sr, W)}; top: ${pct(sy - 3 * sr, H)}; width: ${pct(6 * sr, W)}">`
            + '<defs><radialGradient id="sun-halo"><stop offset="0.3" class="sun-light" stop-opacity="0.55" /><stop offset="1" class="sun-light" stop-opacity="0" /></radialGradient></defs>'
            + `<circle class="sun-halo" cx="${sx}" cy="${sy}" r="${3 * sr}" fill="url(#sun-halo)" /><circle class="sun-disc" filter="url(#gouache)" cx="${sx}" cy="${sy}" r="${sr}" />`
            + `<circle class="moon-dark" cx="${sx}" cy="${sy}" r="${sr}" /><path class="moon-lit" filter="url(#gouache)" d="${moonLit(sx, sy, sr, phaseOf(seed))}" /></svg>`;
        // by night, stars across the upper sky, a few of them twinkling (.stars)
        const stars = Array.from({ length: 34 }, () => {
            const twinkle = Math.random() < 0.4
                ? ` class="twinkle" style="animation-duration: ${(2 + Math.random() * 4).toFixed(1)}s; animation-delay: -${(Math.random() * 6).toFixed(1)}s"`
                : "";
            return `<circle${twinkle} cx="${f(Math.random() * W)}" cy="${f(Math.random() * H * 0.55)}" r="${f(0.5 + Math.random() * 0.7)}" />`;
        }).join("");
        clouds.innerHTML = `<svg class="stars" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${stars}</svg>` + sun + sky.map((c) => {
            const drift = (Math.random() < 0.5 ? -1 : 1) * (25 + Math.random() * 35);
            return `<svg viewBox="${f(c.x)} ${f(c.y)} ${f(c.w)} ${f(c.h)}" style="left: ${pct(c.x, W)}; top: ${pct(c.y, H)}; width: ${pct(c.w, W)}; --drift: ${drift.toFixed(0)}%; animation-duration: ${(45 + Math.random() * 45).toFixed(0)}s; animation-delay: -${(Math.random() * 90).toFixed(0)}s"><g class="cloud ${c.tone}" filter="url(#gouache)">${c.shapes}</g></svg>`;
        }).join("");

        // two to four pennants flying from some of the highest needles in sight (.pennants)
        const highest = tips.filter((t) => t.y > 8).sort((a, b) => a.y - b.y).slice(0, 8);
        const flown = [];
        for (let k = Math.min(int(2, 4), highest.length); k > 0; k--) flown.push(highest.splice(int(0, highest.length - 1), 1)[0]);
        pennants.innerHTML = flown.map((t) => `<svg class="pennant" viewBox="0 0 14 7" style="left: ${pct(t.x, W)}; top: ${pct(t.y, H)}; width: ${pct(14, W)}; animation-duration: ${(1.4 + Math.random()).toFixed(2)}s; animation-delay: -${(Math.random() * 2).toFixed(2)}s"><path class="${pick(FLAGS)} outline thin" filter="url(#gouache)" d="M0.5 0.5 L13 3.2 L0.5 6 Z" /></svg>`).join("")
            // at dusk and by night, a few fireflies over the gardens, drifting and glowing (.firefly)
            + gardens.sort(() => Math.random() - 0.5).slice(0, 4).map((g) => {
                const x = g.x0 + Math.random() * (g.x1 - g.x0), y = g.y0 - 4 - Math.random() * 12;
                const drift = (n) => `${((Math.random() - 0.5) * n).toFixed(0)}`;
                return `<svg class="firefly" viewBox="-6 -6 12 12" style="left: ${pct(x - 6, W)}; top: ${pct(y - 6, H)}; width: ${pct(12, W)}; --dx: ${drift(260)}%; --dy: ${drift(160)}%; animation-duration: ${(5 + Math.random() * 5).toFixed(1)}s, ${(6 + Math.random() * 5).toFixed(1)}s; animation-delay: -${(Math.random() * 8).toFixed(1)}s, -${(Math.random() * 10).toFixed(1)}s">`
                    + '<circle r="6" fill="url(#firefly-glow)" /><circle class="firefly-core" r="0.9" /></svg>';
            }).join("");
        svg.innerHTML = `<defs>${shading}<filter id="gouache" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.7 0.35" numOctaves="3" seed="${seed % 1000}" result="fine" />
            <feColorMatrix in="fine" type="saturate" values="0" result="fineGrey" />
            <feComponentTransfer in="fineGrey" result="mottle">
                <feFuncR type="linear" slope="0.7" intercept="0.56" />
                <feFuncG type="linear" slope="0.7" intercept="0.56" />
                <feFuncB type="linear" slope="0.7" intercept="0.56" />
                <feFuncA type="linear" slope="0" intercept="1" />
            </feComponentTransfer>
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="${(seed >>> 10) % 1000}" result="broad" />
            <feColorMatrix in="broad" type="saturate" values="0" result="broadGrey" />
            <feComponentTransfer in="broadGrey" result="patches">
                <feFuncR type="linear" slope="0.45" intercept="0.74" />
                <feFuncG type="linear" slope="0.45" intercept="0.74" />
                <feFuncB type="linear" slope="0.45" intercept="0.74" />
                <feFuncA type="linear" slope="0" intercept="1" />
            </feComponentTransfer>
            <feBlend in="mottle" in2="patches" mode="multiply" result="paint" />
            <feComposite in="SourceGraphic" in2="paint" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="painted" />
            <feFlood class="daylight" result="light" />
            <feComposite in="painted" in2="light" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" />
            </filter></defs><g filter="url(#gouache)">${drawing}</g>`;

        // Freehand lines: every straight segment is redrawn as a slightly bowed curve, as if drawn
        // without a ruler; curves stay as they are. Done on the vector paths, so lines stay smooth.
        const ARGS = { M: 2, L: 2, H: 1, V: 1, Q: 4, C: 6, A: 7, Z: 0 };
        const freehand = (d) => {
            const tokens = d.match(/[MLHVQCAZ]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/gi) || [];
            let i = 0, x = 0, y = 0, sx = 0, sy = 0, out = "";
            const num = () => parseFloat(tokens[i++]);
            const bow = (x2, y2) => {
                const len = Math.hypot(x2 - x, y2 - y);
                if (len < 6) return ` L${f(x2)} ${f(y2)}`;
                const o = rand(-1, 1) * Math.min(1.3, len * 0.02);
                const mx = (x + x2) / 2 - ((y2 - y) / len) * o, my = (y + y2) / 2 + ((x2 - x) / len) * o;
                return ` Q${f(mx)} ${f(my)} ${f(x2)} ${f(y2)}`;
            };
            while (i < tokens.length) {
                let cmd = tokens[i++];
                do {
                    const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
                    const ox = rel ? x : 0, oy = rel ? y : 0;
                    if (C === "M") { x = sx = num() + ox; y = sy = num() + oy; out += ` M${f(x)} ${f(y)}`; cmd = rel ? "l" : "L"; }
                    else if (C === "L") { const nx = num() + ox, ny = num() + oy; out += bow(nx, ny); x = nx; y = ny; }
                    else if (C === "H") { const nx = num() + ox; out += bow(nx, y); x = nx; }
                    else if (C === "V") { const ny = num() + oy; out += bow(x, ny); y = ny; }
                    else if (C === "Q") { const a = [num() + ox, num() + oy, num() + ox, num() + oy]; out += ` Q${a.map(f).join(" ")}`; [x, y] = a.slice(2); }
                    else if (C === "C") { const a = [num() + ox, num() + oy, num() + ox, num() + oy, num() + ox, num() + oy]; out += ` C${a.map(f).join(" ")}`; [x, y] = a.slice(4); }
                    else if (C === "A") {
                        // the rotation and the two flags must stay plain integers
                        const a = [num(), num(), num(), num(), num(), num() + ox, num() + oy];
                        out += ` A${f(a[0])} ${f(a[1])} ${a[2]} ${a[3]} ${a[4]} ${f(a[5])} ${f(a[6])}`;
                        [x, y] = a.slice(5);
                    }
                    else if (C === "Z") { out += bow(sx, sy) + " Z"; x = sx; y = sy; break; }
                } while (i < tokens.length && !/[a-z]/i.test(tokens[i]));
            }
            return out.trim();
        };
        const asPath = (el, d) => {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            [...el.attributes].forEach((a) => { if (!/^(x|y|x1|y1|x2|y2|width|height)$/.test(a.name)) path.setAttribute(a.name, a.value); });
            if (el.tagName === "line") path.setAttribute("fill", "none");
            path.setAttribute("d", d);
            el.replaceWith(path);
        };
        svg.querySelectorAll("g path").forEach((p) => p.setAttribute("d", freehand(p.getAttribute("d"))));
        svg.querySelectorAll("g line").forEach((l) => {
            const [x1, y1, x2, y2] = ["x1", "y1", "x2", "y2"].map((a) => +l.getAttribute(a));
            asPath(l, freehand(`M${x1} ${y1} L${x2} ${y2}`));
        });
        svg.querySelectorAll("g rect:not([rx])").forEach((r) => {
            const [x, y, w, h] = ["x", "y", "width", "height"].map((a) => +r.getAttribute(a));
            asPath(r, freehand(`M${x} ${y} H${x + w} V${y + h} H${x} Z`));
        });

        // Volume: over each piece marked data-shade, a copy of its final outline filled with the
        // shading, so the two match exactly
        svg.querySelectorAll("[data-shade]").forEach((el) => {
            const shade = el.cloneNode();
            shade.setAttribute("class", "shade");
            shade.setAttribute("fill", `url(#${el.dataset.shade})`);
            shade.removeAttribute("data-shade");
            shade.removeAttribute("id");
            el.after(shade);
        });

        // Cast shadows: each turret throws its shadow away from the light, long when the sun is
        // low, onto the column and the turrets behind it only, through a mask made of
        // everything drawn behind it so far
        const defs = svg.querySelector("defs");
        const behind = ["castle-column"];
        svg.querySelectorAll("[data-turret]").forEach((turret, k) => {
            turret.id = `turret-${k}`;
            defs.insertAdjacentHTML("beforeend", `<mask id="behind-${k}" style="mask-type: alpha" maskUnits="userSpaceOnUse" x="0" y="${ceiling}" width="${W}" height="${H - ceiling}">${behind.map((id) => `<use href="#${id}" />`).join("")}</mask>`);
            const cast = document.createElementNS("http://www.w3.org/2000/svg", "g");
            const shadow = turret.cloneNode(true);
            cast.setAttribute("mask", `url(#behind-${k})`);
            shadow.removeAttribute("id");
            shadow.removeAttribute("data-turret");
            shadow.setAttribute("class", "cast");
            shadow.setAttribute("transform", `translate(${moment.shadow[0]} ${moment.shadow[1]})`);
            cast.append(shadow);
            turret.before(cast);
            behind.push(turret.id);
        });

        svg.dispatchEvent(new Event("castle-drawn", { bubbles: true }));
    };

    // The layers laid over the drawing: the clouds' behind it, the pennants' over it
    const clouds = document.createElement("div");
    clouds.className = "clouds";
    clouds.setAttribute("aria-hidden", "true");
    svg.before(clouds);
    const pennants = document.createElement("div");
    pennants.className = "pennants";
    pennants.setAttribute("aria-hidden", "true");
    svg.after(pennants);

    // The castle's ID under the drawing, editable (each valid ID typed draws its castle at
    // once, and the address follows), after a bell pull hanging from the drawing that draws a
    // new castle when pulled, and before a button that copies a link to this castle

    const ID = /^[0-9a-z]{1,7}$/;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const icon = (d) => `<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="${d}" /></svg>`;
    const ICONS = {
        copy: "M6 6 H12.5 V12.5 H6 Z M3.5 10 V3.5 H10",
        done: "M3 8.5 L6.5 12 L13 4.5",
    };
    const tag = document.createElement("p");
    tag.className = "castle-id";
    tag.innerHTML = '<button type="button" class="castle-cord" title="Pull: a new castle" aria-label="Draw a new castle">'
        + '<svg viewBox="0 0 18 46" aria-hidden="true" focusable="false"><g filter="url(#gouache)">'
        + '<path class="rope outline thin" fill="none" d="M9 0 V26" />'
        + '<g class="tassel" transform="translate(9 26)">'
        + '<path class="c-gold outline thin" d="M-2.8 0 Q0 -2.3 2.8 0 V4 H-2.8 Z" />'
        + '<path class="c-red outline thin" d="M-2.8 4 H2.8 L5.1 15 Q0 17.8 -5.1 15 Z" />'
        + '<path class="outline fine" fill="none" d="M-2.8 15.5 V18.3 M0 16.3 V19 M2.8 15.5 V18.3" />'
        + '</g></g></svg></button>'
        + '<label for="castle-id">castle id</label>'
        + '<input id="castle-id" type="text" maxlength="7" spellcheck="false" autocomplete="off" title="Type another ID to draw its castle" aria-label="Castle ID, type another to draw its castle">'
        + `<button type="button" class="castle-tool" data-tool="copy" title="Copy a link to this castle" aria-label="Copy a link to this castle">${icon(ICONS.copy)}</button>`
        + '<span class="visually-hidden" role="status"></span>';
    const input = tag.querySelector("input");
    const status = tag.querySelector('[role="status"]');
    const randomId = () => (Math.floor(Math.random() * 2 ** 32) >>> 0).toString(36);

    let current = "";
    const show = (id) => {
        current = id;
        draw(parseInt(id, 36) >>> 0);
    };

    // IDs fill the field's 7 characters: select it all on focus, so typing replaces it
    input.addEventListener("focus", () => setTimeout(() => input.select()));
    input.addEventListener("input", () => {
        const id = input.value.trim().toLowerCase();
        input.setAttribute("aria-invalid", String(!ID.test(id)));
        if (!ID.test(id)) return;
        show(id);
        history.replaceState(null, "", `?castle=${id}${location.hash}`);
    });

    // The bell pull: a rope of a few links hanging from the drawing's foot, simulated (Verlet
    // integration) so it bends and swings like a real one, pulled down by gravity, its tassel
    // heavier than the rope, stirred by a light, shifting breeze and by the pointer brushing
    // through it. Pulled by its tassel, the rope follows the hand, bending, and beyond its length
    // stretches, ever harder, then springs back. Pulled far enough, or simply clicked (or
    // tapped), it rings for a new castle.
    const cord = tag.querySelector(".castle-cord");
    const rope = cord.querySelector(".rope"), tassel = cord.querySelector(".tassel");
    const ring = () => {
        input.value = randomId();
        input.dispatchEvent(new Event("input"));
    };
    const LINKS = 8, LENGTH = 26, ANCHOR = { x: 9, y: 0 };        // pixels, in the cord's picture
    const knots = Array.from({ length: LINKS + 1 }, (_, i) => {
        const y = ANCHOR.y + LENGTH * i / LINKS;
        return { x: ANCHOR.x, y, px: ANCHOR.x, py: y };
    });
    const tip = knots[LINKS];
    let stretch = 1, spring = 0, grip = null, dragged = false, passing = null, time = 0, last = 0;
    // how easily each knot moves: the anchor not at all, the tassel heavy, and while held, not at all
    const give = (i) => (i === 0 || (grip && i === LINKS) ? 0 : i === LINKS ? 0.35 : 1);

    const step = (dt) => {
        const breeze = 60 * Math.sin(0.7 * time) + 25 * Math.sin(1.9 * time + 1);
        const keep = Math.pow(0.3, dt);                     // the air takes 70% of the speed each second
        knots.forEach((k, i) => {
            if (!give(i)) return;
            const vx = (k.x - k.px) * keep, vy = (k.y - k.py) * keep;
            k.px = k.x;
            k.py = k.y;
            k.x += vx + breeze * dt * dt;
            k.y += vy + 850 * dt * dt;
        });
        // the rope's length: a stiff, bouncy spring, stretched only by a pull
        if (!grip) {
            spring += (-260 * (stretch - 1) - 9 * spring) * dt;
            stretch += spring * dt;
        }
        const link = LENGTH * stretch / LINKS;
        for (let pass = 0; pass < 12; pass++) {
            for (let i = 0; i < LINKS; i++) {
                const a = knots[i], b = knots[i + 1], ga = give(i), gb = give(i + 1);
                if (!ga && !gb) continue;
                const dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy) || 1e-6;
                const share = (length - link) / length / (ga + gb);
                a.x += dx * share * ga;
                a.y += dy * share * ga;
                b.x -= dx * share * gb;
                b.y -= dy * share * gb;
            }
        }
    };
    // the rope as a smooth curve through its knots, and the tassel hanging along its last link
    const paint = () => {
        let d = `M${f(knots[0].x)} ${f(knots[0].y)}`;
        for (let i = 1; i < LINKS; i++) {
            const a = knots[i], b = knots[i + 1];
            d += ` Q${f(a.x)} ${f(a.y)} ${f((a.x + b.x) / 2)} ${f((a.y + b.y) / 2)}`;
        }
        d += ` L${f(tip.x)} ${f(tip.y)}`;
        rope.setAttribute("d", d);
        const turn = -Math.atan2(tip.x - knots[LINKS - 1].x, tip.y - knots[LINKS - 1].y) * 180 / Math.PI;
        tassel.setAttribute("transform", `translate(${f(tip.x)} ${f(tip.y)}) rotate(${f(turn)})`);
    };
    const tick = (now) => {
        const dt = Math.min(1 / 30, (now - last) / 1000 || 1 / 60);
        last = now;
        time += dt;
        if (inView) {
            step(dt);
            paint();
        }
        requestAnimationFrame(tick);
    };
    if (!reducedMotion.matches) requestAnimationFrame(tick);

    // where the pointer is, in the cord's picture
    const local = (event) => {
        const r = cord.querySelector("svg").getBoundingClientRect();
        return { x: event.clientX - r.left, y: event.clientY - r.top };
    };

    // brushed by the pointer: the knots it passes through are carried along a little
    addEventListener("pointermove", (event) => {
        const was = passing;
        passing = local(event);
        if (grip || !was || event.pointerType === "touch") return;
        knots.forEach((k, i) => {
            if (!give(i) || Math.hypot(k.x - passing.x, k.y - passing.y) > 7) return;
            k.px -= Math.max(-1.2, Math.min(1.2, (passing.x - was.x) * 0.2));
            k.py -= Math.max(-1.2, Math.min(1.2, (passing.y - was.y) * 0.2));
        });
    }, { passive: true });

    // pulled by the tassel: it follows the pointer, the rope stretching less and less beyond
    // its length
    cord.addEventListener("pointerdown", (event) => {
        if (reducedMotion.matches) return;
        const at = local(event);
        grip = { x: tip.x - at.x, y: tip.y - at.y, from: at };
        dragged = false;
        cord.setPointerCapture(event.pointerId);
    });
    cord.addEventListener("pointermove", (event) => {
        if (!grip) return;
        const at = local(event);
        if (Math.hypot(at.x - grip.from.x, at.y - grip.from.y) > 4) dragged = true;
        const tx = at.x + grip.x - ANCHOR.x, ty = at.y + grip.y - ANCHOR.y, reach = Math.hypot(tx, ty) || 1e-6;
        stretch = 1 + 0.45 * (1 - Math.exp(-Math.max(0, reach - LENGTH) / LENGTH));
        spring = 0;
        const held = Math.min(reach, LENGTH * stretch);
        tip.x = tip.px = ANCHOR.x + tx / reach * held;
        tip.y = tip.py = ANCHOR.y + ty / reach * held;
    });
    const release = () => {
        if (!grip) return;
        grip = null;
        if (dragged && stretch > 1.15) ring();
    };
    cord.addEventListener("pointerup", release);
    cord.addEventListener("pointercancel", release);
    // a click, a tap or the keyboard: a short tug, and the bell rings
    cord.addEventListener("click", () => {
        if (dragged) {
            dragged = false;
            return;
        }
        spring += 6;
        tip.py -= 3;
        tip.px -= (Math.random() - 0.5) * 3;
        ring();
    });

    const copy = tag.querySelector('[data-tool="copy"]');
    let restore = 0;
    copy.addEventListener("click", async () => {
        const link = new URL(location.href);
        link.search = `?castle=${current}`;
        link.hash = "";
        try {
            await navigator.clipboard.writeText(link.href);
            status.textContent = "Link copied";
        } catch {
            status.textContent = "Could not copy the link";
            return;
        }
        copy.innerHTML = icon(ICONS.done);
        copy.classList.add("is-done");
        clearTimeout(restore);
        restore = setTimeout(() => {
            copy.innerHTML = icon(ICONS.copy);
            copy.classList.remove("is-done");
            status.textContent = "";
        }, 1600);
    });
    svg.after(tag);

    // At night, now and then a window lights up or goes dark, while the castle is in view
    let inView = true;
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }).observe(svg);
    const flicker = () => {
        const night = getComputedStyle(document.documentElement).colorScheme === "dark";
        if (inView && night && !document.hidden && !reducedMotion.matches) {
            const panes = [...svg.querySelectorAll(".c-window, .c-window-dark")].filter((pane) => !pane.closest(".cast"));
            const pane = panes[Math.floor(Math.random() * panes.length)];
            if (pane) {
                const lit = pane.classList.contains("c-window");
                pane.setAttribute("class", lit ? "c-window-dark" : "c-window");
                pane.previousElementSibling.classList.toggle("is-off", lit);
            }
        }
        setTimeout(flicker, 2500 + Math.random() * 4000);
    };
    setTimeout(flicker, 4000);

    // By day, now and then a bird crosses the sky behind the castle, beating its wings
    const flyBird = () => {
        const day = getComputedStyle(document.documentElement).colorScheme !== "dark";
        if (inView && day && !document.hidden && !reducedMotion.matches) {
            const bird = document.createElement("div");
            bird.className = Math.random() < 0.5 ? "bird" : "bird leftward";
            bird.style.top = `${(8 + Math.random() * 30).toFixed(1)}%`;
            bird.style.animationDuration = `${(14 + Math.random() * 8).toFixed(1)}s`;
            bird.innerHTML = '<span><svg viewBox="0 0 14 6"><path d="M1 4.5 Q4 0.5 7 4 Q10 0.5 13 4.5" /></svg></span>';
            bird.addEventListener("animationend", (event) => { if (event.target === bird) bird.remove(); });
            clouds.append(bird);
        }
        setTimeout(flyBird, 18000 + Math.random() * 25000);
    };
    setTimeout(flyBird, 3000 + Math.random() * 4000);

    // By night, now and then a shooting star
    const shoot = () => {
        const night = getComputedStyle(document.documentElement).colorScheme === "dark";
        if (inView && night && !document.hidden && !reducedMotion.matches) {
            const star = document.createElement("span");
            star.className = "shooting-star";
            star.style.left = `${(10 + Math.random() * 70).toFixed(1)}%`;
            star.style.top = `${(4 + Math.random() * 22).toFixed(1)}%`;
            star.addEventListener("animationend", () => star.remove());
            clouds.append(star);
        }
        setTimeout(shoot, 15000 + Math.random() * 25000);
    };
    setTimeout(shoot, 5000 + Math.random() * 8000);

    const asked = (new URLSearchParams(location.search).get("castle") || "").toLowerCase();
    input.value = ID.test(asked) ? asked : randomId();
    show(input.value);
})();
