"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ChevronDown } from "lucide-react";
import DotWaves from "./DotWaves";
import styles from "./Hero.module.scss";

gsap.registerPlugin(ScrollTrigger);

const ROLES = ["CSE Student", "Web Developer", "Systems Explorer", "Builder"];

const STATS = [
  { value: "1", label: "Live Prototype — Krishi Setu" },
  { value: "36", label: "Pages Shipped" },
  { value: "3", label: "Linux Distros Run" },
];

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
 * Hero (v3) — Sarthak Sharma composition: a large central portrait whose
 * edges melt into the near-black background, dotted particle waves flowing
 * behind it, and the giant Fraunces name overlapping the portrait's lower
 * third. Vikas-style floating glass stat cards sit around the portrait.
 * On desktop the hero is pinned for +100% scroll (GSAP ScrollTrigger,
 * synced with Lenis in SmoothScroll): the name lifts away, the portrait
 * settles back, and the foreground copy fades as the next section arrives.
 */
export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const role = useTypewriter(ROLES);

  // Entrance choreography — starts as the preloader lifts (~2s mark).
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline({ delay: 2.0, defaults: { ease: "power3.out" } })
        .from("[data-animate='label']", {
          opacity: 0,
          y: 10,
          duration: 0.6,
          stagger: 0.08,
        })
        .from(
          "[data-animate='portrait']",
          { opacity: 0, scale: 1.05, y: 26, duration: 1.1 },
          "-=0.35",
        )
        .from(
          "[data-animate='line']",
          { yPercent: 55, opacity: 0, duration: 0.85, stagger: 0.14 },
          "-=0.65",
        )
        .from(
          "[data-animate='card']",
          { opacity: 0, y: 18, scale: 0.94, duration: 0.6, stagger: 0.12 },
          "-=0.45",
        )
        .from(
          "[data-animate='fade']",
          { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 },
          "-=0.35",
        );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  // Pinned scroll choreography — desktop only, and never for reduced motion.
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      "(min-width: 881px) and (prefers-reduced-motion: no-preference)",
      () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",
            end: "+=100%",
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
          },
        });
        tl.to("[data-scrub='name']", { y: -84, opacity: 0 }, 0)
          .to("[data-scrub='fg']", { y: -44, opacity: 0 }, 0)
          .to("[data-scrub='cards']", { opacity: 0 }, 0)
          .to("[data-scrub='labels']", { opacity: 0 }, 0)
          .to("[data-scrub='portrait']", { scale: 0.9, y: 26 }, 0)
          .to("[data-scrub='waves']", { opacity: 0.25 }, 0);
      },
    );
    return () => mm.revert();
  }, []);

  return (
    <section className={styles.hero} id="home" ref={rootRef}>
      <div className={styles.waves} data-scrub="waves">
        <DotWaves className={styles.wavesCanvas} />
      </div>

      <div data-scrub="labels">
        <span
          className={`${styles.label} ${styles.labelTL}`}
          data-animate="label"
        >
          CSE Student. Builder.
        </span>
        <span
          className={`${styles.label} ${styles.labelTR}`}
          data-animate="label"
        >
          Based in Bhopal — Building for the web
        </span>
        <a
          className={`${styles.label} ${styles.labelBL}`}
          data-animate="label"
          href="#about"
          aria-label="Scroll down to the About section"
        >
          Scroll to discover
          <ChevronDown size={14} strokeWidth={2.2} aria-hidden="true" />
        </a>
      </div>

      <div className={styles.stage}>
        <div className={styles.portraitWrap} data-scrub="portrait">
          <div className={styles.halo} aria-hidden="true" />
          <div className={styles.portrait} data-animate="portrait">
            <Image
              src="/hero-photo.jpg"
              alt="Portrait of Anurag Vishwakarma"
              fill
              priority
              sizes="(max-width: 880px) 72vw, 420px"
              className={styles.portraitImg}
            />
            <div className={styles.portraitSeat} aria-hidden="true" />
          </div>
        </div>

        <div className={styles.cards} data-scrub="cards">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`${styles.card} ${styles[`card${i + 1}`]}`}
              data-animate="card"
            >
              <div className={styles.cardInner}>
                <span className={styles.cardValue}>{stat.value}</span>
                <span className={styles.cardLabel}>{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.nameWrap} data-scrub="name">
          <h1 className={styles.name}>
            <span className={styles.nameLine} data-animate="line">
              Anurag
            </span>
            <span
              className={`${styles.nameLine} ${styles.nameItalic}`}
              data-animate="line"
            >
              Vishwakarma
            </span>
          </h1>
        </div>

        <div className={styles.fg} data-scrub="fg">
          <div className={styles.roleLine} data-animate="fade">
            {role}
            <span className={styles.cursor}>|</span>
          </div>

          <p className={styles.tagline} data-animate="fade">
            CSE student. Builder. One live prototype at a time.
          </p>

          <div className={styles.actions} data-animate="fade">
            <a href="#projects" className={styles.btnPrimary}>
              Explore my work <ArrowRight size={17} strokeWidth={2.2} />
            </a>
            <a href="#contact" className={styles.btnGhost}>
              Start a conversation
            </a>
          </div>
        </div>

        <div className={styles.cardsMobile}>
          {STATS.map((stat) => (
            <div key={stat.label} className={styles.cardMobile}>
              <span className={styles.cardValue}>{stat.value}</span>
              <span className={styles.cardLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
