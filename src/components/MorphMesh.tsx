"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  Lightformer,
  MeshDistortMaterial,
} from "@react-three/drei";

/**
 * Part 4 — hero visual, Sharma-base: an animated morphing 3D mesh (the
 * signature of Sarthak Sharma's portfolio) instead of a character. A deep
 * blue sphere endlessly distorted by drei's MeshDistortMaterial, lit warm
 * key / cool fill / gold rim so the surface reads blue-to-gold as it turns.
 * Self-contained Environment (Lightformers) — no external HDR fetch.
 */
export default function MorphMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.rotation.y += delta * 0.18;
    mesh.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.12;
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      {/* warm key */}
      <directionalLight
        position={[4, 6, 4]}
        intensity={1.3}
        color="#ffd9a3"
        castShadow
      />
      {/* cool fill */}
      <directionalLight position={[-5, 2, -1]} intensity={0.55} color="#6ea8ff" />
      {/* gold rim from behind */}
      <directionalLight position={[-1, 3, -6]} intensity={1.5} color="#d4a94e" />

      <Float speed={1.3} rotationIntensity={0.25} floatIntensity={0.55}>
        <mesh ref={meshRef} castShadow>
          <sphereGeometry args={[1.12, 96, 96]} />
          <MeshDistortMaterial
            color="#2563eb"
            roughness={0.16}
            metalness={0.05}
            distort={0.42}
            speed={1.6}
          />
        </mesh>
      </Float>

      <ContactShadows
        position={[0, -1.8, 0]}
        opacity={0.32}
        scale={7.5}
        blur={2.6}
        far={3.2}
        color="#000000"
      />

      <Environment resolution={256}>
        <group rotation={[-Math.PI / 3, 0, 0]}>
          <Lightformer form="circle" intensity={4} position={[0, 5, -9]} scale={2} />
          <Lightformer
            intensity={2}
            position={[-5, 1, -1]}
            scale={[3, 0.8]}
            color="#9db8ff"
          />
          <Lightformer
            intensity={2}
            position={[5, -1, -1]}
            scale={[3, 0.8]}
            color="#d4a94e"
          />
          <Lightformer
            color="#1d3a6e"
            intensity={1.5}
            position={[0, -5, 0]}
            scale={[10, 2]}
          />
        </group>
      </Environment>
    </>
  );
}
