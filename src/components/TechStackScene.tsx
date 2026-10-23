"use client";

import {
  createContext,
  Suspense,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useTexture } from "@react-three/drei";
import {
  CuboidCollider,
  Physics,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";
import { TECH_TEXTURES } from "./techStackData";

/**
 * TechStackScene — white logo balls floating in ZERO GRAVITY (React
 * Three Fiber + rapier), matching the Rajesh Chityal reference: the
 * balls hang in a loose cluster in mid-air at the centre of the panel,
 * and the pointer is an ATTRACTOR — the whole swarm is pulled toward
 * the cursor, gathers around it and travels with it, balls jostling
 * softly against each other. No floor, no piling, nothing ever sinks.
 *
 * Forces (see ForceField): a gentle spring steers each ball toward a
 * personal anchor near the centre, so at rest the balls form the
 * floating centre cluster; while a fine pointer is over the panel a
 * stronger steering toward the (smoothed) pointer takes over and the
 * swarm follows it. Steering is PD-style — desired velocity toward the
 * target, impulse closes the gap with a time constant — so arrivals
 * are soft and dreamy, never twitchy, and there is no repulsive core
 * shoving a hole in the swarm: the pull simply fades out in the last
 * fraction of a unit so balls pack AROUND the point.
 *
 * The world is FITTED TO THE PANEL, not fixed: the first version used
 * one desktop-sized world (17.8 units wide) for every viewport, so on
 * narrow stages the camera only showed a slice of it — balls spread
 * along an over-wide floor, most of them off-frame, leaving a big,
 * nearly empty panel. Here the play box (soft walls on all four sides)
 * is derived from the canvas' real aspect ratio, and ball size/count
 * scale with the stage, so the cluster always floats inside the frame.
 *
 * Smoothness rules: fixed 1/60 physics step with interpolation (no
 * spiral of death on slow devices), the render loop fully stops while
 * the section is off-screen (the parent toggles `active`), and DPR is
 * capped by the parent (1.5 on small stages, 2 on large).
 */

const FOV = 40;

type World = {
  /** half the visible world width (x extent = ±halfW) */
  halfW: number;
  /** half the visible world height */
  halfH: number;
  /** base ball radius for this stage size */
  radius: number;
  /** how many balls float in this stage's cluster */
  count: number;
  /** camera distance that frames exactly this world height */
  dist: number;
};

function computeWorld(aspect: number): World {
  // Wide stages keep the classic ~9.8-unit-tall stage. Narrower stages
  // are width-driven instead: fix the world width and let the height
  // grow, so the cluster always floats inside the visible frame.
  const worldH =
    aspect >= 1.45 ? 9.8 : Math.min(15.5, 11.6 / Math.max(aspect, 0.6));
  const worldW = worldH * aspect;
  const radius = THREE.MathUtils.clamp(worldH * 0.087, 0.6, 0.92);
  const count = Math.round(
    THREE.MathUtils.clamp((worldW / (radius * 2)) * 1.55, 10, 18),
  );
  return {
    halfW: worldW / 2,
    halfH: worldH / 2,
    radius,
    count,
    dist: worldH / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2)),
  };
}

const WorldCtx = createContext<World | null>(null);

function useWorld(): World {
  const w = useContext(WorldCtx);
  if (!w) throw new Error("TechStackScene: world context missing");
  return w;
}

/** Deterministic 0..1 hash — spawn layouts never change between renders. */
function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

type BallSpec = {
  tex: string;
  radius: number;
  position: [number, number, number];
  rotation: [number, number, number];
  /** idle home: a point near the centre the ball lazily steers toward,
   *  so the swarm rests as one loose floating cluster */
  anchor: [number, number];
};

function makeBalls(world: World): BallSpec[] {
  const balls: BallSpec[] = [];
  // Spawn in a loose jittered grid AROUND THE CENTRE (zero gravity —
  // nothing drops in). Spacing keeps a hair of daylight between even
  // the largest neighbours so the cluster never starts interpenetrated
  // and "explodes" apart; the anchor springs then gather it gently
  // into the tighter resting blob over the first seconds.
  const step = world.radius * 2.34;
  const aspect = world.halfW / world.halfH;
  const cols = Math.round(
    THREE.MathUtils.clamp(Math.sqrt(world.count) * (aspect >= 1 ? 1.25 : 0.85), 3, 6),
  );
  for (let i = 0; i < world.count; i++) {
    const radius = world.radius * (0.86 + hash(i * 3 + 1) * 0.26);
    const col = i % cols;
    const row = Math.floor(i / cols);
    const rows = Math.ceil(world.count / cols);
    const x =
      (col - (cols - 1) / 2) * step + (hash(i * 5 + 2) - 0.5) * 0.35;
    const y =
      ((rows - 1) / 2 - row) * step * 0.94 + (hash(i * 7) - 0.5) * 0.35;
    // Alternate depth by checkerboard parity so neighbours are offset
    // in z as well as on screen — a shallow two-layer cluster.
    const z = ((col + row) % 2 === 0 ? 0.42 : -0.42) + (hash(i * 11 + 3) - 0.5) * 0.3;
    balls.push({
      tex: TECH_TEXTURES[i % TECH_TEXTURES.length],
      radius,
      position: [x, y, z],
      rotation: [hash(i) * 3, hash(i + 40) * 3, hash(i + 80) * 3],
      anchor: [x * 0.72, y * 0.72],
    });
  }
  return balls;
}

