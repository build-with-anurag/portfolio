"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Bot, FileStack, Rocket, Terminal } from "lucide-react";
import styles from "./StatsBand.module.scss";

const STATS = [
  { icon: Rocket, target: 1, suffix: "", label: "Live Prototype" },
  { icon: FileStack, target: 36, suffix: "", label: "Pages Shipped" },
  { icon: Terminal, target: 3, suffix: "", label: "Linux Distros Run" },
  { icon: Bot, target: 4, suffix: "-Week", label: "GenAI Internship · SGSU" },
];

/**
 * Part 3 (v3) — Stats band, directly under the hero (Vikas-style cards).
 * Each card: small blue line icon, big blue-gradient number counting up
 * when the band scrolls into view, grey label. Numbers are the honest,
 * already-agreed stats only.
 *
 * Motion: GSAP count-up fired by IntersectionObserver (Lenis-friendly, no
 * scroll hijacking). prefers-reduced-motion → final values immediately.
 */
export default function StatsBand() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const cards = root.querySelectorAll("[data-card]");
    const numbers = root.querySelectorAll<HTMLElement>("[data-count]");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const setFinal = () => {
      numbers.forEach((el) => {
        el.textContent = el.dataset.count ?? "";
      });
    };

    if (reduced) {
      setFinal();
      gsap.set(cards, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(cards, { opacity: 0, y: 26 });

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        io.disconnect();

        gsap.to(cards, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.1,
        });

        numbers.forEach((el, i) => {
          const target = Number(el.dataset.count ?? "0");
          const state = { v: 0 };
          gsap.to(state, {
            v: target,
            duration: 1.4,
            delay: i * 0.1,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = String(Math.round(state.v));
            },
            onComplete: () => {
              el.textContent = String(target);
            },
          });
        });
      },
      { threshold: 0.3 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  return (
    <section className={styles.band} ref={rootRef} aria-label="Key stats">
      <div className={styles.grid}>
        {STATS.map((stat) => (
          <div className={styles.card} key={stat.label} data-card>
            <span className={styles.iconWrap}>
              <stat.icon size={19} strokeWidth={1.8} />
            </span>
            <div className={styles.value}>
              <span data-count={stat.target}>0</span>
              {stat.suffix && <span className={styles.suffix}>{stat.suffix}</span>}
            </div>
            <div className={styles.label}>{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
