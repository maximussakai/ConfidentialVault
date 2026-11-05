import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { useAccount } from 'wagmi'
import { Aurora } from '@/components/Aurora'
import { Checklist } from '@/components/Checklist'
import { EntryRow } from '@/components/EntryRow'
import { Header } from '@/components/Header'
import { Landing } from '@/components/Landing'
import { NewEntry } from '@/components/NewEntry'
import { Tutorial } from '@/components/Tutorial'
import { VaultStatus } from '@/components/VaultStatus'
import { useVault } from '@/hooks/useVault'
import { formatUsdcRaw } from '@/lib/format'
import { hasVault } from '@/lib/vault'

const TUTORIAL_KEY = 'confidential-vault:tutorial-seen'

export default function App() {
  const { address, isConnected } = useAccount()
  const vault = useVault()
  const [session, setSession] = useState<{ owner: string; key: CryptoKey } | null>(null)
  const [tutorialOpen, setTutorialOpen] = useState(() => {
    try {
      return localStorage.getItem(TUTORIAL_KEY) === null
    } catch {
      return false
    }
  })

  const closeTutorial = useCallback(() => {
    setTutorialOpen(false)
    try {
      localStorage.setItem(TUTORIAL_KEY, '1')
    } catch {
      // Storage can be unavailable in embedded previews; the tour simply shows again next time.
    }
  }, [])

  // The key belongs to one wallet; switching accounts locks the vault again.
  const cryptoKey = session && address && session.owner === address ? session.key : null

  if (!hasVault) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md items-center px-4">
        <p className="card p-6">Set VITE_VAULT_ADDRESS in .env to the deployed vault address, then restart the dev server.</p>
      </main>
    )
  }

  const feeLabel = vault.fee === undefined ? '0.01' : formatUsdcRaw(vault.fee)
  const funded = vault.fee !== undefined && vault.balance !== undefined && vault.balance >= vault.fee

  return (
    <div className="min-h-dvh">
      <Aurora />
      <Header onOpenTutorial={() => setTutorialOpen(true)} />

      {!isConnected ? (
        <Landing fee={feeLabel} onOpenTutorial={() => setTutorialOpen(true)} />
      ) : (
        <main className="mx-auto grid max-w-6xl gap-6 px-4 pb-24 pt-8 sm:px-6 lg:grid-cols-[340px_1fr]">
          <motion.aside
            className="space-y-4 lg:sticky lg:top-24 lg:self-start"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
          >
            <VaultStatus
              unlocked={cryptoKey !== null}
              entryCount={vault.entries.length}
              fee={vault.fee}
              balance={vault.balance}
              paused={vault.paused}
              onUnlock={(key) => address && setSession({ owner: address, key })}
              onLock={() => setSession(null)}
            />
            <Checklist
              funded={funded}
              unlocked={cryptoKey !== null}
              hasEntries={vault.entries.length > 0}
              onOpenTutorial={() => setTutorialOpen(true)}
            />
          </motion.aside>

          <motion.div
            className="min-w-0 space-y-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.06 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {cryptoKey ? (
                <motion.div
                  key="composer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <NewEntry
                    cryptoKey={cryptoKey}
                    fee={vault.fee}
                    allowance={vault.allowance}
                    balance={vault.balance}
                    paused={vault.paused}
                    onSaved={vault.refetchAll}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="locked"
                  className="card flex items-center gap-4 p-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="tint-cyan flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                    <Lock size={20} aria-hidden />
                  </div>
                  <div>
                    <p className="font-semibold">Unlock the vault to add or read secrets</p>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      Use the Unlock vault button. It is a free signature, not a transaction.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <section>
              <div className="mb-3 flex items-end justify-between px-1">
                <h2 className="display text-xl font-semibold">Stored secrets</h2>
                <span className="text-sm tabular-nums" style={{ color: 'var(--muted)' }}>
                  {vault.entries.length} {vault.entries.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>
              {vault.entries.length === 0 ? (
                <div className="card p-8 text-center text-sm" style={{ color: 'var(--muted)' }}>
                  {vault.isLoadingEntries ? 'Loading your entries...' : 'Nothing stored yet. Your encrypted entries will appear here.'}
                </div>
              ) : (
                <ul className="space-y-3">
                  <AnimatePresence initial={false}>
                    {vault.entries.map((entry) => (
                      <EntryRow
                        key={entry.id.toString()}
                        entry={entry}
                        cryptoKey={cryptoKey}
                        paused={vault.paused}
                        onChanged={vault.refetchAll}
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </section>

            <p className="px-1 text-xs text-pretty" style={{ color: 'var(--subtle)' }}>
              Anyone can see that you stored something, its size and when, but not what it says. Losing access to this
              wallet means losing these secrets. Deleting removes an entry from the contract, but old chain history
              keeps the encrypted bytes.
            </p>
          </motion.div>
        </main>
      )}

      <Tutorial open={tutorialOpen} fee={feeLabel} onClose={closeTutorial} />
    </div>
  )
}
