"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ArrowUpRight, Code } from "lucide-react";
import styles from "./Projects.module.scss";

function useReveal(rootRef: React.RefObject<HTMLElement | null>) {
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
      { threshold: 0.1 },
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

const FEATURES = [
  "Escrow-style payment release with a 4-digit handover PIN",
  "OpenCV quality pre-check",
  "5-factor match score",
  "Hyperlocal discovery under 25 km",
  "Hindi / English voice UX",
];

const ROWS = [
  {
    index: "02",
    title: "ShopMart",
    desc: "An e-commerce practice build in React — product listing, cart and checkout flows, made while learning by building.",
    chips: ["React", "JavaScript"],
    tag: null as string | null,
    link: null as { href: string; label: string } | null,
  },
  {
    index: "03",
    title: "Tech Brief Automation",
    desc: "My own early system: Python turned tech news into a daily Word file in a Drive folder — the ancestor of the daily systems I run now.",
    chips: ["Python", "Google Drive"],
    tag: "Personal system",
    link: null,
  },
  {
    index: "04",
    title: "This Portfolio",
    desc: "The site you are reading — designed and built end to end, with a pinned hero, physics tech stack and scroll-driven journey.",
    chips: ["Next.js", "SCSS", "GSAP", "Three.js"],
    tag: null,
    link: {
      href: "https://github.com/build-with-anurag/portfolio",
      label: "Code",
    },
  },
];

/**
 * Part 5 (v3) — Projects, Sharma editorial: Krishi Setu leads as a large
 * featured block with its real live-site screenshot and the LIVE
 * PROTOTYPE badge; the remaining work follows as numbered editorial
 * rows. Krishi Setu is framed everywhere as a live prototype — never
 * as a product in real use.
 */
export default function Projects() {
  const rootRef = useRef<HTMLElement>(null);
  useReveal(rootRef);

  return (
    <section className={styles.section} id="projects" ref={rootRef}>
      <div className={styles.inner}>
        <p className={styles.eyebrow} data-animate>
          <span className={styles.num}>04 /</span> Projects
        </p>
        <h2 className={styles.heading} data-animate>
          Work that is <span className={styles.accent}>live,</span> not just
          listed.
        </h2>

        {/* Featured — Krishi Setu */}
        <article className={styles.featured} data-animate>
          <div className={styles.shotWrap}>
            <div className={styles.browserBar} aria-hidden="true">
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.urlPill}>
                krishi-setu-lovat.vercel.app
              </span>
            </div>
            <Image
              className={styles.shot}
              src="/projects/krishi-setu.png"
              alt="Krishi Setu — the live agricultural marketplace prototype homepage"
              width={2880}
              height={1800}
              sizes="(max-width: 960px) 100vw, 560px"
            />
          </div>

          <div className={styles.featuredMain}>
            <p className={styles.featuredEyebrow}>
              Featured · Smart India Hackathon Build
            </p>
            <h3 className={styles.featuredTitle}>Krishi Setu</h3>
            <span className={styles.badge}>
              <span className={styles.badgeDot} aria-hidden="true" />
              Live Prototype
            </span>
            <p className={styles.featuredDesc}>
              An agricultural marketplace prototype connecting farmers and
              buyers directly — built with team Krishi Mitra for Smart India
              Hackathon (problem statement SIH26033). The frontend is
              complete and the prototype is live on the web.
            </p>
            <ul className={styles.features}>
              {FEATURES.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <Chips items={["Next.js 15", "TypeScript", "MSW"]} />
            <div className={styles.links}>
              <a
                className={styles.btnPrimary}
                href="https://krishi-setu-lovat.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit live site <ArrowUpRight size={16} strokeWidth={2.2} />
              </a>
              <a
                className={styles.btnGhost}
                href="https://github.com/itsanuragv/krishi-setu"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Code size={16} strokeWidth={2.2} /> View code{" "}
                <ArrowUpRight size={15} strokeWidth={2.2} />
              </a>
            </div>
          </div>
        </article>

        {/* Editorial rows */}
        <div className={styles.rows}>
          {ROWS.map((row) => (
            <article className={styles.row} key={row.index} data-animate>
              <span className={styles.rowIndex} aria-hidden="true">
                {row.index}
              </span>
              <div className={styles.rowMain}>
                <h3 className={styles.rowTitle}>
                  {row.title}
                  {row.tag && <span className={styles.rowTag}>{row.tag}</span>}
                </h3>
                <p className={styles.rowDesc}>{row.desc}</p>
              </div>
              <Chips items={row.chips} />
              {row.link ? (
                <a
                  className={styles.rowLink}
                  href={row.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${row.title} — ${row.link.label}`}
                >
                  {row.link.label}{" "}
                  <ArrowUpRight size={16} strokeWidth={2.2} />
                </a>
              ) : (
                <span className={styles.rowLinkSpacer} aria-hidden="true" />
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
