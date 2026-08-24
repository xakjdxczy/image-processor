import * as THREE from "../vendor/three/three.module.js";
import { ROOMS, PLAN } from "./plan-data.js";

const EYE = 1.62;
const SPEED = 3.6;
const LOOK_SPEED = 1.7;

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

const FURNITURE = [
  { x: 0.25, y: 5.2, w: 0.9, d: 2.5, h: 0.72, kind: "linen" },
  { x: 0.25, y: 7.05, w: 2.35, d: 0.82, h: 0.72, kind: "linen" },
  { x: 1.65, y: 6.25, w: 1.15, d: 0.7, h: 0.34, kind: "wood" },
  { x: 4.85, y: 5.55, w: 0.4, d: 1.95, h: 0.58, kind: "wood" },
  { x: 1.45, y: 3.15, w: 2.25, d: 1.2, h: 0.76, kind: "wood" },
  { x: 0.1, y: 0.1, w: 3.35, d: 0.58, h: 0.9, kind: "wood" },
  { x: 0.1, y: 0.1, w: 0.58, d: 2.55, h: 0.9, kind: "wood" },
  { x: 10.45, y: 7.25, w: 2.05, d: 2.05, h: 0.48, kind: "linen" },
  { x: 12.25, y: 3.25, w: 1.75, d: 1.55, h: 0.48, kind: "linen" },
  { x: 12.25, y: 0.35, w: 1.75, d: 1.45, h: 0.48, kind: "linen" },
  { x: 7.5, y: 0.3, w: 1.65, d: 0.72, h: 0.76, kind: "wood" },
  { x: 7.45, y: 6.45, w: 1.65, d: 0.8, h: 0.5, kind: "stone" },
  { x: 7.45, y: 8.75, w: 1.05, d: 1.05, h: 2.05, kind: "stone" }
];

const SPOTS = {
  living: { x: 3.15, z: 7.55, yaw: 0.15 },
  dining: { x: 2.4, z: 3.7, yaw: 0.2 },
  kitchen: { x: 1.8, z: 1.6, yaw: 2.6 },
  foyer: { x: 6.3, z: 1.4, yaw: 3.2 },
  study: { x: 9.4, z: 1.4, yaw: 1.2 },
  master: { x: 12.2, z: 7.7, yaw: 3.5 },
  "bedroom-a": { x: 13.4, z: 4.2, yaw: 2.2 },
  "bedroom-b": { x: 13.4, z: 1.4, yaw: 2.4 },
  hall: { x: 6.3, z: 5.4, yaw: 0.1 },
  "guest-bath": { x: 8.3, z: 4.2, yaw: 0.2 },
  wic: { x: 10.7, z: 4.2, yaw: 0.2 },
  "master-bath": { x: 8.3, z: 7.4, yaw: 0.2 },
  "south-balcony": { x: 3.4, z: 9.25, yaw: 3.2 },
  "service-balcony": { x: 4.4, z: 1.4, yaw: 1.6 }
};

const mount = document.getElementById("walkthrough");
const meta = document.getElementById("tourMeta");
if (!mount) throw new Error("missing #walkthrough");

const loader = new THREE.TextureLoader();
function tex(path, repeatX, repeatY) {
  const map = loader.load(path);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = 8;
  map.repeat.set(repeatX, repeatY);
  return map;
}

const oakFloor = tex("assets/textures/tex-oak-floor.png", 8, 5.5);
const plaster = tex("assets/textures/tex-plaster.png", 2.2, 1.4);
const wood = tex("assets/textures/tex-oak-wood.png", 1.4, 1);
const linen = tex("assets/textures/tex-linen.png", 1.6, 1.2);
const stone = tex("assets/textures/tex-stone.png", 2.2, 2.2);
const windowMap = tex("assets/textures/tex-window.png", 1, 1);
windowMap.wrapS = windowMap.wrapT = THREE.ClampToEdgeWrapping;

const mats = {
  floor: new THREE.MeshStandardMaterial({ map: oakFloor, roughness: 0.62 }),
  plaster: new THREE.MeshStandardMaterial({ map: plaster, roughness: 0.88 }),
  wood: new THREE.MeshStandardMaterial({ map: wood, roughness: 0.5 }),
  linen: new THREE.MeshStandardMaterial({ map: linen, roughness: 0.82 }),
  stone: new THREE.MeshStandardMaterial({ map: stone, roughness: 0.48 }),
  ceiling: new THREE.MeshStandardMaterial({ color: 0xf3ece0, roughness: 0.95 }),
  glass: new THREE.MeshBasicMaterial({ map: windowMap })
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd8cfc0);
scene.fog = new THREE.Fog(0xd8cfc0, 16, 32);

