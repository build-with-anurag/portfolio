"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowUpRight, Mail } from "lucide-react";
import styles from "./Contact.module.scss";

/**
 * Part 6 (v3) — Contact. Giant Fraunces headline at Vikas/Rajesh scale,
 * one honest sub-line, and two clear channels: email and LinkedIn.
 * No phone number, no form — the gated contact form comes later.
 */
export default function Contact() {
  const rootRef = useRef<HTMLElement>(null);

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
      { threshold: 0.15 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  return (
    <section className={styles.section} id="contact" ref={rootRef}>
      <div className={styles.inner}>
        <p className={styles.eyebrow} data-animate="contact-eyebrow">
          <span className={styles.num}>07</span> / Contact
        </p>
        <h2 className={styles.heading} data-animate="contact-heading">
          Let&rsquo;s build something <span className={styles.accent}>real.</span>
        </h2>
        <p className={styles.line} data-animate="contact-line">
          A third-semester CSE diploma student — open to internships,
          freelance builds and interesting collaborations.
        </p>
        <div className={styles.buttons} data-animate="contact-buttons">
          <a
            className={styles.btnPrimary}
            href="mailto:anurag.build.official@gmail.com"
          >
            <Mail size={17} strokeWidth={2.2} /> Email me
          </a>
          <a
            className={styles.btnGhost}
            href="https://www.linkedin.com/in/anurag-v1241"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn <ArrowUpRight size={16} strokeWidth={2.2} />
          </a>
        </div>
        <p className={styles.address} data-animate="contact-address">
          <a href="mailto:anurag.build.official@gmail.com">
            anurag.build.official@gmail.com
          </a>
        </p>
      </div>
    </section>
  );
}
