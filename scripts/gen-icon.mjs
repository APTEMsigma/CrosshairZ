/**
 * Генератор иконки приложения (app-icon.png, 1024×1024) без внешних зависимостей:
 * тёмная скруглённая плитка + зелёное перекрестие с тёмной обводкой.
 * Затем запускается `npx tauri icon app-icon.png` для набора иконок.
 */
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const W = 1024;
const H = 1024;
const img = new Float32Array(W * H * 4); // RGBA, premultiplied не нужен — просто alpha-blend

function blend(x, y, r, g, b, a) {
  if (x < 0 || y < 0 || x >= W || y >= H || a <= 0) return;
  const i = (y * W + x) * 4;
  const da = img[i + 3];
  const oa = a + da * (1 - a);
  if (oa <= 0) return;
  img[i] = (r * a + img[i] * da * (1 - a)) / oa;
  img[i + 1] = (g * a + img[i + 1] * da * (1 - a)) / oa;
  img[i + 2] = (b * a + img[i + 2] * da * (1 - a)) / oa;
  img[i + 3] = oa;
}

function sdRoundRect(px, py, cx, cy, hx, hy, r) {
  const qx = Math.abs(px - cx) - hx + r;
  const qy = Math.abs(py - cy) - hy + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

function sdSegment(px, py, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / (abx * abx + aby * aby)));
  return Math.hypot(px - ax - abx * t, py - ay - aby * t);
}

function fillRoundRect(cx, cy, hx, hy, r, [R, G, B], alpha = 1) {
  const x0 = Math.floor(cx - hx - 2);
  const x1 = Math.ceil(cx + hx + 2);
  const y0 = Math.floor(cy - hy - 2);
  const y1 = Math.ceil(cy + hy + 2);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const cov = Math.max(0, Math.min(1, 0.75 - sdRoundRect(x + 0.5, y + 0.5, cx, cy, hx, hy, r)));
      if (cov > 0) blend(x, y, R, G, B, cov * alpha);
    }
  }
}

function fillCapsule(a, b, radius, [R, G, B], alpha = 1) {
  const x0 = Math.floor(Math.min(a[0], b[0]) - radius - 2);
  const x1 = Math.ceil(Math.max(a[0], b[0]) + radius + 2);
  const y0 = Math.floor(Math.min(a[1], b[1]) - radius - 2);
  const y1 = Math.ceil(Math.max(a[1], b[1]) + radius + 2);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const cov = Math.max(0, Math.min(1, 0.75 + radius - sdSegment(x + 0.5, y + 0.5, a[0], a[1], b[0], b[1])));
      if (cov > 0) blend(x, y, R, G, B, cov * alpha);
    }
  }
}

const C = 512;
const DARK = [24, 26, 32]; // #181a20
const EDGE = [38, 42, 51]; // рамка
const GREEN = [0, 230, 118]; // #00e676
const OUTLINE = [10, 12, 16];

// Подложка
fillRoundRect(C, C, 448, 448, 116, DARK);
// Тонкая рамка по краю подложки
for (let i = 0; i < 6; i++) {
  fillRoundRect(C, C, 448 - i, 448 - i, Math.max(0, 116 - i), EDGE, 0.55);
}

// Перекрестие: обводка, затем зелёные лучи
const gap = 96;
const len = 176;
const arms = [
  [[C, C - gap], [C, C - gap - len]],
  [[C, C + gap], [C, C + gap + len]],
  [[C - gap, C], [C - gap - len, C]],
  [[C + gap, C], [C + gap + len, C]],
];
for (const [a, b] of arms) fillCapsule(a, b, 42, OUTLINE);
for (const [a, b] of arms) fillCapsule(a, b, 26, GREEN);
// Центральная точка
fillCapsule([C, C], [C, C], 18, OUTLINE);
fillCapsule([C, C], [C, C], 10, GREEN);

/* ---------- Кодирование PNG ---------- */
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c;
}
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return ~c >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

const raw = Buffer.alloc((W * 4 + 1) * H);
for (let y = 0; y < H; y++) {
  raw[y * (W * 4 + 1)] = 0; // фильтр None
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    const o = y * (W * 4 + 1) + 1 + x * 4;
    raw[o] = Math.max(0, Math.min(255, Math.round(img[i])));
    raw[o + 1] = Math.max(0, Math.min(255, Math.round(img[i + 1])));
    raw[o + 2] = Math.max(0, Math.min(255, Math.round(img[i + 2])));
    raw[o + 3] = Math.max(0, Math.min(255, Math.round(img[i + 3] * 255)));
  }
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // RGBA
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

writeFileSync("app-icon.png", png);
console.log("app-icon.png создан (" + png.length + " байт)");
