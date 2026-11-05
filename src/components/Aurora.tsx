import { motion } from 'framer-motion'

const ORBS = [
  { color: 'rgba(91,157,255,0.20)', size: 520, top: '-12%', left: '-10%', x: [0, 60, 0], y: [0, 40, 0], d: 22 },
  { color: 'rgba(167,139,250,0.16)', size: 460, top: '18%', left: '62%', x: [0, -50, 0], y: [0, 60, 0], d: 28 },
  { color: 'rgba(52,211,153,0.10)', size: 420, top: '70%', left: '8%', x: [0, 40, 0], y: [0, -50, 0], d: 32 },
]

/** Slow, soft color behind the interface. Transform-only motion, calm by design. */
export function Aurora() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            top: orb.top,
            left: orb.left,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
          animate={{ x: orb.x, y: orb.y }}
          transition={{ duration: orb.d, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}
