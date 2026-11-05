import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Box, Coins, KeyRound, ShieldAlert, Unlock, X, type LucideIcon } from 'lucide-react'

interface Step {
  icon: LucideIcon
  tint: string
  title: string
  body: string
}

function buildSteps(fee: string): Step[] {
  return [
    {
      icon: Box,
      tint: 'tint-blue',
      title: 'A safe-deposit box on a public chain',
      body: 'You write a secret, and this app scrambles it inside your browser. Only the scrambled bytes are stored in the smart contract on Arc Testnet.',
    },
    {
      icon: KeyRound,
      tint: 'tint-violet',
      title: 'Your wallet is the key',
      body: 'Press Unlock and sign a free message. That signature becomes your private encryption key. It stays in this tab, and the same wallet always rebuilds the same key.',
    },
    {
      icon: Coins,
      tint: 'tint-amber',
      title: `Saving costs ${fee} USDC`,
      body: 'Each new entry pays a flat protocol fee. The first time you will see two wallet prompts: one to allow the fee, one to save. Editing and deleting have no protocol fee, only network gas.',
    },
    {
      icon: Unlock,
      tint: 'tint-mint',
      title: 'Decrypt whenever you want',
      body: 'Unlock the vault, then Decrypt, Copy, Edit or Delete any entry. Decryption happens locally, so nobody else ever sees your text.',
    },
    {
      icon: ShieldAlert,
      tint: 'tint-amber',
      title: 'Before you rely on it',
      body: 'Anyone can see that you stored something, plus its size and time, but not its content. Lose access to this wallet and the secrets are gone for good. Deleting leaves old encrypted bytes in chain history. This runs on a test network.',
    },
  ]
}

interface Props {
  open: boolean
  fee: string
  onClose: () => void
}

export function Tutorial({ open, fee, onClose }: Props) {
  const steps = buildSteps(fee)
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const step = steps[index] ?? steps[0]
  const last = index === steps.length - 1

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const go = (next: number) => {
    setDirection(next > index ? 1 : -1)
    setIndex(next)
  }

  const close = () => {
    onClose()
    setIndex(0)
  }

  const Icon = step.icon

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            aria-label="Close tutorial"
            className="absolute inset-0 cursor-default"
            style={{ background: 'rgba(13,27,47,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={close}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="How the vault works"
            className="card relative w-full max-w-md overflow-hidden p-6"
            style={{ background: '#101f35' }}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 36 }}
          >
            <div className="spectral-strip" />
            <div className="flex items-center justify-between">
              <p className="label">
                Step {index + 1} of {steps.length}
              </p>
              <button className="btn btn-ghost btn-sm" style={{ minHeight: 44, minWidth: 44, padding: 0 }} onClick={close} aria-label="Close">
                <X size={18} aria-hidden />
              </button>
            </div>

            <div className="relative mt-4 min-h-64">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={index}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -28 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`${step.tint} flex h-16 w-16 items-center justify-center rounded-2xl`} >
                    <Icon size={28} aria-hidden />
                  </div>
                  <h2 className="display mt-5 text-balance text-2xl font-bold">{step.title}</h2>
                  <p className="mt-3 text-pretty" style={{ color: 'var(--ink-2)' }}>
                    {step.body}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5" role="tablist" aria-label="Tutorial progress">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Go to step ${i + 1}`}
                    onClick={() => go(i)}
                    className="flex h-6 w-4 items-center justify-center"
                  >
                    <motion.span
                      className="block h-2 rounded-full"
                      animate={{ width: i === index ? 20 : 8, background: i === index ? '#acc6e9' : 'rgba(255,255,255,0.18)' }}
                    />
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button className="btn btn-ghost btn-sm" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous step">
                  <ArrowLeft size={16} aria-hidden />
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => (last ? close() : go(index + 1))}>
                  {last ? 'Got it' : 'Next'} {!last && <ArrowRight size={16} aria-hidden />}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
