"""Refresh Callmestylez catalogue from SoundCloud + Spotify/iTunes.

- Pulls latest SC uploads; inserts only NEW tracks at the top of the feed
- Discovers Spotify track IDs (artist pages + iTunes) and inserts missing DSP rows
- Attaches Spotify links onto existing SC rows when titles match
- Refreshes Spotify covers
- Updates featuredReleaseSlug / soundcloudStartSlug / latestSpotifySlug
- Prefaces Stylez character song list with new slugs
- Writes scripts/dsp-refresh.json

Safe to run weekly via CI. Does not commit.
"""
from __future__ import annotations

import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COVERS = ROOT / "public" / "art" / "covers"
COVERS.mkdir(parents=True, exist_ok=True)
UA = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
}
SC_USER = "https://soundcloud.com/user-363377229"
SPOTIFY_ARTIST = "7BgBZqsMY03cdXtiIi6n1o"


def get_bytes(url: str, retries: int = 3) -> bytes:
    last: Exception | None = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=45) as r:
                return r.read()
        except Exception as exc:  # noqa: BLE001
            last = exc
            time.sleep(0.4 * (attempt + 1))
    assert last is not None
    raise last


def get_text(url: str) -> str:
    return get_bytes(url).decode("utf-8", "replace")


def slugify(title: str) -> str:
    s = title.lower()
    s = s.replace("’", "'").replace("“", "").replace("”", "")
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def slugify_perm(permalink: str) -> str:
    slug = permalink.replace("callmestylez-", "")
    return re.sub(r"-+", "-", slug).strip("-")


def normalize_title(title: str) -> str:
    s = title.lower()
    s = s.replace("**", "").replace("!!", "")
    s = re.sub(r"\(.*?\)", "", s)
    s = re.sub(r"[^a-z0-9]+", "", s)
    return s


def find_sc_client_id() -> str | None:
    home = get_text("https://soundcloud.com")
    scripts = re.findall(r'src="(https://a-v2\.sndcdn\.com/assets/[^"]+\.js)"', home)
    for src in scripts[:16]:
        try:
            js = get_text(src)
        except Exception:
            continue
        m = re.search(r'client_id\s*[:=]\s*"([A-Za-z0-9]{16,})"', js)
        if m:
            return m.group(1)
    return None


def fetch_sc_tracks(client_id: str) -> list[dict]:
    user = json.loads(
        get_text(
            f"https://api-v2.soundcloud.com/resolve?url={urllib.parse.quote(SC_USER)}&client_id={client_id}"
        )
    )
    uid = user["id"]
    tracks: list[dict] = []
    url = f"https://api-v2.soundcloud.com/users/{uid}/tracks?client_id={client_id}&limit=50"
    while url and len(tracks) < 200:
        payload = json.loads(get_text(url))
        for t in payload.get("collection", []):
            art = (t.get("artwork_url") or "").replace("-large", "-t500x500")
            tracks.append(
                {
                    "title": t.get("title") or "",
                    "permalink": t.get("permalink") or "",
                    "url": t.get("permalink_url") or "",
                    "created": (t.get("created_at") or "")[:10],
                    "artwork": art,
                    "slug": slugify_perm(t.get("permalink") or ""),
                }
            )
        nxt = payload.get("next_href")
        url = f"{nxt}&client_id={client_id}" if nxt and "client_id=" not in nxt else nxt
        time.sleep(0.05)
    return tracks


def discover_spotify_ids(existing: set[str]) -> list[str]:
    found: list[str] = []
    paths = [
        f"https://open.spotify.com/artist/{SPOTIFY_ARTIST}",
        f"https://open.spotify.com/artist/{SPOTIFY_ARTIST}/discography/all",
        f"https://open.spotify.com/artist/{SPOTIFY_ARTIST}/discography/single",
        f"https://open.spotify.com/embed/artist/{SPOTIFY_ARTIST}",
    ]
    for path in paths:
        try:
            html = get_text(path)
            ids = re.findall(r"spotify:track:([A-Za-z0-9]{22})", html)
            ids += re.findall(r"/track/([A-Za-z0-9]{22})", html)
            print("spotify page", path.rsplit("/", 1)[-1] or "artist", "->", len(ids))
            found.extend(ids)
        except Exception as exc:  # noqa: BLE001
            print("spotify page fail", path, exc)
        time.sleep(0.08)

    ordered: list[str] = []
    seen: set[str] = set()
    for tid in found:
        if tid not in seen:
            seen.add(tid)
            ordered.append(tid)
    for tid in sorted(existing):
        if tid not in seen:
            seen.add(tid)
            ordered.append(tid)
    return ordered