const camera = new THREE.PerspectiveCamera(92, 1, 0.08, 60);
camera.rotation.order = "YXZ";
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
mount.insertBefore(renderer.domElement, mount.firstChild);

scene.add(new THREE.HemisphereLight(0xfff1d4, 0x6d6356, 0.95));
const sun = new THREE.DirectionalLight(0xffe6b8, 1.05);
sun.position.set(4, 8, 14);
sun.castShadow = true;
scene.add(sun);
[
  [2.6, 2.35, 6.4],
  [2.4, 2.35, 3.6],
  [1.6, 2.35, 1.4],
  [12.3, 2.35, 7.6],
  [9.5, 2.35, 1.4]
].forEach(([x, y, z]) => {
  const light = new THREE.PointLight(0xffddaa, 8, 5.5, 2);
  light.position.set(x, y, z);
  scene.add(light);
});

function box(x, y, z, w, h, d, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

const floors = [];
ROOMS.forEach((room) => {
  const wet = room.slug.includes("bath") || room.slug.includes("balcony");
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(room.w, room.d),
    wet ? mats.stone : mats.floor
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(room.x + room.w / 2, 0.01, room.y + room.d / 2);
  mesh.receiveShadow = true;
  mesh.userData.room = room;
  scene.add(mesh);
  floors.push(mesh);
  box(room.x + room.w / 2, PLAN.height - 0.03, room.y + room.d / 2, room.w, 0.06, room.d, mats.ceiling);
});

function overlaps(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
  const aMinX = Math.min(ax1, ax2);
  const aMaxX = Math.max(ax1, ax2);
  const aMinY = Math.min(ay1, ay2);
  const aMaxY = Math.max(ay1, ay2);
  const bMinX = Math.min(bx1, bx2);
  const bMaxX = Math.max(bx1, bx2);
  const bMinY = Math.min(by1, by2);
  const bMaxY = Math.max(by1, by2);
  return aMinX < bMaxX + 0.02 && aMaxX > bMinX - 0.02 && aMinY < bMaxY + 0.02 && aMaxY > bMinY - 0.02;
}

function isOpen(x1, y1, x2, y2) {
  return OPENINGS.some((gap) => overlaps(x1, y1, x2, y2, gap.x1, gap.y1, gap.x2, gap.y2));
}

function addWall(x1, y1, x2, y2) {
  if (isOpen(x1, y1, x2, y2)) return;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 0.08) return;
  const thick = 0.1;
  const horiz = Math.abs(dx) >= Math.abs(dy);
  box((x1 + x2) / 2, PLAN.height / 2, (y1 + y2) / 2, horiz ? len : thick, PLAN.height, horiz ? thick : len, mats.plaster);
}

const seen = new Set();
ROOMS.forEach((room) => {
  const edges = [
    [room.x, room.y, room.x + room.w, room.y],
    [room.x, room.y + room.d, room.x + room.w, room.y + room.d],
    [room.x, room.y, room.x, room.y + room.d],
    [room.x + room.w, room.y, room.x + room.w, room.y + room.d]
  ];
  edges.forEach((edge) => {
    const key = edge.map((n) => n.toFixed(2)).join(",");
    if (seen.has(key)) return;
    seen.add(key);
    addWall(...edge);
  });
});

FURNITURE.forEach((item) => {
  box(item.x + item.w / 2, item.h / 2 + 0.02, item.y + item.d / 2, item.w, item.h, item.d, mats[item.kind]);
});

box(3.6, 1.35, 9.95, 6.4, 2.2, 0.04, mats.glass);
box(1.8, 1.35, -0.02, 2.6, 1.8, 0.04, mats.glass);

const STEP = 0.1;
const gw = Math.round(PLAN.width / STEP);
const gd = Math.round(PLAN.depth / STEP);
const walk = new Uint8Array(gw * gd);

function cell(x, z) {
  return Math.floor(x / STEP) + Math.floor(z / STEP) * gw;
}

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

