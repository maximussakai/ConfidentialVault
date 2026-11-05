import { bytesToHex, hexToBytes, type Address, type Hex } from 'viem'
import { CHAIN_ID, MAX_CIPHERTEXT_BYTES, VAULT_ADDRESS } from './vault'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const IV_BYTES = 12
const TAG_BYTES = 16

export interface Secret {
  title: string
  body: string
}

/** Message the wallet signs once per session. The signature is the root of the encryption key. */
export function unlockMessage(account: Address): string {
  return [
    'Confidential Vault unlock (v1)',
    `Vault: ${VAULT_ADDRESS.toLowerCase()}`,
    `Chain: ${CHAIN_ID}`,
    `Account: ${account.toLowerCase()}`,
    '',
    'Signing derives your private encryption key inside this browser. It is free and sends nothing onchain.',
    'Never sign this message on a site you do not trust, and never share the signature.',
  ].join('\n')
}

export async function keyFromSignature(signature: Hex): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', hexToBytes(signature) as BufferSource, 'HKDF', false, [
    'deriveKey',
  ])
  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: encoder.encode('ConfidentialVault/v1'),
      info: encoder.encode('aes-256-gcm'),
    },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

/** Exact ciphertext size (IV + payload + GCM tag) for a secret, before encrypting. */
export function ciphertextSize(secret: Secret): number {
  return IV_BYTES + encoder.encode(JSON.stringify(secret)).length + TAG_BYTES
}

export function fitsOnchain(secret: Secret): boolean {
  return ciphertextSize(secret) <= MAX_CIPHERTEXT_BYTES
}

export async function encryptSecret(key: CryptoKey, secret: Secret): Promise<Hex> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const sealed = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(JSON.stringify(secret))),
  )
  const out = new Uint8Array(iv.length + sealed.length)
  out.set(iv, 0)
  out.set(sealed, iv.length)
  return bytesToHex(out)
}

export async function decryptSecret(key: CryptoKey, ciphertext: Hex): Promise<Secret> {
  const bytes = hexToBytes(ciphertext)
  const iv = bytes.slice(0, IV_BYTES)
  const sealed = bytes.slice(IV_BYTES)
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, sealed)
  const parsed: unknown = JSON.parse(decoder.decode(plain))
  if (
    typeof parsed === 'object' &&
    parsed !== null &&
    'title' in parsed &&
    'body' in parsed &&
    typeof parsed.title === 'string' &&
    typeof parsed.body === 'string'
  ) {
    return { title: parsed.title, body: parsed.body }
  }
  throw new Error('Unexpected entry format')
}
