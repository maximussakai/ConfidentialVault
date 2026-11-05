import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Copy, Eye, EyeOff, FileLock2, Loader2, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { describeError } from '@/lib/errors'
import { ciphertextSize, decryptSecret, encryptSecret, fitsOnchain, type Secret } from '@/lib/crypto'
import { formatBytes, formatDate } from '@/lib/format'
import { useVaultTx } from '@/hooks/useVaultTx'
import type { VaultEntry } from '@/hooks/useVault'

interface Props {
  entry: VaultEntry
  cryptoKey: CryptoKey | null
  paused: boolean
  onChanged: () => Promise<void>
}

type Decrypted = { status: 'pending' } | { status: 'ok'; secret: Secret } | { status: 'failed' }

export function EntryRow({ entry, cryptoKey, paused, onChanged }: Props) {
  const tx = useVaultTx()
  const [decrypted, setDecrypted] = useState<Decrypted>({ status: 'pending' })
  const [revealed, setRevealed] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Secret>({ title: '', body: '' })
  const [busy, setBusy] = useState<'save' | 'delete' | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!cryptoKey) return
    decryptSecret(cryptoKey, entry.ciphertext)
      .then((secret) => !cancelled && setDecrypted({ status: 'ok', secret }))
      .catch(() => !cancelled && setDecrypted({ status: 'failed' }))
    return () => {
      cancelled = true
    }
  }, [cryptoKey, entry.ciphertext])

  const secret = cryptoKey && decrypted.status === 'ok' ? decrypted.secret : null
  const failed = cryptoKey !== null && decrypted.status === 'failed'

  const startEdit = () => {
    if (!secret) return
    setDraft(secret)
    setEditing(true)
  }

  const saveEdit = async () => {
    if (!cryptoKey) return
    setBusy('save')
    try {
      const next = { title: draft.title.trim(), body: draft.body }
      await tx.update(entry.id, await encryptSecret(cryptoKey, next))
      setEditing(false)
      toast.success('Entry updated.')
      await onChanged()
    } catch (error) {
      const message = describeError(error)
      if (message) toast.error(message)
    } finally {
      setBusy(null)
    }
  }

  const remove = async () => {
    setBusy('delete')
    try {
      await tx.remove(entry.id)
      toast.success('Entry deleted.')
      await onChanged()
    } catch (error) {
      const message = describeError(error)
      if (message) toast.error(message)
    } finally {
      setBusy(null)
      setConfirmDelete(false)
    }
  }

  const copy = async () => {
    if (!secret) return
    await navigator.clipboard.writeText(secret.body)
    toast.success('Copied to clipboard.')
  }

  const draftValid = draft.title.trim().length > 0 && draft.body.length > 0 && fitsOnchain(draft)

  return (
    <motion.li
      className="card-hover overflow-hidden p-4 pl-5"
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -24, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      style={{ position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16 }}
    >
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ background: secret ? '#34d399' : failed ? '#fbbf24' : '#a78bfa' }}
        aria-hidden
      />
      <div className="flex items-start gap-3">
        <motion.div
          className={`${secret ? 'tint-mint' : failed ? 'tint-amber' : 'tint-violet'} flex h-10 w-10 shrink-0 items-center justify-center rounded-xl`}
          style={{ border: '1px solid var(--border)' }}
          animate={{ rotate: secret ? [0, -8, 0] : 0 }}
          transition={{ duration: 0.4 }}
        >
          <FileLock2 size={18} aria-hidden />
        </motion.div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">
            {secret ? secret.title : failed ? 'Cannot decrypt with this wallet key' : 'Encrypted entry'}
          </p>
          <p className="mt-0.5 text-xs tabular-nums" style={{ color: 'var(--subtle)' }}>
            #{entry.id.toString()} · {formatDate(entry.createdAt)} · {formatBytes(entry.ciphertext.length)}
            {entry.updatedAt !== entry.createdAt ? ' · edited' : ''}
          </p>
        </div>
      </div>

      {editing ? (
        <div className="mt-4 space-y-3">
          <input
            className="field"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            maxLength={120}
            aria-label="Title"
          />
          <textarea
            className="field min-h-28 resize-y"
            value={draft.body}
            onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            aria-label="Secret"
          />
          <p className="text-xs tabular-nums" style={{ color: fitsOnchain(draft) ? 'var(--subtle)' : 'var(--danger)' }}>
            {ciphertextSize(draft)} bytes encrypted. Editing has no protocol fee, only gas.
          </p>
          <div className="flex gap-2">
            <button className="btn btn-primary btn-sm flex-1" onClick={() => void saveEdit()} disabled={!draftValid || busy !== null || paused}>
              {busy === 'save' ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden />{' '}
                  {tx.stage === 'confirming' ? 'Confirming...' : 'Confirm in wallet...'}
                </>
              ) : (
                'Save changes'
              )}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)} disabled={busy !== null}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <AnimatePresence>
            {revealed && secret && (
              <motion.pre
                className="mono mt-4 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-xl p-3 text-sm"
                style={{ background: 'rgba(7,14,26,0.6)', border: '1px solid var(--border)' }}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                {secret.body}
              </motion.pre>
            )}
          </AnimatePresence>
          <div className="mt-4 flex flex-wrap gap-2">
            {secret && (
              <>
                <button className="btn btn-ghost btn-sm" onClick={() => setRevealed((r) => !r)}>
                  {revealed ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
                  {revealed ? 'Hide' : 'Decrypt'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => void copy()}>
                  <Copy size={16} aria-hidden /> Copy
                </button>
                <button className="btn btn-ghost btn-sm" onClick={startEdit} disabled={paused || busy !== null}>
                  <Pencil size={16} aria-hidden /> Edit
                </button>
              </>
            )}
            {!cryptoKey && (
              <span className="self-center text-sm" style={{ color: 'var(--subtle)' }}>
                Unlock the vault to decrypt.
              </span>
            )}
            {confirmDelete ? (
              <>
                <button className="btn btn-ghost btn-sm btn-danger" onClick={() => void remove()} disabled={busy !== null}>
                  {busy === 'delete' ? (
                    <>
                      <Loader2 size={16} className="animate-spin" aria-hidden />{' '}
                      {tx.stage === 'confirming' ? 'Deleting...' : 'Confirm in wallet...'}
                    </>
                  ) : (
                    'Confirm delete'
                  )}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(false)} disabled={busy !== null}>
                  Keep
                </button>
              </>
            ) : (
              <button
                className="btn btn-ghost btn-sm btn-danger ml-auto"
                onClick={() => setConfirmDelete(true)}
                disabled={busy !== null}
                aria-label="Delete entry"
              >
                <Trash2 size={16} aria-hidden />
              </button>
            )}
          </div>
        </>
      )}
    </motion.li>
  )
}
