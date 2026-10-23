"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { Layers, Network, Rocket, Zap } from "lucide-react";
import styles from "./About.module.scss";

const TABS = [
  {
    id: "build",
    label: "Build",
    body: (
      <>
        Building is how I learn. <strong>Krishi Setu</strong>, my agricultural
        marketplace prototype, runs an escrow-style payment flow released by a
        4-digit PIN handover, with hyperlocal discovery under 25&nbsp;km.{" "}
        <strong>ShopMart</strong> is a practice storefront — and my automation
        streak goes back to a Python script that generated a daily tech-brief
        Word file straight into a Drive folder.
      </>
    ),
    chips: ["Next.js", "React", "TypeScript", "Python"],
  },
  {
    id: "learn",
    label: "Learn",
    body: (
      <>
        I learn by going one level deeper than required. <strong>C and data
        structures</strong> for the fundamentals; <strong>Linux internals</strong>{" "}
        the hands-on way — distro-hopping from Garuda and Ubuntu through Fedora
        to Arch with Hyprland; and <strong>AI in depth</strong> — transformer
        architecture, multi-head self-attention, token embeddings,
        feed-forward layers, backpropagation and inference pipelines, not
        just prompts.
      </>
    ),
    chips: [
      "C",
      "Data Structures",
      "Linux",
      "GenAI",
      "Transformers",
      "LLMs",
      "Self-Attention",
      "Embeddings",
    ],
  },
  {
    id: "teach",
    label: "Teach",
    body: (
      <>
        During my <strong>GenAI internship at SGSU</strong>, the teaching part
        found me. After the lecturer&apos;s sessions, classmates who hadn&apos;t
        understood would come to me — and I&apos;d explain it again, in simpler
        words, until it clicked. In the same weeks I finished a{" "}
        <strong>LinkedIn Learning</strong> Generative AI course on my own.
      </>
    ),
    chips: ["Explaining Simply", "GenAI Basics", "Peer Learning"],
  },
];

const PRINCIPLES = [
  { icon: Zap, text: "Build > Talk" },
  { icon: Network, text: "Systems > Motivation" },
  { icon: Rocket, text: "Ship, Then Polish" },
  { icon: Layers, text: "Depth > Noise" },
];

/**
 * Part 3 (v3) — About, Sharma-style numbered section.
 * Eyebrow + Fraunces heading, two columns (portrait left, honest intro
 * right), interactive Build / Learn / Teach tabs under the intro, and the
 * approved principle chips. Copy is facts-only; Krishi Setu is always a
 * live prototype, never a product in real use.
 *
 * Reveal follows the site's data-animate + GSAP pattern via a plain
 * IntersectionObserver (Lenis-friendly, no scroll hijacking);
 * prefers-reduced-motion shows content statically.
 */
export default function About() {
  const rootRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

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
      { threshold: 0.12 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      panel,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" },
    );
  }, [active]);

  return (
    <section className={styles.about} id="about" ref={rootRef}>
      <div className={styles.inner}>
        <p className={styles.eyebrow} data-animate>
          <span className={styles.num}>01 /</span> About
        </p>
        <h2 className={styles.heading} data-animate>
          Technology is the tool.{" "}
          <span className={styles.accent}>Understanding is the point.</span>
        </h2>

        <div className={styles.cols}>
          <div className={styles.leftCol}>
            <figure className={styles.portrait} data-animate>
              <Image
                src="/about-photo.webp"
                alt="Portrait of Anurag Vishwakarma"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 420px, 480px"
              />
            </figure>

            <div className={styles.principles} data-animate>
              {PRINCIPLES.map((principle) => (
                <span className={styles.principle} key={principle.text}>
                  <principle.icon size={15} strokeWidth={2} />
                  {principle.text}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.right}>
            <p className={styles.body} data-animate>
              I&apos;m <strong>Anurag Vishwakarma</strong>, a Diploma CSE
              student at <strong>S.V. Polytechnic College, Bhopal</strong>. I
              build web products end to end — my agricultural marketplace{" "}
              <strong>Krishi Setu</strong> is{" "}
              <span className={styles.keyPhrase}>
                live on the web as a working prototype
              </span>
              , built with Next.js and TypeScript.
            </p>

            <p className={styles.body} data-animate>
              The streak is self-taught: I started with <strong>Python</strong>{" "}
              as a school kid, then went deep on <strong>Linux</strong> — all
              the way to installing <strong>Arch from scratch</strong> — and on
              how AI actually works under the hood:{" "}
              <strong>transformer architecture</strong>, self-attention,
              tokenisation and embeddings, positional encoding, context
              windows and autoregressive inference — the machinery behind{" "}
              <strong>large language models</strong>, not just prompts on top
              of them.
            </p>

            <p className={styles.body} data-animate>
              I recently completed a{" "}
              <strong>4-week Generative AI internship at SGSU</strong>. Most of
              it I taught myself — and when classmates got stuck after the
              lecturer&apos;s sessions, I was the one explaining it back in
              simpler words.
            </p>

            <p className={styles.body} data-animate>
              Through every phase, one thing has never left: ancient Indian
              literature, mythology and philosophy.
            </p>

            <div className={styles.tabs} data-animate>
              <div className={styles.tabList} role="tablist" aria-label="What defines my work">
                {TABS.map((tab, i) => (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={active === i}
                    className={`${styles.tab} ${active === i ? styles.tabActive : ""}`}
                    onClick={() => setActive(i)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div
                className={styles.panel}
                role="tabpanel"
                ref={panelRef}
                key={TABS[active].id}
              >
                <p className={styles.panelBody}>{TABS[active].body}</p>
                <div className={styles.chipRow}>
                  {TABS[active].chips.map((chip) => (
                    <span className={styles.chip} key={chip}>
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
