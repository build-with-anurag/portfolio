import { motion, useScroll, useSpring } from 'framer-motion'

/** Thin gradient scroll-progress bar pinned to the very top of the page. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 })
  return (
    <motion.div
      aria-hidden="true"
      style={{
        scaleX,
        transformOrigin: '0% 50%',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 100,
        background: 'linear-gradient(90deg, #0284c7, #38bdf8, #7dd3fc)',
      }}
    />
  )
}
