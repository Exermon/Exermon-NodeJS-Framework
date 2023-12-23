import {ethers} from "ethers";

export type Chain = {
  chainId: number
  rpcUrl?: string
  explorer?: string
}
export type ChainType = "mainnet" | "testnet" | "devnet"

export const Chains: {[K in ChainType]?: Chain} = {
  mainnet: {
    chainId: 687985,
    // rpcUrl: 'http://207.148.76.79:8545',
  },
  testnet: {
    chainId: 687984,
    // rpcUrl: 'http://207.148.76.79:8545',
  },
  devnet: {
    chainId: 687986,
    rpcUrl: 'http://111.230.227.84:8545',
  },
}

const _providers = {} as {[K in ChainType]?: ethers.providers.JsonRpcProvider}
export function getProvider(chainType: ChainType): ethers.providers.JsonRpcProvider {
  const chain = Chains[chainType]
  if (!chain) throw new Error(`invalid chain type: ${chainType}`)

  return new ethers.providers.JsonRpcProvider(chain.rpcUrl)
}
