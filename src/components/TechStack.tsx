"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import styles from "./TechStack.module.scss";
import { TECH_TEXTURES } from "./techStackData";

// Physics scene is client-only (three.js + rapier WASM) and heavy —
// lazy-load it so it never blocks the rest of the page.
const TechStackScene = dynamic(() => import("./TechStackScene"), {
  ssr: false,
});

let webglProbeCache: boolean | null = null;
/**
 * WebGL is the one hard requirement of the 3D stage. Probe it LAZILY —
 * only when the scene is about to mount. Creating a throwaway WebGL
 * context at page load sounds harmless but blocks the main thread hard
 * on software GL (SwiftShader in Lighthouse CI took ~2–4.5 s for the
 * command-buffer spin-up), which masqueraded as a giant unattributable
 * long task and torched TBT. On real hardware it is also pure waste
 * for visitors who never scroll here.
 */
function webglAvailable(): boolean {
  if (webglProbeCache !== null) return webglProbeCache;
  try {
    const canvas = document.createElement("canvas");
    webglProbeCache = Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    webglProbeCache = false;
  }
  return webglProbeCache;
}

/**
 * Static chip grid — the same logo artwork as round chips. It fills the
 * stage from first paint (so the panel is NEVER an empty box), stays as
 * the loading state while the physics chunk arrives, and becomes the
 * permanent fallback on machines where WebGL is unavailable.
 */
function ChipGrid() {
  return (
    <div className={styles.chipGrid} aria-hidden="true">
      {TECH_TEXTURES.map((tex, i) => (
        <span
          key={tex}
          className={styles.chipBall}
          style={{ animationDelay: `${(i % 6) * -1.3}s` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={tex} alt="" width={72} height={72} loading="lazy" />
        </span>
      ))}
    </div>
  );
}

/**
 * Tech Stack — MoncyDev/Rajesh-style white logo balls with real physics
 * (React Three Fiber + rapier) that drop in, pile up, and react to the
 * pointer (push + gentle magnetism). Section header follows the v3
 * pattern (numbered eyebrow + Fraunces heading); heading reveal follows
 * the site's GSAP data-animate pattern.
 *
 * Loading strategy (why the panel can no longer sit empty): the stage
 * shows the chip grid immediately; the heavy scene chunk starts loading
 * on the visitor's first scroll intent or when the stage comes within
 * ~1200px — whichever first — and once mounted it is NEVER unmounted
 * (scrolling away just freezes its render loop and physics, which costs
 * nothing and keeps the pile exactly where it settled).
 */
export default function TechStack() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [mount, setMount] = useState(false);
  const [webglOk, setWebglOk] = useState<boolean | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);
  const [inView, setInView] = useState(false);
  const [stageW, setStageW] = useState(0);

  // On mount intent: probe WebGL (lazily — see webglAvailable) and
  // watch the scene chunk; no support or a failed chunk → the chip
  // grid stays as the permanent stage instead of an empty panel.
  useEffect(() => {
    if (!mount) return;
    setWebglOk(webglAvailable());
    let cancelled = false;
    import("./TechStackScene").catch(() => {
      if (!cancelled) setSceneFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [mount]);

  // Start loading the scene early: first scroll intent, or proximity.
  useEffect(() => {
    if (mount) return;
    const go = () => setMount(true);
    const opts: AddEventListenerOptions = { passive: true, once: true };
    window.addEventListener("wheel", go, opts);
    window.addEventListener("touchmove", go, opts);
    window.addEventListener("keydown", go, opts);

    const el = stageRef.current;
    let io: IntersectionObserver | null = null;
    if (el) {
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) go();
        },
        { rootMargin: "1200px" },
      );
      io.observe(el);
    }
    return () => {
      window.removeEventListener("wheel", go);
      window.removeEventListener("touchmove", go);
      window.removeEventListener("keydown", go);
      io?.disconnect();
    };
  }, [mount]);

  // Visibility drives the scene's render loop (and a hidden tab counts
  // as off-screen). Hysteresis via rootMargin so the loop doesn't flap
  // while the stage sits right at the viewport edge.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting && !document.hidden),
      { rootMargin: "120px" },
    );
    io.observe(el);
    const onVis = () => {
      if (document.hidden) setInView(false);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Stage width → DPR cap (small stages don't need retina physics).
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setStageW(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Heading reveal (site-wide GSAP data-animate pattern).
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

  const handleReady = useCallback(() => setSceneReady(true), []);
  const showScene = mount && webglOk === true && !sceneFailed;
  const dpr: [number, number] = stageW > 0 && stageW < 760 ? [1, 1.5] : [1, 2];

  return (
    <section className={styles.section} ref={rootRef} aria-label="Tech stack">
      <p className={styles.eyebrow} data-animate="stack-eyebrow">
        <span className={styles.num}>03 /</span> Tech Stack
      </p>
      <h2 className={styles.heading} data-animate="stack-heading">
        The tools I <span className={styles.accent}>build with.</span>
      </h2>
      <div
        className={styles.stage}
        data-animate="stack-stage"
        ref={stageRef}
        role="img"
        aria-label="Interactive physics balls, each printed with a technology logo from Anurag's stack"
      >
        {!sceneReady && <ChipGrid />}
        {showScene && (
          <div className={styles.stageCanvas}>
            <TechStackScene
              active={inView}
              dpr={dpr}
              onReady={handleReady}
            />
          </div>
        )}
      </div>
    </section>
  );
}
