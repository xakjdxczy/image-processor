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

const SPOTS = {
  living: { x: 3.2, z: 7.2, yaw: 0.05 },
  dining: { x: 2.5, z: 3.85, yaw: 0.05 },
  kitchen: { x: 1.7, z: 1.55, yaw: 3.2 },
  foyer: { x: 6.25, z: 1.55, yaw: 3.55 },
  study: { x: 9.2, z: 1.45, yaw: 0.15 },
  master: { x: 12.4, z: 7.9, yaw: 0.05 },
  "bedroom-a": { x: 13.35, z: 4.25, yaw: 3.3 },
  "bedroom-b": { x: 13.35, z: 1.4, yaw: 3.3 },
  hall: { x: 6.3, z: 5.4, yaw: 0.1 },
  "guest-bath": { x: 8.35, z: 4.25, yaw: 0.2 },
  wic: { x: 10.75, z: 4.25, yaw: 0.2 },
  "master-bath": { x: 8.35, z: 7.5, yaw: 0.15 },
  "south-balcony": { x: 3.4, z: 9.2, yaw: 3.2 },
  "service-balcony": { x: 4.4, z: 1.4, yaw: 1.6 }
};

const VIEWS = {
  living: { pano: "assets/panos/pano-living.png", hero: "assets/renders/living-room.png" },
  dining: { pano: "assets/panos/pano-dining.png", hero: "assets/renders/dining-kitchen.png" },
  kitchen: { pano: "assets/panos/pano-dining.png", hero: "assets/renders/dining-kitchen.png" },
  foyer: { pano: "assets/panos/pano-foyer.png", hero: "assets/renders/foyer.png" },
  hall: { pano: "assets/panos/pano-foyer.png", hero: "assets/renders/foyer.png" },
  study: { pano: "assets/panos/pano-study.png", hero: "assets/renders/study.png" },
  master: { pano: "assets/panos/pano-master.png", hero: "assets/renders/master-bedroom.png" },
  wic: { pano: "assets/panos/pano-master.png", hero: "assets/renders/master-bedroom.png" },
  "master-bath": { pano: "assets/panos/pano-bath.png", hero: "assets/renders/master-bath.png" },
  "guest-bath": { pano: "assets/panos/pano-bath.png", hero: "assets/renders/master-bath.png" },
  "bedroom-a": { pano: "assets/panos/pano-kids.png", hero: "assets/renders/kids-bedroom.png" },
  "bedroom-b": { pano: "assets/panos/pano-kids.png", hero: "assets/renders/kids-bedroom.png" },
  "south-balcony": { pano: "assets/panos/pano-living.png", hero: "assets/renders/living-room.png" },
  "service-balcony": { pano: "assets/panos/pano-dining.png", hero: "assets/renders/dining-kitchen.png" }
};

const mount = document.getElementById("walkthrough");
const meta = document.getElementById("tourMeta");
if (!mount) throw new Error("missing #walkthrough");

const loader = new THREE.TextureLoader();
const texCache = new Map();

function loadMap(src, wrap) {
  if (texCache.has(src)) return texCache.get(src);
  const map = loader.load(src, () => {
    map.needsUpdate = true;
  });
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  map.minFilter = THREE.LinearFilter;
  map.generateMipmaps = false;
  map.wrapS = map.wrapT = wrap;
  texCache.set(src, map);
  return map;
}

Object.values(VIEWS).forEach((view) => {
  loadMap(view.pano, THREE.RepeatWrapping);
  loadMap(view.hero, THREE.ClampToEdgeWrapping);
});

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1611);
const camera = new THREE.PerspectiveCamera(80, 1, 0.08, 80);
camera.rotation.order = "YXZ";
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
mount.insertBefore(renderer.domElement, mount.firstChild);

const sphereA = new THREE.Mesh(
  new THREE.SphereGeometry(40, 72, 48),
  new THREE.MeshBasicMaterial({ side: THREE.BackSide, toneMapped: false, transparent: true, opacity: 1 })
);
const sphereB = new THREE.Mesh(
  new THREE.SphereGeometry(40, 72, 48),
  new THREE.MeshBasicMaterial({ side: THREE.BackSide, toneMapped: false, transparent: true, opacity: 0 })
);
sphereA.renderOrder = -20;
sphereB.renderOrder = -19;
scene.add(sphereA, sphereB);
let frontSphere = sphereA;
let backSphere = sphereB;
let fading = 0;

const hero = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide })
);
hero.renderOrder = 3;
scene.add(hero);

const floors = [];
const floorMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
ROOMS.forEach((room) => {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(room.w, room.d), floorMat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(room.x + room.w / 2, 0.01, room.y + room.d / 2);
  mesh.userData.room = room;
  scene.add(mesh);
  floors.push(mesh);
});

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
  const pathPts = cells.map((key) => {
    const ix = key % gw;
    const iz = (key - ix) / gw;
    return { x: (ix + 0.5) * STEP, z: (iz + 0.5) * STEP };
  });
  pathPts[pathPts.length - 1] = { x: goal.x, z: goal.z };
  return pathPts.filter((_, i) => i === pathPts.length - 1 || i % 2 === 0);
}

const player = { x: 3.2, z: 7.2, yaw: 0.05, pitch: 0 };
const keys = {};
const hold = { forward: false, back: false, left: false, right: false };
let path = [];
let shownSlug = "";
let heading = 0.05;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let dragging = false;
let looking = false;
let lastX = 0;
let lastY = 0;
let travel = 0;

function viewOf(slug) {
  return VIEWS[slug] || VIEWS.living;
}

