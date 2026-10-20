"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ArrowRight, ChevronDown, Mail } from "lucide-react";
import styles from "./Hero.module.scss";

// Part 3: the 3D character scene is client-only (three.js / WebGL).
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

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
 * Hero. Left: pill, stacked headline, rotating typewriter role, tagline,
 * two buttons. Right: the live Part 3 character scene (Argon's Character3D,
 * mounted client-only via HeroScene). GSAP drives the headline entrance
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
    <section className={styles.hero} id="home" ref={rootRef}>
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
          <a href="#projects" className={styles.btnPrimary}>
            View Projects <ArrowRight size={17} strokeWidth={2.2} />
          </a>
          <a href="#contact" className={styles.btnGhost}>
            <Mail size={17} strokeWidth={2.2} /> Contact
          </a>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.stage} data-animate="panel">
          <HeroScene />
        </div>
      </div>

      <a
        className={styles.scrollCue}
        href="#about"
        aria-label="Scroll down to the About section"
      >
        <span>Scroll to explore</span>
        <ChevronDown size={15} strokeWidth={2.2} aria-hidden="true" />
      </a>
    </section>
  );
}
