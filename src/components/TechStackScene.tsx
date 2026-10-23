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
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";
import { TECH_TEXTURES } from "./techStackData";

/**
 * TechStackScene — white logo balls with real physics (React Three Fiber
 * + rapier) that drop in, pile up, roll, get shoved by the pointer and
 * drift gently toward it when it comes near (the reference behaviour).
 *
 * The world is FITTED TO THE PANEL, not fixed: the first version used
 * one desktop-sized world (17.8 units wide) for every viewport, so on
 * narrow stages the camera only showed a slice of it — balls spread
 * along an over-wide floor, most of them off-frame, leaving a big,
 * nearly empty panel. Here the play box is derived from the canvas'
 * real aspect ratio: floor, walls and the spawn grid always sit inside
 * the visible frame, and ball size/count scale with the stage.
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
  /** y of the floor's top surface */
  floorTop: number;
  /** base ball radius for this stage size */
  radius: number;
  /** how many balls fill this stage (≈1.5 layers across the floor) */
  count: number;
  /** camera distance that frames exactly this world height */
  dist: number;
};

function computeWorld(aspect: number): World {
  // Wide stages keep the classic ~9.8-unit-tall stage. Narrower stages
  // are width-driven instead: fix the world width and let the height
  // grow, so the pile always spans the panel edge to edge.
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
    floorTop: -worldH / 2 + 0.5,
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
};

function makeBalls(world: World): BallSpec[] {
  const balls: BallSpec[] = [];
  const stepX = world.radius * 2.12;
  const cols = Math.max(2, Math.floor((world.halfW * 2 - 0.6) / stepX));
  for (let i = 0; i < world.count; i++) {
    const radius = world.radius * (0.86 + hash(i * 3 + 1) * 0.26);
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x =
      -((cols - 1) * stepX) / 2 + col * stepX + (hash(i * 5 + 2) - 0.5) * 0.5;
    const y =
      world.floorTop +
      radius +
      2.3 +
      row * (world.radius * 2.2) +
      hash(i * 7) * 0.4;
    balls.push({
      tex: TECH_TEXTURES[i % TECH_TEXTURES.length],
      radius,
      position: [x, y, (hash(i * 11 + 3) - 0.5) * 0.9],
      rotation: [hash(i) * 3, hash(i + 40) * 3, hash(i + 80) * 3],
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
      restitution={0.24}
      friction={0.55}
      linearDamping={0.05}
      angularDamping={0.3}
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

/** Invisible container fitted to the visible frame: floor + walls + slabs. */
function Bounds() {
  const world = useWorld();
  const wallH = world.halfH + 6;
  return (
    <RigidBody type="fixed" colliders={false}>
      {/* floor (top surface at world.floorTop) */}
      <CuboidCollider
        args={[world.halfW + 1, 0.5, 3.4]}
        position={[0, world.floorTop - 0.5, 0]}
      />
      {/* side walls, just inside the visible edges */}
      <CuboidCollider
        args={[0.5, wallH, 3.4]}
        position={[-world.halfW - 0.35, world.halfH, 0]}
      />
      <CuboidCollider
        args={[0.5, wallH, 3.4]}
        position={[world.halfW + 0.35, world.halfH, 0]}
      />
      {/* back + front slabs keep the pile in one shallow layer */}
      <CuboidCollider
        args={[world.halfW + 1, wallH, 0.5]}
        position={[0, world.halfH, -2.2]}
      />
      <CuboidCollider
        args={[world.halfW + 1, wallH, 0.5]}
        position={[0, world.halfH, 2.2]}
      />
    </RigidBody>
  );
}

const MAGNET_RADIUS = 3.6;
const _origin = new THREE.Vector3();
const _toPointer = new THREE.Vector3();

/**
 * Pointer interaction — two parts, both driven by the same pointer:
 *  - a kinematic sphere that physically shoves balls out of its way;
 *  - a gentle magnetic pull: balls within MAGNET_RADIUS drift toward
 *    the pointer, easing off as they arrive, so the pile gathers and
 *    swirls around the cursor like the reference — without ever
 *    vacuuming balls in from across the whole panel.
 * Parked below the floor until the pointer actually moves over the
 * canvas, so it never blasts the pile on load (or in headless captures).
 * Only fine pointers (mouse/pen) drive it; touch stays passive so the
 * canvas never fights page scroll.
 */
function PointerRig({
  pointerActive,
  bodies,
}: {
  pointerActive: React.RefObject<boolean>;
  bodies: BodiesRef;
}) {
  const pusher = useRef<RapierRigidBody>(null);
  const world = useWorld();

  useFrame((state, delta) => {
    const p = pusher.current;
    if (!p) return;
    if (!pointerActive.current) {
      p.setNextKinematicTranslation({ x: 0, y: -14, z: 0 });
      return;
    }
    const vp = state.viewport.getCurrentViewport(state.camera, _origin);
    const px = (state.pointer.x * vp.width) / 2;
    const py = (state.pointer.y * vp.height) / 2;
    p.setNextKinematicTranslation({ x: px, y: py, z: 0 });

    // Magnetic drift for nearby balls — an impulse scaled to frame
    // time, so the pull feels the same at 60Hz and 120Hz.
    const scale = Math.min(delta, 1 / 30) * 60;
    const list = bodies.current;
    for (let i = 0; i < list.length; i++) {
      const body = list[i];
      if (!body) continue;
      const t = body.translation();
      _toPointer.set(px - t.x, py - t.y, 0);
      const d = _toPointer.length();
      if (d > MAGNET_RADIUS || d < 1.15) continue;
      const falloff = 1 - d / MAGNET_RADIUS;
      const strength = 0.05 * falloff * falloff * scale;
      _toPointer.normalize().multiplyScalar(strength);
      body.applyImpulse(_toPointer, true);
    }
  });

  return (
    <RigidBody
      ref={pusher}
      type="kinematicPosition"
      colliders={false}
      position={[0, -14, 0]}
    >
      <BallCollider
        args={[world.radius * 1.25]}
        friction={0.1}
        restitution={0.4}
      />
    </RigidBody>
  );
}

/**
 * Provides the fitted world and keeps the camera framing it. The world
 * refits only after a resize settles (350ms quiet), so dragging a
 * window never respawns the pile mid-gesture; a settled, materially
 * different aspect gets a fresh drop-in.
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
      gravity={[0, -9.81, 0]}
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
      <PointerRig pointerActive={pointerActive} bodies={bodies} />
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
