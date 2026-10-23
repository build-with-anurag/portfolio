import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import styles from "./Footer.module.scss";

// Brand icons as inline SVGs (same pattern as SocialRail —
// lucide-react no longer ships brand icons).
function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const SOCIALS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/anurag-v1241", Icon: LinkedInIcon },
  { label: "GitHub", href: "https://github.com/build-with-anurag", Icon: GitHubIcon },
  { label: "Instagram", href: "https://www.instagram.com/iam.anuragv", Icon: InstagramIcon },
];

const EXPLORE = [
  { label: "About", href: "#about" },
  { label: "What I Do", href: "#what-i-do" },
  { label: "Projects", href: "#projects" },
  { label: "Journey", href: "#journey" },
  { label: "Contact", href: "#contact" },
];

const PROJECT_LINKS = [
  { label: "Krishi Setu — Live", href: "https://krishi-setu-lovat.vercel.app" },
  { label: "Krishi Setu — Code", href: "https://github.com/itsanuragv/krishi-setu" },
  { label: "This Portfolio — Code", href: "https://github.com/build-with-anurag/portfolio" },
];

/**
 * Part 6 (v3) — Footer. Four columns on a slightly lifted ground:
 * brand, explore, projects, contact — closed by a colophon bar.
 * No phone number anywhere, by design.
 */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <a href="#home" className={styles.logo} aria-label="Anurag Vishwakarma — home">
              <Image
                src="/header-photo.webp"
                alt=""
                width={72}
                height={72}
                className={styles.photo}
              />
              <span className={styles.wordmark}>anurag</span>
            </a>
            <p className={styles.tagline}>
              CSE student. Builder. One live prototype at a time.
            </p>
            <div className={styles.socials}>
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialBtn}
                  aria-label={label}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <nav className={styles.col} aria-label="Explore">
            <h3 className={styles.colTitle}>Explore</h3>
            <ul className={styles.links}>
              {EXPLORE.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.col}>
            <h3 className={styles.colTitle}>Projects</h3>
            <ul className={styles.links}>
              {PROJECT_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    {link.label} <ArrowUpRight size={13} strokeWidth={2.2} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.col}>
            <h3 className={styles.colTitle}>Contact</h3>
            <ul className={styles.links}>
              <li className={styles.plain}>Bhopal, Madhya Pradesh, India</li>
              <li>
                <a href="mailto:anurag.build.official@gmail.com">
                  anurag.build.official@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/anurag-v1241"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn <ArrowUpRight size={13} strokeWidth={2.2} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <span>© 2026 Anurag Vishwakarma</span>
          <span>Designed &amp; built by Anurag — Next.js · GSAP · Three.js</span>
        </div>
      </div>
    </footer>
  );
}
