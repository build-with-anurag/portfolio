"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowUpRight, Code } from "lucide-react";
import styles from "./Projects.module.scss";

function useReveal(rootRef: React.RefObject<HTMLElement | null>) {
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
            stagger: 0.1,
          });
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, [rootRef]);
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className={styles.chips}>
      {items.map((item) => (
        <span className={styles.chip} key={item}>
          {item}
        </span>
      ))}
    </div>
  );
}

/**
 * Part 5 — Projects. Krishi Setu leads as the featured live prototype;
 * this portfolio and the ShopMart practice build follow, honestly
 * labelled. Order and wording are deliberate: live work first.
 */
export default function Projects() {
  const rootRef = useRef<HTMLElement>(null);
  useReveal(rootRef);

  return (
    <section className={styles.section} id="projects" ref={rootRef}>
      <p className={styles.eyebrow} data-animate="projects-eyebrow">
        <span className={styles.num}>03</span> Projects
      </p>
      <h2 className={styles.heading} data-animate="projects-heading">
        Projects<span className={styles.accent}>.</span>
      </h2>

      <div className={styles.grid}>
        {/* Featured — Krishi Setu */}
        <article className={`${styles.card} ${styles.featured}`} data-animate="project-card">
          <span className={styles.badge}>
            <span className={styles.badgeDot}>●</span> LIVE PROTOTYPE
          </span>
          <h3 className={styles.cardTitle}>Krishi Setu</h3>
          <p className={styles.desc}>
            An agricultural marketplace connecting farmers and buyers —
            escrow-style secure payments with a 4-digit handover PIN, OpenCV
            quality pre-checks, a 5-factor match score, and hyperlocal
            discovery within 25 km. Hindi/English voice UX.
          </p>
          <Chips items={["Next.js 15", "TypeScript", "MSW"]} />
          <div className={styles.metrics}>
            <div>
              <div className={styles.metricValue}>36</div>
              <div className={styles.metricLabel}>Pages</div>
            </div>
            <div>
              <div className={styles.metricValue}>5-step</div>
              <div className={styles.metricLabel}>Trust Journey</div>
            </div>
          </div>
          <div className={styles.links}>
            <a
              className={styles.btnPrimary}
              href="https://krishi-setu-lovat.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Live Site <ArrowUpRight size={16} strokeWidth={2.2} />
            </a>
            <a
              className={styles.btnGhost}
              href="https://github.com/itsanuragv/krishi-setu"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Code size={16} strokeWidth={2.2} /> Code
            </a>
          </div>
        </article>

        {/* This portfolio */}
        <article className={styles.card} data-animate="project-card">
          <span className={styles.tag}>REBUILD V2</span>
          <h3 className={styles.cardTitle}>This Portfolio</h3>
          <p className={styles.desc}>
            The site you&apos;re on — Next.js + SCSS, GSAP motion, a morphing
            Three.js hero and a physics-driven tech stack.
          </p>
          <Chips items={["Next.js", "R3F", "GSAP", "Rapier"]} />
          <div className={styles.links}>
            <a
              className={styles.btnGhost}
              href="https://github.com/build-with-anurag/portfolio"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Code size={16} strokeWidth={2.2} /> Code
            </a>
          </div>
        </article>

        {/* ShopMart — practice build, deliberately muted */}
        <article className={`${styles.card} ${styles.mutedCard}`} data-animate="project-card">
          <span className={styles.tagMuted}>PRACTICE BUILD</span>
          <h3 className={styles.cardTitleMuted}>ShopMart</h3>
          <p className={styles.desc}>
            A practice e-commerce build — product listing, cart and checkout
            flows.
          </p>
          <Chips items={["React", "JavaScript"]} />
        </article>
      </div>
    </section>
  );
}
