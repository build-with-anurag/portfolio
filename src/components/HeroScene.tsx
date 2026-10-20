"use client";

import { Canvas } from "@react-three/fiber";
import Character3D from "./Character3D";
import styles from "./Hero.module.scss";

/**
 * Part 3 — client-only 3D scene for the hero's right column. Loaded via
 * next/dynamic with ssr:false from Hero, so three.js never runs during
 * server rendering. The canvas is transparent: the character floats
 * directly on the hero's dark background, no visible box.
 */
export default function HeroScene() {
  return (
    <div className={styles.scene}>
      <Canvas
        shadows
        camera={{ position: [0, 0.35, 4.6], fov: 40 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        {/* Framing wrapper (Part 3 fix): Argon's character renders slightly
            too large for this canvas — its hair top and the raised waving
            hand clipped at the frame edges. Pull the whole character back
            a touch (scale + shift) so idle and wave states both fit with
            margin. Character internals are untouched. */}
        <group scale={0.88} position={[0.15, -0.15, 0]}>
          <Character3D />
        </group>
      </Canvas>
    </div>
  );
}
