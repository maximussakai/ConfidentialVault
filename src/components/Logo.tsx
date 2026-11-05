import { useId } from 'react'
import { motion } from 'framer-motion'

/** Vault shield with a keyhole. The outline draws itself in on mount. */
export function LogoMark({ size = 36, animate = true }: { size?: number; animate?: boolean }) {
  const id = useId()
  const grad = `${id}-g`
  return (
    <motion.svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      role="img"
      aria-label="Confidential Vault logo"
      whileHover={{ rotate: -4, scale: 1.06 }}
      transition={{ type: 'spring', stiffness: 420, damping: 20 }}
    >
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="0.5" stopColor="#5b9dff" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <path d="M24 3 41 11.5V26c0 9-7.500 15.500-17 19C14.500 41.500 7 35 7 26V11.500Z" fill="#0b1626" />
      <motion.path
        d="M24 3 41 11.5V26c0 9-7.500 15.500-17 19C14.500 41.500 7 35 7 26V11.500Z"
        fill="none"
        stroke={`url(#${grad})`}
        strokeWidth="3"
        strokeLinejoin="round"
        initial={animate ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: 'easeInOut' }}
      />
      <motion.g
        initial={animate ? { opacity: 0, scale: 0.6 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 18 }}
        style={{ transformOrigin: '24px 24px', transformBox: 'view-box' }}
      >
        <circle cx="24" cy="20" r="5.500" fill={`url(#${grad})`} />
        <path d="M21.500 24h5l1.500 10h-8Z" fill={`url(#${grad})`} />
      </motion.g>
    </motion.svg>
  )
}

export function Wordmark({ size = 36 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className="display text-lg leading-none">
        Confidential<span className="grad-text">Vault</span>
      </span>
    </span>
  )
}
