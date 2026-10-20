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
        camera={{ position: [0, 0.35, 3.6], fov: 38 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <Character3D />
      </Canvas>
    </div>
  );
}
