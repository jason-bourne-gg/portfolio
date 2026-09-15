/* =====================================================================
   The model. A scale model of a road at dusk: graphite terrain, concrete
   and glass, and light doing most of the work. Everything is built from
   primitives, but the finish comes from the materials — what is lit, what
   is merely pale, and what is only a silhouette.
   ===================================================================== */

import * as THREE from "three";
import type { Station } from "./stations";

export const COLORS = {
  horizon: 0x2c3c5c,
  ground: 0x414d63,
  groundLow: 0x39445a,
  groundHigh: 0x4c5a72,
  asphalt: 0x1c222c,
  kerb: 0x2f3744,
  paint: 0x9aa3b2,
  concrete: 0xc9c4b8,
  concreteDeep: 0xa59f93,
  metal: 0x515a68,
  glassDark: 0x2c3c50,
  lit: 0xffc98a,
  lamp: 0xffc48a,
  accent: 0x4d7cff,
  cyan: 0x74e4ff,
  canopy: 0x2b3340,
  foliage: 0x3d5348,
  foliageDeep: 0x32453c,
};

const solid = (color: number, roughness = 0.82) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.05 });

/** Anything using this reads as a light source once bloom is applied. */
const glow = (color: number, intensity = 1.5) =>
  new THREE.MeshStandardMaterial({
    color: 0x0b0e14,
    emissive: color,
    emissiveIntensity: intensity,
    roughness: 0.4,
  });

const MATS = {
  concrete: solid(COLORS.concrete, 0.88),
  concreteDeep: solid(COLORS.concreteDeep, 0.9),
  metal: new THREE.MeshStandardMaterial({ color: COLORS.metal, roughness: 0.45, metalness: 0.6 }),
  glassDark: new THREE.MeshStandardMaterial({
    color: COLORS.glassDark,
    roughness: 0.22,
    metalness: 0.28,
  }),
  window: glow(COLORS.lit, 0.95),
  windowDim: glow(COLORS.lit, 0.3),
  lamp: glow(COLORS.lamp, 1.5),
  accent: glow(COLORS.accent, 1.3),
  cyan: glow(COLORS.cyan, 1.4),
  foliage: solid(COLORS.foliage, 1),
  foliageDeep: solid(COLORS.foliageDeep, 1),
  trunk: solid(0x3a3f42, 1),
};

function box(w: number, h: number, d: number, material: THREE.Material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function cylinder(r: number, h: number, material: THREE.Material, sides = 14) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, sides), material);
  mesh.castShadow = true;
  return mesh;
}

/** A grid of lit and unlit windows — the thing that sells a building at dusk. */
function windowGrid(
  group: THREE.Group,
  columns: number,
  rows: number,
  spacingX: number,
  spacingY: number,
  baseY: number,
  z: number,
  seed: number,
  rotated = false
) {
  let state = seed;
  const random = () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
  const geometry = new THREE.BoxGeometry(0.9, 1.05, 0.1);
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const roll = random();
      const material = roll > 0.42 ? MATS.window : roll > 0.2 ? MATS.windowDim : MATS.glassDark;
      const pane = new THREE.Mesh(geometry, material);
      const x = (column - (columns - 1) / 2) * spacingX;
      const y = baseY + row * spacingY;
      if (rotated) {
        pane.position.set(z, y, x);
        pane.rotation.y = Math.PI / 2;
      } else {
        pane.position.set(x, y, z);
      }
      group.add(pane);
    }
  }
}

/** The road's spine. Stations sit beside it; the rider follows it. */
export function makeCurve(stops: number) {
  const points: THREE.Vector3[] = [];
  for (let i = -1; i <= stops + 1; i++) {
    points.push(new THREE.Vector3(Math.sin(i * 0.82) * 15 + Math.cos(i * 0.37) * 7, 0, -i * 26));
  }
  return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
}

function ribbon(curve: THREE.CatmullRomCurve3, halfWidth: number, y: number, material: THREE.Material) {
  const steps = 1200;
  const positions: number[] = [];
  const indices: number[] = [];
  const up = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const point = curve.getPointAt(t);
    const normal = curve.getTangentAt(t).cross(up).normalize();
    positions.push(
      point.x - normal.x * halfWidth, y, point.z - normal.z * halfWidth,
      point.x + normal.x * halfWidth, y, point.z + normal.z * halfWidth
    );
    if (i < steps) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  return mesh;
}

