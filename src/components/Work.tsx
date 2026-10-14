import Reveal from './Reveal'
import { ArrowUpRightIcon } from './icons'

const KRISHI_LIVE = 'https://krishi-setu-lovat.vercel.app'
const KRISHI_CODE = 'https://github.com/itsanuragv/krishi-setu'

export default function Work() {
  return (
    <section id="work" className="site-section">
      <Reveal>
        <p className="eyebrow">Featured Work</p>
        <h2 className="section-h2">
          One real product.
          <br />
          Shipped and live.
        </h2>
        <p className="section-sub">
          Everything else I have built is practice. This one is not — it is a working
          marketplace, built end-to-end and deployed.
        </p>
      </Reveal>

      <Reveal>
        <article className="live-card">
          <div>
            <span className="badge-live">
              <span className="dot" />
              Live
            </span>
            <h3>Krishi Setu</h3>
            <p className="tagline">AGRICULTURAL MARKETPLACE · TEAM KRISHI MITRA</p>
            <p className="desc">
              A marketplace that connects farmers directly with buyers. Payments stay in{' '}
              <strong>escrow</strong> and are released only when the buyer confirms handover
              with a <strong>4-digit PIN</strong>. An <strong>OpenCV quality pre-check</strong>{' '}
              grades produce before listing, discovery is{' '}
              <strong>hyperlocal — under 25&nbsp;km</strong>, and the whole experience works by{' '}
              <strong>voice in Hindi and English</strong>.
            </p>
            <div className="chips">
              <span className="chip">Next.js 15</span>
              <span className="chip">TypeScript</span>
              <span className="chip">Tailwind CSS</span>
            </div>
            <div className="card-links">
              <a href={KRISHI_LIVE} target="_blank" rel="noopener noreferrer">
                Live Site
                <ArrowUpRightIcon />
              </a>
              <a className="code" href={KRISHI_CODE} target="_blank" rel="noopener noreferrer">
                View Code
                <ArrowUpRightIcon />
              </a>
            </div>
          </div>

          <div>
            <div className="shot-frame">
              <div className="shot-bar" aria-hidden="true">
                <i />
                <i />
                <i />
                <span className="url">krishi-setu-lovat.vercel.app</span>
              </div>
              <img
                src="/images/krishi-setu.png"
                alt="Krishi Setu — live agricultural marketplace homepage"
                width={2880}
                height={1800}
                loading="lazy"
              />
            </div>
            <p className="shot-note">{"// real screenshot — the live production site"}</p>
          </div>
        </article>
      </Reveal>

      <div className="practice-grid">
        <Reveal>
          <article className="practice-card">
            <span className="badge-practice">Practice Build</span>
            <h3>ShopMart — E-Commerce UI</h3>
            <p>
              A front-end storefront built to practise component structure, state, and cart
              flows. A learning build — not a live product.
            </p>
            <div className="chips">
              <span className="chip">React</span>
              <span className="chip">Node.js</span>
              <span className="chip">Tailwind CSS</span>
            </div>
          </article>
        </Reveal>
        <Reveal delay={0.08}>
          <article className="practice-card">
            <span className="badge-practice">Practice Build</span>
            <h3>3D Interactive Portfolio</h3>
            <p>
              An experiment with real-time 3D on the web — scenes, lighting, and scroll-driven
              camera work. Built to learn, kept as a playground.
            </p>
            <div className="chips">
              <span className="chip">React</span>
              <span className="chip">Three.js</span>
              <span className="chip">WebGL</span>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  )
}