type BodiesRef = React.RefObject<(RapierRigidBody | null)[]>;

function Ball({
  spec,
  index,
  bodies,
}: {
  spec: BallSpec;
  index: number;
  bodies: BodiesRef;
}) {
  const texture = useTexture(spec.tex);
  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
  }, [texture]);

  return (
    <RigidBody
      ref={(body) => {
        bodies.current[index] = body;
      }}
      colliders="ball"
      position={spec.position}
      rotation={spec.rotation}
      restitution={0.15}
      friction={0.35}
      linearDamping={0.1}
      angularDamping={0.5}
      canSleep={false}
    >
      <mesh>
        <sphereGeometry args={[spec.radius, 36, 36]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.3}
          metalness={0.02}
        />
      </mesh>
    </RigidBody>
  );
}

/**
 * Invisible box fitted to the visible frame — soft walls on ALL sides
 * (zero gravity: nothing may drift out of the panel in any direction).
 * Inner faces sit a hair outside the visible edges, so a ball can
 * visually kiss the panel border but never cross it; back + front
 * slabs keep the swarm in one shallow layer.
 */
function Bounds() {
  const world = useWorld();
  const t = 0.6; // wall half-thickness
  const inset = 0.04;
  return (
    <RigidBody type="fixed" colliders={false}>
      {/* bottom + top */}
      <CuboidCollider
        args={[world.halfW + 1, t, 3.4]}
        position={[0, -world.halfH - t + inset, 0]}
      />
      <CuboidCollider
        args={[world.halfW + 1, t, 3.4]}
        position={[0, world.halfH + t - inset, 0]}
      />
      {/* sides */}
      <CuboidCollider
        args={[t, world.halfH + 1, 3.4]}
        position={[-world.halfW - t + inset, 0, 0]}
      />
      <CuboidCollider
        args={[t, world.halfH + 1, 3.4]}
        position={[world.halfW + t - inset, 0, 0]}
      />
      {/* back + front slabs */}
      <CuboidCollider
        args={[world.halfW + 1, world.halfH + 1, 0.5]}
        position={[0, 0, -2.2]}
      />
      <CuboidCollider
        args={[world.halfW + 1, world.halfH + 1, 0.5]}
        position={[0, 0, 2.2]}
      />
    </RigidBody>
  );
}

/**
 * Force tuning — NOTE: the reference recording plays at 2× speed, so
 * the real reference motion is HALF as fast as the video looks. Every
 * constant below is therefore set deliberately slow: the swarm crosses
 * the panel in seconds, not frames. When in doubt, gentler.
 */
const POINTER_RADIUS = 12; // the pull reaches most of the panel
const POINTER_MAX_SPEED = 2.7; // world units/s the swarm may travel at
const POINTER_TAU = 0.32; // s — velocity-approach time constant (soft)
const POINTER_SMOOTH = 4.5; // /s — pointer target lag (dreamy follow)
const CENTRE_MAX_SPEED = 0.6; // idle drift back home is a slow float
const CENTRE_TAU = 0.9; // s — idle steering is lazier still
const MAX_SPEED = 4.5; // hard clamp: nothing may ever zip or tunnel

const _origin = new THREE.Vector3();
const _target = new THREE.Vector3();
const _desired = new THREE.Vector3();
const _impulse = new THREE.Vector3();
const _smoothPointer = new THREE.Vector3();