def fetch_itunes_songs() -> list[dict]:
    itunes_url = "https://itunes.apple.com/search?" + urllib.parse.urlencode(
        {"term": "Callmestylez", "entity": "song", "limit": 50}
    )
    try:
        itunes = json.loads(get_text(itunes_url))
    except Exception as exc:  # noqa: BLE001
        print("itunes fail", exc)
        return []
    rows = []
    for item in itunes.get("results", []):
        artist = (item.get("artistName") or "").lower()
        name = (item.get("trackName") or "").lower()
        if "callmestylez" not in artist and "callmestylez" not in name:
            continue
        rows.append(
            {
                "title": item.get("trackName") or "",
                "artist": item.get("artistName") or "",
                "date": (item.get("releaseDate") or "")[:10],
                "artwork": (item.get("artworkUrl100") or "").replace("100x100bb", "600x600bb"),
                "apple": item.get("trackViewUrl") or "",
            }
        )
    print("itunes songs", len(rows))
    return rows


def spotify_oembed(tid: str) -> dict | None:
    url = f"https://open.spotify.com/track/{tid}"
    try:
        return json.loads(get_text("https://open.spotify.com/oembed?url=" + urllib.parse.quote(url)))
    except Exception as exc:  # noqa: BLE001
        print("oembed fail", tid, exc)
        return None


def search_spotify_track_id(title: str) -> str | None:
    q = f"{title} Callmestylez"
    try:
        html = get_text("https://open.spotify.com/search/" + urllib.parse.quote(q))
    except Exception as exc:  # noqa: BLE001
        print("search fail", title, exc)
        return None
    ids = re.findall(r"/track/([A-Za-z0-9]{22})", html)
    return ids[0] if ids else None


def refresh_spotify_covers(releases_text: str) -> dict[str, dict]:
    blocks = re.split(r"\n  \{\n", releases_text)[1:]
    slug_to_spotify: dict[str, str] = {}
    for block in blocks:
        slug_m = re.search(r'slug: "([^"]+)"', block)
        sp_m = re.search(r"open\.spotify\.com/track/([A-Za-z0-9]{22})", block)
        if slug_m and sp_m:
            slug_to_spotify[slug_m.group(1)] = sp_m.group(1)

    meta: dict[str, dict] = {}
    for slug, tid in slug_to_spotify.items():
        spotify = f"https://open.spotify.com/track/{tid}"
        d = spotify_oembed(tid)
        if not d:
            meta[slug] = {"id": tid, "spotify": spotify}
            continue
        thumb = d.get("thumbnail_url") or ""
        meta[slug] = {
            "title": d.get("title"),
            "id": tid,
            "cover": thumb,
            "spotify": spotify,
        }
        if thumb:
            dest = COVERS / f"{slug}.jpg"
            try:
                dest.write_bytes(get_bytes(thumb))
                print("cover", slug, dest.stat().st_size)
            except Exception as exc:  # noqa: BLE001
                print("cover fail", slug, exc)
        time.sleep(0.05)
    return meta


def sc_release_block(slug: str, title: str, year: int, url: str, cover: str, stylezmix: bool) -> str:
    kind = "Stylezmix" if stylezmix else "Single"
    mix = ', { role: "Mix", name: "Stylezmix" }' if stylezmix else ""
    desc = (
        "Newest Stylezmix. SoundCloud exclusive."
        if stylezmix
        else "SoundCloud exclusive from the live Callmestylez feed."
    )
    return f"""  {{
    id: "rel-{slug}",
    slug: "{slug}",
    title: {json.dumps(title)},
    year: {year},
    cover: "{cover}",
    audio: "/audio/flatbed-freestyle.wav",
    soundcloudOnly: true,
    type: "{kind}",
    era: "Southside Chronicles",
    description:
      {json.dumps(desc)},
    credits: [{{ role: "Artist", name: "Callmestylez" }}{mix}],
    streamingLinks: {{
      soundcloud: "{url}",
    }},
    characters: ["stylez"],
    locations: ["southside", "the-city"],
    chronicles: ["the-world-comes-online"],
  }},"""


def spotify_release_block(
    slug: str,
    title: str,
    year: int,
    spotify: str,
    cover: str,
    soundcloud: str | None,
) -> str:
    links = f'      spotify: "{spotify}",\n'
    if soundcloud:
        links += f'      soundcloud: "{soundcloud}",\n'
    sc_only_line = "" if spotify else "    soundcloudOnly: true,\n"
    return f"""  {{
    id: "rel-{slug}",
    slug: "{slug}",
    title: {json.dumps(title)},
    year: {year},
    cover: "{cover}",
    audio: "/audio/flatbed-freestyle.wav",
{sc_only_line}    type: "Single",
    era: "Southside Chronicles",
    description:
      "Live DSP cut from Callmestylez.",
    credits: [{{ role: "Artist", name: "Callmestylez" }}],
    streamingLinks: {{
{links}    }},
    characters: ["stylez"],
    locations: ["southside", "the-city"],
    chronicles: ["the-world-comes-online"],
  }},"""


