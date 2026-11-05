import { useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { describeError } from '@/lib/errors'
import { ciphertextSize, encryptSecret, fitsOnchain } from '@/lib/crypto'
import { formatUsdcRaw } from '@/lib/format'
import { MAX_CIPHERTEXT_BYTES } from '@/lib/vault'
import { useVaultTx } from '@/hooks/useVaultTx'

type Phase = 'idle' | 'approve' | 'save'

interface Props {
  cryptoKey: CryptoKey
  fee: bigint | undefined
  allowance: bigint | undefined
  balance: bigint | undefined
  paused: boolean
  onSaved: () => Promise<void>
}

export function NewEntry({ cryptoKey, fee, allowance, balance, paused, onSaved }: Props) {
  const tx = useVaultTx()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')

  const secret = { title: title.trim(), body }
  const size = ciphertextSize(secret)
  const tooLarge = !fitsOnchain(secret)
  const ready = fee !== undefined && secret.title.length > 0 && body.length > 0 && !tooLarge && !paused
  const lacksFunds = fee !== undefined && balance !== undefined && balance < fee
  const busy = phase !== 'idle'

  const save = async () => {
    if (fee === undefined) return
    try {
      const ciphertext = await encryptSecret(cryptoKey, secret)
      if ((allowance ?? 0n) < fee) {
        setPhase('approve')
        await tx.approveFee(fee)
      }
      setPhase('save')
      await tx.create(ciphertext, fee)
      setTitle('')
      setBody('')
      toast.success('Secret stored and encrypted.')
      await onSaved()
    } catch (error) {
      const message = describeError(error)
      if (message) toast.error(message)
    } finally {
      setPhase('idle')
    }
  }

  const waiting = tx.stage === 'confirming' ? 'Confirming on Arc Testnet...' : 'Confirm in your wallet...'
  const label =
    phase === 'approve'
      ? `Step 1 of 2: allow the fee. ${waiting}`
      : phase === 'save'
        ? `${allowance !== undefined && fee !== undefined && allowance < fee ? 'Step 2 of 2: saving. ' : 'Saving. '}${waiting}`
        : fee === undefined
          ? 'Save secret'
          : `Encrypt and save for ${formatUsdcRaw(fee)} USDC`

  return (
    <section className="card p-6">
      <div className="spectral-strip" />
      <h2 className="display text-xl font-semibold">New secret</h2>
      <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
        Both the title and the text are encrypted. Nothing readable is stored onchain.
      </p>

      <div className="mt-5 space-y-3">
        <label className="block">
          <span className="label">Title</span>
          <input
            className="field mt-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Recovery phrase, API key"
            maxLength={120}
            disabled={busy}
          />
        </label>
        <label className="block">
          <span className="label">Secret</span>
          <textarea
            className="field mt-1 min-h-32 resize-y"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Paste anything you want kept private"
            disabled={busy}
          />
        </label>
      </div>

      <p
        className="mt-2 text-xs tabular-nums"
        style={{ color: tooLarge ? 'var(--danger)' : 'var(--subtle)' }}
      >
        {size} / {MAX_CIPHERTEXT_BYTES} bytes encrypted{tooLarge ? ' (too large)' : ''}
      </p>

      {lacksFunds && (
        <p className="mt-3 text-sm" style={{ color: 'var(--danger)' }}>
          You need at least {formatUsdcRaw(fee)} USDC. Use Get test USDC in the Arc Studio sidebar.
        </p>
      )}

      <button className="btn btn-primary mt-5 w-full" onClick={() => void save()} disabled={!ready || busy || lacksFunds}>
        {busy ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Plus size={16} aria-hidden />} {label}
      </button>
    </section>
  )
}
