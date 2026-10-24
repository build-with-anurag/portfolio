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
 * TechStackScene — white logo balls floating in ZERO GRAVITY (React
 * Three Fiber + rapier), matching the Rajesh Chityal reference: the
 * balls hang in a loose cluster in mid-air at the centre of the panel,
 * and the pointer is an ATTRACTOR — the whole swarm is pulled toward
 * the cursor, gathers around it and travels with it, balls jostling
 * softly against each other. No floor, no piling, nothing ever sinks.
 *
 * Forces (see ForceField): a gentle spring steers each ball toward a
 * personal anchor in the compact centre bunch, so at rest the balls
 * form the floating centre cluster; while a fine pointer is over the
 * panel a brisk steering toward the (lightly smoothed, velocity-led)
 * pointer takes over and the swarm follows it eagerly. Steering is
 * PD-style — desired velocity toward the target, impulse closes the
 * gap with a time constant — so arrivals stay soft, never twitchy.
 * The pointer also carries a small kinematic sphere: balls pack
 * against it, and a fast pass through the swarm physically shoves
 * them aside before the attractor gathers them back — the reference's
 * push-and-regather, not a hole punched in the pack.
 *
 * The world is FITTED TO THE PANEL, not fixed: the first version used
 * one desktop-sized world (17.8 units wide) for every viewport, so on
 * narrow stages the camera only showed a slice of it — balls spread
 * along an over-wide floor, most of them off-frame, leaving a big,
 * nearly empty panel. Here the play box (soft walls on all four sides)
 * is derived from the stage's real aspect ratio, and ball size/count
 * scale with the stage, so the cluster always floats inside the frame.
 *
 * FRAMING (round 5 — the sliced-ball fix): the canvas is NOT the
 * stage. The parent bleeds the canvas past the stage on all four
 * sides (see StageBleed), and the camera frames the PLAY BOX — the
 * stage rect plus an extra strip of play height above its top edge
 * (extTop) — onto the matching sub-rect of that larger canvas. The
 * visible frustum therefore extends well past every wall: earlier the
 * frustum edges coincided with the walls, so a ball in the front
 * z-layer pressed against a wall was perspective-magnified straight
 * past the frame edge and sliced flat by the canvas rect (most
 * visible as the straight-cut row of balls under the heading). Now a
 * ball touching any wall renders in full, the swarm may drift up
 * behind the heading zone, and only the physical screen edge ever
 * crops a ball — as in the reference. The pointer is tracked on
 * window events and mapped through the same framing math (the bled
 * canvas is pointer-events:none so it can never block the heading's
 * text or a click).
 *
 * Smoothness rules: fixed 1/60 physics step with interpolation (no
 * spiral of death on slow devices), the render loop fully stops while
 * the section is off-screen (the parent toggles `active`), and DPR is
 * capped by the parent (1.5 on small stages, 2 on large).
 */

const FOV = 40;

type World = {
  /** half the play-box width (x extent = ±halfW) */
  halfW: number;
  /** half the STAGE height (the play box extends extTop above +halfH) */
  halfH: number;
  /** full play-box width in world units */
  worldW: number;
  /** stage height in world units (2 × halfH, excl. the top strip) */
  worldH: number;
  /** base ball radius for this stage size */
  radius: number;
  /** how many balls float in this stage's cluster */
  count: number;
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
    worldW,
    worldH,
    radius,
    count,
  };
}

/**
 * How far the canvas bleeds past the stage rect on each side, in CSS
 * px (the parent sizes the canvas with exactly these insets and hands
 * them down, so CSS and framing math can never disagree).
 */
export type StageBleed = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

/**
 * Frame — the complete mapping between canvas pixels and world units
 * at the z=0 plane. The play box (stage + extTop strip above it) is
 * centred on the stage sub-rect of the bled canvas; everything else
 * (camera placement, pointer mapping, wall spans) derives from these
 * numbers, computed once per resize in FrameProvider.
 */
