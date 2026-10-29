// Elevator: a shaft beside the page with one landing per floor (section), read as a table
// of contents. Each landing stands for the scroll position a click on it leads to; the cabin
// follows the scroll from landing to landing, so it rests exactly on a landing whenever its
// floor's title is reached. Clicking a landing rides the page there (quick start, steady
// travel, quick stop).
//
// Above the floors, the shaft climbs to the castle (skyline.js): at the top of the page the
// cabin docks in the pavilion on the castle's terrace, the shaft hanging from the pavilion's
// pulley as the page scrolls.
(() => {
    // The page always opens on the rooftop, so the castle is seen first
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    const elevator = document.querySelector(".elevator");
    const floors = [...document.querySelectorAll(".floor")];
    if (!elevator || !floors.length) return;

    const list = elevator.querySelector(".stops");
    const cabin = elevator.querySelector(".cabin");
    const titles = floors.map((floor) => floor.querySelector(".floor-title"));
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

    // The rooftop is the top stop when the castle has a pavilion for the cabin; it has no
    // landing in the list, the pavilion being drawn in the castle
    const castle = document.querySelector(".skyline[data-dock]");
    const rooftop = document.getElementById("top");
    const targets = castle && rooftop ? [rooftop, ...floors] : floors;
    const first = targets.length - floors.length;      // index of the first floor in targets

    const stops = floors.map((floor, i) => {
        const stop = document.createElement("li");
        const link = document.createElement("a");
        link.href = `#${floor.id}`;
        link.textContent = titles[i].textContent.trim();
        stop.append(link);
        list.append(stop);
        return stop;
    });

    document.documentElement.classList.add("has-elevator");
    elevator.classList.add("is-ready");

    const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

    // Where a click on a floor scrolls the page to
    const scrollTarget = (el) => {
        const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
        return Math.max(0, Math.min(maxScroll(), el.getBoundingClientRect().top + window.scrollY - margin));
    };

    // Landings: one per floor, spread like the floors in the page between the castle and the
    // bottom of the screen, kept readable apart. The rooftop's landing is the castle's
    // terrace, as seen at the top of the page: the cabin stands on it, in the pavilion.
    let anchors = [], landings = [], dock = null, pulley = null;
    const place = () => {
        const max = maxScroll();
        const pad = Math.min(48, list.clientHeight * 0.06), gap = 28;
        let top = pad;
        if (first) {
            // the shaft right under the pavilion, and the cabin at the drawing's scale: 25.6
            // units wide, its size beside the pavilion on wide screens (1.6rem), and never
            // below 14px, still within the pavilion's arch on a phone
            const box = castle.getBoundingClientRect();
            const unit = box.width / castle.viewBox.baseVal.width;
            elevator.style.setProperty("--dock-x", `${box.left + box.width * parseFloat(castle.dataset.dockX)}px`);
            elevator.style.setProperty("--cabin-width", `${Math.max(14, 25.6 * unit)}px`);
            dock = box.top + window.scrollY + box.height * parseFloat(castle.dataset.dock);
            pulley = box.top + window.scrollY + box.height * parseFloat(castle.dataset.pulley);
            top = box.bottom + window.scrollY + gap;
        }
        const bottom = list.clientHeight - pad;
        // on short screens, the landings start over the castle rather than be crushed below it
        top = Math.min(top, Math.max(pad, bottom - (floors.length - 1) * gap));
        anchors = targets.map(scrollTarget);
        const from = anchors[first];
        const spots = anchors.slice(first).map((a) => top + (max > from ? (a - from) / (max - from) : 0) * (bottom - top));
        for (let i = 1; i < spots.length; i++) spots[i] = Math.max(spots[i], spots[i - 1] + gap);
        spots[spots.length - 1] = Math.min(spots[spots.length - 1], bottom);
        for (let i = spots.length - 2; i >= 0; i--) spots[i] = Math.min(spots[i], spots[i + 1] - gap);
        stops.forEach((stop, i) => { stop.style.top = `${spots[i]}px`; });
        landings = first ? [dock - cabin.offsetHeight / 2, ...spots] : spots;
        list.style.setProperty("--shaft-bottom", `${list.clientHeight - spots[spots.length - 1]}px`);
    };

    // Cabin position for a scroll position: from landing to landing as the page scrolls
    // from one floor's anchor to the next
    const cabinAt = (y) => {
        if (y <= anchors[0]) return landings[0];
        for (let i = 1; i < anchors.length; i++) {
            if (y < anchors[i]) {
                const t = (y - anchors[i - 1]) / (anchors[i] - anchors[i - 1]);
                return landings[i - 1] + t * (landings[i] - landings[i - 1]);
            }
        }
        return landings[landings.length - 1];
    };
    const floorAt = (y) => {
        let index = 0;
        anchors.forEach((a, i) => { if (y >= a - 2) index = i; });
        return index;
    };

    const setCabin = (y) => { cabin.style.transform = `translateY(${y - cabin.offsetHeight / 2}px)`; };
    // index in targets: the rooftop lights no landing
    const markCurrent = (index) => stops.forEach((stop, i) => {
        const link = stop.querySelector("a");
        stop.classList.toggle("is-current", i + first === index);
        if (i + first === index) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
    });

    // A floor reached by a click stays current until the visitor scrolls again: needed at the
    // bottom of the page, where the last floors share the same scroll position
    let pinned = null;
    const update = () => {
        const y = window.scrollY;
        // the shaft hangs from the pavilion's pulley, wherever the scroll has taken it
        list.style.setProperty("--shaft-top", `${first ? pulley - y : landings[0]}px`);
        if (pinned && Math.abs(y - pinned.y) < 2) return;
        pinned = null;
        setCabin(cabinAt(y));
        markCurrent(floorAt(y));
    };

    // Accelerate over the first 20% of the trip, travel at constant speed, brake over the last 20%
    const ramp = 0.2;
    const speed = 1 / (1 - ramp);
    const ease = (t) => {
        if (t < ramp) return speed * t * t / (2 * ramp);
        if (t < 1 - ramp) return speed * (ramp / 2 + t - ramp);
        return 1 - speed * (1 - t) * (1 - t) / (2 * ramp);
    };

    let ride = 0;
    const rideTo = (target) => {
        const from = window.scrollY, to = scrollTarget(target);
        const index = targets.indexOf(target);
        const arrive = () => {
            if (index < 0) return;
            pinned = { y: window.scrollY };
            setCabin(landings[index]);
            markCurrent(index);
        };
        if (reducedMotion.matches) {
            window.scrollTo(0, to);
            update();
            return arrive();
        }
        const duration = Math.min(1600, 500 + Math.abs(to - from) * 0.25);
        const start = performance.now();
        const trip = ++ride;
        pinned = null;
        const frame = (now) => {
            if (trip !== ride) return;
            const t = Math.min(1, (now - start) / duration);
            window.scrollTo(0, from + (to - from) * ease(t));
            if (t < 1) requestAnimationFrame(frame);
            else arrive();
        };
        requestAnimationFrame(frame);
    };

    // Every link to a place in the page (landings, "Back to the top") rides there
    document.addEventListener("click", (event) => {
        const link = event.target.closest('a[href^="#"]');
        if (!link) return;
        const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
        if (!target) return;
        event.preventDefault();
        rideTo(target);
    });
    // A wheel or touch during a ride hands control back to the visitor
    ["wheel", "touchstart"].forEach((type) => window.addEventListener(type, () => { ride++; }, { passive: true }));

    let pending = false;
    window.addEventListener("scroll", () => {
        if (pending) return;
        pending = true;
        requestAnimationFrame(() => {
            pending = false;
            update();
        });
    }, { passive: true });

    // Landings move when the layout changes: fonts loading, folds opening, resizing
    new ResizeObserver(() => { place(); pinned = null; update(); }).observe(document.body);
    // and the castle's terrace, when another castle is drawn (skyline.js), and the screen's
    // height, as when a phone's address bar shows or hides
    ["castle-drawn", "resize"].forEach((type) => window.addEventListener(type, () => { place(); pinned = null; update(); }));

    if (!location.hash) window.scrollTo(0, 0);
    place();
    update();
})();
