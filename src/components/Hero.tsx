"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown, FileText, Terminal, TrendingUp } from "lucide-react";
import DotWaves from "./DotWaves";
import styles from "./Hero.module.scss";

gsap.registerPlugin(ScrollTrigger);

const ROLES = ["CSE Student", "Web Developer", "Systems Explorer", "Builder"];

const STATS = [
  { value: "1", label: "Live Prototype — Krishi Setu" },
  { value: "36", label: "Pages Shipped" },
  { value: "3", label: "Linux Distros Run" },
];

/** Floating chips stacked along the portrait's right side (concept mock). */
const CHIPS = [
  { text: "1 Live Prototype", Icon: TrendingUp },
  { text: "36 Pages Shipped", Icon: FileText },
  { text: "3 Linux Distros", Icon: Terminal },
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
 * EdgeDissolve — Sarthak-style particle dissolve along the portrait's inner
 * (left) edge, as in the approved concept mock: a deterministic field of
 * glowing blue/gold dots (seeded hash, no runtime randomness) that pools
 * along the portrait's lower-left, where the photo melts into the page, and
 * thins out to almost nothing above chin level so the face stays clean.
 * Dots grow larger, denser and brighter towards the photo. The scrub
 * timeline drifts and fades the whole field as the hero scrolls away.
 */
function EdgeDissolve({ className }: { className?: string }) {
  const dots = useMemo(() => {
    const out: { cx: number; cy: number; r: number; o: number; fill: string }[] =
      [];
    const COLS = 20;
    const ROWS = 46;
    const hash = (i: number, j: number, k = 0) => {
      const s = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453;
      return s - Math.floor(s);
    };
    for (let i = 0; i < COLS; i++) {
      const t = i / (COLS - 1); // 0 = far from the photo, 1 = at its edge
      for (let j = 0; j < ROWS; j++) {
        const cy = j * 17.5 + (i % 2) * 8.75 + (hash(i + 40, j) - 0.5) * 5;
        const yFrac = cy / 800;
        const yFactor =
          yFrac < 0.3
            ? 0.22
            : yFrac < 0.52
              ? 0.22 + 0.78 * ((yFrac - 0.3) / 0.22)
              : 1;
        const keep = (0.22 + 0.78 * t) * yFactor;
        if (hash(i, j) > keep) continue;
        const sparkle = hash(i, j, 7) > 0.93;
        out.push({
          cx: 8 + i * 15.5 + (hash(j, i) - 0.5) * 6,
          cy,
          r:
            (0.6 + Math.pow(t, 1.4) * 2.1 + (hash(i, j, 3) - 0.5) * 0.7) *
            (sparkle ? 1.9 : 1),
          o: 0.2 + 0.8 * t * (0.45 + 0.55 * hash(i, j, 5)),
          fill:
            hash(i, j, 9) < 0.38
              ? "#f5b301"
              : hash(i, j, 11) < 0.12
                ? "#e8e3d3"
                : "#60a5fa",
        });
      }
    }
    return out;
  }, []);

  return (
    <svg
      className={className}
      viewBox="0 0 320 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {dots.map((d, k) => (
        <circle key={k} cx={d.cx} cy={d.cy} r={d.r} fill={d.fill} opacity={d.o} />
      ))}
    </svg>
  );
}

/**
 * Hero (v3, spread redesign) — Antigravity/Folioblox-style spread layout
 * matching the approved concept mock: giant Fraunces name on the left with
 * the tagline as a sub-line under it, a large portrait anchored right whose
 * grey studio backdrop melts into the page (masked edges + a glowing
 * particle dissolve along its inner edge), and glass stat chips stacked
 * down the portrait's right side over the background. The dotted waves live
 * behind the portrait zone. On desktop the hero stays pinned for +100%
 * scroll (GSAP ScrollTrigger, Lenis-synced): the copy slides out left, the
 * chips scatter, the dots drift, and the portrait slowly zooms and melts
 * away last. Mobile stacks portrait-first with no pin.
 */
