// Day / night: the site always opens by day, whatever the device's own setting. Night comes
// only from the toggle button, and lasts for the rest of the visit (moving between pages),
// a new visit opening by day again. Loaded in <head>, not deferred, so a night chosen earlier
// in the visit applies before the page paints.
(() => {
    const root = document.documentElement;
    const storage = {
        get: () => { try { return sessionStorage.getItem("theme"); } catch { return null; } },
        set: (value) => { try { sessionStorage.setItem("theme", value); } catch { } },
    };

    if (storage.get() === "night") root.dataset.theme = "night";

    document.addEventListener("DOMContentLoaded", () => {
        const button = document.querySelector(".theme-toggle");
        if (!button) return;

        const sync = () => {
            const night = root.dataset.theme === "night";
            button.setAttribute("aria-pressed", String(night));
            button.setAttribute("aria-label", night ? "Switch to day" : "Switch to night");
        };

        button.addEventListener("click", () => {
            root.dataset.theme = root.dataset.theme === "night" ? "day" : "night";
            storage.set(root.dataset.theme);
            sync();
        });
        sync();
    });
})();
