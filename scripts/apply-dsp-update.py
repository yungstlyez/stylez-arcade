"""Patch releases.ts with SoundCloud links + new SC exclusives from current feeds."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
path = ROOT / "data" / "releases.ts"
text = path.read_text(encoding="utf-8")

SC_LINKS = {
    "badu-freestyle": "https://soundcloud.com/user-363377229/badu-freestyle-2025",
    "genesis": "https://soundcloud.com/user-363377229/genesis-1",
    "my-darkest-thoughts": "https://soundcloud.com/user-363377229/my-darkest-thoughts-2",
    "boyz-n-the-hood": "https://soundcloud.com/user-363377229/boyz-n-the-hood-3",
    "roses-in-the-concrete": "https://soundcloud.com/user-363377229/roses-in-the-concrete-4",
    "this-wat-a-rave-sounds-like": "https://soundcloud.com/user-363377229/this-wat-a-rave-sounds-like-5",
    "when-the-dust-settles": "https://soundcloud.com/user-363377229/when-the-dust-settles-6",
    "2025-intro": "https://soundcloud.com/user-363377229/callmestylez-2025-intro",
}

for slug, sc in SC_LINKS.items():
    # Find the release block for this slug
    m = re.search(
        rf'(  \{{\n    id: "rel-{re.escape(slug)}",\n    slug: "{re.escape(slug)}",[\s\S]*?streamingLinks: \{{\n)(      spotify: "[^"]+",\n)(    \}},)',
        text,
    )
    if not m:
        if re.search(rf'slug: "{re.escape(slug)}"[\s\S]{{0,800}}soundcloud:', text):
            print("already has sc", slug)
        else:
            print("no match", slug)
        continue
    if "soundcloud:" in m.group(0):
        print("already has sc", slug)
        continue
    text = text[: m.start()] + m.group(1) + m.group(2) + f'      soundcloud: "{sc}",\n' + m.group(3) + text[m.end() :]
    print("added sc", slug)

NEW = [
    ("melodic-stylez-is-back", "Melodic Stylez is Back", 2026, "https://soundcloud.com/user-363377229/melodic-stylez-is-back", "Southside Chronicles", "The melody came back louder."),
    ("theres-tension-here", "There's Tension Here", 2026, "https://soundcloud.com/user-363377229/theres-tension-here", "Southside Chronicles", "Prod. Rahfrmny. Tension in the room."),
    ("grind-til-i-die", "Grind 'Til I Die", 2026, "https://soundcloud.com/user-363377229/grind-til-i-die", "Southside Chronicles", "Prod. Rahfromny. No off switch."),
    ("on-gang", "On Gang", 2026, "https://soundcloud.com/user-363377229/on-gang", "Southside Chronicles", "Prod. 129Jay. SoundCloud exclusive."),
    ("walk-em-down-in-balenci", "Walk 'Em Down In Balenci", 2025, "https://soundcloud.com/user-363377229/callmestylez-walk-em-down-in-balance", "Southside Chronicles", "Prod. keziibeats. SoundCloud exclusive."),
    ("vvs-on-me", "Vvs On Me", 2025, "https://soundcloud.com/user-363377229/callmestylez-vvs-on-me", "Southside Chronicles", "Prod. Young Madz. SoundCloud exclusive."),
    ("lilith-among-us", "Lilith Among Us", 2025, "https://soundcloud.com/user-363377229/callmestylez-lilith-among-us", "Relics", "SoundCloud exclusive."),
    ("long-distance", "Long Distance Sucks", 2025, "https://soundcloud.com/user-363377229/callmestylez-long-distance", "Southside Chronicles", "SoundCloud exclusive."),
    ("my-feliciaaa", "my feliciaaa", 2025, "https://soundcloud.com/user-363377229/callmestylez-my-feliciaaa", "Southside Chronicles", "SoundCloud exclusive."),
    ("preacherboy", "preacher boy", 2025, "https://soundcloud.com/user-363377229/callmestylez-preacherboy", "Southside Chronicles", "SoundCloud exclusive."),
    ("walkingmypath", "walking my path!!", 2025, "https://soundcloud.com/user-363377229/callmestylez-walkingmypath", "Southside Chronicles", "SoundCloud exclusive."),
    ("panda-express", "panda express", 2025, "https://soundcloud.com/user-363377229/callmestylez-belt-and-road", "Southside Chronicles", "SoundCloud exclusive."),
    ("iced-out-leggings", "iced out leggings", 2025, "https://soundcloud.com/user-363377229/callmestylez-iced-out-leggings", "Early Files", "SoundCloud exclusive."),
    ("cookinwitstylez", "COOKINWITSTYLEZ", 2024, "https://soundcloud.com/user-363377229/callmestylez-cookinwitstylez", "Early Files", "SoundCloud exclusive."),
    ("not-a-jerk-rapper", "not a jerk rapper", 2024, "https://soundcloud.com/user-363377229/callmestylez-not-a-jerk-rapper", "Early Files", "SoundCloud exclusive."),
]

COVER_ALIAS = {
    "walk-em-down-in-balenci": "walk-em-down-in-balance",
    "panda-express": "belt-and-road",
}

blocks = []
for slug, title, year, url, era, desc in NEW:
    if f'slug: "{slug}"' in text:
        print("skip existing", slug)
        continue
    cover_slug = COVER_ALIAS.get(slug, slug)
    cover = f"/art/covers/{cover_slug}.jpg"
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
    anchor = '  {\n    id: "rel-casually-flexing",'
    if anchor not in text:
        raise SystemExit("anchor missing")
    text = text.replace(anchor, insert + anchor, 1)
    print("inserted", len(blocks), "sc exclusives")

path.write_text(text, encoding="utf-8")
print("wrote", path)
print("total slugs", len(re.findall(r'slug: "', text)))
print("spotify links", len(re.findall(r'spotify: "', text)))
print("soundcloud links", len(re.findall(r'soundcloud: "', text)))
