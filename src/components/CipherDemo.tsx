import { useEffect, useState } from 'react'
import { ArrowDown, Lock, LockOpen } from 'lucide-react'

const SAMPLE = 'correct horse battery staple'
const GLYPHS = '0123456789abcdef'

function scramble(text: string, revealed: number): string {
  return text
    .split('')
    .map((ch, i) => (i < revealed || ch === ' ' ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
    .join('')
}

/** Illustration only: shows how readable text turns into unreadable bytes. Not real vault data. */
export function CipherDemo() {
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [text, setText] = useState(reduced ? '9f3a c01e 7b2d 48aa e5d1 06c9' : SAMPLE)
  const [sealed, setSealed] = useState(reduced)

  useEffect(() => {
    if (reduced) return
    let frame = 0
    let direction: 'seal' | 'open' = 'seal'
    let hold = 0
    const timer = window.setInterval(() => {
      if (hold > 0) {
        hold -= 1
        return
      }
      frame += 1
      const progress = Math.min(frame / 14, 1)
      if (direction === 'seal') {
        setText(scramble(SAMPLE, Math.round(SAMPLE.length * (1 - progress))))
        setSealed(progress > 0.5)
      } else {
        setText(scramble(SAMPLE, Math.round(SAMPLE.length * progress)))
        setSealed(progress < 0.5)
      }
      if (progress >= 1) {
        direction = direction === 'seal' ? 'open' : 'seal'
        frame = 0
        hold = 18
      }
    }, 70)
    return () => window.clearInterval(timer)
  }, [reduced])

  return (
    <div className="card mx-auto w-full max-w-md p-5" aria-hidden>
      <div className="flex items-center justify-between">
        <p className="label">Illustration</p>
        <span className={`badge ${sealed ? '' : 'badge-ok'}`} style={sealed ? { color: 'var(--cyan)' } : undefined}>
          {sealed ? <Lock size={12} /> : <LockOpen size={12} />}
          {sealed ? 'Sealed' : 'Readable'}
        </span>
      </div>
      <p className="mono mt-4 min-h-[3.2rem] break-all rounded-xl p-3 text-sm" style={{ background: 'rgba(7,14,26,0.6)', border: '1px solid var(--border)', color: sealed ? 'var(--cyan)' : 'var(--ink)' }}>
        {text}
      </p>
      <div className="mt-3 flex items-center justify-center gap-2 text-xs" style={{ color: 'var(--subtle)' }}>
        <ArrowDown size={14} /> Only the sealed form ever reaches the chain
      </div>
    </div>
  )
}