export function buildRoad(curve: THREE.CatmullRomCurve3) {
  const group = new THREE.Group();
  group.add(ribbon(curve, 6.2, 0.008, solid(COLORS.kerb, 0.95)));
  group.add(
    ribbon(
      curve,
      4.7,
      0.024,
      new THREE.MeshStandardMaterial({ color: COLORS.asphalt, roughness: 0.82, metalness: 0 })
    )
  );

  const dummy = new THREE.Object3D();
  const up = new THREE.Vector3(0, 1, 0);

  const dashes = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.2, 0.015, 2.1),
    solid(COLORS.paint, 0.7),
    420
  );
  for (let i = 0; i < 420; i++) {
    const t = (i + 0.5) / 420;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    dummy.position.set(point.x, 0.04, point.z);
    dummy.rotation.set(0, Math.atan2(tangent.x, tangent.z), 0);
    dummy.updateMatrix();
    dashes.setMatrixAt(i, dummy.matrix);
  }
  group.add(dashes);

  // Reflective studs down both edges — the road reads as lit, not painted.
  const studs = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.16, 0.05, 0.4),
    glow(COLORS.accent, 0.9),
    720
  );
  for (let i = 0; i < 720; i++) {
    const t = (Math.floor(i / 2) + 0.5) / 360;
    const side = i % 2 ? 1 : -1;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    const normal = tangent.clone().cross(up).normalize();
    dummy.position.set(point.x + normal.x * 4.3 * side, 0.06, point.z + normal.z * 4.3 * side);
    dummy.rotation.set(0, Math.atan2(tangent.x, tangent.z), 0);
    dummy.updateMatrix();
    studs.setMatrixAt(i, dummy.matrix);
  }
  group.add(studs);

  return group;
}

/** Street lamps down the verge, alternating sides. */
export function buildLamps(curve: THREE.CatmullRomCurve3) {
  const group = new THREE.Group();
  const up = new THREE.Vector3(0, 1, 0);
  const count = Math.max(24, Math.round(curve.getLength() / 11));

  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    const normal = tangent.clone().cross(up).normalize();
    const side = i % 2 ? 1 : -1;

    const lamp = new THREE.Group();
    const post = cylinder(0.11, 6.4, MATS.metal, 8);
    post.position.y = 3.2;
    const arm = box(0.12, 0.12, 1.5, MATS.metal);
    arm.position.set(0, 6.3, 0.7);
    const head = box(0.42, 0.14, 0.95, MATS.lamp);
    head.position.set(0, 6.18, 1.3);
    head.castShadow = false;
    lamp.add(post, arm, head);

    lamp.position.copy(point).addScaledVector(normal, 5.9 * side);
    lamp.rotation.y = Math.atan2(-normal.x * side, -normal.z * side);
    group.add(lamp);
  }
  return group;
}

export interface StationHandle {
  group: THREE.Group;
  label: THREE.Sprite;
  ring: THREE.Mesh;
  rack: THREE.Mesh[];
  anchor: THREE.Vector3;
}

