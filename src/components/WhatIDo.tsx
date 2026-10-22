"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Hammer, Terminal, Workflow } from "lucide-react";
import styles from "./WhatIDo.module.scss";

const PANELS = [
  {
    num: "01",
    icon: Hammer,
    title: "Build Products",
    body: (
      <>
        I turn ideas into working web products. <strong>Krishi Setu</strong>,
        my agricultural marketplace, is live on the web as a working
        prototype; <strong>ShopMart</strong> is my e-commerce practice build;
        and this portfolio is designed and built by me, end to end.
      </>
    ),
    chips: ["Next.js", "React", "TypeScript", "SCSS"],
  },
  {
    num: "02",
    icon: Workflow,
    title: "Automate Workflows",
    body: (
      <>
        It started with a <strong>Python script</strong> I wrote myself that
        turned tech news into a daily Word file in a Drive folder. Today I run
        daily automated systems — a <strong>tech briefing</strong>,{" "}
        <strong>email triage</strong> and a <strong>phone-deal watch</strong>{" "}
        — built and run with AI agents.
      </>
    ),
    chips: ["Python", "APIs", "Google Workspace", "AI Agents"],
  },
  {
    num: "03",
    icon: Terminal,
    title: "Explore Systems",
    body: (
      <>
        I like going under the hood. I distro-hopped through Garuda, Ubuntu
        and Fedora on my way to installing <strong>Arch Linux</strong> from
        scratch, I&apos;m comfortable on the command line, and I study how AI
        works internally — <strong>transformer architecture</strong>, tokens,
        attention.
      </>
    ),
    chips: ["Linux", "Arch", "Git", "CLI Tools"],
  },
];

/**
 * Part 4 (v3) — What I Do, Rajesh Chityal-style: large dashed-border
 * panels with scroll-linked activation. As the section scrolls, the
 * panel nearest the viewport centre lights up (blue border, full
 * brightness) while the others dim. Entrance reveal follows the site's
 * data-animate + GSAP pattern; prefers-reduced-motion shows content
 * statically.
 */
export default function WhatIDo() {
  const rootRef = useRef<HTMLElement>(null);
  const panelRefs = useRef<Array<HTMLElement | null>>([]);
  const [active, setActive] = useState(0);

  // Entrance reveal (same pattern as About).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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
            // Panels carry their own class-driven dim/active opacity —
            // hand control back to CSS once the entrance finishes.
            clearProps: "opacity,transform",
          });
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  // Scroll-linked activation: whichever panel crosses the viewport's
  // middle band becomes the active one.
  useEffect(() => {
    const panels = panelRefs.current.filter(Boolean) as HTMLElement[];
    if (!panels.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(panels.indexOf(entry.target as HTMLElement));
          }
        }
      },
      { rootMargin: "-38% 0px -38% 0px", threshold: 0 },
    );
    panels.forEach((panel) => io.observe(panel));
    return () => io.disconnect();
  }, []);

  return (
    <section className={styles.section} id="what-i-do" ref={rootRef}>
      <div className={styles.inner}>
        <p className={styles.eyebrow} data-animate>
          <span className={styles.num}>02 /</span> What I Do
        </p>
        <h2 className={styles.heading} data-animate>
          Three ways I spend <span className={styles.accent}>my building time.</span>
        </h2>

        <div className={styles.panels}>
          {PANELS.map((panel, i) => (
            <article
              key={panel.num}
              ref={(el) => {
                panelRefs.current[i] = el;
              }}
              className={`${styles.panel} ${active === i ? styles.panelActive : ""}`}
              data-animate
            >
              <span className={styles.panelNum} aria-hidden="true">
                {panel.num}
              </span>
              <div className={styles.panelMain}>
                <h3 className={styles.panelTitle}>
                  <panel.icon size={21} strokeWidth={2} />
                  {panel.title}
                </h3>
                <p className={styles.panelBody}>{panel.body}</p>
                <div className={styles.chipRow}>
                  {panel.chips.map((chip) => (
                    <span className={styles.chip} key={chip}>
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
