"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Journey.module.scss";

gsap.registerPlugin(ScrollTrigger);

const MILESTONES = [
  {
    title: "The Fix-It Kid",
    text: "The kid his family and neighbours called whenever a phone's settings broke — and he still gets those calls.",
  },
  {
    title: "A Borrowed Laptop",
    text: "Lockdown, class 6: online classes on his elder brother's old Lenovo, running Windows 7 Ultimate. Customising that machine hooked him, and gave him his first surface-level encounter with coding.",
  },
  {
    title: "Python, Then a Laptop of My Own",
    text: "Class 8 summer: he started Python, changed coaching and scored 89%. His father bought him a laptop of his own on 31 May 2023 — the same machine he uses today — and he took his Python to about 90% through one-shot tutorials.",
  },
  {
    title: "My Own Way",
    text: "Class 10: he refused coaching — “only rote learning there” — studied his own way and scored 82.2%. Then he took the last seat in Diploma CSE in the CLC counselling round.",
  },
  {
    title: "Going Deep on Systems",
    text: "The diploma years: Garuda → Ubuntu → Fedora → Arch Linux, vanilla with Hyprland. Before the diploma even began, he had corrupted Windows three times — and reinstalled it himself, every time.",
  },
  {
    title: "The Internship That Taught Me to Teach Myself",
    text: "A four-week Generative AI internship at SGSU where little was actually taught — so he finished a LinkedIn Learning GenAI course himself, and explained the concepts to classmates after the lecturer left.",
  },
  {
    title: "Krishi Setu",
    text: "For Smart India Hackathon, he joined team Krishi Mitra and shipped a 36-page agricultural-marketplace prototype — live on the web.",
  },
  {
    title: "Today",
    text: "Third-semester Diploma CSE: building products, running his daily automations, and going deeper on AI and systems.",
  },
];

/**
 * Part 5 (v3) — Journey. A vertical timeline whose centre line fills
 * with a blue→gold gradient as the reader scrolls (GSAP ScrollTrigger
 * scrub); each milestone node lights up when the fill reaches it.
 * Copy is his own story, told plainly — no embellishment.
 * prefers-reduced-motion: the line renders fully lit, statically.
 */
export default function Journey() {
  const rootRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLOListElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  // Entrance reveal for the section header (site pattern).
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

  // Glowing progress line + node lighting.
  useEffect(() => {
    const timeline = timelineRef.current;
    const fill = fillRef.current;
    if (!timeline || !fill) return;

    const items = Array.from(
      timeline.querySelectorAll<HTMLElement>("[data-milestone]"),
    );

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(fill, { scaleY: 1 });
      items.forEach((item) => item.classList.add(styles.lit));
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(fill, { scaleY: 0 });
      gsap.to(fill, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: timeline,
          start: "top 68%",
          end: "bottom 60%",
          scrub: 0.4,
        },
      });
      items.forEach((item) => {
        // Sticky lighting: once the fill line passes a milestone it
        // stays lit; it only un-lights when scrolled back above it.
        ScrollTrigger.create({
          trigger: item,
          start: "top 64%",
          onEnter: () => item.classList.add(styles.lit),
          onLeaveBack: () => item.classList.remove(styles.lit),
        });
      });
    }, timeline);

    return () => {
      items.forEach((item) => item.classList.remove(styles.lit));
      ctx.revert();
    };
  }, []);

  return (
    <section className={styles.section} id="journey" ref={rootRef}>
      <div className={styles.inner}>
        <p className={styles.eyebrow} data-animate>
          <span className={styles.num}>05 /</span> Journey
        </p>
        <h2 className={styles.heading} data-animate>
          How a fix-it kid became a{" "}
          <span className={styles.accent}>builder.</span>
        </h2>

        <ol className={styles.timeline} ref={timelineRef}>
          <div className={styles.track} aria-hidden="true">
            <div className={styles.fill} ref={fillRef} />
          </div>
          {MILESTONES.map((m, i) => (
            <li
              className={`${styles.item} ${
                i % 2 === 0 ? styles.itemLeft : styles.itemRight
              }`}
              key={m.title}
              data-milestone
            >
              <span className={styles.node} aria-hidden="true" />
              <article className={styles.card}>
                <span className={styles.cardIndex}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className={styles.cardTitle}>{m.title}</h3>
                <p className={styles.cardText}>{m.text}</p>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
