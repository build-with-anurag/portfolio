"use client";

import { Component, Suspense, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  Center,
  ContactShadows,
  Environment,
  Float,
  Lightformer,
  useGLTF,
} from "@react-three/drei";

/**
 * Part 3 (GLB) — Anurag's own character model.
 *
 * Loads the Tripo-generated bust from /models/character.glb (his photo-based
 * portrait turned into a 3D model). The GLB's native scale is arbitrary, so
 * on load we measure its bounding box with three's Box3 and scale it to a
 * fixed target height; drei's Center then puts the bounding-box centre on
 * the origin. Motion is deliberately calm: a gentle Float plus a slow,
 * small rotational sway of the whole group — no mouse/head tracking.
 *
 * If the file is missing or fails to load, the error boundary below renders
 * nothing (empty hero panel) instead of breaking the page.
 */

const MODEL_PATH = "/models/character.glb";
const TARGET_HEIGHT = 2.2; // world units the bust is normalised to

class GLBErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    // Model not available yet (or corrupt) — hero simply stays empty.
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Model() {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_PATH);

  // Normalise: uniform scale so the model's height == TARGET_HEIGHT.
  // Centering is delegated to drei's <Center>, which measures the same
  // bounding box (scale included) and offsets it onto the origin.
  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    if (!isFinite(size.y) || size.y <= 0) return 1;
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = false;
      }
    });
    return TARGET_HEIGHT / size.y;
  }, [scene]);

  // Soft idle sway — slow, small, on the whole group only.
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = Math.sin(t * 0.35) * 0.07;
    group.current.rotation.z = Math.sin(t * 0.22) * 0.012;
  });

  return (
    <group ref={group}>
      {/* Studio-ish lighting, mirroring the old procedural scene's palette:
          warm key, cool blue fill, gold rim. The Environment is built from
          Lightformers (no external HDR fetch) so the PBR materials get
          soft reflections. */}
      <ambientLight intensity={0.5} color="#e2e8f0" />
      <directionalLight
        position={[3.5, 5, 4]}
        intensity={1.4}
        color="#fffbeb"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-4, 2, -2]} intensity={0.8} color="#38bdf8" />
      <pointLight position={[2.2, 1.8, -2.5]} intensity={2} color="#f59e0b" distance={8} />
      <Environment resolution={256}>
        <Lightformer
          intensity={2}
          position={[0, 2, 3]}
          rotation-x={Math.PI / 8}
          scale={[6, 4, 1]}
          color="#fff7e0"
        />
        <Lightformer
          intensity={1.2}
          position={[-4, 1, 1]}
          rotation-y={Math.PI / 3}
          scale={[5, 3, 1]}
          color="#7dd3fc"
        />
        <Lightformer
          intensity={1}
          position={[4, 0, -2]}
          rotation-y={-Math.PI / 3}
          scale={[4, 3, 1]}
          color="#fbbf24"
        />
      </Environment>

      <Float
        speed={1.4}
        rotationIntensity={0.12}
        floatIntensity={0.35}
        floatingRange={[-0.04, 0.04]}
      >
        <Center>
          <group scale={scale}>
            <primitive object={scene} />
          </group>
        </Center>
      </Float>

      {/* Model bottom sits at -TARGET_HEIGHT/2 (-1.1) after centering. */}
      <ContactShadows
        position={[0, -1.14, 0]}
        opacity={0.45}
        scale={4.5}
        blur={2.2}
        far={2.5}
        color="#020617"
      />
    </group>
  );
}

export default function CharacterModel() {
  return (
    <GLBErrorBoundary>
      <Suspense fallback={null}>
        <Model />
      </Suspense>
    </GLBErrorBoundary>
  );
}
