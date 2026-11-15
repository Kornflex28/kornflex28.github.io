"""The pages opened as a visitor would: check.py [BASE_URL]

Fails (exit 1) when a script throws on a page, or when what the scripts draw is not there:
the castle and its sky, the floors' drawings (all six), the castle's ID, the frog, the ruins."""
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
    # every floor's drawing, not only those in view: they are drawn as they come near, here all
    # at once, as before the page is printed
    browser.errors.clear()
    browser.open(base + "/", 1400, 900)
    bare = browser.eval("window.dispatchEvent(new Event('beforeprint')), [...document.querySelectorAll('main .floor')]"
                        ".filter((floor) => !floor.querySelector(':scope > .floor-deco')?.childElementCount).map((floor) => floor.id)")
    for error in browser.errors:
        print(f"::error::a script fails drawing the floors: {error}")
    for floor in bare:
        print(f"::error::the floor {floor} is not drawn")
    failed |= bool(browser.errors or bare)
    print(f"/ floors: {'ok' if not (browser.errors or bare) else 'FAILED'}")
sys.exit(1 if failed else 0)
