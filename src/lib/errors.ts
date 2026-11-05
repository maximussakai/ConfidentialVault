/** Returns null for a user-cancelled request, otherwise a readable message. */
export function describeError(error: unknown): string | null {
  const raw = error instanceof Error ? error.message : String(error)
  const msg = raw.toLowerCase()
  if (msg.includes('user rejected') || msg.includes('user denied') || msg.includes('rejected the request')) {
    return null
  }
  if (msg.includes('insufficient funds') || msg.includes('exceeds balance')) {
    return 'Not enough USDC to cover the fee and gas.'
  }
  if (msg.includes('feeabovemax')) return 'The fee changed while you were saving. Try again.'
  if (msg.includes('enforcedpause')) return 'The vault is paused. You can still delete entries.'
  if (msg.includes('invalidciphertextlength')) return 'That secret is too large to store onchain.'
  if (msg.includes('entrynotfound')) return 'That entry no longer exists.'
  if (msg.includes('reverted')) return 'The transaction failed onchain. Please try again.'
  if (msg.includes('network') || msg.includes('timeout')) return 'Network issue. Check your connection and retry.'
  return 'Something went wrong. Please try again.'
}
