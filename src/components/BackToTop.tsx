"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import styles from "./BackToTop.module.scss";

/**
 * Back-to-top — circular button fixed at the bottom-right; fades in
 * after the visitor has scrolled a screenful. Clicking smooth-scrolls
 * back to the top (Lenis animates the native scroll it drives).
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`${styles.btn} ${visible ? styles.visible : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
    >
      <ArrowUp size={18} />
    </button>
  );
}
