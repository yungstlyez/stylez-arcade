"""Pull current Callmestylez DSP tracks and compare to releases.ts."""
from __future__ import annotations

import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"}
ARTIST = "7BgBZqsMY03cdXtiIi6n1o"
COVERS = ROOT / "public" / "art" / "covers"
COVERS.mkdir(parents=True, exist_ok=True)


def get(url: str) -> str:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def get_bytes(url: str) -> bytes:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def slugify(title: str) -> str:
    s = title.lower()
    s = s.replace("’", "'").replace("“", "").replace("”", "")
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


releases_text = (ROOT / "data" / "releases.ts").read_text(encoding="utf-8")
existing_spotify = set(
    re.findall(r'open\.spotify\.com/track/([A-Za-z0-9]{22})', releases_text)
)
existing_slugs = set(re.findall(r'slug: "([^"]+)"', releases_text))
print("existing spotify", len(existing_spotify), "slugs", len(existing_slugs))

# Spotify artist + discography pages
track_ids: list[str] = []
for path in [
    f"https://open.spotify.com/artist/{ARTIST}",
    f"https://open.spotify.com/artist/{ARTIST}/discography/all",
    f"https://open.spotify.com/artist/{ARTIST}/discography/single",
]:
    try:
        html = get(path)
        found = re.findall(r"spotify:track:([A-Za-z0-9]{22})", html)
        found += re.findall(r"/track/([A-Za-z0-9]{22})", html)
        print(path.split("/")[-1] or "artist", "->", len(found))
        track_ids.extend(found)
    except Exception as e:
        print("fail", path, e)

# Also try embed
try:
    emb = get(f"https://open.spotify.com/embed/artist/{ARTIST}")
    found = re.findall(r"/track/([A-Za-z0-9]{22})", emb)
    print("embed", len(found))
    track_ids.extend(found)
except Exception as e:
    print("embed fail", e)

# Search via iTunes for Callmestylez songs
itunes_url = "https://itunes.apple.com/search?" + urllib.parse.urlencode(
    {"term": "Callmestylez", "entity": "song", "limit": 50}
)
itunes = json.loads(get(itunes_url))
print("itunes", itunes.get("resultCount"))
itunes_rows = []
for item in itunes.get("results", []):
    if "callmestylez" not in (item.get("artistName") or "").lower():
        # keep features mentioning Callmestylez
        if "callmestylez" not in (item.get("trackName") or "").lower():
            continue
    itunes_rows.append(item)
    print(
        "ITUNES",
        (item.get("releaseDate") or "")[:10],
        "|",
        item.get("trackName"),
        "|",
        item.get("artistName"),
    )

# Unique track ids preserving order
seen = set()
ordered_ids = []
for tid in track_ids:
    if tid not in seen:
        seen.add(tid)
        ordered_ids.append(tid)

# Always include known catalogue ids so we can refresh metadata
for tid in sorted(existing_spotify):
    if tid not in seen:
        ordered_ids.append(tid)
        seen.add(tid)

print("unique track ids", len(ordered_ids))

catalog = []
for tid in ordered_ids:
    url = f"https://open.spotify.com/track/{tid}"
    try:
        meta = json.loads(get("https://open.spotify.com/oembed?url=" + urllib.parse.quote(url)))
    except Exception as e:
        print("oembed fail", tid, e)
        continue
    title = meta.get("title") or tid
    thumb = meta.get("thumbnail_url") or ""
    # Prefer larger art
    if "ab67616d00001e02" in thumb:
        thumb_hi = thumb
    else:
        thumb_hi = thumb
    slug = slugify(title)
    # disambiguate
    if slug in {c["slug"] for c in catalog}:
        slug = f"{slug}-{tid[:4].lower()}"
    entry = {
        "id": tid,
        "title": title,
        "slug": slug,
        "spotify": url,
        "cover_url": thumb_hi,
        "in_repo": tid in existing_spotify,
        "slug_exists": slug in existing_slugs,
    }
    catalog.append(entry)
    print(("OK " if entry["in_repo"] else "NEW"), title, "|", slug, "|", tid)
    time.sleep(0.08)

# Search Spotify via public web search pages for missing RecentMusic titles
missing_titles = [
    "preach boy Callmestylez",
    "preacher boy Callmestylez",
    "walking my path Callmestylez",
    "panda express Callmestylez",
    "iced out leggings Callmestylez",
    "COOKINWITSTYLEZ Callmestylez",
    "not a jerk rapper Callmestylez",
    "!!gl0ckiana Callmestylez",
    "gl0ckiana Callmestylez",
    "body by raven Callmestylez",
    "5 in singles Callmestylez",
    "casually flexing Callmestylez",
    "drake timing Callmestylez",
    "flyest inna room Callmestylez",
    "stylez be Callmestylez",
    "jesus piece rockin Callmestylez",
]
search_ids = []
for q in missing_titles:
    try:
        html = get("https://open.spotify.com/search/" + urllib.parse.quote(q))
        ids = re.findall(r"/track/([A-Za-z0-9]{22})", html)
        print("search", q, "->", ids[:5])
        search_ids.extend(ids[:3])
    except Exception as e:
        print("search fail", q, e)
    time.sleep(0.12)

for tid in search_ids:
    if tid in seen:
        continue
    seen.add(tid)
    url = f"https://open.spotify.com/track/{tid}"
    try:
        meta = json.loads(get("https://open.spotify.com/oembed?url=" + urllib.parse.quote(url)))
    except Exception as e:
        print("oembed fail", tid, e)
        continue
    title = meta.get("title") or tid
    # filter obvious wrong artists by title heuristics later
    slug = slugify(title)
    entry = {
        "id": tid,
        "title": title,
        "slug": slug,
        "spotify": url,
        "cover_url": meta.get("thumbnail_url") or "",
        "in_repo": False,
        "slug_exists": slug in existing_slugs,
        "from_search": True,
    }
    catalog.append(entry)
    print("SEARCH", title, "|", slug, "|", tid)
    time.sleep(0.08)

out = ROOT / "scripts" / "dsp-catalog.json"
out.write_text(json.dumps({"catalog": catalog, "itunes": [
    {
        "track": i.get("trackName"),
        "artist": i.get("artistName"),
        "date": (i.get("releaseDate") or "")[:10],
        "apple": i.get("trackViewUrl"),
        "artwork": (i.get("artworkUrl100") or "").replace("100x100bb", "600x600bb"),
    }
    for i in itunes_rows
]}, indent=2), encoding="utf-8")
print("wrote", out)

# Download covers for NEW entries that look like Callmestylez catalogue
for entry in catalog:
    if entry["in_repo"] and entry["slug_exists"]:
        continue
    if not entry.get("cover_url"):
        continue
    # skip if title clearly not ours - keep all for now, filter in report
    dest = COVERS / f"{entry['slug']}.jpg"
    if dest.exists() and dest.stat().st_size > 2000:
        continue
    try:
        dest.write_bytes(get_bytes(entry["cover_url"]))
        print("cover", dest.name, dest.stat().st_size)
    except Exception as e:
        print("cover fail", entry["slug"], e)
