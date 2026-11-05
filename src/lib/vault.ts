import { isAddress, parseAbi, type Address } from 'viem'
import { arcTestnet } from 'viem/chains'
import { getUsdc } from '@/onchain-facts'

export const CHAIN_ID = arcTestnet.id

export const VAULT_ADDRESS = (import.meta.env.VITE_VAULT_ADDRESS ?? '') as Address
export const hasVault = isAddress(VAULT_ADDRESS)

const usdcFact = getUsdc(CHAIN_ID)
if (!usdcFact) throw new Error('USDC is not registered for Arc Testnet')
export const USDC_ADDRESS = usdcFact.address as Address

/** Client-defined tag stored with each entry: 1 = AES-256-GCM, key derived from a wallet signature. */
export const SCHEME_AES_GCM_V1 = 1
export const MAX_CIPHERTEXT_BYTES = 4096

export const vaultAbi = parseAbi([
  'function fee() view returns (uint256)',
  'function treasury() view returns (address)',
  'function paused() view returns (bool)',
  'function entryCount(address) view returns (uint256)',
  'function getEntry(address entryOwner, uint256 id) view returns ((bytes ciphertext, uint64 createdAt, uint64 updatedAt, uint8 scheme))',
  'function createEntry(bytes ciphertext, uint8 scheme, uint256 maxFee) returns (uint256 id)',
  'function updateEntry(uint256 id, bytes ciphertext, uint8 scheme)',
  'function deleteEntry(uint256 id)',
])
