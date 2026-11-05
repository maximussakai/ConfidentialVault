import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface Props {
  funded: boolean
  unlocked: boolean
  hasEntries: boolean
  onOpenTutorial: () => void
}

/** Progress comes from real wallet and contract state, never from a timer. */
export function Checklist({ funded, unlocked, hasEntries, onOpenTutorial }: Props) {
  const steps = [
    { label: 'Wallet connected', hint: '', done: true },
    { label: 'Get test USDC', hint: 'Tap Get test USDC in the Arc Studio sidebar.', done: funded },
    { label: 'Unlock the vault', hint: 'Sign one free message to create your key.', done: unlocked },
    { label: 'Save your first secret', hint: 'Write it in the form and press save.', done: hasEntries },
  ]
  const doneCount = steps.filter((s) => s.done).length
  const activeIndex = steps.findIndex((s) => !s.done)

  return (
    <AnimatePresence>
      {doneCount < steps.length && (
        <motion.section className="card p-6" exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} layout>
          <div className="flex items-center justify-between gap-3">
            <h2 className="display text-lg font-semibold">Getting started</h2>
            <span className="text-sm tabular-nums" style={{ color: 'var(--muted)' }}>
              {doneCount}/{steps.length}
            </span>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full" style={{ background: 'var(--border)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'var(--brand)' }}
              initial={false}
              animate={{ width: `${(doneCount / steps.length) * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            />
          </div>
          <ol className="mt-4 space-y-1">
            {steps.map((step, i) => {
              const active = i === activeIndex
              return (
                <li key={step.label} className="flex items-start gap-3 rounded-xl p-2.5" style={{ background: active ? 'var(--surface-strong)' : 'transparent' }}>
                  <motion.span
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    animate={{
                      background: step.done ? 'rgba(52,211,153,0.22)' : active ? '#7dd3fc' : 'rgba(255,255,255,0.08)',
                      color: step.done ? '#34d399' : active ? '#06101f' : '#7b8da6',
                    }}
                  >
                    {step.done ? <Check size={13} aria-hidden /> : i + 1}
                  </motion.span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium" style={{ color: step.done ? 'var(--muted)' : 'var(--ink)' }}>
                      {step.label}
                    </p>
                    {active && step.hint && (
                      <p className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>
                        {step.hint}
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
          <button className="mt-3 min-h-11 text-sm font-medium underline-offset-2 hover:underline" style={{ color: 'var(--accent)' }} onClick={onOpenTutorial}>
            Take the tour
          </button>
        </motion.section>
      )}
    </AnimatePresence>
  )
}
