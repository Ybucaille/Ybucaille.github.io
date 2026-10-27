// The stack, drawn as a server rack: one chassis per layer, one module per
// project with its name engraved on the chassis, LEDs on the faceplate, and an
// empty slot at the bottom for the missing layer. main.js drives it.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const ACC = 0xc6f432;
const GAP = 1.05, W = 4.6, H = 0.34, D = 3.0;
const PALETTES = {
  light: { chassis: '#dcdbd5', side: '#c9c8c1', top: '#cfcec7', grid: 'rgba(24,25,22,.09)', ink: '#181916', soft: '#5a5b54',
    vent: 'rgba(24,25,22,.55)', block: 0x24251f, dim: 0x9d9c94, post: 0x2a2b27, led: 0x6d6e66, edge: 0x181916 },
  dark: { chassis: '#3b3c37', side: '#2f302c', top: '#2a2b27', grid: 'rgba(230,229,223,.07)', ink: '#ecebe5', soft: '#a4a59c',
    vent: 'rgba(0,0,0,.7)', block: 0x111210, dim: 0x45463f, post: 0x111210, led: 0x55564f, edge: 0x000000 },
};

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// brushed-metal side panel
function brushed(p) {
  return canvasTex(512, 64, (g, w, h) => {
    g.fillStyle = p.side; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) {
      g.fillStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '0,0,0'},${Math.random() * .05})`;
      g.fillRect(0, Math.random() * h, w, 1);
    }
  });
}

// faceplate: layer number, name, vent slots, screws
function faceplate(p, num, name, ghost = false) {
  return canvasTex(2048, 152, (g, w, h) => {
    if (!ghost) {
      g.fillStyle = p.chassis; g.fillRect(0, 0, w, h);
      const grd = g.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0, 'rgba(255,255,255,.18)'); grd.addColorStop(.5, 'rgba(255,255,255,0)'); grd.addColorStop(1, 'rgba(0,0,0,.18)');
      g.fillStyle = grd; g.fillRect(0, 0, w, h);
    } else {
      g.fillStyle = '#c6f432'; g.fillRect(0, 0, w, h);
    }
    g.fillStyle = ghost ? '#181916' : p.ink;
    g.font = '600 74px "IBM Plex Mono", monospace';
    g.textBaseline = 'middle';
    g.fillText(num, 70, h / 2 + 4);
    g.font = '500 46px "IBM Plex Mono", monospace';
    g.fillText(name, 210, h / 2 + 3);
    if (!ghost) {
      g.fillStyle = p.vent;
      for (let i = 0; i < 22; i++) {
        g.beginPath(); g.roundRect(1180 + i * 26, 42, 12, h - 84, 6); g.fill();
      }
      g.fillStyle = p.soft;
      for (const x of [26, w - 26]) { g.beginPath(); g.arc(x, h / 2, 11, 0, Math.PI * 2); g.fill(); }
    }
  });
}

// top panel: grid, engraved names in front of each module
function topPanel(p, items) {
  return canvasTex(2048, Math.round(2048 * D / W), (g, w, h) => {
    g.fillStyle = p.top; g.fillRect(0, 0, w, h);
    g.strokeStyle = p.grid; g.lineWidth = 2;
    for (let x = 0; x < w; x += 44) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y < h; y += 44) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.strokeStyle = p.soft; g.lineWidth = 3;
    g.strokeRect(24, 24, w - 48, h - 48);
    g.fillStyle = p.ink;
    g.font = '500 38px "IBM Plex Mono", monospace';
    g.textAlign = 'center';
    items.forEach(({ x, z, name }) => {
      g.fillText(name.toUpperCase(), (x + W / 2) / W * w, (z + D / 2) / D * h);
    });
  });
}

export function initStack(canvas, { layers, names, labels, certs, reduced, mobile, theme }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x8f8e86, 0.6);
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.castShadow = !mobile;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 30 });
  sun.shadow.bias = -0.0005;
  sun.shadow.radius = 5;
  scene.add(hemi, sun, sun.target);

  const root = new THREE.Group();
  scene.add(root);
  const total = layers.length;

  const coreGeo = new THREE.BoxGeometry(W, H, D);
  const edgeGeo = new THREE.EdgesGeometry(coreGeo);
  const blockGeo = new RoundedBoxGeometry(0.62, 0.2, 0.42, 3, 0.045);
  const ledGeo = new THREE.PlaneGeometry(0.34, 0.03);
  const fLedGeo = new THREE.CircleGeometry(0.035, 16);
  const chipGeo = new RoundedBoxGeometry(0.36, 0.06, 0.26, 2, 0.02);

  const slabs = [], blocks = new Map(), chips = [];
  const metal = () => new THREE.MeshPhysicalMaterial({ roughness: 0.42, metalness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.5 });

  layers.forEach((ids, i) => {
    const g = new THREE.Group();
    g.position.y = -i * GAP;
    const side = metal(), top = metal(), front = metal();
    top.metalness = 0.15; top.roughness = 0.75;
    // px, nx, py, ny, pz, nz
    const core = new THREE.Mesh(coreGeo, [side, side, top, side, front, side]);
    core.castShadow = core.receiveShadow = true;
    const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ transparent: true, opacity: 0.35 }));
    g.add(core, edges);

    const cols = Math.min(4, ids.length);
    const items = [];
    ids.forEach((id, k) => {
      const col = k % cols, row = Math.floor(k / cols);
      const x = -W / 2 + 0.75 + col * 1.02, z = -0.95 + row * 0.95;
      const m = new THREE.Group();
      const body = new THREE.Mesh(blockGeo, new THREE.MeshPhysicalMaterial({ roughness: 0.35, metalness: 0.3, clearcoat: 0.6 }));
      body.castShadow = true;
      const led = new THREE.Mesh(ledGeo, new THREE.MeshBasicMaterial({ toneMapped: false }));
      led.position.set(0, 0, 0.212);
      m.add(body, led);
      m.position.set(x, H / 2 + 0.1, z);
      m.userData = { lift: 0, body, led };
      g.add(m);
      blocks.set(id, m);
      items.push({ x, z: z + 0.42, name: labels[id] || id });
    });
    const fleds = ids.map((id, k) => {
      const l = new THREE.Mesh(fLedGeo, new THREE.MeshBasicMaterial({ toneMapped: false }));
      l.position.set(W / 2 - 0.25 - k * 0.12, 0, D / 2 + 0.004);
      g.add(l);
      return { id, l };
    });
    root.add(g);
    slabs.push({ g, side, top, front, edges, items, fleds, num: String(i + 1).padStart(2, '0'), name: names[i], drawer: 0 });
  });

  // certificates: cards that drop onto the socle
  const socle = slabs[total - 1].g;
  for (let i = 0; i < certs; i++) {
    const m = new THREE.Mesh(chipGeo, new THREE.MeshPhysicalMaterial({ color: ACC, roughness: 0.45, clearcoat: 0.4 }));
    const c = i % 4, r = Math.floor(i / 4);
    m.userData.home = new THREE.Vector3(0.55 + c * 0.44, H / 2 + 0.03, -1.0 + r * 0.38);
    m.position.copy(m.userData.home).setY(5);
    m.visible = false;
    m.castShadow = true;
    socle.add(m);
    chips.push(m);
  }

  // empty slot for the missing layer
  const ghost = new THREE.Group();
  ghost.position.set(0, -total * GAP, 4.5);
  const gEdges = new THREE.LineSegments(edgeGeo, new THREE.LineDashedMaterial({ color: 0x181916, dashSize: 0.12, gapSize: 0.08 }));
  gEdges.computeLineDistances();
  const gFill = new THREE.MeshBasicMaterial({ color: ACC, transparent: true, opacity: 0 });
  const gFront = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
  ghost.add(new THREE.Mesh(coreGeo, [gFill, gFill, gFill, gFill, gFront, gFill]), gEdges);
  root.add(ghost);

  // rack posts frame the stack
  const postMat = new THREE.MeshPhysicalMaterial({ roughness: 0.5, metalness: 0.6 });
  const span = (total + 0.6) * GAP;
  const postGeo = new THREE.BoxGeometry(0.09, span, 0.09);
  for (const x of [-W / 2 - 0.13, W / 2 + 0.13]) for (const z of [-D / 2 + 0.2, D / 2 - 0.2]) {
    const p = new THREE.Mesh(postGeo, postMat);
    p.position.set(x, -span / 2 + 0.45, z);
    p.castShadow = true;
    root.add(p);
  }

  // ---- theme ----
  let pal;
  function setTheme(name) {
    pal = PALETTES[name] || PALETTES.light;
    slabs.forEach(s => {
      for (const [mat, map] of [[s.side, brushed(pal)], [s.top, topPanel(pal, s.items)], [s.front, faceplate(pal, s.num, s.name)]]) {
        mat.map?.dispose(); mat.map = map; mat.needsUpdate = true;
      }
      s.edges.material.color.set(pal.edge);
    });
    gFront.map?.dispose();
    gFront.map = faceplate(pal, '07', 'VOTRE ENTREPRISE', true);
    gFront.needsUpdate = true;
    postMat.color.set(pal.post);
    hemi.intensity = name === 'dark' ? 0.35 : 0.6;
    scene.environmentIntensity = name === 'dark' ? 0.45 : 0.8;
  }
  setTheme(theme);

  // ---- state ----
  let state = { mode: 'intro', layer: -1, project: null, hits: null };
  let certT0 = -1;
  const cam = { y: -2.6, dist: 1.55, rot: 0.15 };

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    if (mobile) camera.setViewOffset(w, h, 0, h * 0.24, w, h);
    else camera.setViewOffset(w, h, -w * 0.25, 0, w, h);
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);

  const tmpC = new THREE.Color(), ledOff = new THREE.Color(), accC = new THREE.Color(ACC);
  const offset = new THREE.Vector3(6.4, 4.6, 8.6);
  const look = new THREE.Vector3();
  let last = performance.now();

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const k = reduced ? 1 : 1 - Math.exp(-dt * 4.5);
    const { mode, layer, project, hits } = state;
    const whole = mode === 'intro' || mode === 'tech';
    const job = mode === 'job' || mode === 'end';
    const certsMode = mode === 'certs' ? 1 : 0;

    const ty = whole ? -(total - 1) * GAP / 2 : job ? -(total - 0.2) * GAP : -Math.max(0, layer) * GAP - certsMode * 0.6;
    const td = (whole ? 1.55 : job ? 1.3 : 1.12 + certsMode * 0.1) * (mobile ? 1.55 : 1);
    const tr = mode === 'intro' && !reduced ? 0.12 + Math.sin(now / 4500) * 0.1 : 0.15;
    cam.y += (ty - cam.y) * k; cam.dist += (td - cam.dist) * k; cam.rot += (tr - cam.rot) * k;
    root.rotation.y = cam.rot;
    camera.position.copy(offset).multiplyScalar(cam.dist);
    camera.position.y += cam.y;
    look.set(0, cam.y, 0);
    camera.lookAt(look);
    sun.target.position.set(0, cam.y, 0);
    sun.position.set(3, cam.y + 9, 7);

    ledOff.set(pal.led);
    const blink = reduced ? 1 : 0.55 + 0.45 * Math.sin(now / 180);
    slabs.forEach((s, i) => {
      const active = !whole && !job && i === layer;
      s.drawer += ((active ? 1 : 0) - s.drawer) * k;
      s.g.position.z = s.drawer * 0.85;
      s.edges.material.opacity = active ? 0.7 : 0.3;
      s.fleds.forEach(({ id, l }) => {
        const on = hits ? hits.has(id) : active && id === project;
        l.material.color.copy(on ? accC : active ? tmpC.copy(accC).multiplyScalar(0.35) : ledOff);
        if (on && !hits) l.material.color.multiplyScalar(blink);
      });
    });

    blocks.forEach((m, id) => {
      const { body, led } = m.userData;
      let target = pal.block, lift = 0, glow = false;
      if (hits) { if (hits.has(id)) { lift = 0.22; glow = true; } else target = pal.dim; }
      else if (id === project) { lift = 0.3; glow = true; }
      m.userData.lift += (lift - m.userData.lift) * k;
      m.position.y = H / 2 + 0.1 + m.userData.lift;
      body.material.color.lerp(tmpC.set(target), k);
      led.material.color.lerp(glow ? accC : ledOff, k);
    });

    if (mode === 'certs' && certT0 < 0) certT0 = now;
    if (certT0 >= 0) chips.forEach((m, i) => {
      m.visible = true;
      const t = reduced ? 1 : Math.min(1, Math.max(0, (now - certT0 - i * 110) / 700));
      const e = 1 - Math.pow(1 - t, 3);
      m.position.y = m.userData.home.y + (1 - e) * 4 + (t < 1 ? Math.sin(t * Math.PI) * 0.08 : 0);
      m.rotation.y = (1 - e) * 1.2;
    });

    // the empty slot slides into the rack for the job section
    ghost.position.z += ((job ? 0.5 : 4.5) - ghost.position.z) * k;
    const gv = job ? 1 : 0;
    gFill.opacity += (gv * 0.92 - gFill.opacity) * k;
    gFront.opacity += (gv - gFront.opacity) * k;
    gEdges.visible = gFill.opacity > 0.02;
    if (!reduced) gEdges.material.dashOffset = -now / 900;

    renderer.render(scene, camera);
  }

  const run = () => renderer.setAnimationLoop(frame);
  run();
  document.addEventListener('visibilitychange', () => document.hidden ? renderer.setAnimationLoop(null) : (last = performance.now(), run()));

  return {
    setState(next) { state = { ...state, ...next }; },
    setTheme,
  };
}
