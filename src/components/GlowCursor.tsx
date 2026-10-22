"use client";

import { useEffect, useRef } from "react";
import styles from "./GlowCursor.module.scss";

/**
 * Custom glowing cursor — Rajesh Chityal style: a soft blue glowing dot
 * with a trailing ring following the pointer. It AUGMENTS the native
 * cursor (which stays visible) and only activates on pointer-fine
 * devices (mouse/trackpad); touch devices never see it. The ring grows
 * over links, buttons and other interactive elements. If JS fails, the
 * component simply never renders and the native cursor is untouched.
 */
export default function GlowCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.body.classList.add(styles.enabled);

    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;
    let rafId = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;

      const target = e.target as HTMLElement | null;
      const interactive = target?.closest(
        "a, button, [role='button'], input, textarea, select, label",
      );
      ring.classList.toggle(styles.grow, Boolean(interactive));
    };

    const loop = () => {
      // Ring trails the pointer with a light lerp.
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
      document.body.classList.remove(styles.enabled);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className={styles.ring} aria-hidden="true" />
      <div ref={dotRef} className={styles.dot} aria-hidden="true" />
    </>
  );
}
