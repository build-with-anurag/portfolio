import Reveal from './Reveal'

const SKILLS: Array<{ name: string; proof: string }> = [
  {
    name: 'TypeScript',
    proof: "Built Krishi Setu's 36-page frontend — routing, state, and a mocked API layer.",
  },
  {
    name: 'C',
    proof:
      'Data Structures & Algorithms coursework and exam prep — pointers, linked lists, trees, sorting.',
  },
  {
    name: 'Python',
    proof: 'Scripting coursework and personal automations that run my daily workflows.',
  },
  {
    name: 'Linux',
    proof: 'Installed Arch Linux from scratch; dual-boots Fedora & Windows on my daily machine.',
  },
  {
    name: 'Android',
    proof: 'Custom ROMs, bootloader unlocking, and root management with Magisk / KernelSU.',
  },
  {
    name: 'Git & GitHub',
    proof: 'PR-based workflow — PRs #1–#4 reviewed and merged on the Krishi Setu repository.',
  },
]

export default function Skills() {
  return (
    <section id="skills" className="site-section">
      <Reveal>
        <p className="eyebrow">Skills</p>
        <h2 className="section-h2">
          No percentages.
          <br />
          Just proof.
        </h2>
        <p className="section-sub">
          Anyone can claim 90% in a language. Here is what each skill has actually produced.
        </p>
      </Reveal>

      <div className="skills-grid">
        {SKILLS.map((skill, i) => (
          <Reveal key={skill.name} delay={(i % 3) * 0.08}>
            <div className="skill">
              <div className="s-name">{skill.name}</div>
              <p className="s-proof">{skill.proof}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
