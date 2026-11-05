import { ConnectKitButton } from 'connectkit'
import { motion } from 'framer-motion'
import { ArrowRight, Coins, Fingerprint, LockKeyhole, type LucideIcon } from 'lucide-react'
import { CipherDemo } from './CipherDemo'

interface Props {
  fee: string
  onOpenTutorial: () => void
}

const FEATURES: { icon: LucideIcon; tint: string; title: string; body: string }[] = [
  {
    icon: LockKeyhole,
    tint: 'tint-cyan',
    title: 'Encrypted before it leaves',
    body: 'Your browser scrambles every secret, title included. The contract only ever sees unreadable bytes.',
  },
  {
    icon: Fingerprint,
    tint: 'tint-violet',
    title: 'Your wallet is the key',
    body: 'One free signature rebuilds your key on demand. No password to remember, nothing sent to a server.',
  },
  {
    icon: Coins,
    tint: 'tint-amber',
    title: 'Flat, transparent fee',
    body: 'Pay a single USDC fee for each new entry. Editing and deleting carry no protocol fee.',
  },
]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const } },
}

export function Landing({ fee, onOpenTutorial }: Props) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-12 sm:px-6 sm:pt-20">
      <motion.section
        className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <div>
          <motion.span variants={item} className="badge" style={{ color: 'var(--cyan)' }}>
            <span className="dot" /> Private storage on Arc
          </motion.span>
          <motion.h1 variants={item} className="display mt-5 text-balance text-5xl font-bold sm:text-6xl lg:text-7xl">
            Keep secrets onchain, <span className="grad-text">readable only by you.</span>
          </motion.h1>
          <motion.p variants={item} className="mt-6 max-w-xl text-pretty text-lg" style={{ color: 'var(--ink-2)' }}>
            Encrypt notes, keys and recovery phrases in your browser, store them in a smart contract for {fee} USDC, and
            decrypt them any time with your wallet.
          </motion.p>
          <motion.div variants={item} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ConnectKitButton.Custom>
              {({ show }) => (
                <button className="btn btn-primary" style={{ minWidth: 210 }} onClick={show}>
                  Connect wallet <ArrowRight size={16} aria-hidden />
                </button>
              )}
            </ConnectKitButton.Custom>
            <button className="btn btn-ghost" onClick={onOpenTutorial}>
              See how it works
            </button>
          </motion.div>
          <motion.ul variants={item} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm" style={{ color: 'var(--muted)' }}>
            <li className="flex items-center gap-2">
              <span className="dot" style={{ color: 'var(--cyan)' }} /> AES-256 encryption
            </li>
            <li className="flex items-center gap-2">
              <span className="dot" style={{ color: 'var(--violet)' }} /> Keys never leave your tab
            </li>
            <li className="flex items-center gap-2">
              <span className="dot" style={{ color: 'var(--success)' }} /> Immutable contract
            </li>
          </motion.ul>
        </div>

        <motion.div variants={item} animate={{ y: [0, -8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
          <CipherDemo />
        </motion.div>
      </motion.section>

      <motion.section
        className="mt-20 grid gap-4 md:grid-cols-3"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
      >
        {FEATURES.map((f) => {
          const Icon = f.icon
          return (
            <motion.article key={f.title} variants={item} className="card card-hover p-6" whileHover={{ y: -4 }}>
              <div className={`${f.tint} flex h-12 w-12 items-center justify-center rounded-xl`}>
                <Icon size={22} aria-hidden />
              </div>
              <h2 className="display mt-5 text-lg">{f.title}</h2>
              <p className="mt-2 text-pretty text-sm" style={{ color: 'var(--muted)' }}>
                {f.body}
              </p>
            </motion.article>
          )
        })}
      </motion.section>

      <p className="mx-auto mt-10 max-w-2xl text-center text-sm" style={{ color: 'var(--subtle)' }}>
        Blockchains are public. Others can see that you stored something, its size and when, but not what it says.
        Running on Arc Testnet.
      </p>
    </div>
  )
}