def clear_featured(text: str) -> str:
    text = re.sub(r'\n    subtitle: "Latest file",\n', "\n", text, count=1)
    text = re.sub(r"\n    featured: true,\n", "\n", text, count=1)
    text = re.sub(r'\n    rarity: "Featured",\n', "\n", text, count=1)
    return text


def prepend_character_songs(characters_path: Path, slugs: list[str]) -> None:
    chars = characters_path.read_text(encoding="utf-8")
    m = re.search(r"(songs: \[\n)((?:      \"[^\"]+\",\n)+)", chars)
    if not m:
        return
    existing = m.group(2)
    prefix = "".join(f'      "{slug}",\n' for slug in slugs if f'"{slug}"' not in existing)
    if not prefix:
        return
    chars = chars[: m.start(2)] + prefix + existing + chars[m.end(2) :]
    characters_path.write_text(chars, encoding="utf-8")
    print("characters +", len(slugs))


def attach_spotify_to_existing(releases_text: str, pairs: list[tuple[str, str]]) -> str:
    """pairs: list of (slug, spotify_url) to inject into streamingLinks lacking spotify."""
    for slug, spotify in pairs:
        pattern = re.compile(
            rf'(slug: "{re.escape(slug)}",[\s\S]*?streamingLinks: \{{\n)((?:      \w+: "[^"]+",\n)*)(    \}},)',
            re.M,
        )

        def repl(m: re.Match[str]) -> str:
            body = m.group(2)
            if "spotify:" in body:
                return m.group(0)
            # Prefer spotify first
            return m.group(1) + f'      spotify: "{spotify}",\n' + body + m.group(3)

        new_text, n = pattern.subn(repl, releases_text, count=1)
        if n:
            # Drop soundcloudOnly when Spotify is attached
            block_pat = re.compile(
                rf'(  \{{\n    id: "rel-{re.escape(slug)}",[\s\S]*?)(\n    soundcloudOnly: true,)([\s\S]*?\n  \}},)',
                re.M,
            )
            new_text = block_pat.sub(r"\1\3", new_text, count=1)
            releases_text = new_text
            print("attached spotify", slug)
    return releases_text


