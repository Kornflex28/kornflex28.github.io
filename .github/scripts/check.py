"""The pages opened as a visitor would: check.py [BASE_URL]

Fails (exit 1) when a script throws on a page, or when what the scripts draw is not there:
the castle and its sky, the floors' drawings, the castle's ID, the frog, the ruins."""
import sys

from browser import Browser

PAGES = [
    ("/", ["html[data-moment]", ".floor-deco", "#castle-id"]),
    ("/frogs.html", ["canvas"]),
    ("/404.html", [".lost-ruins"]),
]

base = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8001"
failed = False
with Browser() as browser:
    for path, marks in PAGES:
        browser.errors.clear()
        browser.open(base + path, 1400, 900)
        missing = [mark for mark in marks if not browser.eval(f"!!document.querySelector({mark!r})")]
        for error in browser.errors:
            print(f"::error::a script fails on {path}: {error}")
        for mark in missing:
            print(f"::error::{mark} missing on {path}")
        failed |= bool(browser.errors or missing)
        print(f"{path}: {'ok' if not (browser.errors or missing) else 'FAILED'}")
sys.exit(1 if failed else 0)
