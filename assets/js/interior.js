export function buildInterior(THREE, scene, PLAN, ROOMS) {
  const loader = new THREE.TextureLoader();

  function canvasMap(draw, size, repeatX, repeatY) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    draw(canvas.getContext("2d"), size);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 8;
    map.repeat.set(repeatX, repeatY);
    return map;
  }

  const oakFloor = canvasMap((ctx, s) => {
    ctx.fillStyle = "#c4a06a";
    ctx.fillRect(0, 0, s, s);
    const step = 36;
    for (let y = -s; y < s * 2; y += step) {
      for (let x = -s; x < s * 2; x += step * 2) {
        const flip = Math.floor(y / step) % 2;
        ctx.save();
        ctx.translate(x + (flip ? step : 0), y);
        ctx.rotate(flip ? Math.PI / 4 : -Math.PI / 4);
        const n = (x * 17 + y * 9) % 36;
        ctx.fillStyle = `rgb(${168 + n},${124 + (n % 22)},${68 + (n % 14)})`;
        ctx.fillRect(-step, -7, step * 1.7, 13);
        ctx.strokeStyle = "rgba(70,42,18,0.28)";
        ctx.strokeRect(-step, -7, step * 1.7, 13);
        ctx.restore();
      }
    }
  }, 512, 9, 6);

  const plaster = canvasMap((ctx, s) => {
    ctx.fillStyle = "#e7dcc8";
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 1400; i += 1) {
      const x = (i * 67) % s;
      const y = (i * 131) % s;
      ctx.fillStyle = `rgba(190,170,145,${0.04 + (i % 7) * 0.01})`;
      ctx.beginPath();
      ctx.ellipse(x, y, 18 + (i % 12), 10 + (i % 8), i, 0, Math.PI * 2);
      ctx.fill();
    }
  }, 512, 2.2, 1.4);

  const wood = canvasMap((ctx, s) => {
    const g = ctx.createLinearGradient(0, 0, s, 0);
    g.addColorStop(0, "#b8894e");
    g.addColorStop(0.5, "#d2a66a");
    g.addColorStop(1, "#a8753b");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = "rgba(90,50,20,0.18)";
    for (let x = 8; x < s; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x + 4, s * 0.3, x - 3, s * 0.7, x + 2, s);
      ctx.stroke();
    }
  }, 256, 1.6, 1);

  const linen = canvasMap((ctx, s) => {
    ctx.fillStyle = "#efe6d6";
    ctx.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 3) {
      ctx.fillStyle = y % 6 ? "rgba(210,190,165,0.25)" : "rgba(255,248,235,0.2)";
      ctx.fillRect(0, y, s, 1);
    }
    for (let x = 0; x < s; x += 4) {
      ctx.fillStyle = "rgba(180,160,140,0.12)";
      ctx.fillRect(x, 0, 1, s);
    }
  }, 256, 1.8, 1.4);

  const stone = canvasMap((ctx, s) => {
    ctx.fillStyle = "#d8cfc2";
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 80; i += 1) {
      ctx.fillStyle = `rgba(${190 + (i % 20)},${180 + (i % 16)},${168},0.35)`;
      ctx.fillRect((i * 53) % s, (i * 91) % s, 40, 28);
    }
  }, 256, 2, 2);

  const leaf = canvasMap((ctx, s) => {
    ctx.fillStyle = "#2f5a32";
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 90; i += 1) {
      ctx.fillStyle = i % 2 ? "#4a7a3c" : "#1e3f22";
      ctx.beginPath();
      ctx.ellipse((i * 47) % s, (i * 73) % s, 18, 10, i, 0, Math.PI * 2);
      ctx.fill();
    }
  }, 256, 1, 1);

  function adopt(path, target, repeatX, repeatY) {
    loader.load(path, (map) => {
      map.colorSpace = THREE.SRGBColorSpace;
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.anisotropy = 8;
      map.repeat.set(repeatX, repeatY);
      target.map = map;
      target.needsUpdate = true;
    });
  }

  const mats = {
    floor: new THREE.MeshStandardMaterial({ map: oakFloor, roughness: 0.55, color: 0xf3e2c4 }),
    plaster: new THREE.MeshStandardMaterial({ map: plaster, roughness: 0.9, color: 0xf0e6d4 }),
    wood: new THREE.MeshStandardMaterial({ map: wood, roughness: 0.48, color: 0xe6c48a }),
    darkWood: new THREE.MeshStandardMaterial({ map: wood, roughness: 0.42, color: 0x6b4a28 }),
    linen: new THREE.MeshStandardMaterial({ map: linen, roughness: 0.86, color: 0xf4ead8 }),
    sage: new THREE.MeshStandardMaterial({ map: linen, roughness: 0.86, color: 0x8d9a72 }),
    stone: new THREE.MeshStandardMaterial({ map: stone, roughness: 0.45, color: 0xefe8dc }),
    marble: new THREE.MeshStandardMaterial({ map: stone, roughness: 0.28, color: 0xf7f2ea, metalness: 0.08 }),
    metal: new THREE.MeshStandardMaterial({ color: 0xc4a35a, metalness: 0.85, roughness: 0.28 }),
    glass: new THREE.MeshStandardMaterial({ color: 0xcfe4f2, transparent: true, opacity: 0.28, roughness: 0.05, metalness: 0.1 }),
    curtain: new THREE.MeshStandardMaterial({ map: linen, color: 0xfbf6ea, transparent: true, opacity: 0.72, roughness: 0.9, side: THREE.DoubleSide }),
    leaf: new THREE.MeshStandardMaterial({ map: leaf, roughness: 0.9, color: 0x6d8a4a }),
    pot: new THREE.MeshStandardMaterial({ color: 0x8d5a3c, roughness: 0.7 }),
    ceiling: new THREE.MeshStandardMaterial({ color: 0xf7f1e6, roughness: 0.96 }),
    sky: new THREE.MeshBasicMaterial({ color: 0x9ec5d6 }),
    glow: new THREE.MeshBasicMaterial({ color: 0xffe7b0 })
  };

  adopt("assets/textures/tex-oak-floor.png", mats.floor, 9, 6);
  adopt("assets/textures/tex-plaster.png", mats.plaster, 2.2, 1.4);
  adopt("assets/textures/tex-oak-wood.png", mats.wood, 1.6, 1);
  adopt("assets/textures/tex-oak-wood.png", mats.darkWood, 1.4, 1);
  adopt("assets/textures/tex-linen.png", mats.linen, 1.8, 1.4);
  adopt("assets/textures/tex-stone.png", mats.stone, 2, 2);
  adopt("assets/textures/tex-stone.png", mats.marble, 1.6, 1.6);

  scene.background = new THREE.Color(0xb9c7b4);
  scene.add(new THREE.HemisphereLight(0xfff3dd, 0x6a5c4a, 0.85));
  const sun = new THREE.DirectionalLight(0xffe6bf, 1.35);
  sun.position.set(3, 7, 16);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  scene.add(sun);
  [
    [2.6, 2.28, 6.5, 7],
    [2.4, 2.2, 3.7, 8],
    [1.5, 2.15, 1.3, 6],
    [12.2, 2.2, 7.6, 7],
    [8.4, 2.2, 4.2, 5],
    [13.3, 2.15, 4.2, 5],
    [6.3, 2.2, 1.5, 4]
  ].forEach(([x, y, z, i]) => {
    const light = new THREE.PointLight(0xffddaa, i, 5.2, 2);
    light.position.set(x, y, z);
    scene.add(light);
  });

  function mesh(geo, mat, x, y, z, rotY) {
    const item = new THREE.Mesh(geo, mat);
    item.position.set(x, y, z);
    if (rotY) item.rotation.y = rotY;
    item.castShadow = true;
    item.receiveShadow = true;
    scene.add(item);
    return item;
  }

  function box(x, y, z, w, h, d, mat, rotY) {
    return mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, rotY);
  }

  const floors = [];
  ROOMS.forEach((room) => {
    const wet = room.slug.includes("bath") || room.slug.includes("balcony");
    const floor = mesh(new THREE.PlaneGeometry(room.w, room.d), wet ? mats.stone : mats.floor, room.x + room.w / 2, 0.012, room.y + room.d / 2);
    floor.rotation.x = -Math.PI / 2;
    floor.userData.room = room;
    floors.push(floor);
    box(room.x + room.w / 2, PLAN.height - 0.03, room.y + room.d / 2, room.w, 0.06, room.d, mats.ceiling);
  });

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

  function overlaps(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
    return Math.min(ax1, ax2) < Math.max(bx1, bx2) + 0.02 && Math.max(ax1, ax2) > Math.min(bx1, bx2) - 0.02 && Math.min(ay1, ay2) < Math.max(by1, by2) + 0.02 && Math.max(ay1, ay2) > Math.min(by1, by2) - 0.02;
  }

  function addWall(x1, y1, x2, y2) {
    if (OPENINGS.some((gap) => overlaps(x1, y1, x2, y2, gap.x1, gap.y1, gap.x2, gap.y2))) return;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len < 0.08) return;
    const horiz = Math.abs(dx) >= Math.abs(dy);
    box((x1 + x2) / 2, PLAN.height / 2, (y1 + y2) / 2, horiz ? len : 0.1, PLAN.height, horiz ? 0.1 : len, mats.plaster);
  }

  const seen = new Set();
  ROOMS.forEach((room) => {
    [
      [room.x, room.y, room.x + room.w, room.y],
      [room.x, room.y + room.d, room.x + room.w, room.y + room.d],
      [room.x, room.y, room.x, room.y + room.d],
      [room.x + room.w, room.y, room.x + room.w, room.y + room.d]
    ].forEach((edge) => {
      const key = edge.map((n) => n.toFixed(2)).join(",");
      if (seen.has(key)) return;
      seen.add(key);
      addWall(...edge);
    });
  });

  function slats(x, z, length, height, alongZ, mat) {
    const pitch = 0.075;
    const n = Math.max(4, Math.floor(length / pitch));
    const geo = new THREE.BoxGeometry(alongZ ? 0.02 : 0.055, height, alongZ ? 0.055 : 0.02);
    const inst = new THREE.InstancedMesh(geo, mat, n);
    inst.castShadow = true;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < n; i += 1) {
      const t = (i + 0.5) / n;
      dummy.position.set(alongZ ? x : x - length / 2 + t * length, height / 2 + 0.02, alongZ ? z - length / 2 + t * length : z);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    scene.add(inst);
  }

  function pendant(x, z, size) {
    mesh(new THREE.SphereGeometry(size, 24, 16), mats.glow, x, 2.22, z);
    box(x, 2.42, z, 0.04, 0.28, 0.04, mats.metal);
  }

  function plant(x, z, scale) {
    mesh(new THREE.CylinderGeometry(0.09 * scale, 0.12 * scale, 0.28 * scale, 12), mats.pot, x, 0.16 * scale, z);
    mesh(new THREE.SphereGeometry(0.28 * scale, 16, 12), mats.leaf, x, 0.62 * scale, z);
    mesh(new THREE.SphereGeometry(0.2 * scale, 14, 10), mats.leaf, x + 0.12 * scale, 0.82 * scale, z - 0.06 * scale);
  }

  function curtain(x, z, w, alongX) {
    const geo = new THREE.PlaneGeometry(w, 2.35, 12, 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i += 1) {
      pos.setZ(i, Math.sin(pos.getX(i) * 6.2) * 0.04);
    }
    pos.needsUpdate = true;
    const item = mesh(geo, mats.curtain, x, 1.2, z, alongX ? 0 : Math.PI / 2);
    item.castShadow = false;
  }

  function chair(x, z, yaw, dark) {
    const woodMat = dark ? mats.darkWood : mats.wood;
    [-0.14, 0.14].forEach((ox) => {
      [-0.14, 0.14].forEach((oz) => {
        const rx = x + Math.cos(yaw) * ox - Math.sin(yaw) * oz;
        const rz = z + Math.sin(yaw) * ox + Math.cos(yaw) * oz;
        mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 8), woodMat, rx, 0.21, rz);
      });
    });
    box(x, 0.46, z, 0.42, 0.07, 0.42, mats.linen, yaw);
    box(x + Math.sin(yaw) * 0.17, 0.8, z + Math.cos(yaw) * 0.17, 0.4, 0.5, 0.07, mats.linen, yaw);
    box(x + Math.sin(yaw) * 0.17, 0.72, z + Math.cos(yaw) * 0.17, 0.06, 0.42, 0.06, woodMat, yaw);
  }

  function sofaSeat(x, z, w, d, yaw) {
    box(x, 0.22, z, w, 0.2, d, mats.linen, yaw);
    box(x, 0.4, z, w - 0.08, 0.16, d - 0.1, mats.linen, yaw);
    mesh(new THREE.CapsuleGeometry(0.1, w * 0.55, 6, 10), mats.linen, x, 0.62, z - d * 0.28, yaw);
  }

  slats(0.12, 6.7, 3.2, 2.55, true, mats.wood);
  box(0.2, 1.35, 6.7, 0.04, 0.82, 1.28, mats.darkWood);
  box(0.28, 0.42, 6.7, 0.28, 0.06, 2.4, mats.marble);
  box(0.55, 1.1, 5.35, 0.42, 1.7, 0.28, mats.wood);
  box(2.55, 0.16, 7.15, 2.4, 0.03, 1.85, mats.linen);
  sofaSeat(2.85, 7.42, 1.65, 0.78, 0);
  sofaSeat(2.05, 6.95, 0.85, 0.72, 0.4);
  sofaSeat(3.55, 6.95, 0.78, 0.72, -0.35);
  box(2.55, 0.54, 7.62, 0.3, 0.16, 0.2, mats.sage);
  box(3.05, 0.54, 7.5, 0.22, 0.14, 0.18, mats.linen);
  mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 24), mats.linen, 2.55, 0.18, 7.15);
  box(1.95, 0.22, 6.85, 0.95, 0.32, 0.62, mats.darkWood);
  box(4.15, 0.28, 7.55, 0.38, 0.36, 0.38, mats.marble);
  chair(4.15, 6.55, 2.4, false);
  mesh(new THREE.TorusGeometry(0.32, 0.035, 10, 24), mats.glow, 2.55, 2.2, 6.9);
  pendant(2.55, 6.9, 0.2);
  plant(4.55, 8.15, 1.15);
  box(4.35, 0.85, 8.15, 0.03, 1.45, 0.03, mats.metal);
  curtain(2.5, 8.52, 4.6, true);
  box(2.7, 1.35, 8.58, 4.8, 2.2, 0.03, mats.glass);

  box(2.35, 0.38, 3.75, 1.85, 0.06, 1.05, mats.darkWood);
  box(2.35, 0.72, 3.75, 1.7, 0.04, 0.92, mats.darkWood);
  [
    [1.55, 3.35], [2.35, 3.25], [3.15, 3.35],
    [1.55, 4.15], [2.35, 4.25], [3.15, 4.15]
  ].forEach(([x, z], i) => chair(x, z, i < 3 ? 0 : Math.PI, true));
  pendant(2.35, 3.75, 0.34);
  box(2.25, 0.86, 3.75, 0.32, 0.08, 0.32, mats.sage);

  box(1.05, 0.46, 0.28, 3.1, 0.9, 0.42, mats.wood);
  box(1.05, 0.92, 0.28, 3.1, 0.04, 0.44, mats.marble);
  box(0.28, 0.95, 1.35, 0.42, 1.85, 2.3, mats.wood);
  slats(0.48, 1.35, 2.2, 1.7, true, mats.wood);
  box(1.85, 0.46, 1.55, 1.35, 0.88, 0.7, mats.marble);
  box(1.85, 0.92, 1.55, 1.4, 0.05, 0.74, mats.marble);
  box(1.55, 1.12, 1.55, 0.04, 0.32, 0.04, mats.metal);
  box(0.55, 1.55, 0.32, 1.6, 0.04, 0.08, mats.glow);
  box(1.7, 1.25, -0.01, 2.4, 1.7, 0.03, mats.glass);

  slats(5.62, 1.35, 2.3, 2.5, true, mats.wood);
  box(5.95, 0.38, 1.5, 0.7, 0.1, 1.15, mats.marble);
  box(6.15, 1.15, 1.95, 0.04, 1.9, 0.62, mats.metal);
  box(5.7, 0.08, 1.3, 1.15, 0.04, 2.2, mats.stone);
  plant(6.5, 0.55, 0.7);

  box(8.7, 0.38, 0.42, 1.7, 0.74, 0.62, mats.wood);
  box(8.7, 0.8, 0.42, 1.55, 0.06, 0.55, mats.wood);
  chair(8.55, 1.15, Math.PI, false);
  slats(11.75, 1.35, 2.3, 2.4, true, mats.wood);
  box(10.6, 1.15, 0.28, 1.8, 1.9, 0.28, mats.wood);
  box(9.4, 1.55, 1.3, 0.62, 0.04, 0.08, mats.glow);

  slats(14.82, 7.85, 3.4, 2.5, true, mats.darkWood);
  box(13.15, 0.22, 7.85, 2.2, 0.28, 1.9, mats.darkWood);
  box(13.15, 0.46, 7.85, 2.05, 0.2, 1.75, mats.linen);
  box(13.95, 0.78, 7.85, 0.16, 0.62, 1.6, mats.linen);
  mesh(new THREE.BoxGeometry(0.48, 0.14, 0.42), mats.linen, 12.7, 0.64, 7.35);
  mesh(new THREE.BoxGeometry(0.48, 0.14, 0.42), mats.linen, 13.25, 0.64, 7.35);
  box(13.15, 0.58, 8.5, 1.55, 0.08, 0.5, mats.sage);
  box(13.15, 0.34, 8.9, 1.6, 0.34, 0.4, mats.wood);
  box(12.15, 0.42, 7.15, 0.48, 0.42, 0.48, mats.stone);
  box(14.15, 0.42, 7.15, 0.48, 0.42, 0.48, mats.stone);
  mesh(new THREE.SphereGeometry(0.16, 18, 12), mats.glow, 12.15, 0.86, 7.15);
  mesh(new THREE.SphereGeometry(0.16, 18, 12), mats.glow, 14.15, 0.86, 7.15);
  box(13.15, 0.08, 7.75, 2.4, 0.03, 2.2, mats.linen);
  curtain(12.4, 9.88, 3.6, true);
  box(12.3, 1.3, 9.94, 3.8, 2.1, 0.03, mats.glass);
  slats(10.05, 4.25, 2.5, 2.4, true, mats.wood);
  box(10.35, 1.1, 4.2, 0.32, 2.1, 2.2, mats.wood);
  box(10.55, 1.6, 4.2, 0.04, 1.6, 1.8, mats.glow);

  box(13.45, 0.28, 4.2, 1.7, 0.28, 1.35, mats.wood);
  box(13.45, 0.48, 4.2, 1.6, 0.14, 1.25, mats.linen);
  box(13.95, 0.7, 4.2, 0.16, 0.48, 1.15, mats.linen);
  box(13.45, 0.38, 0.95, 1.55, 0.32, 1.15, mats.wood);
  box(13.45, 0.56, 0.95, 1.45, 0.12, 1.05, mats.linen);

  box(8.35, 0.02, 3.9, 1.8, 0.04, 2.2, mats.stone);
  box(7.55, 1.05, 3.5, 0.55, 2.05, 0.55, mats.stone);
  box(8.85, 0.42, 5.1, 1.15, 0.82, 0.48, mats.marble);
  box(8.35, 0.02, 7.6, 1.9, 0.04, 3.2, mats.stone);
  box(7.7, 0.48, 8.85, 0.85, 0.95, 0.85, mats.stone);
  box(8.55, 0.32, 7.1, 1.35, 0.62, 0.7, mats.marble);

  box(3.2, 0.06, 9.25, 5.8, 0.04, 1.15, mats.stone);
  plant(0.7, 9.2, 0.85);
  plant(2.2, 9.35, 0.7);
  plant(5.4, 9.2, 0.9);
  box(3.6, 1.1, 9.95, 6.8, 2.15, 0.03, mats.glass);
  box(8, 1.2, 10.4, 14, 2.4, 0.04, mats.sky);
  box(8, 0.4, 10.7, 14, 0.8, 0.6, mats.leaf);

  return { floors };
}
