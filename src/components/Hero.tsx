"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowRight, Mail } from "lucide-react";
import styles from "./Hero.module.scss";

const ROLES = ["CSE Student", "Web Developer", "Builder"];

function useTypewriter(roles: string[]) {
  const [text, setText] = useState("");
  useEffect(() => {
    let role = 0;
    let char = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const word = roles[role];
      char += deleting ? -1 : 1;
      setText(word.slice(0, char));
      let delay = deleting ? 42 : 88;
      if (!deleting && char === word.length) {
        delay = 1500;
        deleting = true;
      } else if (deleting && char === 0) {
        deleting = false;
        role = (role + 1) % roles.length;
        delay = 350;
      }
      timer = setTimeout(tick, delay);
    };
    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, [roles]);

  return text;
}

/**
 * Hero shell (Part 2) — placeholder only. Left: pill, stacked headline,
 * rotating typewriter role, tagline, two buttons. Right: empty panel where
 * the Part 3 character will mount. GSAP drives the headline entrance
 * (delayed until the preloader has lifted).
 */
export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const role = useTypewriter(ROLES);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline({ delay: 2.05, defaults: { ease: "power3.out" } })
        .from("[data-animate='pill']", { y: 18, opacity: 0, duration: 0.55 })
        .from(
          "[data-animate='line']",
          { y: 56, opacity: 0, duration: 0.8, stagger: 0.13 },
          "-=0.25",
        )
        .from(
          "[data-animate='fade']",
          { y: 22, opacity: 0, duration: 0.6, stagger: 0.1 },
          "-=0.4",
        )
        .from(
          "[data-animate='panel']",
          { opacity: 0, scale: 0.97, duration: 0.8 },
          "-=0.5",
        );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.hero} ref={rootRef}>
      <div className={styles.left}>
        <span className={styles.pill} data-animate="pill">
          Diploma CSE • Builder
        </span>

        <h1 className={styles.headline}>
          <span className={styles.lineWhite} data-animate="line">
            Anurag
          </span>
          <span className={styles.lineBlue} data-animate="line">
            Vishwakarma
          </span>
        </h1>

        <div className={styles.roleLine} data-animate="fade">
          {role}
          <span className={styles.cursor}>|</span>
        </div>

        <p className={styles.tagline} data-animate="fade">
          I build real products while I learn — one live product, shipped from
          Bhopal to the web.
        </p>

        <div className={styles.actions} data-animate="fade">
          <a href="#" className={styles.btnPrimary}>
            View Projects <ArrowRight size={17} strokeWidth={2.2} />
          </a>
          <a href="#" className={styles.btnGhost}>
            <Mail size={17} strokeWidth={2.2} /> Contact
          </a>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.panel} data-animate="panel">
          <span>3D Character — Part 3</span>
        </div>
      </div>
    </section>
  );
}
