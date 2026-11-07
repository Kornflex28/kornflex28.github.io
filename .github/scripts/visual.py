"""Pictures of the site from one publication to the next, to see what changed.

visual.py shoot OUT [BASE_URL]      photographs a few pages, always the same castle, into OUT
visual.py compare BEFORE AFTER DIFF  compares two sets of pictures: prints a table (markdown) of
                                     how much of each changed, and writes into DIFF each picture
                                     that changed, its changes in red"""
import os, sys

from PIL import Image, ImageChops

PAGES = [  # name, address, width, height, on a phone
    ("home", "/?castle=b2", 1400, 900, False),
    ("home-phone", "/?castle=b2", 412, 915, True),
    ("frogs", "/frogs", 1400, 900, False),
    ("404", "/404.html", 1400, 900, False),
]


def shoot(out, base):
    from browser import Browser
    os.makedirs(out, exist_ok=True)
    with Browser() as browser:
        for name, path, width, height, phone in PAGES:
            browser.open(base + path, width, height, mobile=phone)
            browser.shoot(os.path.join(out, f"{name}.png"), full=True)
        if browser.errors:
            print("script errors:", *browser.errors, sep="\n  ")


def compare(before, after, diff):
    os.makedirs(diff, exist_ok=True)
    print("| Page | Changed |\n|---|---|")
    for name, *_ in PAGES:
        a, b = os.path.join(before, f"{name}.png"), os.path.join(after, f"{name}.png")
        if not os.path.exists(a) or not os.path.exists(b):
            print(f"| {name} | no picture to compare |")
            continue
        old, new = Image.open(a).convert("RGB"), Image.open(b).convert("RGB")
        if old.size != new.size:
            print(f"| {name} | size {old.size[0]}×{old.size[1]} → {new.size[0]}×{new.size[1]} |")
            new.save(os.path.join(diff, f"{name}.png"))
            continue
        # a pixel has changed when it differs by more than a trace (the paper's grain aside)
        changed = ImageChops.difference(old, new).convert("L").point(lambda v: 255 if v > 24 else 0)
        share = sum(changed.histogram()[255:]) / (new.width * new.height)
        print(f"| {name} | {share:.2%} |")
        if share:
            faded = Image.blend(new, Image.new("RGB", new.size, "white"), 0.6)
            faded.paste(Image.new("RGB", new.size, (220, 30, 30)), mask=changed)
            faded.save(os.path.join(diff, f"{name}.png"))


if __name__ == "__main__":
    if sys.argv[1] == "shoot":
        shoot(sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else "http://localhost:8001")
    else:
        compare(*sys.argv[2:5])
