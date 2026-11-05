import { useMemo } from 'react'
import { erc20Abi, type Hex } from 'viem'
import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { CHAIN_ID, USDC_ADDRESS, VAULT_ADDRESS, vaultAbi, hasVault } from '@/lib/vault'

export interface VaultEntry {
  id: bigint
  ciphertext: Hex
  createdAt: bigint
  updatedAt: bigint
  scheme: number
}

export function useVault() {
  const { address } = useAccount()
  const enabled = hasVault && Boolean(address)

  const fee = useReadContract({ address: VAULT_ADDRESS, abi: vaultAbi, functionName: 'fee', chainId: CHAIN_ID })
  const paused = useReadContract({ address: VAULT_ADDRESS, abi: vaultAbi, functionName: 'paused', chainId: CHAIN_ID })
  const count = useReadContract({
    address: VAULT_ADDRESS,
    abi: vaultAbi,
    functionName: 'entryCount',
    args: address ? [address] : undefined,
    chainId: CHAIN_ID,
    query: { enabled },
  })
  const balance = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: CHAIN_ID,
    query: { enabled },
  })
  const allowance = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address ? [address, VAULT_ADDRESS] : undefined,
    chainId: CHAIN_ID,
    query: { enabled },
  })

  const ids = useMemo(() => Array.from({ length: Number(count.data ?? 0n) }, (_, i) => BigInt(i)), [count.data])

  const entriesQuery = useReadContracts({
    contracts: address
      ? ids.map((id) => ({
          address: VAULT_ADDRESS,
          abi: vaultAbi,
          functionName: 'getEntry' as const,
          args: [address, id] as const,
          chainId: CHAIN_ID,
        }))
      : [],
    query: { enabled: enabled && ids.length > 0 },
  })

  // Deleted entries revert on read, so failed reads are simply skipped.
  const entries = useMemo<VaultEntry[]>(() => {
    const out: VaultEntry[] = []
    entriesQuery.data?.forEach((item, index) => {
      const id = ids[index]
      if (item.status === 'success' && id !== undefined) {
        const e = item.result
        out.push({ id, ciphertext: e.ciphertext, createdAt: e.createdAt, updatedAt: e.updatedAt, scheme: e.scheme })
      }
    })
    return out.reverse()
  }, [entriesQuery.data, ids])

  const refetchAll = async () => {
    await Promise.all([count.refetch(), balance.refetch(), allowance.refetch(), fee.refetch(), paused.refetch()])
    await entriesQuery.refetch()
  }

  return {
    fee: fee.data,
    paused: paused.data ?? false,
    balance: balance.data,
    allowance: allowance.data,
    entries,
    isLoadingEntries: count.isLoading || entriesQuery.isLoading,
    refetchAll,
  }
}
