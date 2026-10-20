"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import styles from "./TechStack.module.scss";

// Physics scene is client-only (three.js + rapier WASM) and heavy —
// lazy-load it so it never blocks the rest of the page.
const TechStackScene = dynamic(() => import("./TechStackScene"), {
  ssr: false,
  loading: () => <div className={styles.stagePlaceholder} />,
});

/**
 * Part 4 — Tech Stack, MoncyDev-style: white logo balls with real physics
 * (React Three Fiber + rapier) that drop in, pile up, and can be pushed
 * around with the pointer. Heading reveal follows the site's GSAP
 * data-animate pattern.
 */
export default function TechStack() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  // Mount the physics canvas only when the stage nears the viewport —
  // the balls drop in as the section arrives, and off-screen the canvas
  // costs nothing (also keeps it from fighting the hero's WebGL).
  const [stageInRange, setStageInRange] = useState(false);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setStageInRange(entry.isIntersecting),
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const targets = root.querySelectorAll("[data-animate]");
    gsap.set(targets, { opacity: 0, y: 26 });

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          gsap.to(targets, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.1,
          });
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  return (
    <section className={styles.section} ref={rootRef} aria-label="Tech stack">
      <p className={styles.eyebrow} data-animate="stack-eyebrow">
        <span className={styles.num}>02</span> Tech Stack
      </p>
      <h2 className={styles.heading} data-animate="stack-heading">
        MY TECH <span className={styles.accent}>STACK</span>
      </h2>
      <div className={styles.stage} data-animate="stack-stage" ref={stageRef} role="img" aria-label="Interactive physics balls, each printed with a technology logo from Anurag's stack">
        {stageInRange ? <TechStackScene /> : <div className={styles.stagePlaceholder} />}
      </div>
    </section>
  );
}
