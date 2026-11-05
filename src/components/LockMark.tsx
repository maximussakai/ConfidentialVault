import { motion } from 'framer-motion'

/** Padlock mark: the shackle lifts and the keyhole turns green when the vault unlocks. */
export function LockMark({ unlocked, size = 64 }: { unlocked: boolean; size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} aria-hidden>
      <motion.div
        key={unlocked ? 'open' : 'closed'}
        className="absolute inset-0 rounded-full"
        style={{ background: unlocked ? 'rgba(52,211,153,0.4)' : 'rgba(125,211,252,0.35)' }}
        initial={{ scale: 0.7, opacity: 0.8 }}
        animate={{ scale: 1.6, opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      <svg viewBox="0 0 96 96" className="relative h-full w-full">
        <defs>
          <linearGradient id="lock-body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="55%" stopColor="#5b9dff" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <motion.path
          d="M30 44 V32 a18 18 0 0 1 36 0 V44"
          fill="none"
          stroke="#a5d8ff"
          strokeWidth="8"
          strokeLinecap="round"
          style={{ transformBox: 'fill-box', transformOrigin: '0% 100%' }}
          animate={unlocked ? { y: -9, rotate: -24 } : { y: 0, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        />
        <rect x="18" y="42" width="60" height="40" rx="12" fill="url(#lock-body)" />
        <motion.circle
          cx="48"
          cy="59"
          r="5.5"
          animate={{ fill: unlocked ? '#10b981' : '#0d1b2f' }}
          transition={{ duration: 0.3 }}
        />
        <rect x="46" y="62" width="4" height="9" rx="2" fill="#0d1b2f" opacity="0.7" />
      </svg>
    </div>
  )
}