/**
 * ForceField — the invisible hand that makes the swarm behave like
 * the reference. Every frame it steers each ball's velocity toward a
 * desired velocity (PD steering: impulse = (desired − current) ×
 * (1 − e^(−dt/τ)) × mass, frame-rate independent):
 *
 *  - IDLE: desired velocity points at the ball's personal anchor near
 *    the centre (anchors swirl almost imperceptibly and bob a touch,
 *    plus a whisper of sinusoidal air current) — the balls rest as one
 *    loose, slowly breathing cluster in mid-air.
 *  - POINTER (fine pointers only; touch stays passive): desired
 *    velocity points at the pointer, which is itself smoothed so fast
 *    flicks can't fling the swarm. The pull reaches across the panel
 *    with a gentle distance fade and — crucially — fades OUT over the
 *    last ~0.4 units, so balls decelerate into the point and pack
 *    around it instead of being shoved into a ring with a hole. The
 *    home spring keeps a whisper of strength so strays stay local.
 *  - A hard speed clamp backstops everything: no explosions, no
 *    tunnelling through walls on fast pointer moves.
 */
function ForceField({
  pointerActive,
  bodies,
  balls,
}: {
  pointerActive: React.RefObject<boolean>;
  bodies: BodiesRef;
  balls: BallSpec[];
}) {
  const smoothInit = useRef(false);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const list = bodies.current;
    if (!list.length) return;
    const t = state.clock.elapsedTime;
    const active = pointerActive.current;

    // Pointer position in world units, exponentially smoothed so the
    // attractor glides behind the cursor instead of teleporting.
    if (active) {
      const vp = state.viewport.getCurrentViewport(state.camera, _origin);
      const px = (state.pointer.x * vp.width) / 2;
      const py = (state.pointer.y * vp.height) / 2;
      if (!smoothInit.current) {
        _smoothPointer.set(px, py, 0);
        smoothInit.current = true;
      } else {
        const a = 1 - Math.exp(-dt * POINTER_SMOOTH);
        _smoothPointer.x += (px - _smoothPointer.x) * a;
        _smoothPointer.y += (py - _smoothPointer.y) * a;
      }
    } else {
      smoothInit.current = false;
    }

    const aPointer = 1 - Math.exp(-dt / POINTER_TAU);
    const aCentre = 1 - Math.exp(-dt / CENTRE_TAU);
    const swirl = t * 0.035; // one revolution ≈ 3 min — barely-there
    const cosS = Math.cos(swirl);
    const sinS = Math.sin(swirl);

    for (let i = 0; i < list.length; i++) {
      const body = list[i];
      const spec = balls[i];
      if (!body || !spec) continue;
      const tr = body.translation();
      const v = body.linvel();
      const mass = body.mass();
      _impulse.set(0, 0, 0);

      // — Home spring: steer toward the swirling, bobbing anchor.
      const ax = spec.anchor[0] * cosS - spec.anchor[1] * sinS;
      const ay =
        spec.anchor[0] * sinS + spec.anchor[1] * cosS +
        Math.sin(t * 0.18 + i * 1.93) * 0.1;
      _target.set(ax - tr.x, ay - tr.y, -tr.z);
      const dh = _target.length();
      if (dh > 0.12) {
        const sp = Math.min(dh * 0.55, CENTRE_MAX_SPEED) * (active ? 0.3 : 1);
        const inv = sp / dh;
        _desired.set(_target.x * inv, _target.y * inv, _target.z * inv);
        const w = aCentre * (active ? 0.35 : 1) * mass;
        _impulse.x += (_desired.x - v.x) * w;
        _impulse.y += (_desired.y - v.y) * w;
        _impulse.z += (_desired.z - v.z) * w;
      }

      // — Pointer attractor: steer toward the smoothed pointer.
      if (active) {
        _target.set(_smoothPointer.x - tr.x, _smoothPointer.y - tr.y, 0);
        const d = Math.hypot(_target.x, _target.y);
        if (d > 0.001 && d < POINTER_RADIUS) {
          const fade = 1 - 0.5 * (d / POINTER_RADIUS); // far balls: a tug, not a yank
          const near = Math.min(1, d / 0.4); // ease off at the point itself — no hole
          const sp = Math.min(d * 1.1, POINTER_MAX_SPEED) * fade * near;
          const inv = sp / d;
          _desired.set(_target.x * inv, _target.y * inv, 0);
          _impulse.x += (_desired.x - v.x) * aPointer * mass;
          _impulse.y += (_desired.y - v.y) * aPointer * mass;
        }
      }

      // — Ambient drift: a whisper of air current so the resting
      // cluster breathes instead of freezing mid-air.
      _impulse.x += Math.sin(t * 0.22 + i * 2.39) * 0.05 * dt * mass;
      _impulse.y += Math.cos(t * 0.17 + i * 1.71) * 0.05 * dt * mass;

      if (_impulse.x !== 0 || _impulse.y !== 0 || _impulse.z !== 0) {
        body.applyImpulse(_impulse, true);
      }

      // — Safety clamp.
      const sp2 = v.x * v.x + v.y * v.y + v.z * v.z;
      if (sp2 > MAX_SPEED * MAX_SPEED) {
        const s = MAX_SPEED / Math.sqrt(sp2);
        body.setLinvel({ x: v.x * s, y: v.y * s, z: v.z * s }, true);
      }
    }
  });

  return null;
}

