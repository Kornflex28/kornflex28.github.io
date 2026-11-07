"""New works on ORCID, added to the publications: orcid.py ORCID_ID PUBLICATIONS_YML

Reads the public ORCID record, keeps the works with a DOI that the publications file doesn't have
yet, describes each from its DOI's record (Crossref, else DataCite) as the file does (type,
authors up to Louis Chauvet, title, venue, link), and adds them to the file under their year.
Prints what it added (nothing when there is nothing new)."""
import json, re, sys, urllib.parse, urllib.request

ME = "Chauvet"
orcid, path = sys.argv[1], sys.argv[2]


def get(url, accept="application/json"):
    request = urllib.request.Request(url, headers={"Accept": accept, "User-Agent": "touchevisual.dev publications (GitHub Actions)"})
    with urllib.request.urlopen(request, timeout=30) as reply:
        return json.load(reply)


def initials(given):
    # "Jean-Michel" -> "J.-M.", "Lasse B. N." -> "L. B. N."
    return " ".join("-".join(part[0] + "." for part in word.split("-") if part) for word in given.replace(".", " ").split())


def authors(people):
    names = [f"{family} {initials(given)}".strip() for family, given in people]
    if len(names) <= 3:
        return ", ".join(names)
    me = next((k for k, (family, _) in enumerate(people) if family == ME), None)
    if me is None:
        shown = names[:3]
    elif me <= 3:
        shown = names[:max(me + 1, 2)]
    else:
        shown = [names[0], "…", names[me]]
    return ", ".join(shown) + (" et al." if len(names) > (me or 0) + 1 and len(names) > len(shown) else "")


def describe(doi):
    try:
        m = get("https://api.crossref.org/works/" + urllib.parse.quote(doi))["message"]
        people = [(a.get("family", ""), a.get("given", "")) for a in m.get("author", [])]
        year = (m.get("published") or m.get("issued"))["date-parts"][0][0]
        title = " ".join(m["title"][0].split())
        if m["type"] == "posted-content" and "egusphere-egu" in doi.lower():
            kind, venue = "Conference", "EGU General Assembly, " + doi.split("-", 1)[1].upper()
        else:
            kind = {"journal-article": "Article", "proceedings-article": "Conference", "dataset": "Dataset"}.get(m["type"], "Article")
            venue = ", ".join(str(v) for v in ((m.get("container-title") or [m.get("publisher", "")])[0], m.get("volume"), m.get("article-number") or m.get("page")) if v)
    except Exception:
        d = get("https://api.datacite.org/dois/" + urllib.parse.quote(doi))["data"]["attributes"]
        people = [(c.get("familyName", ""), c.get("givenName", "")) for c in d.get("creators", [])]
        year, title, kind, venue = d["publicationYear"], d["titles"][0]["title"], "Dataset", d.get("publisher", "")
        if isinstance(venue, dict):
            venue = venue.get("name", "")
    return {"year": int(year), "type": kind, "authors": authors(people), "title": title, "venue": venue, "url": "https://doi.org/" + doi}


def quoted(text):
    # as the file writes them: plain, unless the text would read as something else in YAML
    return json.dumps(text, ensure_ascii=False) if re.search(r": |#|^[\"'&*!|>%@`\[{-]", text) else text


raw = open(path, encoding="utf-8", newline="").read()
nl = "\r\n" if "\r\n" in raw else "\n"      # the file's own line endings, kept
text = raw.replace("\r\n", "\n")
known = {u.lower() for u in re.findall(r"url: https://doi\.org/(\S+)", text)}
works = get(f"https://pub.orcid.org/v3.0/{orcid}/works")["group"]
dois = []
for group in works:
    ids = {(e["external-id-type"], e["external-id-value"]) for s in group["work-summary"] for e in (s.get("external-ids") or {}).get("external-id", [])}
    doi = next((v for t, v in ids if t == "doi"), None)
    if doi and doi.lower() not in known:
        dois.append(doi)

for doi in dois:
    work = describe(doi)
    entry = (f"- year: {work['year']}\n  type: {work['type']}\n  authors: {work['authors']}\n  title: {quoted(work['title'])}\n"
             f"  venue: {quoted(work['venue'])}\n  url: {work['url']}\n\n")
    # under its year: before the first entry of the same year or an earlier one
    at = next((m.start() for m in re.finditer(r"^- year: (\d+)", text, re.M) if int(m.group(1)) <= work["year"]), len(text))
    text = text[:at] + entry + text[at:]
    print(f"added {work['year']} {work['type']}: {work['title']} ({work['url']})")

open(path, "w", encoding="utf-8", newline="").write(text.replace("\n", nl))
