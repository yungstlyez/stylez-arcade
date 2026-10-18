import re
from pathlib import Path

text = Path("data/releases.ts").read_text(encoding="utf-8")
slugs = re.findall(r'slug: "([^"]+)"', text)
print("count", len(slugs))
print("first8", slugs[:8])
print("spotify", len(re.findall(r'spotify: "', text)))
print("soundcloud", len(re.findall(r'soundcloud: "', text)))
site = Path("data/site.ts").read_text(encoding="utf-8")
print("featured", re.search(r'featuredReleaseSlug: "([^"]+)"', site).group(1))
print("latestSpotify", re.search(r'latestSpotifySlug: "([^"]+)"', site).group(1))
