"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import styles from "./TechStack.module.scss";
import { TECH_TEXTURES } from "./techStackData";
import type { StageBleed } from "./TechStackScene";

/**
 * Canvas bleed (round 5) — the WebGL canvas is rendered LARGER than
 * the stage on all four sides, so the camera's frustum extends well
 * past the physics walls and a ball pressed against any wall still
 * renders whole (previously wall + frustum edge coincided and front
 * balls got sliced flat by the canvas rect). The top bleed is the
 * deep one: the play box extends above the stage's top edge into it,
 * so the swarm can drift up behind the heading (the heading paints
 * above the canvas; the canvas is pointer-events:none throughout).
 * These same numbers are handed to the scene for its framing math —
 * one source of truth for CSS and camera alike.
 */
const BLEED_DESKTOP: StageBleed = { left: 200, top: 232, right: 200, bottom: 96 };
const BLEED_COMPACT: StageBleed = { left: 112, top: 156, right: 112, bottom: 80 };

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
 * Tech Stack — Rajesh-style white logo balls floating in zero gravity
 * (React Three Fiber + rapier): a loose cluster hovers at the centre
 * of the panel and the pointer acts as a magnet the swarm gathers
 * around and follows. Section header follows the v3 pattern (numbered
 * eyebrow + Fraunces heading); heading reveal follows the site's GSAP
 * data-animate pattern — the STAGE itself is deliberately NOT part of
 * that reveal: it must be fully visible from the section's first
 * paint, never an invisible box waiting on an animation.
 *
 * Loading strategy (why the panel can no longer sit empty, or even
 * look empty): the stage shows the chip grid from first paint; the
 * heavy scene chunk starts loading at the EARLIEST of — the visitor's
 * first scroll intent anywhere on the page, the stage coming within
 * ~1200px, or a DELAYED idle warm-up (only once the main thread has
 * been quiet for a few seconds after window load) — so in normal
 * reading the scene is already alive and settled when the visitor
 * arrives. The idle path is deliberately late: the ~3.2 MB three.js
 * + rapier chunk must never compete with first paint, the hero
 * entrance or LCP for main thread — warming it the moment the
 * browser first idled landed its parse square inside the load
 * window (seconds of blocking time in throttled audits).
 * The scroll-intent and proximity triggers keep the arrival-alive
 * guarantee for anyone who heads here sooner. Once mounted
 * the scene is NEVER unmounted — scrolling away just freezes its
 * render loop and physics, which costs nothing and keeps the swarm
 * exactly where it floated.
 */
export default function TechStack() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [mount, setMount] = useState(false);
  const [webglOk, setWebglOk] = useState<boolean | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [gridGone, setGridGone] = useState(false);
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

  // Start loading the scene at the earliest SAFE opportunity: first
  // scroll intent anywhere, the stage nearing the viewport, or a
  // delayed idle warm-up — whichever fires first. The idle path waits
  // for window load PLUS a settle delay before asking for an idle
  // slot, so the heavy chunk's parse can never land in the first
  // paint / LCP window and fight the hero for the main thread.
  useEffect(() => {
    if (mount) return;
    const go = () => setMount(true);
    const opts: AddEventListenerOptions = { passive: true, once: true };
    window.addEventListener("wheel", go, opts);
    window.addEventListener("touchmove", go, opts);
    window.addEventListener("keydown", go, opts);
    window.addEventListener("scroll", go, opts);

    const idle = window as unknown as {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let ric: number | undefined;
    let timer: number | undefined;
    let settleTimer: number | undefined;
    // The idle warm-up may only start once the main thread has been
    // QUIET — no long task for QUIET_MS — measured from window load.
    // A fixed post-load delay was not enough on throttled phones: the
    // page's own work runs long there, so a timer still landed inside
    // the busy window and the chunk's parse became fresh blocking
    // time. Watching real long tasks makes the warm-up wait for the
    // actual calm after first paint, the hero entrance and LCP, on
    // any hardware. Browsers without the longtask API fall back to a
    // plain post-load delay.
    const QUIET_MS = 3000;
    const FALLBACK_MS = 4000;
    const scheduleIdle = () => {
      let lastBusy = performance.now();
      let po: PerformanceObserver | null = null;
      try {
        po = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            lastBusy = Math.max(lastBusy, entry.startTime + entry.duration);
          }
        });
        po.observe({ type: "longtask", buffered: true });
      } catch {
        po = null;
      }
      const fire = () => {
        po?.disconnect();
        if (idle.requestIdleCallback) {
          ric = idle.requestIdleCallback(go, { timeout: 2500 });
        } else {
          timer = window.setTimeout(go, 1200);
        }
      };
      if (!po) {
        settleTimer = window.setTimeout(fire, FALLBACK_MS);
        return;
      }
      const check = () => {
        if (performance.now() - lastBusy >= QUIET_MS) fire();
        else settleTimer = window.setTimeout(check, 500);
      };
      settleTimer = window.setTimeout(check, 500);
    };
    if (document.readyState === "complete") scheduleIdle();
    else window.addEventListener("load", scheduleIdle, { once: true });

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
      window.removeEventListener("scroll", go);
      window.removeEventListener("load", scheduleIdle);
      if (ric !== undefined) idle.cancelIdleCallback?.(ric);
      if (timer !== undefined) window.clearTimeout(timer);
      if (settleTimer !== undefined) window.clearTimeout(settleTimer);
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

  // Once the scene is ready, let the canvas finish its fade-in OVER
  // the chip grid before the grid steps aside — no frame where the
  // stage shows neither.
  useEffect(() => {
    if (!sceneReady) return;
    const t = setTimeout(() => setGridGone(true), 700);
    return () => clearTimeout(t);
  }, [sceneReady]);

  const handleReady = useCallback(() => setSceneReady(true), []);
  const showScene = mount && webglOk === true && !sceneFailed;
  const dpr: [number, number] = stageW > 0 && stageW < 760 ? [1, 1.5] : [1, 2];
  const bleed = stageW > 0 && stageW < 900 ? BLEED_COMPACT : BLEED_DESKTOP;

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
        ref={stageRef}
        role="img"
        aria-label="Interactive physics balls, each printed with a technology logo from Anurag's stack"
      >
        {!gridGone && <ChipGrid />}
        {showScene && (
          <div
            className={styles.stageCanvas}
            style={{
              top: -bleed.top,
              right: -bleed.right,
              bottom: -bleed.bottom,
              left: -bleed.left,
            }}
          >
            <TechStackScene
              active={inView}
              dpr={dpr}
              onReady={handleReady}
              bleed={bleed}
            />
          </div>
        )}
      </div>
    </section>
  );
}
