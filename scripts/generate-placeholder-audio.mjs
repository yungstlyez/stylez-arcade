import fs from "node:fs";
import path from "node:path";

const outDir = path.join(process.cwd(), "public", "audio");
fs.mkdirSync(outDir, { recursive: true });

function writeWav(file, seconds, sampleFn) {
  const sampleRate = 22050;
  const numSamples = sampleRate * seconds;
  const dataSize = numSamples * 2;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const s = Math.max(-1, Math.min(1, sampleFn(t, i, sampleRate)));
    buf.writeInt16LE((s * 18000) | 0, 44 + i * 2);
  }
  fs.writeFileSync(file, buf);
}

function sq(freq, t) {
  return Math.sign(Math.sin(2 * Math.PI * freq * t));
}

function noise(i) {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// TODO: replace these generated loops with real Stylez mixes.
writeWav(path.join(outDir, "flatbed-freestyle.wav"), 12, (t, i) => {
  const beat = t % 0.5;
  const kick = beat < 0.05 ? Math.sin(2 * Math.PI * 55 * t) * (1 - beat * 18) : 0;
  const hat = beat > 0.24 && beat < 0.28 ? (noise(i) * 2 - 1) * 0.12 : 0;
  const notes = [110, 110, 130.81, 98, 110, 146.83, 130.81, 82.41];
  const step = Math.floor((t * 2) % notes.length);
  const bass = sq(notes[step], t) * 0.14;
  const lead = sq(notes[step] * 2, t) * 0.04 * (0.5 + 0.5 * Math.sin(t * 0.7));
  return kick * 0.7 + hat + bass + lead;
});

writeWav(path.join(outDir, "jesus-piece-rockin.wav"), 12, (t, i) => {
  const beat = t % 0.75;
  const kick = beat < 0.06 ? Math.sin(2 * Math.PI * 48 * t) * (1 - beat * 14) : 0;
  const hat = beat > 0.36 && beat < 0.4 ? (noise(i) * 2 - 1) * 0.1 : 0;
  const notes = [87.31, 87.31, 103.83, 130.81, 116.54, 87.31, 73.42, 103.83];
  const step = Math.floor((t * 1.333) % notes.length);
  const bass = sq(notes[step], t) * 0.12;
  const shimmer = Math.sin(2 * Math.PI * notes[step] * 4 * t) * 0.05 * Math.max(0, Math.sin(t * 0.4));
  return kick * 0.65 + hat + bass + shimmer;
});

console.log("Wrote placeholder audio to public/audio");
