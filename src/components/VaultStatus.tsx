import { useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, FileLock2, KeyRound, Loader2, Lock, Wallet } from 'lucide-react'
import { TokenUSDC } from '@web3icons/react'
import { toast } from 'sonner'
import { useAccount, useSignMessage } from 'wagmi'
import { describeError } from '@/lib/errors'
import { keyFromSignature, unlockMessage } from '@/lib/crypto'
import { formatUsdcRaw } from '@/lib/format'
import { CHAIN_ID, VAULT_ADDRESS } from '@/lib/vault'
import { buildAddressExplorerUrl } from '@/onchain-facts'
import { LockMark } from './LockMark'

interface Props {
  unlocked: boolean
  entryCount: number
  fee: bigint | undefined
  balance: bigint | undefined
  paused: boolean
  onUnlock: (key: CryptoKey) => void
  onLock: () => void
}

export function VaultStatus({ unlocked, entryCount, fee, balance, paused, onUnlock, onLock }: Props) {
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const [busy, setBusy] = useState(false)

  const unlock = async () => {
    if (!address) return
    setBusy(true)
    try {
      const signature = await signMessageAsync({ message: unlockMessage(address) })
      onUnlock(await keyFromSignature(signature))
    } catch (error) {
      const message = describeError(error)
      if (message) toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card p-6">
      <div className="flex items-center gap-4">
        <LockMark unlocked={unlocked} size={56} />
        <div className="min-w-0">
          <p className="label">Vault</p>
          <motion.h1
            key={unlocked ? 'unlocked' : 'locked'}
            className="display text-3xl font-bold"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
          >
            {unlocked ? 'Unlocked' : 'Locked'}
          </motion.h1>
        </div>
      </div>

      <p className="mt-4 text-pretty text-sm" style={{ color: 'var(--muted)' }}>
        {unlocked
          ? 'Your key lives only in this tab. Everything below is decrypted locally.'
          : 'Sign one free message to build your key and decrypt your entries.'}
      </p>

      <div className="mt-5">
        {unlocked ? (
          <button className="btn btn-ghost w-full" onClick={onLock}>
            <Lock size={16} aria-hidden /> Lock vault
          </button>
        ) : (
          <button className="btn btn-primary w-full" onClick={() => void unlock()} disabled={busy}>
            {busy ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <KeyRound size={16} aria-hidden />}
            {busy ? 'Confirm in your wallet...' : 'Unlock vault'}
          </button>
        )}
      </div>

      {paused && (
        <p className="mt-4 rounded-xl px-3 py-2 text-sm" style={{ background: 'rgba(255,122,138,0.1)', color: 'var(--danger)' }}>
          Paused: you can read and delete, but not add or edit.
        </p>
      )}

      <dl className="mt-5 border-t pt-1" style={{ borderColor: 'var(--border)' }}>
        <div className="kv">
          <dt className="flex items-center gap-2"><FileLock2 size={15} style={{ color: 'var(--violet)' }} aria-hidden /> Entries</dt>
          <dd className="tabular-nums">{entryCount}</dd>
        </div>
        <div className="kv">
          <dt className="flex items-center gap-2"><Wallet size={15} style={{ color: '#fbbf24' }} aria-hidden /> Fee per new entry</dt>
          <dd className="tabular-nums">
            <TokenUSDC variant="branded" size={16} /> {fee === undefined ? '-' : formatUsdcRaw(fee)}
          </dd>
        </div>
        <div className="kv">
          <dt className="flex items-center gap-2"><Wallet size={15} style={{ color: '#34d399' }} aria-hidden /> Your USDC</dt>
          <dd className="tabular-nums">
            <TokenUSDC variant="branded" size={16} /> {balance === undefined ? '-' : formatUsdcRaw(balance)}
          </dd>
        </div>
        <div className="kv">
          <dt className="flex items-center gap-2"><Lock size={15} style={{ color: 'var(--cyan)' }} aria-hidden /> Contract</dt>
          <dd>
            <a
              className="mono inline-flex min-h-11 items-center gap-1 text-sm underline-offset-2 hover:underline"
              href={buildAddressExplorerUrl(CHAIN_ID, VAULT_ADDRESS)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {VAULT_ADDRESS.slice(0, 6)}...{VAULT_ADDRESS.slice(-4)} <ExternalLink size={13} aria-hidden />
            </a>
          </dd>
        </div>
      </dl>
    </section>
  )
}
