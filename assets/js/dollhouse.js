import * as THREE from "../vendor/three/three.module.js";
import { OrbitControls } from "../vendor/three/addons/controls/OrbitControls.js";
import { PLAN, ROOMS } from "./plan-data.js";

const mount = document.getElementById("dollhouse");
const meta = document.getElementById("tourMeta");
if (!mount) throw new Error("missing #dollhouse");

const wallH = PLAN.height;
const ox = -PLAN.width / 2;
const oz = -PLAN.depth / 2;

function wx(x) {
  return ox + x;
}

function wz(y) {
  return oz + y;
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xece6da);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
mount.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.48;
controls.minDistance = 8;
controls.maxDistance = 32;
controls.target.set(0, 0.4, 0);

const hemi = new THREE.HemisphereLight(0xfff4e0, 0x8a8070, 1.05);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1d6, 1.15);
sun.position.set(-8, 14, 10);
sun.castShadow = true;
scene.add(sun);
scene.add(new THREE.AmbientLight(0xffffff, 0.28));

const slab = new THREE.Mesh(
  new THREE.BoxGeometry(PLAN.width + 0.3, 0.12, PLAN.depth + 0.3),
  new THREE.MeshStandardMaterial({ color: 0xd8cfc0, roughness: 0.9 })
);
slab.position.y = -0.06;
scene.add(slab);

const floors = [];
const wood = new THREE.MeshStandardMaterial({ color: 0xe7d3a8, roughness: 0.72 });

function addBox(x, y, z, w, h, d, material, y0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, (y0 ?? 0) + h / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function addFloor(room) {
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(room.fill),
    roughness: 0.78
  });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(room.w - 0.04, 0.04, room.d - 0.04), mat);
  mesh.position.set(wx(room.x + room.w / 2), 0.02, wz(room.y + room.d / 2));
  mesh.receiveShadow = true;
  mesh.userData.room = room;
  scene.add(mesh);
  floors.push(mesh);
}

function uniqueWalls() {
  const seen = new Map();
  function add(x1, y1, x2, y2) {
    const a = [Number(x1.toFixed(2)), Number(y1.toFixed(2))];
    const b = [Number(x2.toFixed(2)), Number(y2.toFixed(2))];
    const key = a[0] < b[0] || (a[0] === b[0] && a[1] < b[1])
      ? `${a[0]},${a[1]}|${b[0]},${b[1]}`
      : `${b[0]},${b[1]}|${a[0]},${a[1]}`;
    seen.set(key, seen.has(key) ? "in" : "out");
  }
  ROOMS.forEach((r) => {
    add(r.x, r.y, r.x + r.w, r.y);
    add(r.x, r.y + r.d, r.x + r.w, r.y + r.d);
    add(r.x, r.y, r.x, r.y + r.d);
    add(r.x + r.w, r.y, r.x + r.w, r.y + r.d);
  });
  return [...seen.entries()].map(([key, kind]) => {
    const [p1, p2] = key.split("|");
    const [x1, y1] = p1.split(",").map(Number);
    const [x2, y2] = p2.split(",").map(Number);
    return { x1, y1, x2, y2, kind };
  });
}

const plaster = new THREE.MeshStandardMaterial({ color: 0xf4efe6, roughness: 0.86 });
const plasterIn = new THREE.MeshStandardMaterial({ color: 0xeee6d8, roughness: 0.88 });

function isOpen(wall) {
  const horiz = Math.abs(wall.y1 - wall.y2) < 0.02;
  const vert = Math.abs(wall.x1 - wall.x2) < 0.02;
  if (horiz && Math.abs(wall.y1 - 4.8) < 0.02 && wall.x1 <= 0.05 && wall.x2 >= 5.3) return true;
  if (horiz && Math.abs(wall.y1 - 2.8) < 0.02 && wall.x1 >= 5.3 && wall.x2 <= 7.3) return true;
  if (vert && Math.abs(wall.x1 - 5.4) < 0.02 && wall.y1 < 8.55 && wall.y2 > 4.75) return true;
  return false;
}

