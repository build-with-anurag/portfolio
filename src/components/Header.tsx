import styles from "./Header.module.scss";

const LINKS = ["Home", "About", "Projects", "Journey", "Contact"];

/**
 * Header — dark bar. Logo is a handwritten/script wordmark (lowercase,
 * white, thin underline swoosh), Vikas Patel style. Nav links are
 * placeholders until the content sections land in later parts.
 */
export default function Header() {
  return (
    <header className={styles.header}>
      <a href="#" className={styles.logo} aria-label="Anurag Vishwakarma — home">
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

      <nav className={styles.nav}>
        {LINKS.map((link, i) => (
          <a
            key={link}
            href="#"
            className={i === 0 ? styles.active : undefined}
          >
            {link}
          </a>
        ))}
      </nav>
    </header>
  );
}