/** A place on the map. Each kind is built from the same few primitives. */
export function buildStation(station: Station, index: number): StationHandle {
  const group = new THREE.Group();
  const rack: THREE.Mesh[] = [];
  let anchorHeight = 6;

  const padRadius = station.kind === "finish" ? 7 : 8.6;
  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(padRadius, padRadius, 0.12, 36),
    solid(COLORS.groundHigh, 0.95)
  );
  pad.position.y = 0.02;
  pad.receiveShadow = true;
  group.add(pad);

  if (station.kind !== "finish") {
    const path = box(2.8, 0.05, 8.5, solid(COLORS.kerb, 0.95));
    path.position.set(0, 0.08, 6.4);
    group.add(path);
  }

  // A thin ring of light that breathes when you arrive.
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(padRadius + 0.05, 0.075, 8, 72),
    new THREE.MeshBasicMaterial({ color: COLORS.cyan, transparent: true, opacity: 0 })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.14;
  group.add(ring);

  switch (station.kind) {
    case "home": {
      const walls = box(5.4, 3.2, 4.8, MATS.concrete);
      walls.position.y = 1.6;
      const roof = new THREE.Mesh(new THREE.ConeGeometry(4.3, 2.4, 4), MATS.concreteDeep);
      roof.rotation.y = Math.PI / 4;
      roof.position.y = 4.4;
      roof.castShadow = true;
      const door = box(1, 1.9, 0.12, MATS.window);
      door.position.set(0, 0.95, 2.45);
      group.add(walls, roof, door);
      windowGrid(group, 2, 1, 3.2, 0, 2, 2.45, 11);
      anchorHeight = 6.2;
      break;
    }
    case "school": {
      const walls = box(9, 3.4, 5.2, MATS.concrete);
      walls.position.y = 1.7;
      const roof = box(9.5, 0.35, 5.7, MATS.concreteDeep);
      roof.position.y = 3.58;
      const tower = box(1.7, 3.4, 1.7, MATS.concrete);
      tower.position.set(-3.4, 3.4, 0);
      const towerCap = box(2, 0.3, 2, MATS.concreteDeep);
      towerCap.position.set(-3.4, 5.25, 0);
      const clock = new THREE.Mesh(new THREE.CircleGeometry(0.58, 24), MATS.window);
      clock.position.set(-3.4, 4.1, 0.88);
      group.add(walls, roof, tower, towerCap, clock);
      windowGrid(group, 5, 1, 1.6, 0, 2, 2.68, 23);
      anchorHeight = 6.4;
      break;
    }
    case "college": {
      const base = box(12, 4.6, 6.2, MATS.concrete);
      base.position.y = 2.3;
      const roof = box(12.6, 0.4, 6.8, MATS.concreteDeep);
      roof.position.y = 4.8;
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(2.2, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        MATS.concreteDeep
      );
      dome.position.y = 5;
      dome.castShadow = true;
      group.add(base, roof, dome);
      for (let i = -2; i <= 2; i++) {
        const column = cylinder(0.34, 4.6, MATS.concrete, 14);
        column.position.set(i * 2.3, 2.3, 3.4);
        group.add(column);
        // Uplighters at the foot of each column.
        const wash = box(0.5, 0.1, 0.4, MATS.lamp);
        wash.position.set(i * 2.3, 0.14, 4.1);
        wash.castShadow = false;
        group.add(wash);
      }
      windowGrid(group, 5, 1, 2.3, 0, 2.5, -3.2, 31);
      anchorHeight = 9;
      break;
    }
    case "office": {
      const tower = station.tower ?? { width: 5.6, height: 13, floors: 6, columns: 3 };
      const half = tower.width / 2;
      const core = box(tower.width, tower.height, tower.width, MATS.glassDark);
      core.position.y = tower.height / 2;
      const frame = box(tower.width + 0.3, 0.35, tower.width + 0.3, MATS.concreteDeep);
      frame.position.y = tower.height + 0.1;
      const crown = box(tower.width - 1.2, 0.25, tower.width - 1.2, MATS.accent);
      crown.position.y = tower.height + 0.45;
      crown.castShadow = false;
      const mast = cylinder(0.07, 2.6, MATS.metal, 6);
      mast.position.y = tower.height + 1.7;
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), MATS.cyan);
      beacon.position.y = tower.height + 3;
      group.add(core, frame, crown, mast, beacon);
      const spacingY = (tower.height - 3) / tower.floors;
      const spacingX = (tower.width - 1.4) / Math.max(1, tower.columns - 1);
      windowGrid(group, tower.columns, tower.floors, spacingX, spacingY, 2.1, half + 0.06, index * 97 + 7);
      windowGrid(group, tower.columns, tower.floors, spacingX, spacingY, 2.1, half + 0.06, index * 97 + 53, true);
      // Plaza and a couple of cars.
      const plaza = box(7.2, 0.06, 4.6, solid(COLORS.kerb, 0.9));
      plaza.position.set(6.6, 0.09, 3.4);
      group.add(plaza);
      [0, 1].forEach((i) => {
        const parked = vehicle();
        parked.position.set(half + 2.4 + i * 2.7, 0, 3.4);
        parked.rotation.y = Math.PI / 2;
        group.add(parked);
      });
      anchorHeight = tower.height + 4.2;
      break;
    }
    case "store": {
      const shop = box(6.6, 3.6, 4.8, MATS.concrete);
      shop.position.set(0, 1.8, -2.4);
      const shopRoof = box(7.1, 0.35, 5.3, MATS.concreteDeep);
      shopRoof.position.set(0, 3.78, -2.4);
      const frontGlass = box(5.4, 2.2, 0.12, MATS.window);
      frontGlass.position.set(0, 1.9, 0.05);
      group.add(shop, shopRoof, frontGlass);

      // The forecourt canopy, lit from underneath.
      const canopy = box(10, 0.5, 5.6, MATS.concreteDeep);
      canopy.position.set(0, 5, 3.6);
      const underside = box(9.4, 0.08, 5, MATS.lamp);
      underside.position.set(0, 4.72, 3.6);
      underside.castShadow = false;
      group.add(canopy, underside);
      [-4.1, 4.1].forEach((x) => {
        const pillar = box(0.42, 4.8, 0.42, MATS.concrete);
        pillar.position.set(x, 2.4, 3.6);
        group.add(pillar);
      });
      [-2.2, 2.2].forEach((x) => {
        const pump = box(0.85, 2, 0.7, MATS.concreteDeep);
        pump.position.set(x, 1, 3.6);
        const readout = box(0.62, 0.42, 0.75, MATS.cyan);
        readout.position.set(x, 1.72, 3.6);
        readout.castShadow = false;
        group.add(pump, readout);
      });
      const filling = vehicle();
      filling.position.set(0, 0, 3.6);
      filling.rotation.y = Math.PI / 2;
      group.add(filling);

      // The rack: one edge-lit slab per project, each its own hit target.
      const rackGroup = new THREE.Group();
      [1.55, 2.95].forEach((y) => {
        const shelf = box(7.8, 0.14, 1.5, MATS.metal);
        shelf.position.set(0, y, 0);
        rackGroup.add(shelf);
      });
      [-3.7, 3.7].forEach((x) => {
        const leg = box(0.16, 3.4, 1.3, MATS.metal);
        leg.position.set(x, 1.7, 0);
        rackGroup.add(leg);
      });
      (station.shelf ?? []).forEach((_, i) => {
        const row = i < 3 ? 0 : 1;
        const column = i % 3;
        const slab = new THREE.Mesh(
          new THREE.BoxGeometry(1.9, 1.15, 0.95),
          new THREE.MeshStandardMaterial({
            color: 0x1b222e,
            emissive: COLORS.accent,
            emissiveIntensity: 0.22,
            roughness: 0.35,
            metalness: 0.4,
          })
        );
        slab.castShadow = true;
        slab.position.set((column - 1) * 2.4, 2.25 + row * 1.4, 0);
        slab.userData.project = i;
        slab.userData.restY = slab.position.y;
        rack.push(slab);
        rackGroup.add(slab);
      });
      rackGroup.position.set(-0.4, 0, 5.9);
      rackGroup.rotation.y = -0.16;
      group.add(rackGroup);
      anchorHeight = 6.6;
      break;
    }
    case "garage": {
      const shed = box(7.6, 3.8, 5.6, MATS.concrete);
      shed.position.y = 1.9;
      const roof = box(8.1, 0.35, 6.1, MATS.concreteDeep);
      roof.position.y = 3.98;
      const opening = box(4.6, 3, 0.1, MATS.window);
      opening.position.set(0, 1.5, 2.85);
      group.add(shed, roof, opening);
      for (let i = 0; i < 4; i++) {
        const tyre = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.2, 10, 20), solid(0x1a1d22, 0.95));
        tyre.rotation.x = Math.PI / 2;
        tyre.position.set(4.5, 0.22 + i * 0.36, 1.2);
        tyre.castShadow = true;
        group.add(tyre);
      }
      anchorHeight = 6.6;
      break;
    }
    case "finish": {
      [-5.8, 5.8].forEach((x) => {
        const pylon = box(0.7, 7, 0.7, MATS.concrete);
        pylon.position.set(x, 3.5, 0);
        group.add(pylon);
      });
      const beam = box(12.2, 0.5, 0.6, MATS.concreteDeep);
      beam.position.y = 6.9;
      const light = box(11.4, 0.16, 0.3, MATS.cyan);
      light.position.set(0, 6.6, 0.18);
      light.castShadow = false;
      group.add(beam, light);
      anchorHeight = 8.2;
      break;
    }
  }

  const label = makeLabel(station.sign, anchorHeight + 2.4);
  group.add(label);
  group.userData.station = index;

  return { group, label, ring, rack, anchor: new THREE.Vector3(0, anchorHeight, 0) };
}

