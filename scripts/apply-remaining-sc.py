"""Add remaining SC-only tracks from missing_sc + download covers."""
from __future__ import annotations

import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REFRESH = json.loads((ROOT / "scripts" / "dsp-refresh.json").read_text(encoding="utf-8"))
path = ROOT / "data" / "releases.ts"
text = path.read_text(encoding="utf-8")
covers_dir = ROOT / "public" / "art" / "covers"
covers_dir.mkdir(parents=True, exist_ok=True)

REMAINING = [
    ("kevin-gates-gif", "kevin gates gif", 2024, "Early Files", "SoundCloud exclusive."),
    ("swim-music-2024", "swim music 2024", 2024, "Early Files", "SoundCloud exclusive."),
    ("gotham-city", "gotham city", 2024, "Early Files", "SoundCloud exclusive."),
    ("no-humility", "no humility", 2024, "Early Files", "SoundCloud exclusive."),
    ("redemption-arc", "redemption arc", 2024, "Early Files", "SoundCloud exclusive."),
    ("please-come-here", "please come here", 2024, "Early Files", "SoundCloud exclusive."),
    ("paid-motion", "paid motion", 2024, "Early Files", "SoundCloud exclusive."),
    ("squeaky-clean", "squeaky clean", 2024, "Early Files", "SoundCloud exclusive."),
    ("yea-he-aint-that", "yea he aint that", 2024, "Early Files", "SoundCloud exclusive."),
    ("i-feel-ah-way", "I feel ah way", 2024, "Early Files", "SoundCloud exclusive."),
]

# Map our slug -> missing_sc entry by matching keywords in permalink/url
by_slug = {item["slug"]: item for item in REFRESH["missing_sc"]}
URL_FOR = {
    "kevin-gates-gif": by_slug["kevin-gates-gif"],
    "swim-music-2024": by_slug["swim-music-2024-master"],
    "gotham-city": by_slug["gotham-city"],
    "no-humility": by_slug["no-humility"],
    "redemption-arc": by_slug["redemption-arc"],
    "please-come-here": by_slug["please-come-here"],
    "paid-motion": by_slug["paid-motion"],
    "squeaky-clean": by_slug["squeaky-clean-final"],
    "yea-he-aint-that": by_slug["yea-he-aint-that"],
    "i-feel-ah-way": by_slug["i-feel-ah-way"],
}

blocks = []
for slug, title, year, era, desc in REMAINING:
    if f'slug: "{slug}"' in text:
        print("skip existing", slug)
        continue
    meta = URL_FOR[slug]
    url = meta["url"]
    artwork = meta.get("artwork")
    cover_path = covers_dir / f"{slug}.jpg"
    if artwork and not cover_path.exists():
        try:
            req = urllib.request.Request(artwork, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=30) as resp:
                cover_path.write_bytes(resp.read())
            print("cover", slug)
        except Exception as exc:
            print("cover fail", slug, exc)
    cover = f"/art/covers/{slug}.jpg" if cover_path.exists() else "/art/covers/body-by-raven.jpg"
    blocks.append(
        f"""  {{
    id: "rel-{slug}",
    slug: "{slug}",
    title: {json.dumps(title)},
    year: {year},
    cover: "{cover}",
    audio: "/audio/flatbed-freestyle.wav",
    soundcloudOnly: true,
    type: "Single",
    era: "{era}",
    description:
      {json.dumps(desc)},
    credits: [{{ role: "Artist", name: "Callmestylez" }}],
    streamingLinks: {{
      soundcloud: "{url}",
    }},
    characters: ["stylez"],
    locations: ["southside", "the-city"],
    chronicles: ["the-world-comes-online"],
  }},"""
    )

if blocks:
    insert = "\n".join(blocks) + "\n"
    # Insert before not-a-jerk's following casually-flexing... better: after not-a-jerk-rapper block
    # Find end of not-a-jerk-rapper entry and insert remaining older tracks before casually-flexing
    anchor = '  {\n    id: "rel-casually-flexing",'
    if anchor not in text:
        raise SystemExit("anchor missing")
    text = text.replace(anchor, insert + anchor, 1)
    path.write_text(text, encoding="utf-8")
    print("inserted", len(blocks))
else:
    print("nothing to insert")

print("slugs", len(re.findall(r'slug: "', text)))
print("soundcloud", len(re.findall(r'soundcloud: "', text)))