type Frame = {
  world: World;
  /** extra play height above the stage's top edge, in world units —
   *  the strip the swarm may drift up into, behind the heading */
  extTop: number;
  /** world y of the play box's vertical centre (extTop / 2) */
  centerY: number;
  /** CSS px per world unit at z=0 */
  scale: number;
  /** world-space point that projects onto the canvas centre */
  camX: number;
  camY: number;
  /** camera distance that realises `scale` across the canvas height */
  dist: number;
  bleed: StageBleed;
  canvasW: number;
  canvasH: number;
};

function computeFrame(
  canvasW: number,
  canvasH: number,
  bleed: StageBleed,
  world: World,
): Frame {
  const stageW = Math.max(50, canvasW - bleed.left - bleed.right);
  const stageH = Math.max(50, canvasH - bleed.top - bleed.bottom);
  const scale = stageW / world.worldW;
  const extTop = THREE.MathUtils.clamp(world.worldH * 0.16, 1.2, 1.7);
  const centerY = extTop / 2;
  // Centre of the play box's rect in canvas px (y measured top-down):
  // horizontally the stage centre; vertically the stage centre pulled
  // up by half the extension strip.
  const regionCx = bleed.left + stageW / 2;
  const regionCy = bleed.top + stageH / 2 - (extTop * scale) / 2;
  // World point that must land on the canvas centre so the play box
  // lands on its sub-rect: x grows right, y grows up (canvas y down).
  const camX = (canvasW / 2 - regionCx) / scale;
  const camY = centerY + (regionCy - canvasH / 2) / scale;
  const dist =
    canvasH / scale / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  return {
    world,
    extTop,
    centerY,
    scale,
    camX,
    camY,
    dist,
    bleed,
    canvasW,
    canvasH,
  };
}

const FrameCtx = createContext<Frame | null>(null);

function useSceneFrame(): Frame {
  const f = useContext(FrameCtx);
  if (!f) throw new Error("TechStackScene: frame context missing");
  return f;
}

function useWorld(): World {
  return useSceneFrame().world;
}

