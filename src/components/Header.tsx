import { ConnectKitButton } from 'connectkit'
import { CircleHelp } from 'lucide-react'
import { Wordmark } from './Logo'

export function Header({ onOpenTutorial }: { onOpenTutorial: () => void }) {
  return (
    <header
      className="sticky top-0 z-30"
      style={{
        background: 'rgba(11,22,38,0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Wordmark />
        <div className="flex items-center gap-2">
          <span className="badge hidden sm:inline-flex badge-ok">
            <span className="dot" /> Arc Testnet
          </span>
          <button className="chip" style={{ minHeight: 44, cursor: 'pointer' }} onClick={onOpenTutorial} aria-label="Open the tutorial">
            <CircleHelp size={16} aria-hidden /> <span className="hidden sm:inline">How it works</span>
          </button>
          <ConnectKitButton showBalance={false} />
        </div>
      </div>
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(125,211,252,0.5), rgba(167,139,250,0.5), transparent)' }} />
    </header>
  )
}
