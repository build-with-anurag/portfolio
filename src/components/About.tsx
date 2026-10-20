"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./About.module.scss";

const STATS = [
  { value: "1", label: "Live Product" },
  { value: "36", label: "Pages Shipped" },
  { value: "3", label: "Linux Distros Run" },
  { value: "1", label: "Workshop Led" },
];

/**
 * Part 4 — About. Short, factual intro (no inflated claims) plus an honest
 * stat-chip row. Reveal follows the site's data-animate + GSAP pattern,
 * triggered when the section scrolls into view (Lenis-friendly: plain
 * IntersectionObserver, no scroll hijacking).
 */
export default function About() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const targets = root.querySelectorAll("[data-animate]");
    gsap.set(targets, { opacity: 0, y: 28 });

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          gsap.to(targets, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.09,
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
    <section className={styles.about} id="about" ref={rootRef}>
      <div className={styles.inner}>
        <h2 className={styles.heading} data-animate="about-heading">
          About <span className={styles.accent}>Me</span>
        </h2>

        <p className={styles.body} data-animate="about-text">
          I&apos;m a Diploma CSE student at S.V. Polytechnic College, Bhopal,
          and I learn by building real products — not by collecting tutorials.
          My main build is <strong>Krishi Setu</strong>, a live agricultural
          marketplace built with Next.js, with escrow-style payments,
          image-based quality checks and hyperlocal discovery.
        </p>

        <p className={styles.body} data-animate="about-text">
          My base is C and Python fundamentals, and on the web I work across
          the stack with Next.js, React and TypeScript. I&apos;m just as at
          home on Linux — I&apos;ve run Fedora and Arch as daily systems — and
          I care more about clean, finished, shipped work than half-done
          experiments.
        </p>

        <div className={styles.stats}>
          {STATS.map((stat) => (
            <div className={styles.chip} key={stat.label} data-animate="about-chip">
              <div className={styles.value}>{stat.value}</div>
              <div className={styles.label}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
