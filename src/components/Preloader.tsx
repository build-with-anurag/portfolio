"use client";

import { useEffect, useState } from "react";
import styles from "./Preloader.module.scss";

/**
 * Preloader — Vikas Patel style (verified from vikaspatel.in):
 * near-black full screen, gradient "AV" badge with a 3-dot ring, bold name
 * (first name white, surname bright blue), gray role line, thin gradient
 * progress bar (no percentage), "Loading experience..." caption.
 * The page content renders behind it from the start. The overlay never
 * holds paint hostage: it dismisses on window load or after a hard cap
 * of ~1.1s from mount — whichever comes first (with a ~500ms floor so it
 * never just flashes) — then fades/slides out and unmounts.
 */
const MIN_SHOW_MS = 500;
const MAX_SHOW_MS = 1100;
const FADE_MS = 700; // matches the 0.65s overlay transition + slack

export default function Preloader() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const mountedAt = performance.now();
    let dismissed = false;
    let dismissTimer: number | undefined;
    let goneTimer: number | undefined;

    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      // Tell the hero the curtain is lifting so its entrance
      // choreography starts in sync with the fade — not on a guessed
      // fixed delay (the old 2s constant outlived the 1.1s cap and
      // left the hero sitting hidden for ~a second after the lift).
      (window as unknown as { __avPreloaderGone?: boolean }).__avPreloaderGone =
        true;
      window.dispatchEvent(new Event("av:preloader-leaving"));
      setLeaving(true);
      goneTimer = window.setTimeout(() => setGone(true), FADE_MS);
    };

    const dismissRespectingFloor = () => {
      const elapsed = performance.now() - mountedAt;
      const wait = Math.min(
        Math.max(0, MIN_SHOW_MS - elapsed),
        MAX_SHOW_MS - elapsed,
      );
      if (wait <= 0) dismiss();
      else dismissTimer = window.setTimeout(dismiss, wait);
    };

    // Hard cap: never stay longer than MAX_SHOW_MS, loaded or not.
    const capTimer = window.setTimeout(dismiss, MAX_SHOW_MS);

    if (document.readyState === "complete") {
      dismissRespectingFloor();
    } else {
      window.addEventListener("load", dismissRespectingFloor);
    }

    return () => {
      window.clearTimeout(capTimer);
      if (dismissTimer) window.clearTimeout(dismissTimer);
      if (goneTimer) window.clearTimeout(goneTimer);
      window.removeEventListener("load", dismissRespectingFloor);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      className={`${styles.overlay} ${leaving ? styles.leaving : ""}`}
      aria-hidden="true"
    >
      <div className={styles.center}>
        <div className={styles.badgeWrap}>
          <span className={`${styles.dot} ${styles.dot1}`} />
          <span className={`${styles.dot} ${styles.dot2}`} />
          <span className={`${styles.dot} ${styles.dot3}`} />
          <div className={styles.badge}>AV</div>
        </div>

        <div className={styles.name}>
          Anurag <span className={styles.surname}>Vishwakarma</span>
        </div>
        <div className={styles.role}>CSE Student • Builder</div>

        <div className={styles.barTrack}>
          <div className={styles.barFill} />
        </div>
        <div className={styles.caption}>Loading experience...</div>
      </div>
    </div>
  );
}
