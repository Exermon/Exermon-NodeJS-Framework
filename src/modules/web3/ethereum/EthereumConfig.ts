import {config} from "../../../config/ConfigManager";

export type ChainType = "ethereum" | "goerli" | "polygon" | "mumbai" | "zksync-test" | "zksync" | "bsc" | "optimism" | "arbitrum" | string;
export type ChainConfig = {
  url: string,
  chainId?: number,
  needRefresh?: boolean,
}

export type ChainConfigs = {[T in ChainType]?: string | ChainConfig}

export interface EthereumConfig {
  providers?: ChainConfigs
  defaultProvider?: ChainType
  privateKey: string
  contractsFile?: string
  chainsFile?: string
}

declare module "../../../config/ConfigType" {
  interface MainConfig {
    ethereum?: EthereumConfig
  }
}

export default function() { return config().ethereum }
