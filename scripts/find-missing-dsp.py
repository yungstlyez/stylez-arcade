"""Find Spotify/Apple IDs for titles missing from the arcade catalogue."""
from __future__ import annotations

import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
ROOT = Path(__file__).resolve().parents[1]

QUERIES = [
    "preacher boy",
    "walking my path",
    "panda express",
    "iced out leggings",
    "COOKINWITSTYLEZ",
    "not a jerk rapper",
    "stylez be",
    "jesus piece rockin",
    "casually flexing",
    "drake timing",
    "gl0ckiana",
    "flyest inna room",
]


def get(url: str) -> str:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


found = []
for title in QUERIES:
    term = f"{title} Callmestylez"
    url = "https://itunes.apple.com/search?" + urllib.parse.urlencode(
        {"term": term, "entity": "song", "limit": 8}
    )
    data = json.loads(get(url))
    print("\n==", term, "itunes", data.get("resultCount"))
    for item in data.get("results", []):
        artist = item.get("artistName") or ""
        track = item.get("trackName") or ""
        if "callmestylez" not in artist.lower() and "callmestylez" not in track.lower():
            continue
        row = {
            "q": title,
            "track": track,
            "artist": artist,
            "date": (item.get("releaseDate") or "")[:10],
            "apple": item.get("trackViewUrl"),
            "collection": item.get("collectionName"),
            "artwork": (item.get("artworkUrl100") or "").replace("100x100bb", "600x600bb"),
        }
        found.append(row)
        print(" ", row["date"], "|", track, "|", artist, "|", row["apple"])

    # song.link / odesli sometimes resolves
    for candidate in [
        f"https://song.link/s?{urllib.parse.urlencode({'q': term})}",
    ]:
        pass

    # Try Spotify via duckduckgo html (lightweight)
    ddg = "https://html.duckduckgo.com/html/?" + urllib.parse.urlencode({"q": f"site:open.spotify.com/track {term}"})
    try:
        html = get(ddg)
        ids = re.findall(r"open\.spotify\.com/track/([A-Za-z0-9]{22})", html)
        print("  ddg spotify", ids[:5])
        for tid in ids[:3]:
            try:
                meta = json.loads(
                    get(
                        "https://open.spotify.com/oembed?url="
                        + urllib.parse.quote(f"https://open.spotify.com/track/{tid}")
                    )
                )
                print("   ->", tid, meta.get("title"))
                found.append(
                    {
                        "q": title,
                        "track": meta.get("title"),
                        "spotify": f"https://open.spotify.com/track/{tid}",
                        "id": tid,
                        "cover": meta.get("thumbnail_url"),
                    }
                )
            except Exception as e:
                print("   oembed fail", e)
    except Exception as e:
        print("  ddg fail", e)
    time.sleep(0.4)

# SoundCloud latest via API
print("\n== SOUNDCLOUD ==")
home = get("https://soundcloud.com")
scripts = re.findall(r'src="(https://a-v2\.sndcdn\.com/assets/[^"]+\.js)"', home)
cid = None
for s in scripts[:12]:
    try:
        js = urllib.request.urlopen(urllib.request.Request(s, headers=UA), timeout=20).read().decode(
            "utf-8", "replace"
        )
    except Exception:
        continue
    m = re.search(r'client_id:"([A-Za-z0-9]{16,})"', js)
    if m:
        cid = m.group(1)
        break
print("client", cid)
sc = []
if cid:
    user = json.loads(
        get(
            f"https://api-v2.soundcloud.com/resolve?url=https://soundcloud.com/user-363377229&client_id={cid}"
        )
    )
    tracks = json.loads(
        get(f"https://api-v2.soundcloud.com/users/{user['id']}/tracks?client_id={cid}&limit=40")
    )
    for t in tracks.get("collection", []):
        sc.append(
            {
                "title": t.get("title"),
                "slug": t.get("permalink"),
                "url": t.get("permalink_url"),
                "created": (t.get("created_at") or "")[:10],
                "artwork": (t.get("artwork_url") or "").replace("-large", "-t500x500"),
            }
        )
        print((t.get("created_at") or "")[:10], "|", t.get("title"), "|", t.get("permalink_url"))

out = {
    "dsp_hits": found,
    "soundcloud": sc,
}
(ROOT / "scripts" / "missing-dsp.json").write_text(json.dumps(out, indent=2), encoding="utf-8")
print("wrote scripts/missing-dsp.json")
