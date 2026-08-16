/**
 * Generates cinematic placeholder environment / cover / portrait SVGs.
 * Replace these files later with painted or photographic Southside artwork.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "art");

function mulberry32(a) {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function defs(id) {
  return `
  <defs>
    <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#020B11"/>
      <stop offset="38%" stop-color="#061B2A"/>
      <stop offset="72%" stop-color="#073C5A"/>
      <stop offset="100%" stop-color="#020B11"/>
    </linearGradient>
    <radialGradient id="${id}-moon" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#D9F7F5"/>
      <stop offset="42%" stop-color="#00E5FF" stop-opacity=".55"/>
      <stop offset="100%" stop-color="#00AEEA" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${id}-wet" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#073C5A"/>
      <stop offset="40%" stop-color="#061B2A"/>
      <stop offset="100%" stop-color="#010508"/>
    </linearGradient>
    <linearGradient id="${id}-fog" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#00AEEA" stop-opacity="0"/>
      <stop offset="50%" stop-color="#00E5FF" stop-opacity=".12"/>
      <stop offset="100%" stop-color="#020B11" stop-opacity=".55"/>
    </linearGradient>
    <linearGradient id="${id}-neon" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#F20BA8"/>
      <stop offset="100%" stop-color="#FF2AC3"/>
    </linearGradient>
    <filter id="${id}-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.18"/>
      </feComponentTransfer>
    </filter>
    <filter id="${id}-glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge>
        <feMergeNode in="b"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>`;
}

function stars(rng, w, h, n = 70) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const x = (rng() * w).toFixed(1);
    const y = (rng() * h * 0.42).toFixed(1);
    const r = (0.4 + rng() * 1.3).toFixed(2);
    const c = rng() > 0.8 ? "#62FF5B" : rng() > 0.5 ? "#00E5FF" : "#D9F7F5";
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${(0.25 + rng() * 0.7).toFixed(2)}"/>`;
  }
  return s;
}

function windows(rng, x, y, w, h) {
  let s = "";
  const cols = Math.max(2, Math.floor(w / 9));
  const rows = Math.max(3, Math.floor(h / 13));
  const palette = ["#00E5FF", "#00AEEA", "#19E642", "#62FF5B", "#F20BA8", "#FF2AC3", "#D9F7F5"];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (rng() < 0.38) continue;
      const fill = palette[Math.floor(rng() * palette.length)];
      s += `<rect x="${(x + 3 + c * (w / cols)).toFixed(1)}" y="${(y + 8 + r * (h / rows)).toFixed(1)}" width="${Math.max(2, w / cols - 5).toFixed(1)}" height="${Math.max(3, h / rows - 7).toFixed(1)}" fill="${fill}" opacity="${(0.28 + rng() * 0.62).toFixed(2)}"/>`;
    }
  }
  return s;
}

function building(rng, { x, y, w, h, fill = "#061B2A" }) {
  const roof = rng() > 0.55;
  const water = rng() > 0.7;
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>
    <rect x="${x}" y="${y}" width="${w}" height="2" fill="#00E5FF" opacity=".22"/>
    ${roof ? `<rect x="${x + w * 0.18}" y="${y - 18}" width="${w * 0.18}" height="18" fill="#073C5A"/>` : ""}
    ${water ? `<ellipse cx="${x + w * 0.72}" cy="${y - 6}" rx="10" ry="6" fill="#073C5A"/><ellipse cx="${x + w * 0.72}" cy="${y - 6}" rx="7" ry="4" fill="#061B2A"/>` : ""}
    ${windows(rng, x, y, w, h)}
    <rect x="${x}" y="${y}" width="2" height="${h}" fill="#00E5FF" opacity=".12"/>
  </g>`;
}

function streetlights(w, streetY, n = 8) {
  let s = "";
  const gap = w / (n + 1);
  for (let i = 1; i <= n; i++) {
    const x = gap * i;
    s += `<g>
      <rect x="${x - 1.5}" y="${streetY - 92}" width="3" height="92" fill="#073C5A"/>
      <rect x="${x - 14}" y="${streetY - 98}" width="28" height="4" fill="#00AEEA"/>
      <ellipse cx="${x}" cy="${streetY}" rx="38" ry="10" fill="#00E5FF" opacity=".12"/>
      <circle cx="${x}" cy="${streetY - 96}" r="5" fill="#D9F7F5" opacity=".85"/>
    </g>`;
  }
  return s;
}

function car(x, y, color, police = false) {
  return `<g transform="translate(${x} ${y})">
    <rect x="0" y="8" width="78" height="18" rx="3" fill="${color}"/>
    <rect x="14" y="0" width="42" height="14" fill="#061B2A"/>
    <rect x="18" y="2" width="16" height="8" fill="#00E5FF" opacity=".45"/>
    <rect x="38" y="2" width="14" height="8" fill="#00AEEA" opacity=".35"/>
    <circle cx="16" cy="28" r="6" fill="#020B11"/>
    <circle cx="62" cy="28" r="6" fill="#020B11"/>
    <circle cx="16" cy="28" r="2.5" fill="#19E642"/>
    <circle cx="62" cy="28" r="2.5" fill="#19E642"/>
    <rect x="74" y="12" width="8" height="5" fill="#D9F7F5" opacity=".9"/>
    <ellipse cx="86" cy="14" rx="16" ry="5" fill="#D9F7F5" opacity=".18"/>
    ${police ? `<rect x="28" y="-4" width="10" height="5" fill="#F20BA8"/><rect x="38" y="-4" width="10" height="5" fill="#00E5FF"/>` : `<rect x="2" y="12" width="6" height="5" fill="#F20BA8"/>`}
  </g>`;
}

function subway(y, w) {
  return `<g>
    <rect x="0" y="${y}" width="${w}" height="10" fill="#073C5A"/>
    <rect x="0" y="${y + 10}" width="${w}" height="4" fill="#00AEEA" opacity=".35"/>
    ${Array.from({ length: 18 }, (_, i) => `<rect x="${40 + i * 104}" y="${y - 52}" width="8" height="52" fill="#061B2A"/>`).join("")}
    <rect x="80" y="${y - 46}" width="420" height="36" fill="#020B11"/>
    <rect x="88" y="${y - 40}" width="50" height="18" fill="#00E5FF" opacity=".55"/>
    <rect x="148" y="${y - 40}" width="50" height="18" fill="#19E642" opacity=".4"/>
    <rect x="208" y="${y - 40}" width="50" height="18" fill="#F20BA8" opacity=".45"/>
    <rect x="268" y="${y - 40}" width="50" height="18" fill="#00AEEA" opacity=".5"/>
    <text x="340" y="${y - 26}" fill="#62FF5B" font-size="11" font-family="monospace" letter-spacing="3">7</text>
  </g>`;
}

function neonSign(x, y, text) {
  return `<g filter="url(#np-glow)">
    <rect x="${x}" y="${y}" width="${text.length * 11 + 16}" height="22" fill="#321052" opacity=".85"/>
    <text x="${x + 8}" y="${y + 16}" fill="#FF2AC3" font-size="13" font-family="monospace" letter-spacing="2">${text}</text>
  </g>`;
}

function southside(w, h, seed, extra = "") {
  const rng = mulberry32(seed);
  const streetY = h * 0.72;
  const skyline = [
    { x: -20, y: h * 0.28, w: 90, h: streetY - h * 0.28, fill: "#04141f" },
    { x: 60, y: h * 0.22, w: 120, h: streetY - h * 0.22, fill: "#061B2A" },
    { x: 170, y: h * 0.18, w: 70, h: streetY - h * 0.18, fill: "#073C5A" },
    { x: 230, y: h * 0.3, w: 160, h: streetY - h * 0.3, fill: "#051821" },
    { x: 380, y: h * 0.12, w: 88, h: streetY - h * 0.12, fill: "#061B2A" },
    { x: 460, y: h * 0.24, w: 140, h: streetY - h * 0.24, fill: "#041018" },
    { x: 590, y: h * 0.16, w: 110, h: streetY - h * 0.16, fill: "#073C5A" },
    { x: 690, y: h * 0.26, w: 80, h: streetY - h * 0.26, fill: "#061B2A" },
    { x: 760, y: h * 0.1, w: 70, h: streetY - h * 0.1, fill: "#321052" },
    { x: 820, y: h * 0.2, w: 150, h: streetY - h * 0.2, fill: "#051821" },
    { x: 960, y: h * 0.14, w: 100, h: streetY - h * 0.14, fill: "#061B2A" },
    { x: 1050, y: h * 0.28, w: 180, h: streetY - h * 0.28, fill: "#04141f" },
    { x: 1210, y: h * 0.18, w: 90, h: streetY - h * 0.18, fill: "#073C5A" },
    { x: 1290, y: h * 0.08, w: 64, h: streetY - h * 0.08, fill: "#321052" },
    { x: 1340, y: h * 0.22, w: 160, h: streetY - h * 0.22, fill: "#061B2A" },
    { x: 1480, y: h * 0.15, w: 120, h: streetY - h * 0.15, fill: "#051821" },
    { x: 1580, y: h * 0.25, w: 200, h: streetY - h * 0.25, fill: "#041018" },
    { x: 1760, y: h * 0.12, w: 180, h: streetY - h * 0.12, fill: "#061B2A" },
  ].filter((b) => b.x < w);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" role="img">
  <!-- PLACEHOLDER ART: cinematic Southside Queens night — replace with painted/photographic artwork -->
  ${defs("np")}
  <rect width="${w}" height="${h}" fill="url(#np-sky)"/>
  ${stars(rng, w, h, 90)}
  <circle cx="${w * 0.78}" cy="${h * 0.14}" r="90" fill="url(#np-moon)"/>
  <circle cx="${w * 0.78}" cy="${h * 0.14}" r="18" fill="#D9F7F5"/>
  <ellipse cx="${w * 0.5}" cy="${h * 0.62}" rx="${w * 0.7}" ry="70" fill="#00AEEA" opacity=".08"/>
  ${skyline.map((b) => building(rng, b)).join("")}
  ${subway(streetY - 118, w)}
  <rect x="0" y="${streetY}" width="${w}" height="${h - streetY}" fill="url(#np-wet)"/>
  <path d="M0 ${streetY + 8} L${w} ${streetY + 8}" stroke="#00E5FF" stroke-opacity=".18" stroke-width="2"/>
  <path d="M0 ${streetY + 28} L${w} ${streetY + 28}" stroke="#19E642" stroke-opacity=".12" stroke-dasharray="18 22"/>
  ${streetlights(w, streetY, Math.round(w / 220))}
  ${neonSign(120, streetY - 160, "BODEGA")}
  ${neonSign(w * 0.42, streetY - 148, "OPEN")}
  ${neonSign(w * 0.68, streetY - 170, "AVE")}
  ${car(w * 0.18, streetY + 18, "#073C5A")}
  ${car(w * 0.38, streetY + 26, "#020B11", true)}
  ${car(w * 0.62, streetY + 14, "#321052")}
  ${car(w * 0.82, streetY + 22, "#061B2A")}
  <rect width="${w}" height="${h}" fill="url(#np-fog)"/>
  <rect width="${w}" height="${h}" filter="url(#np-grain)"/>
  ${extra}
</svg>`;
}

function studio() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" role="img">
  <!-- PLACEHOLDER ART: env-studio-crt — Stylez in a dark studio, screens, neon, CRTs -->
  ${defs("st")}
  <rect width="1200" height="800" fill="#020B11"/>
  <rect x="0" y="0" width="1200" height="800" fill="#061B2A"/>
  <rect x="40" y="70" width="420" height="260" fill="#010508" stroke="#00E5FF" stroke-opacity=".35"/>
  <rect x="58" y="88" width="384" height="210" fill="#073C5A"/>
  <g opacity=".8">
    ${Array.from({ length: 12 }, (_, i) => `<rect x="${70 + (i % 6) * 62}" y="${100 + Math.floor(i / 6) * 90}" width="52" height="70" fill="${i % 3 === 0 ? "#19E642" : i % 3 === 1 ? "#00E5FF" : "#F20BA8"}" opacity=".35"/>`).join("")}
  </g>
  <rect x="500" y="50" width="280" height="180" fill="#010508" stroke="#F20BA8" stroke-opacity=".45"/>
  <rect x="516" y="66" width="248" height="148" fill="#321052"/>
  <text x="540" y="150" fill="#FF2AC3" font-size="28" font-family="monospace">STYLEZ</text>
  <rect x="820" y="80" width="340" height="220" fill="#010508" stroke="#19E642" stroke-opacity=".4"/>
  <rect x="836" y="96" width="308" height="188" fill="#04141f"/>
  ${Array.from({ length: 40 }, (_, i) => `<rect x="${850 + i * 7}" y="${120 + (i % 7) * 18}" width="4" height="${20 + (i % 5) * 12}" fill="#62FF5B" opacity=".7"/>`).join("")}
  <rect x="0" y="430" width="1200" height="370" fill="#041018"/>
  <rect x="80" y="470" width="1040" height="18" fill="#073C5A"/>
  <rect x="160" y="510" width="220" height="90" fill="#061B2A" stroke="#00AEEA" stroke-opacity=".4"/>
  <rect x="420" y="500" width="360" height="110" fill="#020B11" stroke="#19E642" stroke-opacity=".35"/>
  <circle cx="600" cy="555" r="28" fill="#073C5A"/>
  <circle cx="600" cy="555" r="10" fill="#19E642"/>
  <rect x="820" y="520" width="200" height="80" fill="#321052"/>
  <g transform="translate(470 250)">
    <ellipse cx="130" cy="210" rx="90" ry="28" fill="#000" opacity=".45"/>
    <rect x="70" y="80" width="120" height="150" fill="#0a0a0a"/>
    <rect x="58" y="70" width="144" height="40" fill="#111"/>
    <circle cx="130" cy="40" r="36" fill="#1a120e"/>
    <circle cx="118" cy="36" r="4" fill="#00E5FF"/>
    <circle cx="142" cy="36" r="4" fill="#19E642"/>
    <path d="M100 78 Q130 96 160 78" fill="none" stroke="#F20BA8" stroke-width="3"/>
    <rect x="108" y="92" width="44" height="8" fill="#C9A227"/>
    <rect x="90" y="230" width="36" height="70" fill="#061B2A"/>
    <rect x="134" y="230" width="36" height="70" fill="#061B2A"/>
  </g>
  <ellipse cx="200" cy="760" rx="260" ry="40" fill="#00E5FF" opacity=".08"/>
  <ellipse cx="980" cy="760" rx="220" ry="36" fill="#F20BA8" opacity=".1"/>
  <rect width="1200" height="800" fill="url(#st-fog)"/>
  <rect width="1200" height="800" filter="url(#st-grain)"/>
</svg>`;
}

function chase() {
  const rng = mulberry32(91);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" role="img">
  <!-- PLACEHOLDER ART: env-arcade-chase — night drive through Southside, police lights, wet road -->
  ${defs("ch")}
  <rect width="1200" height="800" fill="url(#ch-sky)"/>
  ${stars(rng, 1200, 800, 60)}
  <circle cx="980" cy="90" r="70" fill="url(#ch-moon)"/>
  <circle cx="980" cy="90" r="16" fill="#D9F7F5"/>
  ${[
    [0, 160, 140, 360],
    [120, 120, 90, 400],
    [200, 200, 160, 320],
    [820, 140, 120, 380],
    [930, 90, 80, 430],
    [1000, 170, 200, 350],
  ]
    .map(([x, y, w, h]) => building(rng, { x, y, w, h, fill: "#061B2A" }))
    .join("")}
  <polygon points="0,520 1200,520 1200,800 0,800" fill="url(#ch-wet)"/>
  <polygon points="430,520 770,520 1100,800 100,800" fill="#020B11" opacity=".55"/>
  <path d="M600 520 L430 800" stroke="#19E642" stroke-width="4" opacity=".55"/>
  <path d="M600 520 L770 800" stroke="#19E642" stroke-width="4" opacity=".55"/>
  <g>
    ${Array.from({ length: 9 }, (_, i) => `<rect x="${590}" y="${540 + i * 28}" width="20" height="14" fill="#D9F7F5" opacity="${0.7 - i * 0.06}"/>`).join("")}
  </g>
  ${car(520, 610, "#073C5A")}
  ${car(640, 670, "#020B11", true)}
  <ellipse cx="700" cy="676" rx="40" ry="10" fill="#F20BA8" opacity=".25"/>
  <ellipse cx="760" cy="676" rx="40" ry="10" fill="#00E5FF" opacity=".25"/>
  ${neonSign(80, 300, "SOUTHSIDE")}
  ${neonSign(860, 260, "OPEN 24")}
  <rect width="1200" height="800" fill="url(#ch-fog)"/>
  <rect width="1200" height="800" filter="url(#ch-grain)"/>
</svg>`;
}

function mystery() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice" role="img">
  <!-- PLACEHOLDER ART: env-mystery-silhouette — locked cabinet / unknown character -->
  ${defs("my")}
  <rect width="800" height="1000" fill="#020B11"/>
  <rect width="800" height="1000" fill="#061B2A" opacity=".7"/>
  <circle cx="400" cy="280" r="180" fill="#321052" opacity=".45"/>
  <circle cx="400" cy="280" r="90" fill="#F20BA8" opacity=".12"/>
  <ellipse cx="400" cy="820" rx="160" ry="28" fill="#000" opacity=".6"/>
  <path d="M250 820 L280 430 L400 220 L520 430 L550 820 Z" fill="#010508"/>
  <path d="M310 430 L400 250 L490 430 L470 800 L330 800 Z" fill="#041018"/>
  <circle cx="400" cy="300" r="48" fill="#0a0a0a"/>
  <circle cx="388" cy="292" r="6" fill="#00E5FF" opacity=".7"/>
  <circle cx="414" cy="292" r="6" fill="#19E642" opacity=".35"/>
  <text x="400" y="930" text-anchor="middle" fill="#FF2AC3" font-size="64" font-family="monospace">???</text>
  <rect width="800" height="1000" fill="url(#my-fog)"/>
  <rect width="800" height="1000" filter="url(#my-grain)"/>
</svg>`;
}

function skylineBg() {
  const rng = mulberry32(3);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
  <!-- PLACEHOLDER ART: env-world-skyline — faint NYC underlay -->
  ${defs("bg")}
  <rect width="1920" height="1080" fill="#020B11"/>
  ${stars(rng, 1920, 1080, 120)}
  <g opacity=".55">
    ${[
      [40, 520, 80, 280],
      [140, 480, 110, 320],
      [270, 560, 70, 240],
      [360, 430, 90, 370],
      [470, 500, 160, 300],
      [650, 390, 70, 410],
      [740, 470, 120, 330],
      [880, 420, 100, 380],
      [1000, 510, 140, 290],
      [1160, 400, 60, 400],
      [1240, 460, 180, 340],
      [1440, 430, 90, 370],
      [1550, 500, 130, 300],
      [1700, 440, 160, 360],
    ]
      .map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#073C5A"/>`)
      .join("")}
  </g>
  <g fill="none" stroke="#00E5FF" stroke-opacity=".12" stroke-width="1">
    <circle cx="960" cy="900" r="220"/>
    <circle cx="960" cy="900" r="340"/>
    <circle cx="960" cy="900" r="480"/>
    <path d="M0 900 L1920 900"/>
    <path d="M960 900 L240 200"/>
    <path d="M960 900 L1680 180"/>
  </g>
  <rect width="1920" height="1080" fill="url(#bg-fog)"/>
</svg>`;
}

function cover({ title, accent, seed, extra }) {
  const rng = mulberry32(seed);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice" role="img">
  <!-- PLACEHOLDER ART: album cover — replace with final artwork -->
  ${defs("cv")}
  <rect width="800" height="800" fill="url(#cv-sky)"/>
  ${stars(rng, 800, 800, 40)}
  <circle cx="640" cy="110" r="80" fill="url(#cv-moon)"/>
  ${[
    [0, 180, 110, 380],
    [90, 140, 80, 420],
    [160, 210, 140, 350],
    [520, 160, 100, 400],
    [610, 120, 70, 440],
    [670, 200, 140, 360],
  ]
    .map(([x, y, w, h]) => building(rng, { x, y, w, h, fill: "#061B2A" }))
    .join("")}
  <rect x="0" y="560" width="800" height="240" fill="url(#cv-wet)"/>
  ${extra}
  <rect x="0" y="0" width="800" height="800" fill="none" stroke="${accent}" stroke-width="18" opacity=".55"/>
  <rect x="22" y="22" width="756" height="756" fill="none" stroke="#00E5FF" stroke-width="2" opacity=".35"/>
  <text x="40" y="740" fill="#D9F7F5" font-size="36" font-family="monospace">${title}</text>
  <text x="40" y="768" fill="${accent}" font-size="14" font-family="monospace" letter-spacing="6">CALLMESTYLEZ</text>
  <rect width="800" height="800" filter="url(#cv-grain)"/>
</svg>`;
}

function portrait() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Stylez portrait placeholder">
  <!-- PLACEHOLDER ART: portrait-stylez — replace with Stylez game-world portrait -->
  ${defs("pr")}
  <rect width="600" height="800" fill="#020B11"/>
  <rect x="0" y="0" width="600" height="800" fill="#061B2A"/>
  <circle cx="80" cy="120" r="120" fill="#F20BA8" opacity=".18"/>
  <circle cx="540" cy="160" r="140" fill="#00E5FF" opacity=".16"/>
  <rect x="40" y="80" width="160" height="100" fill="#010508" stroke="#19E642" stroke-opacity=".4"/>
  <rect x="400" y="70" width="160" height="110" fill="#010508" stroke="#F20BA8" stroke-opacity=".4"/>
  ${Array.from({ length: 18 }, (_, i) => `<rect x="${50 + (i % 6) * 24}" y="${90 + Math.floor(i / 6) * 28}" width="18" height="18" fill="#62FF5B" opacity=".35"/>`).join("")}
  <ellipse cx="300" cy="730" rx="160" ry="30" fill="#000" opacity=".5"/>
  <rect x="170" y="430" width="260" height="280" fill="#0b0b0b"/>
  <path d="M150 430 L450 430 L500 760 L100 760 Z" fill="#111"/>
  <rect x="210" y="430" width="180" height="40" fill="#1a1a1a"/>
  <circle cx="300" cy="300" r="92" fill="#1c140f"/>
  <path d="M210 300 Q300 210 390 300 L370 250 Q300 190 230 250 Z" fill="#0a0a0a"/>
  <circle cx="270" cy="295" r="7" fill="#00E5FF"/>
  <circle cx="332" cy="295" r="7" fill="#19E642"/>
  <path d="M270 340 Q300 356 330 340" fill="none" stroke="#F20BA8" stroke-width="3"/>
  <rect x="262" y="390" width="76" height="10" fill="#C9A227"/>
  <circle cx="300" cy="408" r="8" fill="#C9A227"/>
  <rect x="0" y="0" width="600" height="800" fill="none" stroke="#19E642" stroke-width="8" opacity=".25"/>
  <rect width="600" height="800" filter="url(#pr-grain)"/>
</svg>`;
}

function eye() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Winged eye emblem">
  <!-- PLACEHOLDER ART: logo-eye — winged-eye emblem -->
  <defs>
    <filter id="eg" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="1.2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="128" height="128" fill="none"/>
  <g filter="url(#eg)" fill="none" stroke="#19E642" stroke-width="3">
    <path d="M8 64 C28 40 28 40 46 52 C34 58 22 62 8 64 C22 66 34 70 46 76 C28 88 28 88 8 64Z"/>
    <path d="M120 64 C100 40 100 40 82 52 C94 58 106 62 120 64 C106 66 94 70 82 76 C100 88 100 88 120 64Z"/>
  </g>
  <ellipse cx="64" cy="64" rx="28" ry="18" fill="#061B2A" stroke="#62FF5B" stroke-width="3"/>
  <circle cx="64" cy="64" r="10" fill="#00E5FF"/>
  <circle cx="64" cy="64" r="4" fill="#020B11"/>
  <circle cx="61" cy="61" r="2" fill="#D9F7F5"/>
  <path d="M36 64 Q64 44 92 64 Q64 84 36 64" fill="none" stroke="#00E5FF" stroke-width="1.5" opacity=".7"/>
</svg>`;
}

const files = {
  "env-southside-night.svg": southside(1920, 1080, 11),
  "env-world-skyline.svg": skylineBg(),
  "env-studio-crt.svg": studio(),
  "env-arcade-chase.svg": chase(),
  "env-mystery-silhouette.svg": mystery(),
  "now-playing-city.svg": southside(1600, 720, 11),
  "loc-southside.svg": southside(1400, 900, 11),
  "loc-city.svg": southside(1400, 900, 44),
  "loc-ave.svg": southside(1400, 900, 77, neonSign(200, 480, "THE AVE")),
  "studio-night.svg": studio(),
  "loc-studio.svg": studio(),
  "game-flatbed-run.svg": chase(),
  "game-mystery.svg": mystery(),
  "cover-flatbed.svg": cover({
    title: "FLATBED",
    accent: "#19E642",
    seed: 21,
    extra: `${car(240, 590, "#073C5A")}${car(430, 610, "#020B11", true)}`,
  }),
  "cover-jesus-piece.svg": cover({
    title: "JESUS PIECE",
    accent: "#C9A227",
    seed: 33,
    extra: `<circle cx="400" cy="430" r="70" fill="none" stroke="#C9A227" stroke-width="8"/><circle cx="400" cy="430" r="18" fill="#C9A227"/>`,
  }),
  "cover-different-one.svg": cover({
    title: "DIFFERENT ONE",
    accent: "#00E5FF",
    seed: 48,
    extra: `<rect x="300" y="300" width="200" height="260" fill="#020B11" opacity=".5"/><circle cx="400" cy="360" r="40" fill="#1c140f"/>`,
  }),
  "cover-songs-of-sorrow.svg": cover({
    title: "SONGS OF SORROW",
    accent: "#F20BA8",
    seed: 62,
    extra: `<path d="M360 300 Q400 240 440 300 Q480 360 400 470 Q320 360 360 300Z" fill="#321052" stroke="#F20BA8"/>`,
  }),
  "portrait-stylez.svg": portrait(),
  "logo-eye.svg": eye(),
};

for (const [name, svg] of Object.entries(files)) {
  writeFileSync(join(dir, name), svg);
  console.log("wrote", name);
}