uniqueWalls().forEach((wall) => {
  const dx = wall.x2 - wall.x1;
  const dy = wall.y2 - wall.y1;
  const len = Math.hypot(dx, dy);
  if (len < 0.05 || isOpen(wall)) return;
  const thick = wall.kind === "out" ? 0.12 : 0.08;
  const h = wall.kind === "out" ? wallH : wallH * 0.92;
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(Math.abs(dx) > Math.abs(dy) ? len : thick, h, Math.abs(dx) > Math.abs(dy) ? thick : len),
    wall.kind === "out" ? plaster : plasterIn
  );
  mesh.position.set(wx((wall.x1 + wall.x2) / 2), h / 2, wz((wall.y1 + wall.y2) / 2));
  mesh.castShadow = true;
  scene.add(mesh);
});

ROOMS.forEach(addFloor);

const oak = new THREE.MeshStandardMaterial({ color: 0xb08968, roughness: 0.55 });
const linen = new THREE.MeshStandardMaterial({ color: 0xe8dcc6, roughness: 0.8 });
const stone = new THREE.MeshStandardMaterial({ color: 0xd8cfc3, roughness: 0.45 });
const dark = new THREE.MeshStandardMaterial({ color: 0x3a3228, roughness: 0.5 });

function piece(x, y, w, d, h, mat, lift = 0.04) {
  addBox(wx(x + w / 2), 0, wz(y + d / 2), w, h, d, mat, lift);
}

piece(0.25, 5.2, 0.85, 2.5, 0.72, linen);
piece(0.25, 7.05, 2.3, 0.8, 0.72, linen);
piece(1.7, 6.25, 1.15, 0.7, 0.32, oak);
piece(4.85, 5.6, 0.4, 1.9, 0.55, oak);
piece(1.5, 3.2, 2.2, 1.15, 0.74, oak);
piece(0.12, 0.12, 3.3, 0.58, 0.9, oak);
piece(0.12, 0.12, 0.58, 2.5, 0.9, oak);
piece(10.5, 7.3, 2.0, 2.0, 0.45, linen);
piece(12.3, 3.3, 1.7, 1.5, 0.45, linen);
piece(12.3, 0.4, 1.7, 1.4, 0.45, linen);
piece(7.5, 0.35, 1.6, 0.7, 0.74, oak);
piece(7.5, 6.5, 1.6, 0.75, 0.48, stone);
piece(7.45, 8.8, 1.0, 1.0, 1.9, stone, 0.04);

function label(room) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 80;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(31,26,20,0.78)";
  ctx.fillRect(8, 10, 240, 60);
  ctx.fillStyle = "#fffdf8";
  ctx.font = "600 28px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(room.name, 128, 36);
  ctx.font = "400 18px sans-serif";
  ctx.fillStyle = "#e8d5a3";
  ctx.fillText(room.area.toFixed(2) + "㎡", 128, 58);
  const tex = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
  sprite.scale.set(1.55, 0.48, 1);
  sprite.position.set(wx(room.x + room.w / 2), 1.55, wz(room.y + room.d / 2));
  sprite.userData.room = room;
  scene.add(sprite);
}

ROOMS.forEach(label);

function setView(kind) {
  if (kind === "top") {
    camera.position.set(0, 22, 0.2);
  } else if (kind === "sw") {
    camera.position.set(-11, 11, 12);
  } else {
    camera.position.set(12, 11, 12);
  }
  controls.target.set(0, 0.4, 0);
  controls.update();
}

setView("se");

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let selected = null;

function paintSelection(room) {
  floors.forEach((floor) => {
    const on = room && floor.userData.room.slug === room.slug;
    floor.material.emissive = new THREE.Color(on ? 0x8b6914 : 0x000000);
    floor.material.emissiveIntensity = on ? 0.28 : 0;
  });
  if (meta) {
    meta.innerHTML = room
      ? "<strong>" + room.name + "</strong>　" + room.area.toFixed(2) + "㎡　拖动画布旋转，滚轮缩放。"
      : "拖动画布旋转，点房间看面积。去顶鸟瞰，和贝壳 3D 户型同一看房方式。";
  }
}

function pick(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(floors)[0];
  selected = hit ? hit.object.userData.room : null;
  paintSelection(selected);
}

renderer.domElement.addEventListener("click", pick);

function resize() {
  const w = mount.clientWidth;
  const h = Math.max(360, mount.clientHeight);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}

window.addEventListener("resize", resize);
resize();

document.querySelectorAll("[data-view]").forEach((btn) => {
  btn.addEventListener("click", () => setView(btn.dataset.view));
});

function tick() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

paintSelection(null);
tick();
