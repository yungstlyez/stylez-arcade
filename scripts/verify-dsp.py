import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
dsp = json.loads((root / "scripts" / "dsp-refresh.json").read_text(encoding="utf-8"))["dsp"]
text = (root / "data" / "releases.ts").read_text(encoding="utf-8")

print("spotify tracks in dsp", len(dsp))
for slug, info in dsp.items():
    if info["id"] not in text:
        print("MISSING FROM RELEASES", slug, info["id"], info["title"])

for m in re.finditer(r'cover: "(/art/covers/[^"]+)"', text):
    p = root / "public" / m.group(1).lstrip("/")
    if not p.exists():
        print("MISSING COVER", m.group(1))

# SC exclusives that should be in releases
missing_sc = json.loads((root / "scripts" / "dsp-refresh.json").read_text(encoding="utf-8"))[
    "missing_sc"
]
for item in missing_sc:
    url = item["url"]
    if url not in text:
        print("MISSING SC URL", item["title"], url)

print("slugs", len(re.findall(r'slug: "', text)))
print("spotify", len(re.findall(r'spotify: "', text)))
print("soundcloud", len(re.findall(r'soundcloud: "', text)))
print("done")
