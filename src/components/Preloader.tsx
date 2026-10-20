"use client";

import { useEffect, useState } from "react";
import styles from "./Preloader.module.scss";

/**
 * Preloader — Vikas Patel style (verified from vikaspatel.in):
 * near-black full screen, gradient "AV" badge with a 3-dot ring, bold name
 * (first name white, surname bright blue), gray role line, thin gradient
 * progress bar (no percentage), "Loading experience..." caption.
 * The page content renders behind it from the start; the overlay animates
 * for ~1.8s, then slides/fades out and unmounts.
 */
export default function Preloader() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 1950);
    const t2 = setTimeout(() => setGone(true), 2650);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
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
