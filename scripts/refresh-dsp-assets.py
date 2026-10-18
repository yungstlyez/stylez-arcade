"""Refresh Spotify covers + map SoundCloud permalinks for Callmestylez catalogue."""
from __future__ import annotations

import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COVERS = ROOT / "public" / "art" / "covers"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}


def get(url: str) -> bytes:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def get_text(url: str) -> str:
    return get(url).decode("utf-8", "replace")


# Spotify IDs currently in releases.ts
text = (ROOT / "data" / "releases.ts").read_text(encoding="utf-8")
pairs = re.findall(
    r'slug: "([^"]+)"[\s\S]*?spotify: "https://open\.spotify\.com/track/([A-Za-z0-9]{22})"',
    text,
)
# The regex may miss due to field order — parse blocks instead
blocks = re.split(r"\n  \{\n", text)[1:]
slug_to_spotify = {}
for block in blocks:
    slug_m = re.search(r'slug: "([^"]+)"', block)
    sp_m = re.search(r'open\.spotify\.com/track/([A-Za-z0-9]{22})', block)
    if slug_m and sp_m:
        slug_to_spotify[slug_m.group(1)] = sp_m.group(1)

print("dsp slugs", len(slug_to_spotify))
meta = {}
for slug, tid in slug_to_spotify.items():
    url = f"https://open.spotify.com/track/{tid}"
    d = json.loads(get_text("https://open.spotify.com/oembed?url=" + urllib.parse.quote(url)))
    title = d.get("title")
    thumb = d.get("thumbnail_url") or ""
    meta[slug] = {"title": title, "id": tid, "cover": thumb, "spotify": url}
    dest = COVERS / f"{slug}.jpg"
    if thumb:
        dest.write_bytes(get(thumb))
        print("cover", slug, dest.stat().st_size, "|", title)
    time.sleep(0.05)

# SoundCloud map
home = get_text("https://soundcloud.com")
scripts = re.findall(r'src="(https://a-v2\.sndcdn\.com/assets/[^"]+\.js)"', home)
cid = None
for s in scripts[:12]:
    try:
        js = get_text(s)
    except Exception:
        continue
    m = re.search(r'client_id:"([A-Za-z0-9]{16,})"', js)
    if m:
        cid = m.group(1)
        break
print("sc client", cid)
sc_tracks = []
if cid:
    user = json.loads(
        get_text(
            f"https://api-v2.soundcloud.com/resolve?url=https://soundcloud.com/user-363377229&client_id={cid}"
        )
    )
    tracks = json.loads(
        get_text(f"https://api-v2.soundcloud.com/users/{user['id']}/tracks?client_id={cid}&limit=50")
    )
    for t in tracks.get("collection", []):
        art = (t.get("artwork_url") or "").replace("-large", "-t500x500")
        sc_tracks.append(
            {
                "title": t.get("title"),
                "permalink": t.get("permalink"),
                "url": t.get("permalink_url"),
                "created": (t.get("created_at") or "")[:10],
                "artwork": art,
            }
        )

# Manual slug <-> SC permalink aliases for DSP tracks
DSP_SC = {
    "gl0ckianna": "gl0ckianna-prod-sygen-mamberr",
    "jesus-piece-rockin": "jesus-piece-rockin",
    "casually-flexing": "casually-flexing-releasee",
    "stylez-be": "stylez-be",
    "flyest-inna-room": "callmestylez-flyest-inna-room",
    "different-cloth": "callmestylez-different-cloth",
    "badu-freestyle": "badu-freestyle-2025",
    "this-wat-a-rave-sounds-like": "this-wat-a-rave-sounds-like-5",
    "boyz-n-the-hood": "boyz-n-the-hood-3",
    "genesis": "genesis-1",
    "my-darkest-thoughts": "my-darkest-thoughts-2",
    "roses-in-the-concrete": "roses-in-the-concrete-4",
    "when-the-dust-settles": "when-the-dust-settles-6",
    "2025-intro": "callmestylez-2025-intro",
}

sc_by_perm = {t["permalink"]: t for t in sc_tracks}
for slug, perm in DSP_SC.items():
    t = sc_by_perm.get(perm)
    if t:
        meta.setdefault(slug, {})["soundcloud"] = t["url"]
        print("sc link", slug, "->", t["url"])

# Missing SC-only candidates (not already in releases.ts)
existing_slugs = set(re.findall(r'slug: "([^"]+)"', text))
missing_sc = []
SKIP_PERMS = {
    "callmestylez-body-by-raven",
    "callmestylez-5-in-singles",
    "gl0ckianna-prod-sygen-mamberr",
    "raininglol-face-tatt-stylezmix",
    "flatbed-freestyle-stylezmix",
    "jesus-piece-rockin",
    "ma-vibeee",
    "rip-juice",
    "vivienne-westwood",
    "r-i-p-fredo-stylezmix",
    "tragic-freestyle",
    "casually-flexing-releasee",
    "stylez-be",
    "callmestylez-flyest-inna-room",
    "callmestylez-different-cloth",
    "this-wat-a-rave-sounds-like-5",
    "boyz-n-the-hood-3",
    "genesis-1",
    "my-darkest-thoughts-2",
    "roses-in-the-concrete-4",
    "when-the-dust-settles-6",
    "badu-freestyle-2025",
    "callmestylez-2025-intro",
}
for t in sc_tracks:
    perm = t["permalink"]
    if perm in SKIP_PERMS:
        continue
    # build slug
    slug = perm.replace("callmestylez-", "")
    slug = re.sub(r"-+", "-", slug).strip("-")
    if slug in existing_slugs:
        continue
    # skip EP duplicates that only exist as DSP already under different slug
    missing_sc.append({**t, "slug": slug})
    if t["artwork"]:
        dest = COVERS / f"{slug}.jpg"
        if not dest.exists() or dest.stat().st_size < 1000:
            try:
                dest.write_bytes(get(t["artwork"]))
                print("sc cover", dest.name)
            except Exception as e:
                print("sc cover fail", slug, e)

out = {
    "dsp": meta,
    "missing_sc": missing_sc,
    "sc_all": sc_tracks,
}
(ROOT / "scripts" / "dsp-refresh.json").write_text(json.dumps(out, indent=2), encoding="utf-8")
print("wrote dsp-refresh.json", "missing_sc", len(missing_sc))
for m in missing_sc:
    print(" +", m["created"], m["title"], "->", m["slug"], m["url"])
