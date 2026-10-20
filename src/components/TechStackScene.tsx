"use client";

import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, useTexture } from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";

const RADIUS = 0.85;

type BallSpec = {
  tex: string;
  position: [number, number, number];
  rotation: [number, number, number];
};

// His stack (12 unique) + a few duplicates to fill the pile — 16 balls.
// Texture files live in public/textures (generated locally from
// simple-icons paths; no runtime fetches).
const BALLS: BallSpec[] = [
  { tex: "/textures/javascript.png", position: [-4.5, 6.4, 0.3], rotation: [0.4, 0.8, 0.2] },
  { tex: "/textures/typescript.png", position: [-1.5, 6.6, -0.4], rotation: [1.1, 0.3, 0.6] },
  { tex: "/textures/react.png", position: [1.5, 6.4, 0.5], rotation: [0.2, 1.4, 0.9] },
  { tex: "/textures/nextdotjs.png", position: [4.5, 6.6, -0.3], rotation: [0.7, 0.5, 1.2] },
  { tex: "/textures/python.png", position: [-5.2, 4.9, -0.5], rotation: [1.3, 0.9, 0.1] },
  { tex: "/textures/c.png", position: [-1.8, 5.1, 0.4], rotation: [0.5, 1.1, 0.8] },
  { tex: "/textures/html5.png", position: [1.8, 4.9, -0.4], rotation: [0.9, 0.2, 1.4] },
  { tex: "/textures/css3.png", position: [5.2, 5.1, 0.5], rotation: [0.3, 1.6, 0.4] },
  { tex: "/textures/git.png", position: [-4.5, 3.4, 0.2], rotation: [1.5, 0.6, 0.7] },
  { tex: "/textures/github.png", position: [-1.5, 3.6, -0.5], rotation: [0.6, 1.2, 0.3] },
  { tex: "/textures/linux.png", position: [1.5, 3.4, 0.4], rotation: [1.0, 0.4, 1.1] },
  { tex: "/textures/vercel.png", position: [4.5, 3.6, -0.2], rotation: [0.8, 1.5, 0.5] },
  { tex: "/textures/javascript.png", position: [-3.4, 7.9, -0.3], rotation: [0.1, 0.9, 1.3] },
  { tex: "/textures/react.png", position: [-1.1, 8.1, 0.4], rotation: [1.2, 0.7, 0.2] },
  { tex: "/textures/nextdotjs.png", position: [1.1, 7.9, -0.4], rotation: [0.4, 1.0, 0.9] },
  { tex: "/textures/typescript.png", position: [3.4, 8.1, 0.3], rotation: [1.4, 0.1, 0.6] },
];

function Ball({ tex, position, rotation }: BallSpec) {
  const texture = useTexture(tex);
  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
  }, [texture]);

  return (
    <RigidBody
      colliders="ball"
      position={position}
      rotation={rotation}
      restitution={0.22}
      friction={0.55}
      linearDamping={0.04}
      angularDamping={0.25}
    >
      <mesh>
        <sphereGeometry args={[RADIUS, 40, 40]} />
        <meshStandardMaterial map={texture} roughness={0.3} metalness={0.02} />
      </mesh>
    </RigidBody>
  );
}

/** Invisible container: floor + side walls + a shallow front/back slab. */
function Bounds() {
  return (
    <RigidBody type="fixed" colliders={false}>
      {/* floor (top surface at y = -3.3) */}
      <CuboidCollider args={[11, 0.5, 3.4]} position={[0, -3.8, 0]} />
      {/* side walls */}
      <CuboidCollider args={[0.5, 8, 3.4]} position={[-9.4, 1, 0]} />
      <CuboidCollider args={[0.5, 8, 3.4]} position={[9.4, 1, 0]} />
      {/* back + front slabs */}
      <CuboidCollider args={[11, 8, 0.5]} position={[0, 1, -2.7]} />
      <CuboidCollider args={[11, 8, 0.5]} position={[0, 1, 2.7]} />
    </RigidBody>
  );
}

/**
 * Kinematic sphere that follows the pointer and shoves the pile around.
 * Stays parked below the floor until the pointer actually moves, so it
 * never blasts the pile on load (or in headless captures).
 */
function PointerPusher({ active }: { active: React.RefObject<boolean> }) {
  const body = useRef<RapierRigidBody>(null);

  useFrame((state) => {
    const b = body.current;
    if (!b) return;
    if (!active.current) {
      b.setNextKinematicTranslation({ x: 0, y: -12, z: 0 });
      return;
    }
    const anchor = new THREE.Vector3(0, 0, 0);
    const vp = state.viewport.getCurrentViewport(state.camera, anchor);
    b.setNextKinematicTranslation({
      x: (state.pointer.x * vp.width) / 2,
      y: (state.pointer.y * vp.height) / 2,
      z: 0,
    });
  });

  return (
    <RigidBody
      ref={body}
      type="kinematicPosition"
      colliders={false}
      position={[0, -12, 0]}
    >
      <BallCollider args={[1.05]} friction={0.1} restitution={0.4} />
    </RigidBody>
  );
}

export default function TechStackScene() {
  const pointerActive = useRef(false);

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.2, 13.5], fov: 40 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
      onPointerMove={() => {
        pointerActive.current = true;
      }}
      onPointerLeave={() => {
        pointerActive.current = false;
      }}
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 8, 6]} intensity={1.1} color="#fff2df" />
      <directionalLight position={[-6, 3, -2]} intensity={0.4} color="#6ea8ff" />

      <Suspense fallback={null}>
        <Physics gravity={[0, -9.81, 0]}>
          <Bounds />
          {BALLS.map((ball, i) => (
            <Ball key={i} {...ball} />
          ))}
          <PointerPusher active={pointerActive} />
        </Physics>

        <Environment resolution={128}>
          <group rotation={[-Math.PI / 3, 0, 0]}>
            <Lightformer form="circle" intensity={3} position={[0, 5, -9]} scale={2} />
            <Lightformer intensity={1.6} position={[-5, 1, -1]} scale={[3, 0.8]} color="#9db8ff" />
            <Lightformer intensity={1.6} position={[5, -1, -1]} scale={[3, 0.8]} color="#ffe1ae" />
          </group>
        </Environment>
      </Suspense>
    </Canvas>
  );
}
