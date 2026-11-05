import { useState } from 'react'
import { erc20Abi, type Hash, type Hex } from 'viem'
import { useAccount, usePublicClient, useSwitchChain, useWriteContract } from 'wagmi'
import { CHAIN_ID, SCHEME_AES_GCM_V1, USDC_ADDRESS, VAULT_ADDRESS, vaultAbi } from '@/lib/vault'

export type TxStage = 'idle' | 'wallet' | 'confirming'

/** Each action switches chain if needed, asks the wallet, then waits for the onchain receipt. */
export function useVaultTx() {
  const { chainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient({ chainId: CHAIN_ID })
  const [stage, setStage] = useState<TxStage>('idle')

  const exec = async (write: () => Promise<Hash>): Promise<Hash> => {
    setStage('wallet')
    try {
      if (chainId !== CHAIN_ID) await switchChainAsync({ chainId: CHAIN_ID })
      const hash = await write()
      setStage('confirming')
      const receipt = await publicClient?.waitForTransactionReceipt({ hash })
      if (!receipt || receipt.status !== 'success') throw new Error('Transaction reverted')
      return hash
    } finally {
      setStage('idle')
    }
  }

  return {
    stage,
    approveFee: (amount: bigint) =>
      exec(() =>
        writeContractAsync({
          address: USDC_ADDRESS,
          abi: erc20Abi,
          functionName: 'approve',
          args: [VAULT_ADDRESS, amount],
          chainId: CHAIN_ID,
        }),
      ),
    create: (ciphertext: Hex, maxFee: bigint) =>
      exec(() =>
        writeContractAsync({
          address: VAULT_ADDRESS,
          abi: vaultAbi,
          functionName: 'createEntry',
          args: [ciphertext, SCHEME_AES_GCM_V1, maxFee],
          chainId: CHAIN_ID,
        }),
      ),
    update: (id: bigint, ciphertext: Hex) =>
      exec(() =>
        writeContractAsync({
          address: VAULT_ADDRESS,
          abi: vaultAbi,
          functionName: 'updateEntry',
          args: [id, ciphertext, SCHEME_AES_GCM_V1],
          chainId: CHAIN_ID,
        }),
      ),
    remove: (id: bigint) =>
      exec(() =>
        writeContractAsync({
          address: VAULT_ADDRESS,
          abi: vaultAbi,
          functionName: 'deleteEntry',
          args: [id],
          chainId: CHAIN_ID,
        }),
      ),
  }
}
