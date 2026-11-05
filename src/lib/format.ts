import { Amount, formatAmount, usdcDecimalsFor } from '@/onchain-money'
import { CHAIN_ID } from './vault'

export function formatUsdcRaw(raw: bigint): string {
  return formatAmount(CHAIN_ID, Amount.fromRaw(raw, usdcDecimalsFor(CHAIN_ID)))
}

export function formatDate(seconds: bigint): string {
  return new Date(Number(seconds) * 1000).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatBytes(hexLength: number): string {
  const bytes = Math.max(0, (hexLength - 2) / 2)
  return bytes >= 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`
}