/** Live pointer state in world units (written by PointerTracker). */
type PointerState = { active: boolean; x: number; y: number };
type PointerRef = React.RefObject<PointerState>;

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
  // Spawn BORN as the bunch: a golden-spiral (sunflower) packing —
  // even density, no rows or columns for the eye to catch (the
  // earlier jittered GRID read as "scattered dice" on entry). The
  // spiral is AREA-SCALED: each ball's distance from the centre grows
  // with the cumulative area of the balls inside it, so neighbours
  // end up just touching — snug, but never interpenetrated. (A plain
  // fixed-radius disc overpacks once sizes vary: Rapier then resolves
  // the overlaps by flinging the bunch across the whole panel — the
  // round-3 entry bug.) The bunch is squashed vertically on wide
  // stages into the reference's ellipse, and balls are dealt across
  // three shallow z sub-layers so they overlap in depth like the
  // reference cluster. Anchors ARE the spawn points (a hair tighter),
  // so the home springs hold this compact bunch — roughly the central
  // third-to-half of the panel — from frame one.
  const GOLDEN_ANGLE = 2.39996;
  const zLayers = [-0.52, 0.04, 0.56];
  const squash = THREE.MathUtils.clamp((world.halfH / world.halfW) * 1.35, 0.55, 1);
  const radii = Array.from(
    { length: world.count },
    (_, i) => world.radius * (0.8 + hash(i * 3 + 1) * 0.4),
  );
  let cumArea = 0;
  for (let i = 0; i < world.count; i++) {
    const radius = radii[i];
    cumArea += (radius + 0.06) * (radius + 0.06);
    const rr = Math.sqrt(cumArea) * 1.04;
    const th = i * GOLDEN_ANGLE + (hash(i * 13 + 4) - 0.5) * 0.5;
    const x = Math.cos(th) * rr + (hash(i * 5 + 2) - 0.5) * 0.22;
    const y = Math.sin(th) * rr * squash + (hash(i * 7) - 0.5) * 0.22;
    const z = zLayers[i % 3] + (hash(i * 11 + 3) - 0.5) * 0.24;
    balls.push({
      tex: TECH_TEXTURES[i % TECH_TEXTURES.length],
      radius,
      position: [x, y, z],
      rotation: [hash(i) * 3, hash(i + 40) * 3, hash(i + 80) * 3],
      anchor: [x * 0.96, y * 0.96],
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
      restitution={0.35}
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
 * Invisible box fitted to the play box — soft walls on ALL sides
 * (zero gravity: nothing may drift away in any direction). The side
 * and bottom walls sit at the stage edges as always; the TOP wall now
 * sits extTop above the stage's top edge, so the swarm may roam into
 * the strip behind the heading — while the bled canvas renders a wide
 * margin past every wall, so a ball resting on any wall still renders
 * whole. Back + front slabs keep the swarm in one shallow layer;
 * side/back/front spans are centred on the play box (centerY) so they
 * cover the extension strip too.
 */
function Bounds() {
  const { world, extTop, centerY } = useSceneFrame();
  const t = 0.6; // wall half-thickness
  const inset = 0.04;
  const topY = world.halfH + extTop; // top wall line (stage top + strip)
  const spanH = world.halfH + extTop / 2 + 1; // half-height covering the box
  return (
    <RigidBody type="fixed" colliders={false}>
      {/* bottom + top */}
      <CuboidCollider
        args={[world.halfW + 1, t, 3.4]}
        position={[0, -world.halfH - t + inset, 0]}
      />
      <CuboidCollider
        args={[world.halfW + 1, t, 3.4]}
        position={[0, topY + t - inset, 0]}
      />
      {/* sides */}
      <CuboidCollider
        args={[t, spanH, 3.4]}
        position={[-world.halfW - t + inset, centerY, 0]}
      />
      <CuboidCollider
        args={[t, spanH, 3.4]}
        position={[world.halfW + t - inset, centerY, 0]}
      />
      {/* back + front slabs */}
      <CuboidCollider
        args={[world.halfW + 1, spanH, 0.5]}
        position={[0, centerY, -2.2]}
      />
      <CuboidCollider
        args={[world.halfW + 1, spanH, 0.5]}
        position={[0, centerY, 2.2]}
      />
    </RigidBody>
  );
}

/**
 * Force tuning — the reference recording plays at 2× speed, so the
 * real reference motion is half as fast as the video LOOKS — but
 * side-by-side testing (round 3) showed the first magnetic build
 * over-corrected into molasses: the swarm trailed seconds behind the
 * cursor and a fast pass shoved nothing aside. The reference at true
 * 1× is floaty yet EAGER: the bunch keeps up with a normally moving
 * cursor, packs around it within about half a second of it stopping,
 * and the pointer has physical PRESENCE — darting through the swarm
 * shoves balls aside with a springy jostle before they re-gather.
 * The constants below aim at exactly that: quick PD steering, a real
 * travel speed, a lightly-smoothed target with velocity feed-forward,
 * and a small kinematic sphere giving the pointer a body.
 */
const POINTER_MAX_SPEED = 9.5; // units/s — a far ball regroups in ~1.2s
const POINTER_TAU = 0.14; // s — velocity-approach time constant (brisk)
const POINTER_GAIN = 2.2; // desired speed per unit of distance
const POINTER_SMOOTH = 14; // /s — attractor target lag (~70ms)
const PUSHER_SMOOTH = 30; // /s — the physical sphere tracks tighter
const PUSHER_RADIUS = 0.65; // pointer's physical presence (world units)
const CENTRE_MAX_SPEED = 0.6; // idle drift back home is a slow float
const CENTRE_TAU = 0.9; // s — idle steering stays lazy
const MAX_SPEED = 12; // hard clamp: nothing may ever zip or tunnel

const _target = new THREE.Vector3();
const _desired = new THREE.Vector3();
const _impulse = new THREE.Vector3();
const _smoothPointer = new THREE.Vector3();
const _prevRaw = new THREE.Vector3();
const _pointerVel = new THREE.Vector3();

/**
 * ForceField — the invisible hand that makes the swarm behave like
 * the reference. Every frame it steers each ball's velocity toward a
 * desired velocity (PD steering: impulse = (desired − current) ×
 * (1 − e^(−dt/τ)) × mass, frame-rate independent):
 *
 *  - IDLE: desired velocity points at the ball's personal anchor in
 *    the compact centre bunch (anchors swirl almost imperceptibly and
 *    bob a touch, plus a whisper of sinusoidal air current) — the
 *    balls rest as one loose, slowly breathing cluster in mid-air.
 *  - POINTER (fine pointers only; touch stays passive): desired
 *    velocity points at the pointer, lightly smoothed and led by the
 *    pointer's own velocity so the swarm chases where the cursor is
 *    GOING, not where it was. The pull reaches across the panel with
 *    a gentle distance fade and eases — but never dies — at the point
 *    itself, so balls pack tightly around it. The home spring keeps a
 *    whisper of strength so strays stay local.
 *  - PUSH: the pointer also owns a small kinematic sphere (positioned
 *    here each frame). Attraction rules outside its radius; inside
 *    it, plain contact physics rules — a fast pass physically shoves
 *    balls aside, restitution makes the jostle springy, and the
 *    attractor re-captures the displaced balls a beat later.
 *  - A hard speed clamp backstops everything: no explosions, no
 *    tunnelling through walls on fast pointer moves.
 */
function ForceField({
  pointerRef,
  bodies,
  balls,
  pusher,
  world,
  extTop,
}: {
  pointerRef: PointerRef;
  bodies: BodiesRef;
  balls: BallSpec[];
  pusher: React.RefObject<RapierRigidBody | null>;
  world: World;
  extTop: number;
}) {
  // The pull must reach EVERY ball wherever the pointer parks — on a
  // wide stage the corner-to-corner diagonal is ~25 units, so a fixed
  // radius left far balls outside the field entirely (they only crept
  // home on the idle spring). Cover the full diagonal, always.
  const pointerRadius = Math.hypot(world.halfW, world.halfH + extTop) + 1.5;
  const smoothInit = useRef(false);
  const wasActive = useRef(false);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const list = bodies.current;
    if (!list.length) return;
    const t = state.clock.elapsedTime;
    const active = pointerRef.current.active;
    const pusherBody = pusher.current;

    // Pointer position in world units (PointerTracker maps window
    // events through the frame), exponentially smoothed so the
    // attractor glides behind the cursor instead of teleporting; the
    // physical pusher tracks a tighter smoothing of the same point.
    if (active) {
      const px = pointerRef.current.x;
      const py = pointerRef.current.y;
      if (!smoothInit.current) {
        _smoothPointer.set(px, py, 0);
        _prevRaw.set(px, py, 0);
        _pointerVel.set(0, 0, 0);
        smoothInit.current = true;
      } else {
        // Pointer velocity (world units/s), lightly smoothed and
        // clamped — used as feed-forward so the swarm leans into the
        // cursor's direction of travel instead of trailing it.
        if (dt > 0) {
          const rvx = (px - _prevRaw.x) / dt;
          const rvy = (py - _prevRaw.y) / dt;
          const rl = Math.hypot(rvx, rvy);
          const cap = rl > 30 ? 30 / rl : 1;
          _pointerVel.x += (rvx * cap - _pointerVel.x) * 0.45;
          _pointerVel.y += (rvy * cap - _pointerVel.y) * 0.45;
        }
        _prevRaw.set(px, py, 0);
        const a = 1 - Math.exp(-dt * POINTER_SMOOTH);
        _smoothPointer.x += (px - _smoothPointer.x) * a;
        _smoothPointer.y += (py - _smoothPointer.y) * a;
      }

      // — The pusher: a kinematic sphere with the pointer's position.
      // On activation it TELEPORTS in (setTranslation — no sweep
      // through the cluster at infinite speed); after that it follows
      // via setNextKinematicTranslation so the solver derives a true
      // velocity and moving it physically shoves balls aside.
      if (pusherBody) {
        if (!wasActive.current) {
          pusherBody.setTranslation({ x: px, y: py, z: 0 }, true);
        }
        const pa = 1 - Math.exp(-dt * PUSHER_SMOOTH);
        const cur = pusherBody.translation();
        pusherBody.setNextKinematicTranslation({
          x: cur.x + (px - cur.x) * pa,
          y: cur.y + (py - cur.y) * pa,
          z: 0,
        });
      }
    } else {
      smoothInit.current = false;
      _pointerVel.set(0, 0, 0);
      // Pointer gone: park the pusher far behind the world so it can
      // never touch a ball.
      if (pusherBody && wasActive.current) {
        pusherBody.setTranslation({ x: 0, y: 0, z: -100 }, true);
      }
    }
    wasActive.current = active;

    // Attractor aim point: smoothed pointer + a small velocity lead.
    let aimX = _smoothPointer.x;
    let aimY = _smoothPointer.y;
    if (active) {
      const leadX = _pointerVel.x * 0.055;
      const leadY = _pointerVel.y * 0.055;
      const ll = Math.hypot(leadX, leadY);
      const lc = ll > 1.4 ? 1.4 / ll : 1;
      aimX += leadX * lc;
      aimY += leadY * lc;
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
        const w = aCentre * (active ? 0.25 : 1) * mass;
        _impulse.x += (_desired.x - v.x) * w;
        _impulse.y += (_desired.y - v.y) * w;
        _impulse.z += (_desired.z - v.z) * w;
      }

      // — Pointer attractor: steer eagerly toward the aim point.
      // Inside the pusher's own radius the steering stands down —
      // contact physics owns that space, so the pack settles against
      // the sphere and its neighbours instead of jittering.
      if (active) {
        _target.set(aimX - tr.x, aimY - tr.y, 0);
        const d = Math.hypot(_target.x, _target.y);
        if (d > PUSHER_RADIUS * 0.8 && d < pointerRadius) {
          const fade = 1 - 0.12 * (d / pointerRadius); // distance barely weakens the pull
          const near = Math.min(1, 0.25 + d / 0.8); // ease near the point, never to zero
          const sp = Math.min(d * POINTER_GAIN, POINTER_MAX_SPEED) * fade * near;
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
 * The pointer's physical body: a small kinematic sphere that exists
 * only while a fine pointer is over the panel (ForceField teleports
 * it in on activation, drives it per-frame, and parks it far behind
 * the world on exit). No mesh — pure presence.
 */
function PointerPusher({
  pusher,
}: {
  pusher: React.RefObject<RapierRigidBody | null>;
}) {
  return (
    <RigidBody
      ref={pusher}
      type="kinematicPosition"
      colliders={false}
      position={[0, 0, -100]}
    >
      <BallCollider args={[PUSHER_RADIUS]} />
    </RigidBody>
  );
}

/**
 * Provides the frame (fitted world + pixel⇄world mapping) and keeps
 * the camera realising it. The world refits only after a resize
 * settles (350ms quiet), so dragging a window never respawns the
 * cluster mid-gesture; a settled, materially different stage aspect
 * gets a fresh cluster. The frame itself is recomputed from the
 * current world on every render, so the camera tracks resizes
 * immediately even while a world refit is still pending.
 */
function stageAspect(size: { width: number; height: number }, bleed: StageBleed) {
  const w = Math.max(50, size.width - bleed.left - bleed.right);
  const h = Math.max(50, size.height - bleed.top - bleed.bottom);
  return w / h;
}

function FrameProvider({
  bleed,
  children,
}: {
  bleed: StageBleed;
  children: React.ReactNode;
}) {
  const size = useThree((s) => s.size);
  const camera = useThree((s) => s.camera);
  const [world, setWorld] = useState<World>(() =>
    computeWorld(stageAspect(size, bleed)),
  );
  const worldRef = useRef(world);
  worldRef.current = world;

  useEffect(() => {
    const implied = computeWorld(stageAspect(size, bleed));
    const current = worldRef.current;
    if (
      Math.abs(implied.worldW - current.worldW) < 0.4 &&
      Math.abs(implied.worldH - current.worldH) < 0.4
    ) {
      return;
    }
    const t = setTimeout(() => setWorld(implied), 350);
    return () => clearTimeout(t);
  }, [size, bleed]);

  const frame = useMemo(
    () => computeFrame(size.width, size.height, bleed, world),
    [size, bleed, world],
  );

  useEffect(() => {
    camera.position.set(frame.camX, frame.camY, frame.dist);
    camera.near = 0.1;
    camera.far = 90;
    camera.updateProjectionMatrix();
  }, [camera, frame]);

  return <FrameCtx.Provider value={frame}>{children}</FrameCtx.Provider>;
}

/**
 * Tracks the pointer on WINDOW events and writes its world position
 * into the shared ref. The canvas itself is pointer-events:none (it
 * bleeds over the heading and page margins and must never block a
 * click or a text selection), so R3F's own pointer is useless here.
 * The active zone is the play box's rect on screen — the stage plus
 * the extension strip above it — padded by a few px; anywhere else
 * (including over the heading text itself, above the strip) the
 * swarm is left alone. Touch pointers never activate: touch drags
 * scroll the page.
 */
function PointerTracker({ pointerRef }: { pointerRef: PointerRef }) {
  const frame = useSceneFrame();
  const gl = useThree((s) => s.gl);
  const frameRef = useRef(frame);
  frameRef.current = frame;

  useEffect(() => {
    const el = gl.domElement;
    const off = () => {
      pointerRef.current.active = false;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") {
        off();
        return;
      }
      const f = frameRef.current;
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      // Play-box rect within the canvas (canvas px, y top-down): the
      // stage inset by the bleeds, extended upward by the strip.
      const minX = f.bleed.left - 8;
      const maxX = rect.width - f.bleed.right + 8;
      const minY = f.bleed.top - f.extTop * f.scale - 8;
      const maxY = rect.height - f.bleed.bottom + 8;
      if (px < minX || px > maxX || py < minY || py > maxY) {
        off();
        return;
      }
      pointerRef.current.x = f.camX + (px - rect.width / 2) / f.scale;
      pointerRef.current.y = f.camY - (py - rect.height / 2) / f.scale;
      pointerRef.current.active = true;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", off);
    window.addEventListener("blur", off);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", off);
      window.removeEventListener("blur", off);
      off();
    };
  }, [gl, pointerRef]);

  return null;
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
  pointerRef,
  bodies,
  pusher,
}: {
  active: boolean;
  pointerRef: PointerRef;
  bodies: BodiesRef;
  pusher: React.RefObject<RapierRigidBody | null>;
}) {
  const frame = useSceneFrame();
  const world = frame.world;
  const balls = useMemo(() => makeBalls(world), [world]);

  return (
    <Physics
      gravity={[0, 0, 0]}
      timeStep={1 / 60}
      interpolate
      paused={!active}
    >
      <Bounds />
      <PointerPusher pusher={pusher} />
      {balls.map((spec, i) => (
        <Ball
          key={`${spec.tex}-${i}-${spec.radius.toFixed(2)}`}
          spec={spec}
          index={i}
          bodies={bodies}
        />
      ))}
      <ForceField
        pointerRef={pointerRef}
        bodies={bodies}
        balls={balls}
        pusher={pusher}
        world={world}
        extTop={frame.extTop}
      />
    </Physics>
  );
}

export default function TechStackScene({
  active,
  dpr,
  onReady,
  bleed,
}: {
  /** section on-screen: run the loop; off-screen: freeze it entirely */
  active: boolean;
  dpr: [number, number];
  /** textures loaded + world mounted — safe to reveal the canvas */
  onReady?: () => void;
  /** how far the canvas bleeds past the stage rect (CSS px) */
  bleed: StageBleed;
}) {
  const pointerRef = useRef<PointerState>({ active: false, x: 0, y: 0 });
  const bodies = useRef<(RapierRigidBody | null)[]>([]);
  const pusher = useRef<RapierRigidBody | null>(null);

  return (
    <Canvas
      dpr={dpr}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0.15, 13.5], fov: FOV }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      style={{
        background: "transparent",
        touchAction: "pan-y",
        // The canvas bleeds past the stage on every side — over the
        // heading zone above and the page margins at the sides. It
        // must NEVER intercept a click or a text selection; the
        // pointer is tracked on window events instead (PointerTracker).
        pointerEvents: "none",
      }}
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 8, 6]} intensity={1.1} color="#fff2df" />
      <directionalLight position={[-6, 3, -2]} intensity={0.4} color="#6ea8ff" />

      <Suspense fallback={null}>
        <ReadySignal onReady={onReady} />
        <FrameProvider bleed={bleed}>
          <PointerTracker pointerRef={pointerRef} />
          <ScenePhysics
            active={active}
            pointerRef={pointerRef}
            bodies={bodies}
            pusher={pusher}
          />
        </FrameProvider>

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