/** A parked car — dark body, lit cabin. */
function vehicle() {
  const group = new THREE.Group();
  const body = box(1.8, 0.66, 3.7, solid(0x232a35, 0.45));
  body.position.y = 0.72;
  const cabin = box(1.58, 0.58, 1.8, MATS.glassDark);
  cabin.position.set(0, 1.35, -0.15);
  group.add(body, cabin);
  [
    [-0.94, 1.15],
    [0.94, 1.15],
    [-0.94, -1.15],
    [0.94, -1.15],
  ].forEach(([x, z]) => {
    const wheel = cylinder(0.34, 0.28, solid(0x15181d, 0.95), 12);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.34, z);
    group.add(wheel);
  });
  return group;
}

/** Floating name plate, always turned toward the camera. */
function makeLabel(text: string, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.font = '600 40px "Switzer", Helvetica, Arial, sans-serif';
  const width = Math.min(600, ctx.measureText(text).width + 74);
  const left = (640 - width) / 2;

  ctx.fillStyle = "rgba(8, 12, 20, 0.82)";
  roundRect(ctx, left, 34, width, 60, 30);
  ctx.fill();
  ctx.strokeStyle = "rgba(116, 228, 255, 0.5)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#74e4ff";
  ctx.beginPath();
  ctx.arc(left + 26, 64, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#eef2f8";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, left + 44, 66);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true })
  );
  sprite.scale.set(9.2, 1.84, 1);
  sprite.position.y = height;
  sprite.renderOrder = 10;
  sprite.userData.restY = height;
  sprite.userData.restScale = 9.2;
  return sprite;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export interface Rider {
  group: THREE.Group;
  head: THREE.Group;
  wheels: THREE.Mesh[];
}

/** The rider. Read as a silhouette with a headlight, not as a character. */
export function buildRider(): Rider {
  const group = new THREE.Group();
  const dark = solid(0x1c212b, 0.6);

  const wheelGeo = new THREE.TorusGeometry(0.58, 0.16, 10, 22);
  const wheels: THREE.Mesh[] = [];
  [-0.82, 0.82].forEach((z) => {
    const axle = new THREE.Group();
    axle.position.set(0, 0.58, z);
    axle.rotation.y = Math.PI / 2;
    const wheel = new THREE.Mesh(wheelGeo, solid(0x14171d, 0.9));
    wheel.castShadow = true;
    axle.add(wheel);
    group.add(axle);
    wheels.push(wheel);
  });

  const chassis = box(0.5, 0.46, 2.1, dark);
  chassis.position.y = 0.92;
  const fairing = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.8, 4, 12), MATS.metal);
  fairing.rotation.x = Math.PI / 2;
  fairing.position.set(0, 1.26, 0.28);
  const bars = box(1.25, 0.1, 0.1, MATS.metal);
  bars.position.set(0, 1.48, 0.96);
  const headlight = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 10), glow(0xfff2d8, 2.2));
  headlight.position.set(0, 1.34, 1.16);
  const tail = box(0.34, 0.09, 0.08, glow(0xff4d4d, 1.6));
  tail.position.set(0, 1.12, -1.06);
  group.add(chassis, fairing, bars, headlight, tail);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.36, 0.66, 4, 12), dark);
  torso.position.set(0, 1.74, -0.12);
  torso.rotation.x = -0.36;
  torso.castShadow = true;
  const arms = box(0.2, 0.2, 1.4, dark);
  arms.position.set(0, 1.82, 0.44);
  arms.rotation.x = 0.36;
  group.add(torso, arms);

  const head = new THREE.Group();
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.46, 22, 18), solid(0x2b3340, 0.35));
  helmet.castShadow = true;
  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(0.47, 22, 14, -0.9, 1.8, 0.7, 0.85),
    new THREE.MeshStandardMaterial({
      color: 0x0a1020,
      emissive: COLORS.cyan,
      emissiveIntensity: 0.55,
      roughness: 0.12,
      metalness: 0.8,
    })
  );
  head.add(helmet, visor);
  head.position.set(0, 2.32, 0.02);
  group.add(head);

  // The headlight actually lights the road ahead.
  const beam = new THREE.SpotLight(0xfff0d0, 26, 34, 0.42, 0.65, 1.4);
  beam.position.set(0, 1.35, 1.2);
  beam.target.position.set(0, 0, 14);
  group.add(beam, beam.target);

  return { group, head, wheels };
}