function nearestWalkable(x, z) {
  if (walkable(x, z)) return { x, z };
  for (let r = 1; r <= 28; r += 1) {
    for (let iz = -r; iz <= r; iz += 1) {
      for (let ix = -r; ix <= r; ix += 1) {
        if (Math.max(Math.abs(ix), Math.abs(iz)) !== r) continue;
        const nx = x + ix * STEP;
        const nz = z + iz * STEP;
        if (walkable(nx, nz)) return { x: nx, z: nz };
      }
    }
  }
  return null;
}

function findPath(sx, sz, tx, tz) {
  const start = nearestWalkable(sx, sz);
  const goal = nearestWalkable(tx, tz);
  if (!start || !goal) return [];
  const si = Math.floor(start.x / STEP);
  const sj = Math.floor(start.z / STEP);
  const gi = Math.floor(goal.x / STEP);
  const gj = Math.floor(goal.z / STEP);
  const startKey = si + sj * gw;
  const goalKey = gi + gj * gw;
  if (walk[startKey] !== 1 || walk[goalKey] !== 1) return [];
  if (startKey === goalKey) return [{ x: goal.x, z: goal.z }];

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
  if (prev[goalKey] === -1) return [goal];

  const cells = [];
  let cur = goalKey;
  while (cur !== startKey) {
    cells.push(cur);
    cur = prev[cur];
  }
  cells.reverse();
  const path = cells.map((key) => {
    const ix = key % gw;
    const iz = (key - ix) / gw;
    return { x: (ix + 0.5) * STEP, z: (iz + 0.5) * STEP };
  });
  path[path.length - 1] = { x: goal.x, z: goal.z };
  return path.filter((_, i) => i === path.length - 1 || i % 2 === 0);
}

const player = { x: 3.15, z: 7.55, yaw: 0.15, pitch: 0 };
const keys = {};
const hold = { forward: false, back: false, left: false, right: false };
let path = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let dragging = false;
let looking = false;
let lastX = 0;
let lastY = 0;
let travel = 0;

function setPose(x, z, yaw) {
  const spot = nearestWalkable(x, z) || { x, z };
  player.x = spot.x;
  player.z = spot.z;
  if (yaw != null) player.yaw = yaw;
  path = [];
}

function tryMove(nx, nz) {
  if (walkable(nx, player.z)) player.x = nx;
  if (walkable(player.x, nz)) player.z = nz;
}

function roomAt(x, z) {
  return ROOMS.find((room) => x >= room.x && x <= room.x + room.w && z >= room.y && z <= room.y + room.d);
}

function setMeta() {
  if (!meta) return;
  const room = roomAt(player.x, player.z);
  meta.innerHTML = "<strong>全景漫游</strong>　" + (room ? room.name + "　" + room.area.toFixed(2) + "㎡　" : "") + "拖动环视，点击地面或右侧平面走到任意位置。";
}

function goTo(x, z) {
  const dest = nearestWalkable(x, z);
  if (!dest) return;
  path = findPath(player.x, player.z, dest.x, dest.z);
}

function resize() {
  const w = mount.clientWidth;
  const h = Math.max(380, mount.clientHeight);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}

window.addEventListener("resize", resize);
resize();

const canvas = renderer.domElement;
canvas.style.touchAction = "none";
canvas.tabIndex = 0;

canvas.addEventListener("pointerdown", (event) => {
  if (event.target !== canvas) return;
  dragging = true;
  looking = false;
  travel = 0;
  lastX = event.clientX;
  lastY = event.clientY;
  mount.classList.add("is-dragging");
  canvas.focus();
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener("pointermove", (event) => {
  if (!dragging) return;
  const dx = event.clientX - lastX;
  const dy = event.clientY - lastY;
  travel += Math.hypot(dx, dy);
  lastX = event.clientX;
  lastY = event.clientY;
  if (travel < 12) return;
  looking = true;
  player.yaw -= dx * 0.0055;
  player.pitch = Math.max(-1.2, Math.min(1.2, player.pitch - dy * 0.0045));
});
canvas.addEventListener("pointerup", (event) => {
  dragging = false;
  mount.classList.remove("is-dragging");
  if (looking) return;
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(floors)[0];
  if (hit) goTo(hit.point.x, hit.point.z);
});

function onKey(event, down) {
  keys[event.code] = down;
  if (event.key) keys[event.key.toLowerCase()] = down;
  const moveKey = ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code) || ["w", "a", "s", "d"].includes((event.key || "").toLowerCase());
  if (moveKey) {
    event.preventDefault();
    if (down) path = [];
  }
}
window.addEventListener("keydown", (event) => onKey(event, true));
window.addEventListener("keyup", (event) => onKey(event, false));

function bindHold(el, action) {
  const start = (event) => {
    event.preventDefault();
    hold[action] = true;
    if (action === "forward" || action === "back") path = [];
  };
  const stop = () => {
    hold[action] = false;
  };
  el.addEventListener("pointerdown", start);
  el.addEventListener("pointerup", stop);
  el.addEventListener("pointerleave", stop);
  el.addEventListener("pointercancel", stop);
}

document.querySelectorAll("[data-hold]").forEach((btn) => bindHold(btn, btn.dataset.hold));
document.querySelectorAll("[data-go]").forEach((btn) => bindHold(btn, btn.dataset.go));

document.querySelectorAll("[data-spot]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const spot = SPOTS[btn.dataset.spot];
    if (spot) setPose(spot.x, spot.z, spot.yaw);
  });
});

