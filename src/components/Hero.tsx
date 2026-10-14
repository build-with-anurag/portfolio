import { Suspense, lazy, useEffect, useState } from 'react'
import Reveal from './Reveal'
import Typewriter from './Typewriter'
import CountUp from './CountUp'
import { ArrowDownIcon, DownloadIcon } from './icons'

// The 3D hero character is a lazy chunk (three.js + model) that is only
// ever requested on desktop viewports — see Character3D.tsx.
const Character3D = lazy(() => import('./Character3D'))

function useDesktopViewport(): boolean {
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return isDesktop
}

// Hovering a primary CTA makes the character react (ThumbsUp / Yes) —
// Character3D listens for this event and degrades silently if unmounted.
function ctaGesture() {
  window.dispatchEvent(new CustomEvent('character:gesture', { detail: 'approve' }))
}

const STATS: Array<{ value: number; label: string }> = [
  { value: 1, label: 'Live Product' },
  { value: 36, label: 'Pages Shipped' },
  { value: 3, label: 'Linux Distros Hands-On' },
  { value: 1, label: 'Workshop Led' },
]

export default function Hero() {
  const isDesktop = useDesktopViewport()
  return (
    <header className="hero">
      <div className="hero-grid" aria-hidden="true" />
      {isDesktop && (
        <div className="hero-character" aria-hidden="true">
          <Suspense fallback={null}>
            <Character3D />
          </Suspense>
        </div>
      )}
      <Reveal>
        <div className="flex items-center gap-3.5">
          {/* Small circular avatar only — the source photo is 150×150 and
              would pixelate at hero size. A larger photo will replace it later. */}
          <img
            className="hero-avatar"
            src="/avatar.jpg"
            alt="Anurag Vishwakarma"
            width={46}
            height={46}
          />
          <p className="font-mono text-[12.5px] tracking-[0.22em] uppercase text-accent">
            Anurag Vishwakarma — Bhopal, India
          </p>
        </div>
      </Reveal>

      <h1>
        I build <span className="accent">systems</span> that solve real problems.
      </h1>

      <div className="role-line">
        <span className="prompt">&gt;</span>
        <Typewriter />
        <span className="caret" aria-hidden="true" />
      </div>

      <p className="lede">
        Diploma CSE student who ships real products — not demos. My marketplace for farmers is
        live, with escrow payments, quality checks, and a Hindi-first voice experience.
      </p>

      <div className="cta-row">
        <a className="btn btn-solid" href="#work" onMouseEnter={ctaGesture}>
          See My Work
          <ArrowDownIcon />
        </a>
        <a className="btn btn-ghost" href="#contact">
          Get in Touch
        </a>
        <a
          className="btn btn-ghost"
          href="/resume.pdf"
          download="Anurag-Vishwakarma-Resume.pdf"
          onMouseEnter={ctaGesture}
        >
          <DownloadIcon />
          Download Résumé
        </a>
      </div>

      <div className="stat-strip">
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.08}>
            <div className="stat">
              <div className="num">
                <CountUp target={stat.value} />
              </div>
              <div className="lbl">{stat.label}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </header>
  )
}
