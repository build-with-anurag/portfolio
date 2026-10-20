import styles from "./Header.module.scss";

const LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Journey", href: "#journey" },
  { label: "Contact", href: "#contact" },
];

/**
 * Header — dark bar. Logo is a handwritten/script wordmark (lowercase,
 * white, thin underline swoosh), Vikas Patel style. Nav anchors jump to
 * the page sections (Lenis smooth-scrolls the native anchor jump).
 */
export default function Header() {
  return (
    <header className={styles.header}>
      <a href="#home" className={styles.logo} aria-label="Anurag Vishwakarma — home">
        <span className={styles.wordmark}>anurag vishwakarma</span>
        <svg
          className={styles.swoosh}
          viewBox="0 0 220 12"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M3 8 C 60 2, 150 2, 217 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </a>

      <nav className={styles.nav} aria-label="Primary">
        {LINKS.map((link, i) => (
          <a
            key={link.label}
            href={link.href}
            className={i === 0 ? styles.active : undefined}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
