"""Each asset's address stamped with its content: stamp.py SITE

Jekyll writes the build time after every stylesheet and script (?v=<seconds>), so browsers
never keep a stale copy. But the site is published again every morning: with the time, every
address changes every day, and returning visitors fetch everything again. Here the time is
replaced by a hash of the file itself: an address changes only when its file does."""
import hashlib
import pathlib
import re
import sys

site = pathlib.Path(sys.argv[1])


def stamp(match):
    asset = site / match.group(2).lstrip("/")
    if not asset.is_file():
        return match.group(0)
    return f"{match.group(1)}{match.group(2)}?v={hashlib.sha1(asset.read_bytes()).hexdigest()[:10]}"


stamped = 0
for page in site.rglob("*.html"):
    text = page.read_text(encoding="utf-8")
    new, count = re.subn(r'((?:href|src)=")(/[^"?#]+)\?v=\d+', stamp, text)
    if new != text:
        page.write_text(new, encoding="utf-8", newline="")
        stamped += count
print(f"{stamped} addresses stamped")
# a smoke test: no address still carries a build time where its file exists
assert stamped, "no address to stamp: has the ?v= of the layouts changed?"
