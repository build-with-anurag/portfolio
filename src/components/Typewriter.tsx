import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

const ROLES = ['Web Developer', 'Systems Enthusiast', 'Linux & Android Tinkerer']

/** Typewriter that cycles through role labels, deleting and retyping each. */
export default function Typewriter() {
  const reduce = useReducedMotion()
  const [text, setText] = useState(ROLES[0])

  useEffect(() => {
    if (reduce) return
    let role = 0
    let chars = ROLES[0].length
    let deleting = false
    let timer: ReturnType<typeof setTimeout>

    const tick = () => {
      const word = ROLES[role]
      if (!deleting) {
        chars++
        setText(word.slice(0, chars))
        if (chars === word.length) {
          deleting = true
          timer = setTimeout(tick, 1900)
          return
        }
        timer = setTimeout(tick, 65)
      } else {
        chars--
        setText(word.slice(0, chars))
        if (chars === 0) {
          deleting = false
          role = (role + 1) % ROLES.length
          timer = setTimeout(tick, 350)
          return
        }
        timer = setTimeout(tick, 34)
      }
    }
    timer = setTimeout(tick, 1600)
    return () => clearTimeout(timer)
  }, [reduce])

  return (
    <span className="typewriter-text" aria-label={`Roles: ${ROLES.join(', ')}`}>
      {text}
    </span>
  )
}
