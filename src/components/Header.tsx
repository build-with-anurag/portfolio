import Image from "next/image";
import styles from "./Header.module.scss";

const LINKS = [
  { label: "About", href: "#about" },
  { label: "What I Do", href: "#what-i-do" },
  { label: "Projects", href: "#projects" },
  { label: "Journey", href: "#journey" },
  { label: "Contact", href: "#contact" },
];

/**
 * Header — Sarthak Sharma style floating pill nav: a glassy dark
 * rounded-full bar floating with margin from the top of the viewport.
 * Left: circular cut-out photo + handwritten lowercase wordmark
 * (Vikas Patel style). Right: blue-gradient "Let's talk" pill.
 * The header photo is a placeholder asset (public/header-photo.jpg).
 */
export default function Header() {
  return (
    <div className={styles.wrap}>
      <header className={styles.pill}>
        <a href="#home" className={styles.logo} aria-label="Anurag Vishwakarma — home">
          <Image
            src="/header-photo.jpg"
            alt=""
            width={72}
            height={72}
            className={styles.photo}
            priority
          />
          <span className={styles.wordmark}>anurag</span>
        </a>

        <nav className={styles.nav} aria-label="Primary">
          {LINKS.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <a href="#contact" className={styles.cta}>
          Let&rsquo;s talk
        </a>
      </header>
    </div>
  );
}