/** A dusk sky, painted once into a texture. */
export function makeSky() {
  const canvas = document.createElement("canvas");
  canvas.width = 8;
  canvas.height = 320;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createLinearGradient(0, 0, 0, 320);
  gradient.addColorStop(0, "#101a2e");
  gradient.addColorStop(0.42, "#1e2c47");
  gradient.addColorStop(0.72, "#35507a");
  gradient.addColorStop(0.88, "#57708f");
  gradient.addColorStop(1, "#8b93a4");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 8, 320);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Terrain relief, treeline and water. Everything here is a silhouette. */
export function buildScenery(curve: THREE.CatmullRomCurve3) {
  const group = new THREE.Group();
  const samples: THREE.Vector3[] = [];
  for (let i = 0; i <= 420; i++) samples.push(curve.getPointAt(i / 420));

  let seed = 20260915;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const near = (point: THREE.Vector3, distance: number) =>
    samples.some((sample) => sample.distanceToSquared(point) < distance * distance);

  const dummy = new THREE.Object3D();

  // Low relief: broad, shallow mounds that catch the key light.
  const relief = new THREE.InstancedMesh(
    new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    solid(COLORS.groundLow, 1),
    120
  );
  relief.receiveShadow = true;
  relief.castShadow = true;
  for (let i = 0; i < 120; i++) {
    const along = samples[Math.floor(random() * samples.length)];
    const point = new THREE.Vector3(
      along.x + (random() - 0.5) * 190,
      -0.4,
      along.z + (random() - 0.5) * 120
    );
    const spread = 12 + random() * 26;
    // A mound is only allowed where its own footprint clears the road.
    const scale = near(point, spread + 14) ? 0 : spread;
    dummy.position.copy(point);
    dummy.rotation.set(0, random() * Math.PI, 0);
    dummy.scale.set(scale, 1.1 + random() * 2.6, scale * (0.7 + random() * 0.6));
    dummy.updateMatrix();
    relief.setMatrixAt(i, dummy.matrix);
  }
  group.add(relief);

  // Still water, dark and mirror-smooth.
  for (let i = 0; i < 2; i++) {
    const along = samples[Math.floor((0.32 + i * 0.4) * samples.length)];
    const water = new THREE.Mesh(
      new THREE.CircleGeometry(1, 28),
      new THREE.MeshStandardMaterial({
        color: 0x0d1724,
        roughness: 0.06,
        metalness: 0.9,
      })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.set(along.x + (i ? 54 : -52), 0.02, along.z + 16);
    water.scale.setScalar(14 + i * 5);
    group.add(water);
  }

  // Treeline.
  const trunkGeo = new THREE.CylinderGeometry(0.16, 0.22, 1.1, 5);
  const leafGeo = new THREE.ConeGeometry(1.15, 3.6, 6);
  for (let i = 0; i < 360; i++) {
    const along = samples[Math.floor(random() * samples.length)];
    const point = new THREE.Vector3(
      along.x + (random() - 0.5) * 130,
      0,
      along.z + (random() - 0.5) * 80
    );
    if (near(point, 13)) continue;

    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(trunkGeo, MATS.trunk);
    trunk.position.y = 0.55;
    const canopy = new THREE.Mesh(leafGeo, random() > 0.5 ? MATS.foliage : MATS.foliageDeep);
    canopy.position.y = 2.6;
    canopy.castShadow = true;
    const upper = new THREE.Mesh(leafGeo, canopy.material);
    upper.position.y = 4.1;
    upper.scale.setScalar(0.62);
    upper.castShadow = true;
    tree.add(trunk, canopy, upper);
    tree.scale.setScalar(0.8 + random() * 1.1);
    tree.position.copy(point);
    tree.rotation.y = random() * Math.PI;
    group.add(tree);
  }

  return group;
}
