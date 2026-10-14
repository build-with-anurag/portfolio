import Reveal from './Reveal'

const ENTRIES: Array<{ when: string; title: string; body: string }> = [
  {
    when: 'Workshop · 3 Weeks',
    title: 'Student Team Lead — Generative AI Workshop',
    body: 'Scope Global Skills University. Led a student team and guided peers on GenAI tools and workflows — prompting, building, and presenting with AI.',
  },
  {
    when: 'Ongoing',
    title: 'Linux Customization & Distro Hopping',
    body: "Arch, Fedora, Ubuntu — desktop environments, terminal workflows, and system administration, learned by breaking and fixing my own machine.",
  },
  {
    when: 'Ongoing',
    title: 'Android Custom ROMs & System Flashing',
    body: "TWRP / OrangeFox recoveries, LineageOS and Pixel Experience builds, and root management — years of hands-on time inside Android's system layer.",
  },
]

export default function Journey() {
  return (
    <section id="journey" className="site-section">
      <Reveal>
        <p className="eyebrow">Journey</p>
        <h2 className="section-h2">How I got here.</h2>
      </Reveal>

      <div className="timeline">
        {ENTRIES.map((entry) => (
          <Reveal key={entry.title}>
            <div className="t-item">
              <p className="t-when">{entry.when}</p>
              <h3>{entry.title}</h3>
              <p>{entry.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