function applyView(mesh, slug, yaw) {
  const view = viewOf(slug);
  mesh.material.map = loadMap(view.pano, THREE.RepeatWrapping);
  mesh.material.needsUpdate = true;
  mesh.userData.heading = yaw;
}

function showRoom(slug, yaw) {
  if (slug === shownSlug) return;
  heading = yaw;
  hero.material.map = loadMap(viewOf(slug).hero, THREE.ClampToEdgeWrapping);
  hero.material.needsUpdate = true;
  if (!shownSlug) {
    applyView(frontSphere, slug, yaw);
    frontSphere.material.opacity = 1;
    shownSlug = slug;
    return;
  }
  applyView(backSphere, slug, yaw);
  backSphere.material.opacity = 0;
  fading = 0.001;
  shownSlug = slug;
}

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
  meta.innerHTML = "<strong>设计全景</strong>　" + (room ? room.name + "　" + room.area.toFixed(2) + "㎡　" : "") + "正面就是该房间效果图，拖动在三维里转头环视同一套场景。";
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
  if (travel < 8) return;
  looking = true;
  player.yaw -= dx * 0.0058;
  player.pitch = Math.max(-1.2, Math.min(1.2, player.pitch - dy * 0.0046));
});

function pointOnFloor(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(floors)[0];
  if (hit) return { x: hit.point.x, z: hit.point.z };
  if (Math.abs(raycaster.ray.direction.y) < 0.02) return null;
  const t = -raycaster.ray.origin.y / raycaster.ray.direction.y;
  if (t <= 0.05) return null;
  const p = raycaster.ray.origin.clone().addScaledVector(raycaster.ray.direction, t);
  return { x: p.x, z: p.z };
}

canvas.addEventListener("pointerup", (event) => {
  dragging = false;
  mount.classList.remove("is-dragging");
  if (looking || travel > 16) return;
  const dest = pointOnFloor(event.clientX, event.clientY);
  if (dest) goTo(dest.x, dest.z);
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
  let t0 = 0;
  let armed = false;
  const start = (event) => {
    event.preventDefault();
    armed = true;
    hold[action] = true;
    t0 = performance.now();
    if (action === "forward" || action === "back") path = [];
  };
  const stop = () => {
    if (!armed) return;
    const short = performance.now() - t0 < 280;
    armed = false;
    hold[action] = false;
    if (!short) return;
    if (action === "forward" || action === "back") {
      const dir = action === "back" ? -1 : 1;
      goTo(player.x + -Math.sin(player.yaw) * 1.6 * dir, player.z + -Math.cos(player.yaw) * 1.6 * dir);
    }
    if (action === "left" || action === "right") player.yaw += (action === "left" ? 1 : -1) * 0.45;
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
    if (!spot) return;
    setPose(spot.x, spot.z, spot.yaw);
    heading = spot.yaw;
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
    goTo(((event.clientX - rect.left) / rect.width) * PLAN.width, ((event.clientY - rect.top) / rect.height) * PLAN.depth);
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
  ROOMS.forEach((room) => mapCtx.strokeRect(room.x * sx, room.y * sz, room.w * sx, room.d * sz));
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

function placeVisuals() {
  frontSphere.position.set(player.x, EYE, player.z);
  backSphere.position.set(player.x, EYE, player.z);
  const sphereYaw = heading + Math.PI;
  frontSphere.rotation.y = sphereYaw;
  backSphere.rotation.y = sphereYaw;
  const dist = 5.1;
  hero.position.set(player.x - Math.sin(heading) * dist, EYE, player.z - Math.cos(heading) * dist);
  hero.lookAt(player.x, EYE, player.z);
  const map = hero.material.map;
  if (map && map.image && map.image.width) {
    const aspect = map.image.width / Math.max(1, map.image.height);
    const h = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.46));
    hero.scale.set(h * aspect, h, 1);
  }
  let dyaw = player.yaw - heading;
  while (dyaw > Math.PI) dyaw -= Math.PI * 2;
  while (dyaw < -Math.PI) dyaw += Math.PI * 2;
  const align = Math.max(0, Math.cos(dyaw) * Math.cos(player.pitch));
  hero.material.opacity = Math.pow(align, 1.6);
  hero.visible = hero.material.opacity > 0.03;
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
    tryMove(player.x + (-Math.sin(player.yaw) * forward + Math.cos(player.yaw) * strafe) * SPEED * dt, player.z + (-Math.cos(player.yaw) * forward + Math.sin(player.yaw) * strafe) * SPEED * dt);
  }
  if (path.length) {
    const next = path[0];
    const dx = next.x - player.x;
    const dz = next.z - player.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.12) path.shift();
    else tryMove(player.x + (dx / dist) * SPEED * dt, player.z + (dz / dist) * SPEED * dt);
  }
  const room = roomAt(player.x, player.z);
  const slug = room ? room.slug : "living";
  const spot = SPOTS[slug] || SPOTS.living;
  showRoom(slug, shownSlug === slug ? heading : spot.yaw);
  if (fading) {
    fading = Math.min(1, fading + dt * 2.2);
    backSphere.material.opacity = fading;
    frontSphere.material.opacity = 1 - fading * 0.8;
    if (fading >= 1) {
      const swap = frontSphere;
      frontSphere = backSphere;
      backSphere = swap;
      frontSphere.material.opacity = 1;
      backSphere.material.opacity = 0;
      fading = 0;
    }
  }
  camera.position.set(player.x, EYE, player.z);
  camera.rotation.y = player.yaw;
  camera.rotation.x = player.pitch;
  placeVisuals();
  setMeta();
  drawMap();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

showRoom("living", player.yaw);
window.__walk = { player, goTo, walkable, roomAt };
requestAnimationFrame(tick);
