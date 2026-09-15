import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { me, shifts, type Project } from "../content";
import {
  buildLamps,
  buildRider,
  buildRoad,
  buildScenery,
  buildStation,
  COLORS,
  makeCurve,
  makeSky,
  type StationHandle,
} from "./build";
import { stations, type Station } from "./stations";
import "./world.css";

/** Scroll length per station. More means a longer, slower ride. */
const SCREENS_PER_STATION = 2.4;
/** How far off the road each place is built. */
const OFFSET = 13;
/** The ride stays inside the curve's ends, so the road never runs out. */
const T_START = 0.045;
const T_SPAN = 0.91;

export default function World({ onRead }: { onRead: () => void }) {
  const mount = useRef<HTMLDivElement>(null);
  const leader = useRef<SVGSVGElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  /** Smoothed screen position of the card, so it glides rather than snaps. */
  const placed = useRef({ x: 0, y: 0, ready: false });
  const scene = useRef<SceneHandle | null>(null);

  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [grazed, setGrazed] = useState<number | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  const curve = useMemo(() => makeCurve(stations.length), []);
  const stationT = useMemo(() => stations.map((_, i) => i / (stations.length - 1)), []);

  const openItem = picked ?? grazed;
  const store = useMemo(() => stations.findIndex((stop) => stop.shelf), []);
  const shown = openItem !== null ? store : hovered ?? current;
  const station = stations[shown];
  const project = station.shelf && openItem !== null ? station.shelf[openItem] : null;

  const scrollTo = useCallback(
    (index: number) => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: stationT[index] * scrollable, behavior: "smooth" });
    },
    [stationT]
  );

  useEffect(() => {
    const node = mount.current;
    if (!node) return;

    const handle = createScene(node, curve, stationT, (x, y, visible, travelling, riderX) => {
      const svg = leader.current;
      const card = popup.current;
      if (!svg || !card) return;

      card.dataset.state = travelling ? "travelling" : "settled";

      // Below the breakpoint the card is a sheet at the bottom; leave it be.
      if (window.innerWidth <= 900) {
        card.style.transform = "";
        svg.style.opacity = "0";
        return;
      }

      const width = card.offsetWidth;
      const height = card.offsetHeight;
      const gap = 30;
      const margin = 18;

      // Stand beside the place, on whichever side has room.
      let left = x + gap;
      let onRight = true;
      if (left + width > window.innerWidth - margin) {
        left = x - gap - width;
        onRight = false;
      }
      // Never park the card on top of the rider.
      const keepOut = 150;
      if (left < riderX + keepOut && left + width > riderX - keepOut) {
        if (riderX < window.innerWidth / 2) {
          left = riderX + keepOut;
          onRight = true;
        } else {
          left = riderX - keepOut - width;
          onRight = false;
        }
      }
      left = Math.min(Math.max(left, margin), window.innerWidth - width - margin);
      let top = y - height * 0.38;
      top = Math.min(Math.max(top, 84), window.innerHeight - height - 86);

      const settle = placed.current.ready ? 0.22 : 1;
      placed.current.x += (left - placed.current.x) * settle;
      placed.current.y += (top - placed.current.y) * settle;
      placed.current.ready = true;
      card.style.transform = `translate3d(${Math.round(placed.current.x)}px, ${Math.round(
        placed.current.y
      )}px, 0)`;

      const line = svg.firstElementChild as SVGLineElement | null;
      const ring = svg.lastElementChild as SVGCircleElement | null;
      if (!line || !ring) return;
      const edgeX = onRight ? placed.current.x : placed.current.x + width;
      const edgeY = placed.current.y + height * 0.38;
      const reach = Math.hypot(edgeX - x, edgeY - y);
      svg.style.opacity = visible && reach > 26 ? "1" : "0";
      line.setAttribute("x1", String(Math.round(edgeX)));
      line.setAttribute("y1", String(Math.round(edgeY)));
      line.setAttribute("x2", String(x));
      line.setAttribute("y2", String(y));
      ring.setAttribute("cx", String(x));
      ring.setAttribute("cy", String(y));
    });
    scene.current = handle;

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const value = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      handle.target = value;
      setProgress(value);
      let index = 0;
      stationT.forEach((t, i) => {
        if (value >= t - 0.04) index = i;
      });
      setCurrent(index);
    };

    const onMove = (event: PointerEvent) => {
      const hit = handle.pick(event.clientX, event.clientY);
      setHovered(hit.station);
      setGrazed(hit.project);
      node.style.cursor = hit.station !== null ? "pointer" : "";
    };

    const onClick = (event: PointerEvent) => {
      const hit = handle.pick(event.clientX, event.clientY);
      if (hit.project !== null) setPicked(hit.project);
      else if (hit.station !== null) scrollTo(hit.station);
    };

    const onLeave = () => {
      setHovered(null);
      setGrazed(null);
    };

    onScroll();
    handle.eased = handle.target;
    window.addEventListener("scroll", onScroll, { passive: true });
    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerleave", onLeave);
    node.addEventListener("click", onClick as EventListener);

    return () => {
      window.removeEventListener("scroll", onScroll);
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
      node.removeEventListener("click", onClick as EventListener);
      handle.dispose();
    };
  }, [curve, stationT, scrollTo]);

  useEffect(() => {
    if (!scene.current) return;
    placed.current.ready = false;
    scene.current.focus = shown;
    scene.current.hovered = hovered;
    scene.current.arrived = current;
    scene.current.lifted = openItem;
  }, [shown, hovered, current, openItem]);

  return (
    <div className="world">
      <div className="world-stage" ref={mount} />

      <div
        className="world-spacer"
        style={{ height: `${stations.length * SCREENS_PER_STATION * 100}vh` }}
      />

      {/* Leader line from the card to the place it describes. */}
      <svg className="leader" ref={leader} aria-hidden="true">
        <line x1="0" y1="0" x2="0" y2="0" />
        <circle r="13" cx="0" cy="0" />
      </svg>

      <header className="world-head">
        <div>
          <p className="world-name">Aniket Charjan</p>
          <p className="world-role">{me.role}, BrowserStack</p>
        </div>
        <button className="world-toggle" type="button" onClick={onRead}>
          Read as a page
        </button>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        {project ? (
          <Popup key={`project-${project.name}`} hostRef={popup}>
            <ProjectCard
              project={project}
              onBack={() => {
                setPicked(null);
                setGrazed(null);
              }}
            />
          </Popup>
        ) : (
          <Popup key={station.id} hostRef={popup}>
            <StationCard station={station} peeking={shown !== current} onPick={setPicked} />
          </Popup>
        )}
      </AnimatePresence>

      <nav className="route" aria-label="Places on the road">
        <span className="route-line" />
        <span className="route-line is-done" style={{ transform: `scaleX(${progress})` }} />
        {stations.map((stop, index) => (
          <button
            key={stop.id}
            type="button"
            className="route-stop"
            aria-current={index === current}
            onClick={() => scrollTo(index)}
            onFocus={() => setHovered(index)}
            onBlur={() => setHovered(null)}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="route-tick" />
            <span className="route-label">{stop.sign}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

/** One animation for every card, so arriving and peeking feel the same. */
function Popup({
  children,
  hostRef,
}: {
  children: React.ReactNode;
  hostRef: React.Ref<HTMLDivElement>;
}) {
  return (
    <motion.div
      ref={hostRef}
      className="popup"
      initial={{ opacity: 0, y: 26, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -14, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 32, mass: 0.7 }}
    >
      {children}
    </motion.div>
  );
}

const stagger = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.045, delayChildren: 0.06 } },
};
const rise = {
  hidden: { opacity: 0, y: 10 },
  shown: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 520, damping: 34 } },
};