def main() -> None:
    releases_path = ROOT / "data" / "releases.ts"
    site_path = ROOT / "data" / "site.ts"
    characters_path = ROOT / "data" / "characters.ts"
    releases_text = releases_path.read_text(encoding="utf-8")
    existing_slugs = set(re.findall(r'slug: "([^"]+)"', releases_text))
    existing_sc = set(re.findall(r'soundcloud: "([^"]+)"', releases_text))
    existing_spotify = set(re.findall(r"open\.spotify\.com/track/([A-Za-z0-9]{22})", releases_text))
    print("existing slugs", len(existing_slugs), "spotify", len(existing_spotify))

    # --- SoundCloud ---
    client_id = find_sc_client_id()
    if not client_id:
        raise SystemExit("Could not resolve SoundCloud client_id")
    print("sc client", client_id)
    sc_tracks = fetch_sc_tracks(client_id)
    print("sc tracks", len(sc_tracks))

    missing_sc: list[dict] = []
    for t in sc_tracks:
        if not t["url"]:
            continue
        if t["url"] in existing_sc or t["slug"] in existing_slugs:
            break
        missing_sc.append(t)
    print("new sc at top", len(missing_sc))
    for t in missing_sc:
        print(" + sc", t["created"], t["title"], "->", t["slug"])

    sc_by_norm = {normalize_title(t["title"]): t for t in sc_tracks if t.get("title")}

    # --- Spotify / iTunes discovery ---
    spotify_ids = discover_spotify_ids(existing_spotify)
    print("spotify ids", len(spotify_ids))
    itunes_songs = fetch_itunes_songs()

    new_spotify: list[dict] = []
    seen_new_ids = set(existing_spotify)
    attach_pairs: list[tuple[str, str]] = []

    # Map existing SC-only slugs by normalized title / slug for attach
    blocks = re.split(r"\n  \{\n", releases_text)[1:]
    sc_only_by_norm: dict[str, str] = {}
    sc_only_by_slug: dict[str, str] = {}
    for block in blocks:
        slug_m = re.search(r'slug: "([^"]+)"', block)
        title_m = re.search(r'title: "([^"]+)"', block)
        has_sp = "open.spotify.com/track/" in block
        if slug_m and title_m and not has_sp:
            sc_only_by_norm[normalize_title(title_m.group(1))] = slug_m.group(1)
            sc_only_by_slug[slug_m.group(1)] = title_m.group(1)

    # Spotify page / embed ids not yet in the catalogue
    for tid in spotify_ids:
        if tid in seen_new_ids:
            continue
        meta = spotify_oembed(tid)
        time.sleep(0.05)
        if not meta:
            continue
        title = meta.get("title") or tid
        slug = slugify(title)
        spotify_url = f"https://open.spotify.com/track/{tid}"
        # Existing SC-only with same slug/title → attach Spotify link
        attach_slug = slug if slug in sc_only_by_slug else sc_only_by_norm.get(normalize_title(title))
        if attach_slug:
            attach_pairs.append((attach_slug, spotify_url))
            seen_new_ids.add(tid)
            print("attach sp", attach_slug, "->", tid, title)
            continue
        if slug in existing_slugs or any(n["slug"] == slug for n in new_spotify):
            seen_new_ids.add(tid)
            continue
        sc_match = sc_by_norm.get(normalize_title(title))
        new_spotify.append(
            {
                "id": tid,
                "title": title,
                "slug": slug,
                "spotify": spotify_url,
                "cover_url": meta.get("thumbnail_url") or "",
                "date": "",
                "soundcloud": sc_match["url"] if sc_match else None,
            }
        )
        seen_new_ids.add(tid)
        print(" + sp page", title, "->", slug, tid)

    # iTunes titles → search Spotify for anything not already covered
    existing_norms = {normalize_title(t) for t in re.findall(r'title: "([^"]+)"', releases_text)}
    existing_norms |= {normalize_title(s.replace("-", " ")) for s in existing_slugs}
    for song in itunes_songs:
        norm = normalize_title(song["title"])
        if norm in existing_norms:
            continue
        if any(normalize_title(n["title"]) == norm for n in new_spotify):
            continue
        tid = search_spotify_track_id(song["title"])
        time.sleep(0.12)
        if not tid or tid in seen_new_ids:
            continue
        meta = spotify_oembed(tid)
        time.sleep(0.05)
        if not meta:
            continue
        title = meta.get("title") or song["title"]
        slug = slugify(title)
        if slug in existing_slugs or any(n["slug"] == slug for n in new_spotify):
            seen_new_ids.add(tid)
            continue
        sc_match = sc_by_norm.get(normalize_title(title))
        new_spotify.append(
            {
                "id": tid,
                "title": title,
                "slug": slug,
                "spotify": f"https://open.spotify.com/track/{tid}",
                "cover_url": meta.get("thumbnail_url") or song.get("artwork") or "",
                "date": song.get("date") or "",
                "soundcloud": sc_match["url"] if sc_match else None,
            }
        )
        seen_new_ids.add(tid)
        existing_norms.add(norm)
        print(" + sp itunes", song.get("date"), title, "->", slug, tid)

    # Also attach via iTunes title matches for remaining SC-only rows
    already_attached = {slug for slug, _ in attach_pairs}
    for song in itunes_songs:
        slug = sc_only_by_norm.get(normalize_title(song["title"]))
        if not slug or slug in already_attached:
            continue
        tid = search_spotify_track_id(song["title"])
        time.sleep(0.12)
        if not tid or tid in seen_new_ids:
            continue
        attach_pairs.append((slug, f"https://open.spotify.com/track/{tid}"))
        seen_new_ids.add(tid)
        print("attach itunes", slug, "->", tid)

    # --- Build inserts ---
    new_blocks: list[str] = []
    new_slugs: list[str] = []

    # Spotify new rows first among DSP (but SC exclusives stay featured at very top)
    for t in missing_sc:
        slug = t["slug"] or slugify_perm(t["permalink"])
        year = int((t["created"] or "2026")[:4] or "2026")
        cover_file = COVERS / f"{slug}.jpg"
        if t["artwork"]:
            try:
                if not cover_file.exists() or cover_file.stat().st_size < 1000:
                    cover_file.write_bytes(get_bytes(t["artwork"]))
                    print("sc cover", cover_file.name)
            except Exception as exc:  # noqa: BLE001
                print("sc cover fail", slug, exc)
        cover = f"/art/covers/{slug}.jpg" if cover_file.exists() else "/art/covers/body-by-raven.jpg"
        stylezmix = "stylezmix" in slug.lower() or "stylezmix" in (t["title"] or "").lower()
        new_blocks.append(sc_release_block(slug, t["title"], year, t["url"], cover, stylezmix))
        new_slugs.append(slug)
        existing_slugs.add(slug)

    # Sort new Spotify by date desc when available
    new_spotify.sort(key=lambda x: x.get("date") or "", reverse=True)
    for sp in new_spotify:
        slug = sp["slug"]
        if slug in existing_slugs:
            continue
        year = int((sp.get("date") or "2026")[:4] or "2026")
        cover_file = COVERS / f"{slug}.jpg"
        if sp.get("cover_url"):
            try:
                if not cover_file.exists() or cover_file.stat().st_size < 1000:
                    cover_file.write_bytes(get_bytes(sp["cover_url"]))
                    print("sp cover", cover_file.name)
            except Exception as exc:  # noqa: BLE001
                print("sp cover fail", slug, exc)
        cover = f"/art/covers/{slug}.jpg" if cover_file.exists() else "/art/covers/gl0ckianna.jpg"
        new_blocks.append(
            spotify_release_block(slug, sp["title"], year, sp["spotify"], cover, sp.get("soundcloud"))
        )
        new_slugs.append(slug)
        existing_slugs.add(slug)

    if attach_pairs:
        releases_text = attach_spotify_to_existing(releases_text, attach_pairs)

    if new_blocks:
        releases_text = clear_featured(releases_text)
        if missing_sc:
            head = new_blocks[0]
            head = head.replace(
                f'    title: {json.dumps(missing_sc[0]["title"])},\n    year:',
                f'    title: {json.dumps(missing_sc[0]["title"])},\n    subtitle: "Latest file",\n    year:',
                1,
            )
            head = head.replace(
                "    soundcloudOnly: true,\n",
                "    featured: true,\n    soundcloudOnly: true,\n",
                1,
            )
            head = head.replace(
                '    type: "',
                '    rarity: "Featured",\n    type: "',
                1,
            )
            new_blocks[0] = head

        insert = "\n".join(new_blocks) + "\n"
        anchor = "export const releases: Release[] = [\n"
        if anchor not in releases_text:
            raise SystemExit("releases array anchor missing")
        releases_text = releases_text.replace(anchor, anchor + insert, 1)
        print("inserted", len(new_blocks))

    releases_path.write_text(releases_text, encoding="utf-8")

    site_text = site_path.read_text(encoding="utf-8")
    if missing_sc:
        newest_sc = missing_sc[0]["slug"]
        site_text = re.sub(
            r'featuredReleaseSlug: "[^"]+"',
            f'featuredReleaseSlug: "{newest_sc}"',
            site_text,
            count=1,
        )
        site_text = re.sub(
            r'soundcloudStartSlug: "[^"]+"',
            f'soundcloudStartSlug: "{newest_sc}"',
            site_text,
            count=1,
        )
        print("featured/start ->", newest_sc)

    if new_spotify:
        latest_sp = new_spotify[0]["slug"]
        site_text = re.sub(
            r'latestSpotifySlug: "[^"]+"',
            f'latestSpotifySlug: "{latest_sp}"',
            site_text,
            count=1,
        )
        print("latestSpotify ->", latest_sp)
    elif attach_pairs:
        # Newly attached DSP cuts also count as the latest Spotify lead.
        latest_sp = attach_pairs[0][0]
        site_text = re.sub(
            r'latestSpotifySlug: "[^"]+"',
            f'latestSpotifySlug: "{latest_sp}"',
            site_text,
            count=1,
        )
        print("latestSpotify ->", latest_sp)

    site_path.write_text(site_text, encoding="utf-8")

    if new_slugs:
        prepend_character_songs(characters_path, new_slugs)
    elif not new_blocks and not attach_pairs:
        print("catalogue already current")

    dsp_meta = refresh_spotify_covers(releases_path.read_text(encoding="utf-8"))
    out = {
        "dsp": dsp_meta,
        "missing_sc": missing_sc,
        "new_spotify": new_spotify,
        "attached_spotify": attach_pairs,
        "sc_all": sc_tracks,
        "added": new_slugs,
    }
    (ROOT / "scripts" / "dsp-refresh.json").write_text(json.dumps(out, indent=2), encoding="utf-8")
    final = releases_path.read_text(encoding="utf-8")
    print(
        "done",
        "slugs",
        len(re.findall(r'slug: "', final)),
        "spotify",
        len(re.findall(r"open\.spotify\.com/track/", final)),
        "added",
        len(new_slugs),
        "attached",
        len(attach_pairs),
    )


if __name__ == "__main__":
    main()