const mapHost = document.getElementById("walkMap");
const mapCanvas = document.createElement("canvas");
mapCanvas.width = 300;
mapCanvas.height = 200;
if (mapHost) mapHost.appendChild(mapCanvas);
const mapCtx = mapCanvas.getContext("2d");

if (mapHost) {
  mapHost.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
    const rect = mapCanvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * PLAN.width;
    const z = ((event.clientY - rect.top) / rect.height) * PLAN.depth;
    goTo(x, z);
  });
}

function drawMap() {
  if (!mapCtx) return;
  mapCtx.clearRect(0, 0, 300, 200);
  const sx = 300 / PLAN.width;
  const sz = 200 / PLAN.depth;
  ROOMS.forEach((room) => {
    mapCtx.fillStyle = room.fill;
    mapCtx.fillRect(room.x * sx, room.y * sz, room.w * sx, room.d * sz);
  });
  mapCtx.strokeStyle = "rgba(31,26,20,0.55)";
  mapCtx.lineWidth = 1;
  ROOMS.forEach((room) => {
    mapCtx.strokeRect(room.x * sx, room.y * sz, room.w * sx, room.d * sz);
  });
  if (path.length) {
    mapCtx.strokeStyle = "#2f6f55";
    mapCtx.lineWidth = 2;
    mapCtx.beginPath();
    mapCtx.moveTo(player.x * sx, player.z * sz);
    path.forEach((p) => mapCtx.lineTo(p.x * sx, p.z * sz));
    mapCtx.stroke();
  }
  mapCtx.fillStyle = "#c0392b";
  mapCtx.beginPath();
  mapCtx.arc(player.x * sx, player.z * sz, 4, 0, Math.PI * 2);
  mapCtx.fill();
  mapCtx.strokeStyle = "#fff8e8";
  mapCtx.beginPath();
  mapCtx.moveTo(player.x * sx, player.z * sz);
  mapCtx.lineTo(player.x * sx - Math.sin(player.yaw) * 12, player.z * sz - Math.cos(player.yaw) * 12);
  mapCtx.stroke();
}

let last = performance.now();
function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (hold.left) player.yaw += LOOK_SPEED * dt;
  if (hold.right) player.yaw -= LOOK_SPEED * dt;
  const forward = (keys.KeyW || keys.ArrowUp || keys.w || hold.forward ? 1 : 0) + (keys.KeyS || keys.ArrowDown || keys.s || hold.back ? -1 : 0);
  const strafe = (keys.KeyD || keys.ArrowRight || keys.d ? 1 : 0) + (keys.KeyA || keys.ArrowLeft || keys.a ? -1 : 0);
  if (forward || strafe) {
    const fx = -Math.sin(player.yaw);
    const fz = -Math.cos(player.yaw);
    tryMove(player.x + (fx * forward + (-fz) * strafe) * SPEED * dt, player.z + (fz * forward + fx * strafe) * SPEED * dt);
  }
  if (path.length) {
    const next = path[0];
    const dx = next.x - player.x;
    const dz = next.z - player.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.12) {
      path.shift();
    } else {
      tryMove(player.x + (dx / dist) * SPEED * dt, player.z + (dz / dist) * SPEED * dt);
    }
  }
  camera.position.set(player.x, EYE, player.z);
  camera.rotation.y = player.yaw;
  camera.rotation.x = player.pitch;
  setMeta();
  drawMap();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