function StationCard({
  station,
  peeking,
  onPick,
}: {
  station: Station;
  peeking: boolean;
  onPick: (index: number) => void;
}) {
  return (
    <motion.article
      className={`card${peeking ? " is-peeking" : ""}`}
      variants={stagger}
      initial="hidden"
      animate="shown"
    >
      {station.eyebrow && (
        <motion.p className="card-eyebrow" variants={rise}>
          {station.eyebrow}
        </motion.p>
      )}
      <motion.h2 className={station.showShifts ? "card-title is-big" : "card-title"} variants={rise}>
        {station.title}
      </motion.h2>

      <div className="card-detail">
      {station.showShifts && (
        <motion.ul className="card-shifts" variants={rise}>
          {shifts.map((shift) => (
            <li key={shift.label}>
              <span className="card-shift-label">{shift.label}</span>
              <span className="card-shift-pair">
                <s>{shift.from}</s> <em>{shift.to}</em>
              </span>
            </li>
          ))}
        </motion.ul>
      )}

      {station.body.map((paragraph) => (
        <motion.p className="card-body" key={paragraph.slice(0, 40)} variants={rise}>
          {paragraph}
        </motion.p>
      ))}

      {station.roles?.map((role) => (
        <motion.section className="card-role" key={role.period} variants={rise}>
          <h3>{role.title}</h3>
          <p className="card-role-period">{role.period}</p>
          {role.points.map((point) => (
            <p className="card-body" key={point.slice(0, 40)}>
              {point}
            </p>
          ))}
          <ul className="card-chips">
            {role.stack.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </motion.section>
      ))}

      {station.shelf && (
        <motion.ul className="shelf-list" variants={rise}>
          {station.shelf.map((item, index) => (
            <li key={item.name}>
              <button type="button" onClick={() => onPick(index)}>
                <span className="shelf-dot" />
                <span>
                  <strong>{item.name}</strong>
                  <em>{item.kind}</em>
                </span>
              </button>
            </li>
          ))}
        </motion.ul>
      )}

      {station.chips && (
        <motion.ul className="card-chips" variants={rise}>
          {station.chips.map((chip) => (
            <li key={chip}>{chip}</li>
          ))}
        </motion.ul>
      )}

      {station.links && (
        <motion.div className="card-links" variants={rise}>
          {station.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
            >
              {link.label}
            </a>
          ))}
        </motion.div>
      )}
      </div>
    </motion.article>
  );
}

