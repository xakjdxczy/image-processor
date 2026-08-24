export function buildInterior(THREE, scene, PLAN, ROOMS, renderer) {
  const WALL_H = 2.72;
  const DOOR_H = 2.14;
  const THICK = 0.1;

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
    { x1: 9.6, y1: 6.6, x2: 9.6, y2: 8.4 },
  ];

  const WINDOWS = [
    { x1: 0.3, y1: 0, x2: 3.3, y2: 0, sill: 0.88, head: 2.28 },
    { x1: 3.75, y1: 0, x2: 5.25, y2: 0, sill: 0.88, head: 2.28 },
    { x1: 7.5, y1: 0, x2: 11.7, y2: 0, sill: 0.12, head: 2.48 },
    { x1: 12.25, y1: 0, x2: 14.7, y2: 0, sill: 0.88, head: 2.28 },
    { x1: 0.25, y1: 10, x2: 6.95, y2: 10, sill: 0.08, head: 2.52 },
    { x1: 9.9, y1: 10, x2: 14.7, y2: 10, sill: 0.12, head: 2.48 },
    { x1: 15, y1: 3.05, x2: 15, y2: 5.55, sill: 0.88, head: 2.28 },
    { x1: 15, y1: 6.2, x2: 15, y2: 9.7, sill: 0.12, head: 2.48 },
  ];

  const loader = new THREE.TextureLoader();
  function loadTex(url, rx = 1, ry = 1) {
    const t = loader.load(url);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx, ry);
    t.anisotropy = 8;
    return t;
  }
  const texFloor = loadTex("assets/textures/tex-oak-floor.png", 8, 5.5);
  const texPlaster = loadTex("assets/textures/tex-plaster.png", 2.4, 1.6);
  const texWood = loadTex("assets/textures/tex-oak-wood.png", 1.8, 1);
  const texLinen = loadTex("assets/textures/tex-linen.png", 2, 2);
  const texStone = loadTex("assets/textures/tex-stone.png", 2.2, 1.4);
  const texWindow = loadTex("assets/textures/tex-window.png", 1, 1);
  texWindow.wrapS = texWindow.wrapT = THREE.ClampToEdgeWrapping;

  if (renderer) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#f6edd8");
    grad.addColorStop(0.42, "#e4cda8");
    grad.addColorStop(1, "#7a5a38");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);
    const envMap = new THREE.CanvasTexture(canvas);
    envMap.mapping = THREE.EquirectangularReflectionMapping;
    envMap.colorSpace = THREE.SRGBColorSpace;
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromEquirectangular(envMap).texture;
    scene.environmentIntensity = 0.62;
    envMap.dispose();
    pmrem.dispose();
  }

  scene.background = new THREE.Color(0x16130f);
  scene.fog = new THREE.Fog(0x16130f, 18, 36);
  scene.add(new THREE.HemisphereLight(0xfff3e0, 0x3d2c1c, 0.62));
  const sun = new THREE.DirectionalLight(0xffe4bc, 1.35);
  sun.position.set(4.2, 9.5, 16);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -14;
  sun.shadow.camera.right = 14;
  sun.shadow.camera.top = 12;
  sun.shadow.camera.bottom = -8;
  sun.shadow.bias = -0.00025;
  scene.add(sun);

  const mat = (opts) => new THREE.MeshStandardMaterial(opts);
  const mFloor = mat({ map: texFloor, roughness: 0.36, metalness: 0.03 });
  const mCeil = mat({ color: 0xf4eee6, roughness: 0.94 });
  const mWall = mat({ map: texPlaster, color: 0xf7f0e6, roughness: 0.88 });
  const mWood = mat({ map: texWood, roughness: 0.4, metalness: 0.04 });
  const mWalnut = mat({ map: texWood, color: 0x5c3d24, roughness: 0.38 });
  const mSlat = mat({ map: texWood, color: 0x8d6236, roughness: 0.36 });
  const mCream = mat({ map: texLinen, color: 0xf6eee2, roughness: 0.74 });
  const mLinen = mat({ map: texLinen, color: 0xeadcc6, roughness: 0.78 });
  const mSage = mat({ map: texLinen, color: 0x8d9570, roughness: 0.76 });
  const mTan = mat({ map: texLinen, color: 0xc4a06a, roughness: 0.72 });
  const mMarble = mat({ map: texStone, color: 0xf3ebe2, roughness: 0.2, metalness: 0.12 });
  const mTravertine = mat({ map: texStone, color: 0xe6d8c4, roughness: 0.42 });
  const mStoneFloor = mat({ map: texStone, color: 0xd8d0c6, roughness: 0.45 });
  const mGlass = mat({ color: 0xd5e8f4, roughness: 0.06, metalness: 0.12, transparent: true, opacity: 0.22, envMapIntensity: 1.2, side: THREE.DoubleSide });
  const mWindow = mat({ map: texWindow, roughness: 0.18, metalness: 0.04, transparent: true, opacity: 0.92, side: THREE.DoubleSide });
  const mSheer = mat({ color: 0xf7f2e8, roughness: 0.96, transparent: true, opacity: 0.34, side: THREE.DoubleSide });
  const mDrape = mat({ map: texLinen, color: 0xe8d8c0, roughness: 0.9, side: THREE.DoubleSide });
  const mMetal = mat({ color: 0xc9b48a, roughness: 0.28, metalness: 0.74 });
  const mBlack = mat({ color: 0x161412, roughness: 0.42, metalness: 0.22 });
  const mTV = mat({ color: 0x0c0c0c, roughness: 0.18, metalness: 0.45 });
  const mCeram = mat({ color: 0xe7d8c6, roughness: 0.38 });
  const mClay = mat({ color: 0xb08968, roughness: 0.62 });
  const mLeaf = mat({ color: 0x6a8a3c, roughness: 0.62 });
  const mGreen = mat({ color: 0x3f5a30, roughness: 0.7 });
  const mGlow = mat({ color: 0xffe6c4, emissive: 0xffd09a, emissiveIntensity: 1.35, roughness: 1 });
  const mLantern = mat({ color: 0xf6e6c6, emissive: 0xffd6a0, emissiveIntensity: 0.9, roughness: 0.68, transparent: true, opacity: 0.93 });
  const mCarpet = mat({ color: 0xe3d0b0, roughness: 0.96 });
  const mMirror = mat({ color: 0xcfd8e0, roughness: 0.04, metalness: 0.92, envMapIntensity: 1.4 });
  const mSky = mat({ color: 0xb7d19a, emissive: 0x7fa35a, emissiveIntensity: 0.42 });
  const mBooks = [
    mat({ color: 0x8a4a38, roughness: 0.7 }),
    mat({ color: 0xc9a06a, roughness: 0.7 }),
    mat({ color: 0x4a5846, roughness: 0.7 }),
    mat({ color: 0xd6c6ae, roughness: 0.7 }),
    mat({ color: 0x6a4e38, roughness: 0.7 }),
  ];

  const g = new THREE.Group();
  scene.add(g);
  const floors = [];

  function mesh(geom, material, x, y, z, rx = 0, ry = 0) {
    const m = new THREE.Mesh(geom, material);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, 0);
    m.castShadow = m.receiveShadow = true;
    g.add(m);
    return m;
  }
  function box(w, h, d, material, x, y, z, rx = 0, ry = 0) {
    return mesh(new THREE.BoxGeometry(w, h, d), material, x, y, z, rx, ry);
  }
  function cyl(rTop, rBot, h, material, x, y, z, segs = 24) {
    return mesh(new THREE.CylinderGeometry(rTop, rBot, h, segs), material, x, y, z);
  }
  function ball(r, material, x, y, z) {
    return mesh(new THREE.SphereGeometry(r, 22, 16), material, x, y, z);
  }
  function warm(x, y, z, intensity, dist, color = 0xffd6a4) {
    const light = new THREE.PointLight(color, intensity, dist, 1.55);
    light.position.set(x, y, z);
    scene.add(light);
  }
  function spot(x, y, z, tx, ty, tz, intensity = 5.5) {
    const s = new THREE.SpotLight(0xffe6c6, intensity, 9, 0.4, 0.48, 1.35);
    s.position.set(x, y, z);
    s.target.position.set(tx, ty, tz);
    scene.add(s, s.target);
  }

  function addFloor(w, d, material, x, z, y = 0.012) {
    const m = box(w, 0.024, d, material, x, y, z);
    floors.push(m);
    return m;
  }

  addFloor(PLAN.width + 1.4, PLAN.depth + 1.4, mFloor, PLAN.width / 2, PLAN.depth / 2, -0.012);
  box(PLAN.width + 0.5, 0.07, PLAN.depth + 0.5, mCeil, PLAN.width / 2, WALL_H + 0.035, PLAN.depth / 2);
  box(22, 10, 0.3, mSky, 7.5, 3.2, 12.4);
  box(0.3, 10, 18, mSky, -1.5, 3.2, 5);
  box(22, 10, 0.3, mSky, 7.5, 3.2, -1.6);
  box(0.3, 10, 18, mSky, 16.6, 3.2, 5);
  box(24, 0.2, 20, mat({ color: 0x6e8a4a, roughness: 0.9 }), 7.5, -0.2, 5);

  function overlapCuts(x1, z1, x2, z2, list) {
    const horizontal = Math.abs(z1 - z2) < 0.04;
    const lo = horizontal ? Math.min(x1, x2) : Math.min(z1, z2);
    const hi = horizontal ? Math.max(x1, x2) : Math.max(z1, z2);
    const axis = horizontal ? z1 : x1;
    const cuts = [];
    for (const item of list) {
      const same = horizontal
        ? Math.abs(item.y1 - axis) < 0.06 && Math.abs(item.y2 - axis) < 0.06
        : Math.abs(item.x1 - axis) < 0.06 && Math.abs(item.x2 - axis) < 0.06;
      if (!same) continue;
      const a = horizontal ? Math.min(item.x1, item.x2) : Math.min(item.y1, item.y2);
      const b = horizontal ? Math.max(item.x1, item.x2) : Math.max(item.y1, item.y2);
      if (b > lo + 0.04 && a < hi - 0.04) cuts.push({ a: Math.max(a, lo), b: Math.min(b, hi), item });
    }
    cuts.sort((p, q) => p.a - q.a);
    return { horizontal, lo, hi, axis, cuts };
  }

  function wallBox(horizontal, a, b, axis, y, h) {
    const mid = (a + b) / 2;
    const len = Math.max(0.04, b - a);
    box(horizontal ? len : THICK, h, horizontal ? THICK : len, mWall, horizontal ? mid : axis, y, horizontal ? axis : mid);
  }

  function addWall(x1, z1, x2, z2) {
    const doors = overlapCuts(x1, z1, x2, z2, OPENINGS);
    const wins = overlapCuts(x1, z1, x2, z2, WINDOWS);
    const holes = [...doors.cuts.map((c) => ({ ...c, kind: "door" })), ...wins.cuts.map((c) => ({ ...c, kind: "window" }))];
    holes.sort((p, q) => p.a - q.a);
    const { horizontal, lo, hi, axis } = doors;
    let cursor = lo;
    for (const hole of holes) {
      if (hole.a > cursor + 0.03) wallBox(horizontal, cursor, hole.a, axis, WALL_H / 2, WALL_H);
      if (hole.kind === "door") {
        const wide = hole.b - hole.a >= 2.05;
        wallBox(horizontal, hole.a, hole.b, axis, wide ? WALL_H - 0.04 : DOOR_H + (WALL_H - DOOR_H) / 2, wide ? 0.08 : WALL_H - DOOR_H);
        if (!wide) {
          const mid = (hole.a + hole.b) / 2;
          const jamW = hole.b - hole.a;
          box(horizontal ? jamW : 0.06, DOOR_H, horizontal ? 0.06 : jamW, mWood, horizontal ? mid : axis, DOOR_H / 2, horizontal ? axis : mid);
        }
      } else {
        const { sill, head } = hole.item;
        wallBox(horizontal, hole.a, hole.b, axis, sill / 2, sill);
        wallBox(horizontal, hole.a, hole.b, axis, head + (WALL_H - head) / 2, WALL_H - head);
        addWindow(horizontal, hole.a, hole.b, axis, sill, head);
      }
      cursor = hole.b;
    }
    if (hi > cursor + 0.03) wallBox(horizontal, cursor, hi, axis, WALL_H / 2, WALL_H);
  }

  function addWindow(horizontal, a, b, axis, sill, head) {
    const mid = (a + b) / 2;
    const len = b - a;
    const h = head - sill;
    const y = (sill + head) / 2;
    const inset = horizontal ? 0.02 : 0.02;
    const px = horizontal ? mid : axis + (axis < 1 ? inset : -inset);
    const pz = horizontal ? axis + (axis < 1 ? inset : -inset) : mid;
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(horizontal ? len - 0.08 : h, horizontal ? h : len - 0.08), mWindow);
    pane.position.set(px, y, pz);
    if (!horizontal) pane.rotation.y = Math.PI / 2;
    if (horizontal && axis > 5) pane.rotation.y = Math.PI;
    g.add(pane);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(horizontal ? len - 0.1 : h - 0.04, horizontal ? h - 0.04 : len - 0.1), mGlass);
    glass.position.set(px, y, pz + (horizontal ? 0.01 : 0));
    if (!horizontal) glass.rotation.y = Math.PI / 2;
    g.add(glass);
    box(horizontal ? len + 0.04 : 0.05, 0.05, horizontal ? 0.05 : len + 0.04, mBlack, horizontal ? mid : axis, sill, horizontal ? axis : mid);
    box(horizontal ? len + 0.04 : 0.05, 0.05, horizontal ? 0.05 : len + 0.04, mBlack, horizontal ? mid : axis, head, horizontal ? axis : mid);
    const bars = Math.max(1, Math.round(len / 1.15));
    for (let i = 0; i <= bars; i++) {
      const t = a + (len * i) / bars;
      box(horizontal ? 0.04 : 0.05, h, horizontal ? 0.05 : 0.04, mBlack, horizontal ? t : axis, y, horizontal ? axis : t);
    }
  }

  const seen = new Set();
  function edgeKey(x1, z1, x2, z2) {
    const a = `${x1.toFixed(2)},${z1.toFixed(2)}`;
    const b = `${x2.toFixed(2)},${z2.toFixed(2)}`;
    return a < b ? `${a}|${b}` : `${b}|${a}`;
  }
  for (const room of ROOMS) {
    const pts = [
      [room.x, room.y, room.x + room.w, room.y],
      [room.x + room.w, room.y, room.x + room.w, room.y + room.d],
      [room.x, room.y + room.d, room.x + room.w, room.y + room.d],
      [room.x, room.y, room.x, room.y + room.d],
    ];
    for (const [x1, z1, x2, z2] of pts) {
      const key = edgeKey(x1, z1, x2, z2);
      if (seen.has(key)) continue;
      seen.add(key);
      addWall(x1, z1, x2, z2);
    }
  }

  function slats(x, z, length, height, alongZ, material, count, thick = 0.045) {
    const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(alongZ ? thick : 0.06, height, alongZ ? 0.06 : thick), material, count);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      dummy.position.set(alongZ ? x : x - length / 2 + t * length, height / 2 + 0.02, alongZ ? z - length / 2 + t * length : z);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.castShadow = inst.receiveShadow = true;
    g.add(inst);
    return inst;
  }

  function sheer(x, y, z, w, h, rotY = 0) {
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 10, 1), mSheer);
    const pos = plane.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getX(i) * 6.2) * 0.035);
    pos.needsUpdate = true;
    plane.geometry.computeVertexNormals();
    plane.position.set(x, y, z);
    plane.rotation.y = rotY;
    g.add(plane);
  }

  function lantern(x, y, z, r = 0.26) {
    ball(r, mLantern, x, y, z);
    cyl(0.01, 0.01, 0.42, mMetal, x, y + r + 0.18, z, 8);
    warm(x, y, z, 9.5, 7.5, 0xffd4a0);
  }

  function plant(x, z, scale = 1) {
    cyl(0.16 * scale, 0.2 * scale, 0.28 * scale, mClay, x, 0.15 * scale, z);
    cyl(0.025 * scale, 0.04 * scale, 1.15 * scale, mWood, x, 0.82 * scale, z, 8);
    ball(0.36 * scale, mLeaf, x, 1.5 * scale, z);
    ball(0.2 * scale, mGreen, x - 0.18 * scale, 1.28 * scale, z - 0.1 * scale);
    ball(0.18 * scale, mLeaf, x + 0.2 * scale, 1.36 * scale, z + 0.12 * scale);
  }

  function books(x, y, z, n = 5) {
    for (let i = 0; i < n; i++) {
      box(0.04 + (i % 3) * 0.01, 0.2, 0.14, mBooks[i % mBooks.length], x + i * 0.05, y, z);
    }
  }

  function art(x, y, z, w, h, rotY = 0) {
    box(w + 0.04, h + 0.04, 0.03, mWood, x, y, z, 0, rotY);
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#efe6d4";
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = "rgba(90,70,40,0.35)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(40, 200);
    ctx.quadraticCurveTo(90, 40, 140, 170);
    ctx.quadraticCurveTo(180, 70, 220, 150);
    ctx.stroke();
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const painting = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat({ map: tex, roughness: 0.7 }));
    painting.position.set(x, y, z + (Math.abs(rotY) < 0.1 ? 0.02 : 0));
    painting.rotation.y = rotY;
    if (Math.abs(rotY) > 0.2) painting.position.set(x + Math.cos(rotY) * 0.02, y, z - Math.sin(rotY) * 0.02);
    g.add(painting);
  }

  function lamp(x, z, h = 1.48) {
    cyl(0.09, 0.12, 0.04, mMetal, x, 0.03, z);
    cyl(0.012, 0.012, h, mMetal, x, h / 2, z, 8);
    mesh(new THREE.ConeGeometry(0.16, 0.2, 16, 1, true), mLantern, x, h + 0.02, z);
    warm(x, h, z, 4.2, 3.6);
  }

  function cove(x, z, w, d) {
    box(w, 0.025, d, mGlow, x, 2.6, z);
    warm(x, 2.52, z, 5.5, 6.2);
  }

  function downlight(x, z) {
    cyl(0.06, 0.06, 0.03, mBlack, x, 2.68, z, 12);
    cyl(0.04, 0.04, 0.02, mGlow, x, 2.66, z, 12);
    warm(x, 2.45, z, 3.2, 4.2);
  }

  // —— 客厅：西墙格栅电视墙、奶油曲面沙发、南向落地窗 ——
  addFloor(5.16, 3.56, mFloor, 2.7, 6.7);
  box(3.7, 0.02, 2.55, mCarpet, 2.7, 0.03, 7.35);
  slats(0.13, 6.7, 3.5, 2.58, true, mSlat, 30);
  box(0.1, 0.92, 1.58, mBlack, 0.2, 1.52, 6.85);
  box(0.03, 0.8, 1.4, mTV, 0.26, 1.52, 6.85);
  box(0.36, 0.07, 2.35, mMarble, 0.38, 0.74, 6.75);
  box(0.3, 0.58, 2.28, mWalnut, 0.36, 0.36, 6.75);
  cyl(0.08, 0.055, 0.22, mClay, 0.4, 0.9, 5.85);
  cyl(0.06, 0.045, 0.16, mCeram, 0.4, 0.86, 7.55);
  books(0.38, 0.86, 8.05, 4);
  box(0.28, 2.2, 0.85, mWood, 0.28, 1.12, 8.2);
  books(0.36, 1.55, 8.15, 6);

  const sofa = new THREE.Group();
  for (let i = 0; i < 7; i++) {
    const u = i / 6;
    const ang = (u - 0.5) * 1.2;
    const x = Math.sin(ang) * 1.28;
    const z = (1 - Math.cos(ang)) * 0.62;
    const seat = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.38, 6, 12), mCream);
    seat.rotation.z = Math.PI / 2;
    seat.rotation.y = ang;
    seat.position.set(x, 0.36, z);
    seat.castShadow = true;
    sofa.add(seat);
    const back = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.36, 5, 10), mCream);
    back.rotation.z = Math.PI / 2;
    back.position.set(x + Math.sin(ang) * 0.26, 0.62, z + Math.cos(ang) * 0.2);
    back.castShadow = true;
    sofa.add(back);
  }
  function localBox(parent, w, h, d, material, x, y, z) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    m.position.set(x, y, z);
    m.castShadow = true;
    parent.add(m);
  }
  localBox(sofa, 0.42, 0.16, 0.36, mSage, -0.55, 0.56, 0.12);
  localBox(sofa, 0.4, 0.15, 0.34, mTan, 0.05, 0.56, 0.08);
  localBox(sofa, 0.38, 0.14, 0.32, mLinen, 0.62, 0.55, 0.14);
  sofa.position.set(3.15, 0, 7.85);
  sofa.rotation.y = Math.PI / 2;
  g.add(sofa);

  box(1.18, 0.14, 0.62, mWalnut, 2.15, 0.28, 7.35);
  box(1.12, 0.04, 0.56, mWood, 2.15, 0.36, 7.35);
  books(1.85, 0.42, 7.28, 3);
  cyl(0.07, 0.05, 0.12, mCeram, 2.45, 0.44, 7.42);
  box(0.46, 0.08, 0.46, mMarble, 3.85, 0.34, 8.15);
  mesh(new THREE.ConeGeometry(0.16, 0.2, 5), mMarble, 3.85, 0.18, 8.15);
  box(0.6, 0.36, 0.6, mCream, 4.55, 0.32, 6.35);
  box(0.6, 0.4, 0.08, mWood, 4.55, 0.6, 6.62);
  cyl(0.025, 0.025, 0.28, mWood, 4.34, 0.14, 6.16);
  cyl(0.025, 0.025, 0.28, mWood, 4.76, 0.14, 6.54);
  sheer(2.7, 1.28, 8.52, 4.6, 2.28);
  box(0.1, 2.35, 0.08, mWood, 0.35, 1.22, 8.55);
  box(0.1, 2.35, 0.08, mWood, 5.15, 1.22, 8.55);
  lantern(2.35, 2.16, 7.25, 0.3);
  plant(4.65, 8.22, 1.05);
  lamp(4.7, 5.55);
  cove(2.7, 8.35, 4.8, 0.07);
  cove(2.7, 5.05, 4.8, 0.07);
  downlight(1.2, 6.2);
  downlight(3.8, 6.2);
  downlight(2.7, 8.0);
  spot(1.4, 2.55, 6.6, 0.3, 1.4, 6.85, 7);
  spot(3.6, 2.55, 8.1, 3.15, 0.4, 7.7, 4.5);
  box(0.28, 2.55, 0.28, mWood, 5.28, 1.28, 8.48);

  // —— 餐厅 + 开放厨房 ——
  addFloor(5.16, 1.76, mFloor, 2.7, 3.8);
  const table = mesh(new THREE.CylinderGeometry(0.92, 0.92, 0.06, 36), mWalnut, 2.45, 0.74, 3.82);
  table.scale.set(1.28, 1, 0.7);
  slats(2.05, 3.82, 0.42, 0.66, true, mWalnut, 8, 0.035);
  slats(2.85, 3.82, 0.42, 0.66, true, mWalnut, 8, 0.035);
  cyl(0.1, 0.14, 0.08, mWalnut, 2.05, 0.08, 3.82);
  cyl(0.1, 0.14, 0.08, mWalnut, 2.85, 0.08, 3.82);
  cyl(0.16, 0.13, 0.1, mCeram, 2.45, 0.82, 3.82);
  cyl(0.05, 0.04, 0.22, mClay, 2.85, 0.88, 3.7);
  for (const [dx, dz, ry] of [
    [-0.95, 0.02, 1.55],
    [-0.35, 0.62, 0.15],
    [0.45, 0.58, -0.2],
    [0.95, -0.05, -1.55],
    [0.35, -0.62, 3.0],
    [-0.45, -0.58, 2.9],
  ]) {
    const ch = new THREE.Group();
    box(0.44, 0.07, 0.42, mWood, 0, 0.46, 0);
    const seat = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.18, 5, 10), mCream);
    seat.rotation.z = Math.PI / 2;
    seat.position.set(0, 0.5, 0);
    ch.add(seat);
    const back = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.22, 5, 10), mCream);
    back.rotation.z = Math.PI / 2;
    back.position.set(0, 0.78, -0.16);
    ch.add(back);
    box(0.05, 0.38, 0.04, mWalnut, 0, 0.72, -0.2);
    cyl(0.018, 0.018, 0.44, mWalnut, -0.14, 0.22, -0.14);
    cyl(0.018, 0.018, 0.44, mWalnut, 0.14, 0.22, 0.14);
    ch.position.set(2.45 + dx, 0, 3.82 + dz);
    ch.rotation.y = ry;
    g.add(ch);
  }
  const drum = mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.22, 28, 1, true), mLantern, 2.45, 2.05, 3.82);
  cyl(0.36, 0.36, 0.02, mLantern, 2.45, 1.95, 3.82);
  cyl(0.01, 0.01, 0.5, mMetal, 2.45, 2.38, 3.82, 8);
  warm(2.45, 1.92, 3.82, 11, 7);

  addFloor(3.36, 2.56, mFloor, 1.8, 1.4);
  box(2.05, 0.86, 0.7, mMarble, 1.7, 0.44, 1.55);
  box(2.12, 0.04, 0.76, mMarble, 1.7, 0.89, 1.55);
  box(0.38, 0.06, 0.28, mMetal, 1.25, 0.93, 1.55);
  cyl(0.012, 0.012, 0.26, mMetal, 1.25, 1.08, 1.62);
  box(0.08, 0.12, 0.08, mMetal, 1.25, 1.2, 1.55);
  box(3.2, 0.88, 0.38, mWood, 1.7, 0.45, 0.28);
  box(1.15, 0.04, 0.36, mMarble, 1.7, 0.9, 0.3);
  slats(1.7, 0.22, 1.35, 0.7, false, mWood, 16, 0.03);
  box(3.15, 0.02, 0.32, mGlow, 1.7, 1.98, 0.32);
  box(3.2, 0.58, 0.36, mWood, 1.7, 2.28, 0.26);
  box(0.55, 0.42, 0.28, mWood, 0.7, 1.55, 0.28);
  box(0.55, 0.42, 0.28, mWood, 2.7, 1.55, 0.28);
  cyl(0.07, 0.05, 0.16, mCeram, 0.7, 1.82, 0.3);
  cyl(0.05, 0.04, 0.12, mClay, 2.7, 1.8, 0.3);
  box(0.62, 1.95, 0.58, mWood, 0.42, 0.98, 1.85);
  box(0.5, 0.55, 0.04, mBlack, 0.42, 0.72, 2.14);
  box(0.68, 0.88, 0.58, mBlack, 3.05, 0.44, 0.55);
  warm(1.7, 2.0, 1.2, 7.5, 5);
  downlight(1.2, 1.3);
  downlight(2.4, 1.3);
  plant(3.95, 2.35, 0.72);

  // —— 玄关 ——
  addFloor(1.56, 2.56, mStoneFloor, 6.3, 1.4);
  slats(5.58, 1.35, 2.15, 2.5, true, mWood, 22);
  box(0.08, 1.8, 0.02, mBlack, 5.7, 1.35, 0.55);
  box(0.08, 1.8, 0.02, mBlack, 5.7, 1.35, 2.1);
  box(1.15, 0.08, 0.38, mMarble, 6.35, 0.72, 0.55);
  box(1.1, 0.22, 0.34, mWood, 6.35, 0.16, 0.55);
  box(1.05, 0.015, 0.3, mGlow, 6.35, 0.06, 0.55);
  const mirror = mesh(new THREE.CircleGeometry(0.28, 28), mMirror, 6.55, 1.35, 0.72);
  mirror.scale.set(1, 1.75, 1);
  mesh(new THREE.TorusGeometry(0.28, 0.012, 8, 28), mMetal, 6.55, 1.35, 0.72).scale.set(1, 1.75, 1);
  cyl(0.07, 0.05, 0.2, mClay, 6.05, 0.86, 0.55);
  cyl(0.05, 0.04, 0.28, mCeram, 6.22, 0.9, 0.5);
  art(6.95, 1.45, 1.7, 0.7, 0.9, -Math.PI / 2);
  cove(6.3, 0.35, 1.4, 0.06);
  downlight(6.3, 1.4);
  box(0.16, 2.5, 0.16, mWood, 5.5, 1.25, 2.7);
  box(0.16, 2.5, 0.16, mWood, 7.05, 1.25, 2.7);

  // —— 书房 ——
  addFloor(4.56, 2.56, mFloor, 9.6, 1.4);
  box(2.15, 0.07, 0.72, mWalnut, 9.4, 0.74, 0.62);
  box(0.08, 0.7, 0.08, mWalnut, 8.5, 0.36, 0.42);
  box(0.08, 0.7, 0.08, mWalnut, 10.3, 0.36, 0.82);
  box(0.48, 0.08, 0.48, mat({ color: 0x4a3224, roughness: 0.7 }), 9.35, 0.48, 1.35);
  box(0.46, 0.42, 0.08, mWood, 9.35, 0.72, 1.14);
  box(0.38, 0.02, 0.24, mBlack, 9.15, 0.79, 0.62);
  books(9.7, 0.82, 0.58, 4);
  cyl(0.08, 0.07, 0.18, mCeram, 8.7, 0.88, 0.55);
  mesh(new THREE.ConeGeometry(0.16, 0.2, 16, 1, true), mLantern, 8.7, 1.08, 0.55);
  warm(8.7, 1.05, 0.55, 3.5, 2.8);
  slats(11.75, 1.4, 2.35, 2.5, true, mWood, 20);
  box(0.32, 2.15, 2.3, mWood, 11.55, 1.12, 1.4);
  for (let row = 0; row < 4; row++) {
    box(0.28, 0.03, 2.15, mWood, 11.5, 0.55 + row * 0.48, 1.4);
    box(0.26, 0.01, 2.1, mGlow, 11.48, 0.52 + row * 0.48, 1.4);
    books(11.45, 0.68 + row * 0.48, 0.7 + (row % 3) * 0.35, 4);
    cyl(0.05, 0.04, 0.12, mCeram, 11.48, 0.66 + row * 0.48, 1.8);
  }
  sheer(9.6, 1.3, 0.08, 4.1, 2.35);
  box(0.14, 2.4, 0.08, mDrape, 7.55, 1.22, 0.1);
  box(0.14, 2.4, 0.08, mDrape, 11.55, 1.22, 0.1);
  art(7.45, 1.45, 1.4, 0.85, 0.95, Math.PI / 2);
  downlight(8.6, 1.4);
  downlight(10.6, 1.4);
  warm(11.4, 1.8, 1.4, 4.5, 4);

  // —— 主卧 ——
  addFloor(5.16, 3.96, mFloor, 12.3, 7.9);
  box(3.1, 0.02, 2.6, mCarpet, 12.3, 0.03, 7.7);
  slats(12.3, 5.95, 2.15, 2.15, false, mWalnut, 22);
  box(2.2, 0.02, 0.08, mGlow, 12.3, 2.15, 5.98);
  box(2.05, 0.2, 1.85, mWalnut, 12.3, 0.16, 7.45);
  box(1.95, 0.26, 1.72, mCream, 12.3, 0.4, 7.48);
  box(1.88, 0.1, 0.82, mLinen, 12.3, 0.56, 7.75);
  box(0.7, 0.12, 0.42, mTan, 12.3, 0.6, 8.15);
  box(0.52, 0.2, 0.36, mCream, 11.6, 0.64, 6.72);
  box(0.52, 0.2, 0.36, mCream, 13.0, 0.64, 6.72);
  box(2.0, 0.72, 0.1, mLinen, 12.3, 0.78, 6.52);
  box(0.48, 0.4, 0.42, mTravertine, 11.05, 0.22, 6.7);
  box(0.48, 0.4, 0.42, mTravertine, 13.55, 0.22, 6.7);
  cyl(0.07, 0.06, 0.16, mCeram, 11.05, 0.5, 6.7);
  cyl(0.07, 0.06, 0.16, mCeram, 13.55, 0.5, 6.7);
  mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.16, 16, 1, true), mLantern, 11.05, 0.72, 6.7);
  mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.16, 16, 1, true), mLantern, 13.55, 0.72, 6.7);
  warm(11.05, 0.7, 6.7, 3.2, 2.6);
  warm(13.55, 0.7, 6.7, 3.2, 2.6);
  box(1.2, 0.36, 0.38, mWalnut, 12.3, 0.22, 8.55);
  box(1.15, 0.06, 0.34, mCream, 12.3, 0.42, 8.55);
  box(0.58, 2.4, 2.55, mWood, 14.62, 1.2, 8.15);
  box(0.02, 2.05, 0.02, mMetal, 14.32, 1.2, 7.2);
  box(0.02, 2.05, 0.02, mMetal, 14.32, 1.2, 9.05);
  sheer(12.6, 1.3, 9.9, 3.6, 2.3);
  box(0.16, 2.4, 0.1, mDrape, 10.7, 1.22, 9.88);
  box(0.16, 2.4, 0.1, mDrape, 14.55, 1.22, 9.88);
  lantern(12.3, 2.22, 7.5, 0.2);
  cove(12.3, 6.05, 4.6, 0.06);
  downlight(11.2, 8.4);
  downlight(13.4, 8.4);
  spot(12.3, 2.55, 8.4, 12.3, 0.5, 7.4, 6);

  // —— 主卫 ——
  addFloor(2.16, 3.96, mStoneFloor, 8.4, 7.9);
  box(2.05, 2.55, 0.02, mMarble, 8.4, 1.28, 5.95);
  box(0.02, 2.55, 3.8, mMarble, 7.35, 1.28, 7.9);
  box(1.85, 0.78, 0.48, mWood, 7.62, 0.4, 7.55);
  box(1.9, 0.04, 0.52, mMarble, 7.62, 0.81, 7.55);
  box(1.7, 0.85, 0.02, mMirror, 7.4, 1.55, 7.55);
  box(1.65, 0.02, 0.02, mGlow, 7.42, 1.12, 7.55);
  box(1.8, 0.015, 0.45, mGlow, 7.62, 0.03, 7.55);
  cyl(0.015, 0.015, 0.16, mMetal, 7.35, 0.92, 6.95);
  cyl(0.015, 0.015, 0.16, mMetal, 7.35, 0.92, 8.15);
  box(0.22, 0.08, 0.55, mWood, 7.7, 0.42, 7.55);
  box(0.22, 0.08, 0.55, mWood, 7.7, 0.58, 7.55);
  mesh(new THREE.LatheGeometry([
    new THREE.Vector2(0.01, 0),
    new THREE.Vector2(0.36, 0.04),
    new THREE.Vector2(0.38, 0.22),
    new THREE.Vector2(0.32, 0.42),
  ], 28), mCeram, 8.55, 0.02, 9.15);
  cyl(0.015, 0.015, 0.85, mMetal, 8.55, 0.45, 9.45);
  box(0.08, 0.08, 0.28, mMetal, 8.55, 0.88, 9.28);
  box(0.72, 2.05, 0.04, mGlass, 8.95, 1.05, 6.85);
  box(0.04, 2.05, 1.15, mGlass, 8.6, 1.05, 6.3);
  cyl(0.08, 0.08, 0.02, mMetal, 8.55, 2.15, 6.55);
  cyl(0.05, 0.04, 0.14, mClay, 7.7, 0.9, 7.15);
  warm(7.7, 1.5, 7.55, 5, 4);
  downlight(8.4, 7.5);
  downlight(8.4, 9.0);

  // —— 客卫 ——
  addFloor(2.16, 2.76, mStoneFloor, 8.4, 4.3);
  box(1.35, 0.78, 0.46, mWood, 7.7, 0.4, 3.55);
  box(1.4, 0.04, 0.5, mMarble, 7.7, 0.81, 3.55);
  box(1.15, 0.7, 0.02, mMirror, 7.38, 1.45, 3.55);
  cyl(0.22, 0.22, 0.4, mCeram, 8.85, 0.22, 4.85, 22);
  box(0.08, 1.95, 0.85, mGlass, 8.95, 1.0, 3.7);
  warm(8.0, 1.8, 4.2, 3.5, 3.2);

  // —— 衣帽间 ——
  addFloor(2.16, 2.76, mFloor, 10.8, 4.3);
  box(0.4, 2.35, 2.5, mWood, 9.85, 1.18, 4.3);
  box(0.4, 2.35, 2.5, mWood, 11.75, 1.18, 4.3);
  box(1.7, 0.04, 0.4, mWood, 10.8, 1.55, 4.3);
  cyl(0.01, 0.01, 1.5, mMetal, 10.3, 1.7, 4.3, 8);
  cyl(0.01, 0.01, 1.5, mMetal, 11.3, 1.7, 4.3, 8);
  box(0.12, 0.85, 0.04, mLinen, 10.3, 1.35, 3.7);
  box(0.12, 0.85, 0.04, mSage, 10.3, 1.35, 3.95);
  box(0.12, 0.7, 0.04, mTan, 11.3, 1.28, 4.7);
  cove(10.8, 4.3, 1.8, 0.05);
  warm(10.8, 2.1, 4.3, 4, 3.5);

  // —— 次卧A（儿童房）——
  addFloor(2.76, 2.76, mFloor, 13.5, 4.3);
  box(2.55, 0.07, 0.55, mWood, 13.5, 0.74, 3.05);
  box(0.7, 0.55, 0.5, mWood, 14.35, 0.32, 3.05);
  box(0.48, 0.08, 0.46, mCream, 13.15, 0.48, 3.65);
  box(0.46, 0.4, 0.08, mWood, 13.15, 0.7, 3.42);
  box(1.95, 0.18, 0.92, mWood, 13.85, 0.14, 4.95);
  box(1.85, 0.2, 0.82, mLinen, 13.85, 0.34, 4.95);
  box(0.42, 0.16, 0.32, mCream, 13.25, 0.5, 4.7);
  box(0.55, 0.14, 0.28, mSage, 13.85, 0.5, 5.15);
  box(0.38, 1.55, 1.15, mWood, 12.28, 0.85, 4.2);
  books(12.38, 1.15, 3.85, 5);
  books(12.38, 1.55, 4.35, 4);
  lantern(13.5, 2.15, 4.3, 0.22);
  box(0.7, 0.7, 0.02, mTan, 13.85, 1.45, 5.35);
  plant(12.55, 3.35, 0.55);
  downlight(14.2, 3.6);

  // —— 次卧B ——
  addFloor(2.76, 2.56, mFloor, 13.5, 1.4);
  box(1.9, 0.18, 1.0, mWood, 13.35, 0.14, 1.55);
  box(1.8, 0.2, 0.9, mCream, 13.35, 0.34, 1.55);
  box(0.45, 0.16, 0.32, mLinen, 12.8, 0.5, 1.2);
  box(0.42, 2.05, 2.15, mWood, 14.7, 1.05, 1.4);
  box(0.55, 0.55, 0.4, mWood, 12.45, 0.3, 0.45);
  lantern(13.4, 2.15, 1.4, 0.16);
  downlight(13.5, 1.4);

  // —— 走廊 ——
  addFloor(1.56, 5.56, mFloor, 6.3, 5.7);
  art(5.55, 1.5, 5.4, 0.55, 0.75, Math.PI / 2);
  box(0.36, 0.85, 0.36, mTravertine, 6.3, 0.44, 6.9);
  cyl(0.08, 0.06, 0.28, mClay, 6.3, 1.02, 6.9);
  ball(0.12, mLeaf, 6.3, 1.28, 6.9);
  cove(6.3, 5.7, 0.08, 5.2);
  downlight(6.3, 3.6);
  downlight(6.3, 5.5);
  downlight(6.3, 7.4);

  // —— 南阳台 + 生活阳台 ——
  addFloor(6.96, 1.16, mStoneFloor, 3.6, 9.3);
  box(2.35, 0.4, 0.4, mWood, 3.4, 0.22, 9.35);
  box(0.5, 0.7, 0.5, mCeram, 1.15, 0.38, 9.3);
  ball(0.3, mLeaf, 1.15, 0.95, 9.3);
  plant(5.55, 9.35, 0.75);
  plant(6.55, 9.25, 0.55);
  box(6.8, 1.05, 0.05, mMetal, 3.6, 0.55, 9.92);
  addFloor(1.56, 2.56, mStoneFloor, 4.5, 1.4);
  box(0.45, 0.85, 0.45, mCeram, 4.15, 0.44, 0.55);
  ball(0.28, mLeaf, 4.15, 1.05, 0.55);
  box(0.7, 0.55, 0.38, mWood, 4.85, 0.3, 2.15);
  plant(4.9, 0.7, 0.6);

  return { group: g, floors };
}