export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const role = useTypewriter(ROLES);

  // Entrance choreography — starts as the preloader lifts (~2s mark).
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline({ delay: 2.0, defaults: { ease: "power3.out" } })
        .from("[data-animate='portrait']", {
          opacity: 0,
          scale: 1.05,
          duration: 1.1,
        })
        .from(
          "[data-animate='line']",
          { yPercent: 55, opacity: 0, duration: 0.85, stagger: 0.14 },
          "-=0.6",
        )
        .from(
          "[data-animate='fade']",
          { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 },
          "-=0.45",
        )
        .from(
          "[data-animate='chip']",
          { opacity: 0, y: 16, scale: 0.94, duration: 0.55, stagger: 0.12 },
          "-=0.4",
        )
        .from(
          "[data-animate='label']",
          { opacity: 0, y: 10, duration: 0.55, stagger: 0.08 },
          "-=0.4",
        );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  // Pinned scroll choreography — desktop only, never for reduced motion.
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        const chips = gsap.utils.toArray<HTMLElement>(
          "[data-scrub='chip']",
          rootRef.current ?? undefined,
        );
        const scatter = [
          { x: 44, y: -26 },
          { x: 58, y: 0 },
          { x: 44, y: 30 },
        ];
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
        tl.to("[data-scrub='copy']", { x: -72, opacity: 0, duration: 1 }, 0)
          .to("[data-scrub='labels']", { opacity: 0, duration: 1 }, 0)
          .to("[data-scrub='waves']", { x: 34, opacity: 0.3, duration: 1 }, 0)
          .to(
            "[data-scrub='dissolve']",
            { x: -16, opacity: 0.25, duration: 1 },
            0,
          )
          .to(
            "[data-scrub='portrait']",
            {
              scale: 1.06,
              transformOrigin: "62% 55%",
              duration: 1,
            },
            0,
          )
          .to("[data-scrub='portrait']", { opacity: 0.22, duration: 0.42 }, 0.58);
        chips.forEach((chip, i) => {
          const dir = scatter[i % scatter.length];
          tl.to(
            chip,
            { x: dir.x, y: dir.y, opacity: 0, duration: 1 },
            0,
          );
        });
      },
    );
    return () => mm.revert();
  }, []);

  return (
    <section className={styles.hero} id="home" ref={rootRef}>
      <div className={styles.waves} data-scrub="waves">
        <DotWaves className={styles.wavesCanvas} />
      </div>

      <div className={styles.stage}>
        <div className={styles.copy} data-scrub="copy">
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

          <p className={styles.tagline} data-animate="fade">
            CSE student. Builder. One live prototype at a time.
          </p>

          <p className={styles.availability} data-animate="fade">
            <span className={styles.availDot} aria-hidden="true" />
            Open to internships
          </p>

          <div className={styles.roleLine} data-animate="fade">
            {role}
            <span className={styles.cursor}>|</span>
          </div>

          <div className={styles.actions} data-animate="fade">
            <a href="#projects" className={styles.btnPrimary}>
              View Projects
            </a>
            <a href="#contact" className={styles.btnGhost}>
              Let&apos;s Talk
            </a>
          </div>

          <div className={styles.chipsMobile}>
            {STATS.map((stat) => (
              <div key={stat.label} className={styles.chipMobile}>
                <span className={styles.chipValue}>{stat.value}</span>
                <span className={styles.chipLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.portraitZone}>
          <div className={styles.portraitWrap} data-scrub="portrait">
            <div className={styles.halo} aria-hidden="true" />
            <div className={styles.meltX}>
              <div className={styles.meltY} data-animate="portrait">
                <Image
                  src="/hero-photo.webp"
                  alt="Portrait of Anurag Vishwakarma"
                  fill
                  priority
                  fetchPriority="high"
                  sizes="(max-width: 1023px) 100vw, 40vw"
                  className={styles.portraitImg}
                />
              </div>
            </div>

            <div className={styles.dissolve} data-scrub="dissolve">
              <EdgeDissolve className={styles.dissolveSvg} />
            </div>
          </div>

          {CHIPS.map((chip, i) => (
            <div
              key={chip.text}
              className={`${styles.chip} ${styles[`chip${i + 1}`]}`}
              data-scrub="chip"
            >
              <div className={styles.chipIn} data-animate="chip">
                <div className={styles.chipCard}>
                  <chip.Icon
                    size={16}
                    strokeWidth={2.2}
                    className={styles.chipIcon}
                    aria-hidden="true"
                  />
                  <span className={styles.chipText}>{chip.text}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div data-scrub="labels">
        <span
          className={`${styles.label} ${styles.labelBL}`}
          data-animate="label"
        >
          Portfolio © 2026
        </span>
        <a
          className={`${styles.label} ${styles.labelCue}`}
          data-animate="label"
          href="#about"
          aria-label="Scroll down to the About section"
        >
          Scroll to explore
          <ChevronDown size={14} strokeWidth={2.2} aria-hidden="true" />
        </a>
        <span
          className={`${styles.label} ${styles.labelBR}`}
          data-animate="label"
        >
          Based in Bhopal, India
        </span>
      </div>
    </section>
  );
}
