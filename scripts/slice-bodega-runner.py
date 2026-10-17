from PIL import Image
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
src = ROOT / "public" / "art" / "bodega-runner.png"
out_dir = ROOT / "public" / "art" / "bodega"
out_dir.mkdir(parents=True, exist_ok=True)

im = Image.open(src).convert("RGBA")
w, h = im.size
px = im.load()
n = 7
cell = w / n
meta = []

for i in range(n):
    x0 = int(round(i * cell))
    x1 = int(round((i + 1) * cell))
    ymin, ymax = h, 0
    xmin, xmax = x1, x0
    for x in range(x0, x1):
        for y in range(h):
            r, g, b, a = px[x, y]
            if a > 18 and (r + g + b) > 40:
                ymin = min(ymin, y)
                ymax = max(ymax, y)
                xmin = min(xmin, x)
                xmax = max(xmax, x)
    if xmax < xmin:
        box = (x0, 0, x1, h)
    else:
        pad = 2
        box = (
            max(x0, xmin - pad),
            max(0, ymin - pad),
            min(x1, xmax + 1 + pad),
            min(h, ymax + 1 + pad),
        )
    frame = im.crop(box)
    fp = frame.load()
    fw, fh = frame.size
    for x in range(fw):
        for y in range(fh):
            r, g, b, a = fp[x, y]
            if r + g + b < 45:
                fp[x, y] = (0, 0, 0, 0)
    path = out_dir / f"frame-{i}.png"
    frame.save(path)
    meta.append({"i": i, "w": fw, "h": fh, "src": f"/art/bodega/frame-{i}.png"})
    print(i, box, fw, fh)

max_w = max(m["w"] for m in meta)
max_h = max(m["h"] for m in meta)
print("max", max_w, max_h)

sheet = Image.new("RGBA", (max_w * n, max_h), (0, 0, 0, 0))
for i in range(n):
    fr = Image.open(out_dir / f"frame-{i}.png")
    ox = i * max_w + (max_w - fr.size[0]) // 2
    oy = max_h - fr.size[1]
    sheet.paste(fr, (ox, oy), fr)

sheet_path = out_dir / "runner-sheet.png"
sheet.save(sheet_path)
print("sheet", sheet.size)

(out_dir / "frames.json").write_text(
    json.dumps({"frameW": max_w, "frameH": max_h, "count": n, "frames": meta}, indent=2),
    encoding="utf-8",
)
