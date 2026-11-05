# Confidential Vault

An onchain vault for private notes. You encrypt a secret in your browser, store the encrypted bytes in a smart contract for a small flat USDC fee, and decrypt it whenever you want with your wallet.

Built with [Arc Studio](https://studio.arc.io)

## What it does

- Store secrets (a title and text, up to about 4 KB each) on Arc Testnet. Everything is encrypted before it leaves your browser.
- Pay a flat fee of 0.01 USDC for each new entry. Editing and deleting your own entries has no protocol fee.
- Unlock with a free wallet signature, then read, copy, edit, or delete your entries.
- Follow the built-in getting-started checklist and the "How it works" tour (it opens on your first visit).
- Blockchains are public: others can see that you stored something, its size and its timing, but not its content. Losing access to your wallet means losing access to your secrets. Deleting an entry removes it from the contract, but older chain history keeps the encrypted bytes.

## Deployment

The vault contract is live on Arc Testnet at `0x5a7bb21f4ec849fdf155562eddba45765a6cd539` ([view on explorer](https://explorer.testnet.arc.io/address/0x5a7bb21f4ec849fdf155562eddba45765a6cd539)). It is immutable and charges 0.01 USDC per new entry (the owner can change this up to a hard cap of 1 USDC).

You need test USDC on Arc Testnet to save entries.

## Tech stack

- React, Vite, TypeScript, Tailwind CSS, Framer Motion
- wagmi, viem, ConnectKit
- Solidity 0.8.28 with Foundry and OpenZeppelin
- Arc Testnet, USDC

## Development

Prerequisites: [Bun](https://bun.sh), [Foundry](https://getfoundry.sh), and a browser wallet.

```bash
bun install
cp .env.example .env
bun run dev
```

Other commands:

```bash
bun run check            # lint and typecheck
bun run contracts:build  # compile the contract
bun run contracts:test   # run contract tests
```

### Environment variables

- `VITE_VAULT_ADDRESS`: address of the deployed vault contract (public value, see `.env.example`).

## Documentation

The contract's design, roles, and threat model are in `contracts/ConfidentialVault-design.md`.
