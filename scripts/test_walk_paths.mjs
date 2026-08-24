import { ROOMS, PLAN } from "../assets/js/plan-data.js";

const OPENINGS = [
  { x1: 0.15, y1: 4.8, x2: 5.25, y2: 4.8 },
  { x1: 5.4, y1: 4.9, x2: 5.4, y2: 8.45 },
  { x1: 5.5, y1: 2.8, x2: 7.05, y2: 2.8 },
  { x1: 0.2, y1: 2.8, x2: 3.4, y2: 2.8 },
  { x1: 3.6, y1: 0.3, x2: 3.6, y2: 2.5 },
  { x1: 5.4, y1: 0.4, x2: 5.4, y2: 2.4 },
  { x1: 0.2, y1: 8.6, x2: 5.2, y2: 8.6 },
  { x1: 5.45, y1: 8.6, x2: 7.1, y2: 8.6 },
  { x1: 7.2, y1: 0.7, x2: 7.2, y2: 2.15 },
  { x1: 12.0, y1: 0.75, x2: 12.0, y2: 2.15 },
  { x1: 7.2, y1: 3.35, x2: 7.2, y2: 4.85 },
  { x1: 9.6, y1: 3.5, x2: 9.6, y2: 5.1 },
  { x1: 12.0, y1: 3.5, x2: 12.0, y2: 5.1 },
  { x1: 9.7, y1: 5.8, x2: 11.3, y2: 5.8 },
  { x1: 12.3, y1: 5.8, x2: 14.0, y2: 5.8 },
  { x1: 7.2, y1: 6.3, x2: 7.2, y2: 7.9 },
  { x1: 9.6, y1: 6.6, x2: 9.6, y2: 8.4 }
];

const STEP = 0.1;
const gw = Math.round(PLAN.width / STEP);
const gd = Math.round(PLAN.depth / STEP);
const walk = new Uint8Array(gw * gd);

function mark(x, y, w, d, value) {
  const x0 = Math.max(0, Math.floor(x / STEP));
  const z0 = Math.max(0, Math.floor(y / STEP));
  const x1 = Math.min(gw - 1, Math.floor((x + w) / STEP));
  const z1 = Math.min(gd - 1, Math.floor((y + d) / STEP));
  for (let iz = z0; iz <= z1; iz += 1) {
    for (let ix = x0; ix <= x1; ix += 1) walk[ix + iz * gw] = value;
  }
}

ROOMS.forEach((room) => mark(room.x + 0.12, room.y + 0.12, room.w - 0.24, room.d - 0.24, 1));
OPENINGS.forEach((gap) => {
  const pad = 0.42;
  mark(Math.min(gap.x1, gap.x2) - pad, Math.min(gap.y1, gap.y2) - pad, Math.abs(gap.x2 - gap.x1) + pad * 2, Math.abs(gap.y2 - gap.y1) + pad * 2, 1);
});

function walkable(x, z) {
  if (x < 0.08 || z < 0.08 || x > PLAN.width - 0.08 || z > PLAN.depth - 0.08) return false;
  const ix = Math.floor(x / STEP);
  const iz = Math.floor(z / STEP);
  if (ix < 0 || iz < 0 || ix >= gw || iz >= gd) return false;
  return walk[ix + iz * gw] === 1;
}

function findPath(sx, sz, tx, tz) {
  const si = Math.floor(sx / STEP);
  const sj = Math.floor(sz / STEP);
  const gi = Math.floor(tx / STEP);
  const gj = Math.floor(tz / STEP);
  const startKey = si + sj * gw;
  const goalKey = gi + gj * gw;
  const prev = new Int32Array(gw * gd);
  prev.fill(-1);
  const q = new Int32Array(gw * gd);
  let head = 0;
  let tail = 0;
  q[tail++] = startKey;
  prev[startKey] = startKey;
  const dirs = [1, 0, -1, 0, 0, 1, 0, -1, 1, 1, 1, -1, -1, 1, -1, -1];
  while (head < tail) {
    const cur = q[head++];
    if (cur === goalKey) break;
    const cx = cur % gw;
    const cz = (cur - cx) / gw;
    for (let d = 0; d < 16; d += 2) {
      const nx = cx + dirs[d];
      const nz = cz + dirs[d + 1];
      if (nx < 0 || nz < 0 || nx >= gw || nz >= gd) continue;
      if (dirs[d] !== 0 && dirs[d + 1] !== 0) {
        if (walk[cx + nz * gw] !== 1 || walk[nx + cz * gw] !== 1) continue;
      }
      const nk = nx + nz * gw;
      if (walk[nk] !== 1 || prev[nk] !== -1) continue;
      prev[nk] = cur;
      q[tail++] = nk;
    }
  }
  return prev[goalKey] !== -1;
}

const points = ROOMS.map((room) => ({
  name: room.name,
  x: room.x + room.w / 2,
  z: room.y + room.d / 2
}));

let failed = 0;
for (const a of points) {
  if (!walkable(a.x, a.z)) {
    console.error("center blocked", a.name, a.x, a.z);
    failed += 1;
  }
  for (const b of points) {
    if (!findPath(a.x, a.z, b.x, b.z)) {
      console.error("no path", a.name, "->", b.name);
      failed += 1;
    }
  }
}
if (failed) {
  console.error("FAILED", failed);
  process.exit(1);
}
console.log("ok", points.length, "rooms fully connected");
