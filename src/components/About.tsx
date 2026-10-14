import Reveal from './Reveal'

export default function About() {
  return (
    <section id="about" className="site-section">
      <Reveal>
        <p className="eyebrow">About</p>
        <p className="about-text">
          I&apos;m a CSE diploma student from Bhopal who would rather{' '}
          <span className="hl">ship one real product</span> than collect ten certificates.
          I&apos;ve been learning in public since my teens — taking Linux and Android apart to
          see how they work.{' '}
          <span className="dim">
            Off the keyboard, I train calisthenics: pull-ups, push-ups, and a muscle-up I&apos;m
            still making cleaner.
          </span>
        </p>
      </Reveal>
    </section>
  )
}