function ProjectCard({ project, onBack }: { project: Project; onBack: () => void }) {
  return (
    <motion.article className="card is-peeking" variants={stagger} initial="hidden" animate="shown">
      <motion.button className="card-back" type="button" onClick={onBack} variants={rise}>
        Back to the rack
      </motion.button>
      <motion.p className="card-eyebrow" variants={rise}>
        {project.kind}
      </motion.p>
      <motion.h2 className="card-title" variants={rise}>
        {project.name}
      </motion.h2>

      <div className="card-detail">
      <motion.p className="card-body" variants={rise}>
        {project.blurb}
      </motion.p>

      {project.image && (
        <motion.img
          className={`card-shot${project.fit === "contain" ? " is-contain" : ""}`}
          src={project.image}
          alt={`${project.name} in use`}
          loading="lazy"
          variants={rise}
        />
      )}

      {project.note && (
        <motion.p className="card-note" variants={rise}>
          {project.note}
        </motion.p>
      )}

      <motion.ul className="card-chips" variants={rise}>
        {project.stack.map((tool) => (
          <li key={tool}>{tool}</li>
        ))}
      </motion.ul>

      <motion.div className="card-links" variants={rise}>
        {project.live && (
          <a href={project.live} target="_blank" rel="noreferrer">
            Open it
          </a>
        )}
        {project.repo && (
          <a href={project.repo} target="_blank" rel="noreferrer">
            Read the code
          </a>
        )}
      </motion.div>
      </div>
    </motion.article>
  );
}

/* ------------------------------------------------------------- the scene */

interface SceneHandle {
  target: number;
  eased: number;
  focus: number;
  hovered: number | null;
  arrived: number;
  lifted: number | null;
  pick: (x: number, y: number) => { station: number | null; project: number | null };
  dispose: () => void;
}

