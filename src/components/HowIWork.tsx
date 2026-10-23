"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Plus } from "lucide-react";
import styles from "./HowIWork.module.scss";

const ITEMS = [
  {
    title: "Pehle Khud Try Karo",
    body: "Before any tutorial, documentation or AI tool, the first attempt is always my own — even when it fails. That first struggle is what makes the explanation afterwards actually stick.",
  },
  {
    title: "Depth Me Jao",
    body: "I don't stop at the surface of a tool. Arch Linux installed from scratch, how transformers actually work under the hood — self-attention, embeddings, the full inference pipeline — understanding the layer underneath is the whole point.",
  },
  {
    title: "Bana Kar Seekho",
    body: "Learning happens by building. My first websites — portfolio v1 and ShopMart — were built during my internship period, and Krishi Setu came exactly the same way: build it, and the understanding follows.",
  },
  {
    title: "Ship Karo",
    body: "Done and live beats perfect and pending. Ship the working prototype first, then polish — it is one of my principle chips for a reason: Ship, Then Polish.",
  },
];

/**
 * Part 6 (v3) — How I Work. Sharma-style accordion: hairline-separated
 * rows, big Fraunces titles, a plus that rotates into a ×, and a smooth
 * grid-rows expand. The titles are Anurag's own approved Hinglish
 * phrases; the bodies say the same thing in plain English. First item
 * starts open.
 */
export default function HowIWork() {
  const rootRef = useRef<HTMLElement>(null);
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
      { threshold: 0.12 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  return (
    <section className={styles.section} id="how-i-work" ref={rootRef}>
      <div className={styles.inner}>
        <p className={styles.eyebrow} data-animate="how-eyebrow">
          <span className={styles.num}>06</span> / How I Work
        </p>
        <h2 className={styles.heading} data-animate="how-heading">
          The way I approach <span className={styles.accent}>any problem.</span>
        </h2>

        <div className={styles.accordion} data-animate="how-list">
          {ITEMS.map((item, i) => {
            const open = openIndex === i;
            return (
              <div
                key={item.title}
                className={`${styles.item} ${open ? styles.open : ""}`}
              >
                <button
                  type="button"
                  className={styles.head}
                  aria-expanded={open}
                  aria-controls={`how-panel-${i}`}
                  onClick={() => setOpenIndex(open ? -1 : i)}
                >
                  <span className={styles.idx} aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.title}>{item.title}</span>
                  <span className={styles.icon} aria-hidden="true">
                    <Plus size={18} strokeWidth={2.2} />
                  </span>
                </button>
                <div
                  className={styles.panelWrap}
                  id={`how-panel-${i}`}
                  role="region"
                  aria-label={item.title}
                >
                  <div className={styles.panelInner}>
                    <p className={styles.body}>{item.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
