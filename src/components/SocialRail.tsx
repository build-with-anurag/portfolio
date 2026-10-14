import { GitHubIcon, LinkedInIcon, MailIcon } from './icons'

const EMAIL = 'anurag.build.official@gmail.com'

/** Floating social rail on the left edge (desktop only, per the design). */
export default function SocialRail() {
  return (
    <div className="rail">
      <a
        href="https://github.com/build-with-anurag"
        target="_blank"
        rel="noopener noreferrer"
        title="GitHub — @build-with-anurag"
      >
        <GitHubIcon />
      </a>
      <a
        href="https://www.linkedin.com/in/anurag-v1241"
        target="_blank"
        rel="noopener noreferrer"
        title="LinkedIn — Anurag Vishwakarma"
      >
        <LinkedInIcon />
      </a>
      <a href={`mailto:${EMAIL}`} title={`Email — ${EMAIL}`}>
        <MailIcon />
      </a>
    </div>
  )
}