function createScene(
  mount: HTMLDivElement,
  curve: THREE.CatmullRomCurve3,
  stationT: number[],
  onAnchor: (
    x: number,
    y: number,
    visible: boolean,
    travelling: boolean,
    riderX: number
  ) => void
): SceneHandle {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = makeSky();
  scene.fog = new THREE.Fog(COLORS.horizon, 120, 320);

  // An orthographic camera locked to one angle: the map never rotates, so
  // the world reads the same way from the first station to the last.
  const FRUSTUM = 54;
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 600);
  const CAMERA_OFFSET = new THREE.Vector3(34, 31, 30);
  // Pan the view right so the rider sits left of centre and the card has room.
  const PAN = new THREE.Vector3(0.662, 0, -0.75).multiplyScalar(11);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(900, 900),
    new THREE.MeshStandardMaterial({ color: COLORS.ground, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  scene.add(buildRoad(curve));
  scene.add(buildLamps(curve));
  scene.add(buildScenery(curve));

  const up = new THREE.Vector3(0, 1, 0);
  const places: StationHandle[] = [];
  const groups: THREE.Group[] = [];
  const rackItems: THREE.Mesh[] = [];

  stations.forEach((station, index) => {
    const place = buildStation(station, index);
    const t = T_START + stationT[index] * T_SPAN;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    const normal = tangent.clone().cross(up).normalize();
    const side = index % 2 === 0 ? 1 : -1;
    // The finish line straddles the road; everywhere else sits beside it.
    const finish = station.kind === "finish";
    place.group.position.copy(point).addScaledVector(normal, finish ? 0 : OFFSET * side);
    place.group.rotation.y =
      Math.atan2(-normal.x * side, -normal.z * side) + (finish ? Math.PI / 2 : 0);
    scene.add(place.group);
    places.push(place);
    groups.push(place.group);
    rackItems.push(...place.rack);
  });

  const rider = buildRider();
  scene.add(rider.group);

  // Dusk: one low warm key, a cold sky fill, and everything else is emissive.
  const key = new THREE.DirectionalLight(0xffd9b8, 1.5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -70;
  key.shadow.camera.right = 70;
  key.shadow.camera.top = 70;
  key.shadow.camera.bottom = -70;
  key.shadow.camera.far = 220;
  key.shadow.bias = -0.0008;
  key.shadow.normalBias = 0.04;
  scene.add(key, key.target);

  const rim = new THREE.DirectionalLight(0x7f9ad8, 1);
  scene.add(rim, rim.target);
  scene.add(new THREE.HemisphereLight(0x7ea0d2, 0x303a4a, 2.3));
  scene.add(new THREE.AmbientLight(0x4c6187, 0.5));

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.42, 0.34, 0.86);
  composer.addPass(bloom);

  // A quiet vignette and a touch of grain keep the render from looking clinical.
  const grade = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      amount: { value: 0.3 },
      grain: { value: 0.022 },
      time: { value: 0 },
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      uniform sampler2D tDiffuse; uniform float amount; uniform float grain; uniform float time;
      varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){
        vec4 color = texture2D(tDiffuse, vUv);
        float d = distance(vUv, vec2(0.5));
        color.rgb *= smoothstep(0.92, 0.28, d * amount + 0.2);
        color.rgb += (hash(vUv * 900.0 + time) - 0.5) * grain;
        gl_FragColor = color;
      }`,
  });
  composer.addPass(grade);
  composer.addPass(new OutputPass());

  const handle: SceneHandle = {
    target: 0,
    eased: 0,
    focus: 0,
    hovered: null,
    arrived: 0,
    lifted: null,
    pick: () => ({ station: null, project: null }),
    dispose: () => {},
  };

  // On a narrow screen the card takes the lower half, so aim lower and let
  // the rider ride high on the page.
  let lookBias = 2;

  const resize = () => {
    const width = mount.clientWidth;
    const height = mount.clientHeight;
    const aspect = width / height;
    lookBias = aspect < 0.9 ? -11 : 2;
    camera.left = (-FRUSTUM * aspect) / 2;
    camera.right = (FRUSTUM * aspect) / 2;
    camera.top = FRUSTUM / 2;
    camera.bottom = -FRUSTUM / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    composer.setSize(width, height);
    bloom.setSize(width, height);
  };
  resize();
  window.addEventListener("resize", resize);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function findStation(object: THREE.Object3D): number | null {
    let node: THREE.Object3D | null = object;
    while (node) {
      if (typeof node.userData.station === "number") return node.userData.station;
      node = node.parent;
    }
    return null;
  }

  handle.pick = (x, y) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);

    const onRack = raycaster.intersectObjects(rackItems, false)[0];
    if (onRack) {
      return {
        station: findStation(onRack.object),
        project: onRack.object.userData.project as number,
      };
    }
    const onPlace = raycaster.intersectObjects(groups, true)[0];
    if (onPlace) return { station: findStation(onPlace.object), project: null };
    return { station: null, project: null };
  };

  const position = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const lookAt = new THREE.Vector3();
  const anchor = new THREE.Vector3();
  const clock = new THREE.Clock();
  let frame = 0;

  const loop = () => {
    const time = clock.getElapsedTime();
    // Ease toward the scroll position so the ride carries a little weight.
    const drift = handle.target - handle.eased;
    handle.eased += drift * 0.08;
    const travelling = Math.abs(drift) > 0.0022;
    const t = T_START + Math.min(1, Math.max(0, handle.eased)) * T_SPAN;

    curve.getPointAt(t, position);
    curve.getTangentAt(t, tangent);
    rider.group.position.copy(position);
    rider.group.lookAt(lookAt.copy(position).add(tangent));

    // A little weight transfer through the corners, nothing more.
    const lean = Math.max(-0.32, Math.min(0.32, (handle.target - handle.eased) * 26));
    rider.group.rotation.z += (lean - rider.group.rotation.z) * 0.1;
    rider.head.rotation.z = -lean * 0.4;
    rider.wheels.forEach((wheel) => {
      wheel.rotation.z = -handle.eased * 620;
    });

    // Places lean in when you look at them, and the one you've reached pulses.
    places.forEach((place, index) => {
      const active = handle.hovered === index || handle.focus === index;
      const scale = active ? 1.055 : 1;
      place.group.scale.lerp(lookAt.set(scale, scale, scale), 0.14);

      const labelRest = place.label.userData.restY as number;
      const wanted = active ? labelRest + 1 : labelRest;
      place.label.position.y += (wanted - place.label.position.y) * 0.16;
      const labelScale = active ? 1.16 : 1;
      place.label.scale.x += (7.6 * labelScale - place.label.scale.x) * 0.16;
      place.label.scale.y += (2.4 * labelScale - place.label.scale.y) * 0.16;

      const material = place.ring.material as THREE.MeshBasicMaterial;
      if (handle.arrived === index) {
        const beat = (time % 2.4) / 2.4;
        material.opacity = (1 - beat) * 0.55;
        place.ring.scale.setScalar(0.86 + beat * 0.32);
      } else if (material.opacity > 0) {
        material.opacity = Math.max(0, material.opacity - 0.05);
      }
    });

    // The item you're pointing at lifts off the rack and turns.
    rackItems.forEach((item) => {
      const active = handle.lifted === item.userData.project;
      const restY = item.userData.restY as number;
      item.position.y += ((active ? restY + 0.55 : restY) - item.position.y) * 0.2;
      item.rotation.y += ((active ? 0.5 : 0) - item.rotation.y) * 0.16;
      const scale = active ? 1.16 : 1;
      item.scale.x += (scale - item.scale.x) * 0.2;
      item.scale.y += (scale - item.scale.y) * 0.2;
      item.scale.z += (scale - item.scale.z) * 0.2;
    });

    camera.position.copy(position).add(CAMERA_OFFSET).add(PAN);
    camera.lookAt(position.x + PAN.x, position.y + lookBias, position.z + PAN.z);

    key.position.copy(position).add(lookAt.set(-52, 26, -34));
    key.target.position.copy(position);
    key.target.updateMatrixWorld();
    rim.position.copy(position).add(lookAt.set(40, 30, 44));
    rim.target.position.copy(position);
    rim.target.updateMatrixWorld();

    grade.uniforms.time.value = time;
    composer.render();

    // Tell the card where its place is, and where the rider is, on screen.
    anchor.copy(rider.group.position).project(camera);
    const riderX = ((anchor.x + 1) / 2) * mount.clientWidth;

    const place = places[handle.focus];
    if (place) {
      anchor.copy(place.anchor).applyMatrix4(place.group.matrixWorld).project(camera);
      const x = ((anchor.x + 1) / 2) * mount.clientWidth;
      const y = ((1 - anchor.y) / 2) * mount.clientHeight;
      const onScreen = x > -40 && x < mount.clientWidth + 40 && y > -40 && y < mount.clientHeight + 40;
      onAnchor(Math.round(x), Math.round(y), onScreen, travelling, riderX);
    }

    frame = requestAnimationFrame(loop);
  };
  frame = requestAnimationFrame(loop);

  handle.dispose = () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", resize);
    composer.dispose();
    renderer.dispose();
    mount.removeChild(renderer.domElement);
  };

  return handle;
}
