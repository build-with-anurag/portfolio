"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import MorphMesh from "./MorphMesh";
import styles from "./Hero.module.scss";

/**
 * Hero scene — client-only, loaded via next/dynamic with ssr:false from
 * Hero, so three.js never runs during server rendering. The canvas is
 * transparent: the visual floats directly on the hero's dark background,
 * no visible box.
 *
 * Part 4 (Sharma-base): the right column shows an animated morphing 3D
 * mesh (MorphMesh). The earlier character experiments — Argon's
 * procedural Character3D and the Tripo GLB loader (CharacterModel) —
 * stay in the repo unused.
 */
export default function HeroScene() {
  const wrapRef = useRef<HTMLDivElement>(null);
  // Mount the WebGL canvas only while the hero is near the viewport, so
  // it never competes with the Tech Stack physics canvas further down.
  const [inRange, setInRange] = useState(true);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInRange(entry.isIntersecting), {
      rootMargin: "300px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className={styles.scene} ref={wrapRef} role="img" aria-label="Animated morphing 3D mesh artwork">
      {inRange && (
        <Canvas
          shadows
          dpr={[1, 1.75]}
          camera={{ position: [0, 0.35, 4.6], fov: 40 }}
          gl={{ alpha: true, antialias: true }}
          style={{ background: "transparent" }}
        >
          <group scale={0.88} position={[0, 0.05, 0]}>
            <MorphMesh />
          </group>
        </Canvas>
      )}
    </div>
  );
}
