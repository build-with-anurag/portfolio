import { ArrowUpRight } from "lucide-react";
import styles from "./ResumeCorner.module.scss";

/**
 * Fixed RESUME corner element (Rajesh-style detail picked up in the
 * Part 8 reference comparison): a small pill pinned to the bottom-right
 * that opens the résumé PDF in a new tab. The PDF is Anurag's own asset,
 * carried over from the previous site (it excludes phone number and
 * date of birth by design).
 */
export default function ResumeCorner() {
  return (
    <a
      className={styles.corner}
      href="/resume.pdf"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open Anurag's résumé (PDF, opens in a new tab)"
    >
      <span>Resume</span>
      <ArrowUpRight size={14} strokeWidth={2.4} aria-hidden="true" />
    </a>
  );
}
