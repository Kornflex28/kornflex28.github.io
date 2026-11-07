"""A gallery of castles, drawn at each publication: gallery.py SITE COUNT [BASE_URL]

Draws COUNT castles at random from the built site (served at BASE_URL), photographs each one (the
link preview card's castle), and writes into SITE/castles/ a picture of each (<id>.webp), an
animation going through them all (castles.webp, for the README) and their list (castles.json)."""
import json, os, random, sys, time

from PIL import Image

from browser import Browser

site, count = sys.argv[1], int(sys.argv[2])
base = sys.argv[3] if len(sys.argv) > 3 else "http://localhost:8001"
out = os.path.join(site, "castles")
os.makedirs(out, exist_ok=True)


def castle_id():
    # a castle's ID, as skyline.js writes it: a 32-bit number in base 36
    n, digits = random.getrandbits(32), ""
    while True:
        n, d = divmod(n, 36)
        digits = "0123456789abcdefghijklmnopqrstuvwxyz"[d] + digits
        if not n:
            return digits


ids, frames = [], []
with Browser() as browser:
    for _ in range(count):
        cid = castle_id()
        browser.open(f"{base}/card.html?castle={cid}", 1200, 630, wait=2.5)
        shot = os.path.join(out, f"{cid}.png")
        # the card's castle: the top of the card, as wide as it and as tall as the drawing
        browser.shoot(shot, clip={"x": 0, "y": 0, "width": 1200, "height": 340})
        picture = Image.open(shot).convert("RGB").resize((714, 203), Image.LANCZOS)
        os.remove(shot)
        picture.save(os.path.join(out, f"{cid}.webp"), quality=82)
        frames.append(picture.resize((476, 135), Image.LANCZOS))
        ids.append(cid)
    if browser.errors:
        print("script errors:", *browser.errors, sep="\n  ")

frames[0].save(os.path.join(out, "castles.webp"), save_all=True, append_images=frames[1:], duration=1600, loop=0, quality=75)
with open(os.path.join(out, "castles.json"), "w", encoding="utf-8") as listing:
    json.dump({"drawn": time.strftime("%Y-%m-%d"), "castles": ids}, listing)
print(f"{len(ids)} castles photographed into {out}")
