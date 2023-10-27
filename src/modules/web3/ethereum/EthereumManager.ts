import {BaseManager, getManager, manager} from "../../../app/ManagerContext";
import EthereumConfig, {ChainConfig, ChainConfigs, ChainType} from "./EthereumConfig";
import {schedule} from "../../../utils/CronUtils";
import fs from "fs";
import {ETHInstance} from "./core/ETHInstance";

export function chainName() {
  return EthereumConfig().defaultProvider || "ethereum"
}
export function chain() { return ethMgr().chain(chainName()) }
export function chainId() { return chain()?.chainId || 1 }

export function ethereum(provider?: ChainType | number) {
  return provider ?
    ethMgr().instance(provider)?.start() :
    ethMgr().instances[chainName()]?.start();
}

export function toEther(wei: string) {
  return Number(ethereum().web3.utils.fromWei(wei))
}
export function toWei(ether: string | number) {
  return ethereum().web3.utils.toWei(ether.toString());
}

export function ethMgr() {
  return getManager(EthereumManager)
}

@manager
export class EthereumManager extends BaseManager {
  public instances: {[T in ChainType]?: ETHInstance<T>} = {};

  constructor() {
    super();
    const providers = this.chainConfigs();
    const privateKey = EthereumConfig().privateKey;

    Object.keys(providers).forEach((key: any) =>
      this.instances[key] = new ETHInstance(key, providers[key], privateKey)
    )
  }

  @schedule("0 0/15 * * * *")
  public refreshWebsocketProviders() {
    Object.keys(ethMgr().instances).forEach(
      (key: ChainType) => ethMgr().instances[key].refresh())
  }

  private _chainConfigs: ChainConfigs;
  public chainConfigs() {
    if (!this._chainConfigs) {
      if (EthereumConfig().providers)
        this._chainConfigs = EthereumConfig().providers;

      const path = EthereumConfig().chainsFile;
      if (!path) this._chainConfigs = {};

      try {
        console.log("[ChainConfigs] Path", path)
        this._chainConfigs = JSON.parse(fs.readFileSync(path, "utf-8"));
      } catch (e) {
        console.error("[ChainConfigs] Error!", e);
        this._chainConfigs = {}
      }
    }
    return this._chainConfigs;
  }

  public chain(chainNameOrChainId: ChainType | number): ChainConfig {
    if (typeof chainNameOrChainId == "string") {
      const chain = this.chainConfigs()[chainNameOrChainId]
      return typeof chain == "object" ? chain : {url: chain};
    }

    const chainConfigs = this.chainConfigs()
    return Object.values(chainConfigs).find(
      c => typeof c == "object" && c.chainId == chainNameOrChainId
    ) as ChainConfig;
  }
  public instance(chainNameOrChainId: ChainType | number) {
    if (typeof chainNameOrChainId == "string")
      return this.instances[chainNameOrChainId];

    const chainConfigs = this.chainConfigs()
    const chainName = Object.keys(chainConfigs).find(
      key => typeof chainConfigs[key] == "object" &&
        (chainConfigs[key] as ChainConfig)?.chainId == chainNameOrChainId)
    return this.instances[chainName];
  }

}

