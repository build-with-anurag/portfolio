"use client";

import { useEffect, useRef } from "react";
import styles from "./ScrollProgress.module.scss";

/**
 * Scroll-progress bar — thin blue→gold gradient bar pinned to the very
 * top of the viewport; its width follows overall page scroll progress.
 * Lenis (default config) scrolls the native window, so listening to
 * window scroll + rAF gives a value that stays in sync with it.
 */
export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId = 0;
    let ticking = false;

    const update = () => {
      ticking = false;
      const el = barRef.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      el.style.transform = `scaleX(${progress})`;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        rafId = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return <div ref={barRef} className={styles.bar} aria-hidden="true" />;
}