/**
 * Provides the fitted world and keeps the camera framing it. The world
 * refits only after a resize settles (350ms quiet), so dragging a
 * window never respawns the cluster mid-gesture; a settled, materially
 * different aspect gets a fresh cluster.
 */
function WorldProvider({ children }: { children: React.ReactNode }) {
  const size = useThree((s) => s.size);
  const camera = useThree((s) => s.camera);
  const aspect = size.width / Math.max(size.height, 1);
  const [world, setWorld] = useState<World>(() => computeWorld(aspect));
  const worldRef = useRef(world);
  worldRef.current = world;

  useEffect(() => {
    const current = worldRef.current;
    const impliedH =
      current.dist * 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    if (Math.abs(impliedH * aspect - current.halfW * 2) < 0.4) return;
    const t = setTimeout(() => setWorld(computeWorld(aspect)), 350);
    return () => clearTimeout(t);
  }, [aspect]);

  useEffect(() => {
    camera.position.set(0, 0.15, world.dist);
    camera.near = 0.1;
    camera.far = 60;
    camera.updateProjectionMatrix();
  }, [camera, world]);

  return <WorldCtx.Provider value={world}>{children}</WorldCtx.Provider>;
}

/**
 * Fires once the Suspense boundary above it has resolved (textures
 * loaded, world mounted) — the parent lifts the static chip grid only
 * then, so the stage is never an empty box waiting on the network.
 */
function ReadySignal({ onReady }: { onReady?: () => void }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return null;
}

function ScenePhysics({
  active,
  pointerActive,
  bodies,
}: {
  active: boolean;
  pointerActive: React.RefObject<boolean>;
  bodies: BodiesRef;
}) {
  const world = useWorld();
  const balls = useMemo(() => makeBalls(world), [world]);

  return (
    <Physics
      gravity={[0, 0, 0]}
      timeStep={1 / 60}
      interpolate
      paused={!active}
    >
      <Bounds />
      {balls.map((spec, i) => (
        <Ball
          key={`${spec.tex}-${i}-${spec.radius.toFixed(2)}`}
          spec={spec}
          index={i}
          bodies={bodies}
        />
      ))}
      <ForceField pointerActive={pointerActive} bodies={bodies} balls={balls} />
    </Physics>
  );
}

export default function TechStackScene({
  active,
  dpr,
  onReady,
}: {
  /** section on-screen: run the loop; off-screen: freeze it entirely */
  active: boolean;
  dpr: [number, number];
  /** textures loaded + world mounted — safe to reveal the canvas */
  onReady?: () => void;
}) {
  const pointerActive = useRef(false);
  const bodies = useRef<(RapierRigidBody | null)[]>([]);

  return (
    <Canvas
      dpr={dpr}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0.15, 13.5], fov: FOV }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      style={{ background: "transparent", touchAction: "pan-y" }}
      onPointerMove={(e) => {
        // Fine pointers only — touch drags scroll the page instead.
        if (e.pointerType !== "touch") pointerActive.current = true;
      }}
      onPointerLeave={() => {
        pointerActive.current = false;
      }}
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 8, 6]} intensity={1.1} color="#fff2df" />
      <directionalLight position={[-6, 3, -2]} intensity={0.4} color="#6ea8ff" />

      <Suspense fallback={null}>
        <ReadySignal onReady={onReady} />
        <WorldProvider>
          <ScenePhysics
            active={active}
            pointerActive={pointerActive}
            bodies={bodies}
          />
        </WorldProvider>

        <Environment resolution={128}>
          <group rotation={[-Math.PI / 3, 0, 0]}>
            <Lightformer
              form="circle"
              intensity={3}
              position={[0, 5, -9]}
              scale={2}
            />
            <Lightformer
              intensity={1.6}
              position={[-5, 1, -1]}
              scale={[3, 0.8]}
              color="#9db8ff"
            />
            <Lightformer
              intensity={1.6}
              position={[5, -1, -1]}
              scale={[3, 0.8]}
              color="#ffe1ae"
            />
          </group>
        </Environment>
      </Suspense>
    </Canvas>
  );
}
