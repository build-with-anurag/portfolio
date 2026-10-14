import Reveal from './Reveal'
import { DownloadIcon } from './icons'

const EMAIL = 'anurag.build.official@gmail.com'

export default function Contact() {
  return (
    <section id="contact" className="site-section">
      <Reveal>
        <div className="contact-box">
          <h2>
            Let&apos;s build
            <br />
            something real.
          </h2>
          <p>
            I&apos;m looking for internships and real projects to work on. If you have one — or
            just want to talk systems, Linux, or Android — my inbox is open.
          </p>
          <div className="cta-row">
            <a className="btn btn-solid" href={`mailto:${EMAIL}`}>
              {EMAIL}
            </a>
            <a
              className="btn btn-ghost"
              href="https://github.com/build-with-anurag"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub — @build-with-anurag
            </a>
            <a
              className="btn btn-ghost"
              href="https://www.linkedin.com/in/anurag-v1241"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <a
              className="btn btn-ghost"
              href="/resume.pdf"
              download="Anurag-Vishwakarma-Resume.pdf"
            >
              <DownloadIcon />
              Download Résumé
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
