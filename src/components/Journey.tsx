"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./Journey.module.scss";

const MILESTONES = [
  {
    title: "The Start",
    text: "Completed 10th standard and chose a Diploma in Computer Science Engineering at S.V. Polytechnic College, Bhopal.",
  },
  {
    title: "Going Deep on Systems",
    text: "Set up a dual-boot Lenovo with Fedora Linux; later installed Arch Linux from scratch.",
  },
  {
    title: "Krishi Setu",
    text: "Built an agricultural marketplace with team Krishi Mitra for Smart India Hackathon (SIH26033) — 36 pages, shipped live.",
  },
  {
    title: "First Live Prototype",
    text: "Krishi Setu went live on the web; portfolio and dev identity (build-with-anurag) established.",
  },
  {
    title: "Teaching Back",
    text: "Led a workshop; now focused on DSA mastery and the next product.",
  },
];

/**
 * Part 6 — Journey. A quiet vertical timeline of verified milestones
 * only; no dates or claims beyond what actually happened.
 */
export default function Journey() {
  const rootRef = useRef<HTMLElement>(null);

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
            stagger: 0.12,
          });
          io.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  return (
    <section className={styles.section} id="journey" ref={rootRef}>
      <p className={styles.eyebrow} data-animate="journey-eyebrow">
        <span className={styles.num}>04</span> Journey
      </p>
      <h2 className={styles.heading} data-animate="journey-heading">
        My <span className={styles.accent}>Journey</span>
      </h2>

      <ol className={styles.timeline}>
        {MILESTONES.map((m) => (
          <li className={styles.item} key={m.title} data-animate="journey-item">
            <h3 className={styles.itemTitle}>{m.title}</h3>
            <p className={styles.itemText}>{m.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
