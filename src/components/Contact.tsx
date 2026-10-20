"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowUpRight, Mail } from "lucide-react";
import styles from "./Contact.module.scss";

/**
 * Part 7 — Contact + footer. One clear call to action, three direct
 * channels, and the colophon strip that closes the page.
 */
export default function Contact() {
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
    <>
      <section className={styles.contact} id="contact" ref={rootRef}>
        <h2 className={styles.heading} data-animate="contact-heading">
          Let&apos;s Build <span className={styles.accent}>Something</span>
        </h2>
        <p className={styles.line} data-animate="contact-line">
          Open to internships, freelance builds and collaborations.
        </p>
        <div className={styles.buttons} data-animate="contact-buttons">
          <a
            className={styles.btnPrimary}
            href="mailto:anurag.build.official@gmail.com"
          >
            <Mail size={17} strokeWidth={2.2} /> Email
          </a>
          <a
            className={styles.btnGhost}
            href="https://github.com/build-with-anurag"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub <ArrowUpRight size={16} strokeWidth={2.2} />
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
      </section>

      <footer className={styles.footer}>
        © 2026 Anurag Vishwakarma • anurag.build — Built with Next.js, from
        Bhopal to the web.
      </footer>
    </>
  );
}
