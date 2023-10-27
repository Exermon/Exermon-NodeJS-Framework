import fs from "fs";
import {ABI, Contract} from "./Contract";
import {ethereum} from "../EthereumManager";
import EthereumConfig from "../EthereumConfig";

export interface Contracts {}
export type ContractName = keyof Contracts;
export type ContractOf<T extends ContractName> = Contract<Contracts[T]>

// region ABI管理

export const ContractABIs: {
  [K in ContractName]?: Contracts[K]
} = {};

export function addContract<T extends ContractName>(name: T, abi: Contracts[T]) {
  ContractABIs[name] = abi;
}

// endregion

// region Contract Cache

export type ContractCache = {
  [ChainId in number]: {[CacheName: string]: string}
  // {[ChainId]: {[CacheName]: Address}}
}

let _contractData: ContractCache;
export function getContractCache() {
  const path = EthereumConfig().contractsFile;
  if (!path) return {};

  if (!_contractData)
    try {
      console.log("path", path)
      _contractData = JSON.parse(fs.readFileSync(path, "utf-8"));
    } catch (e) {
      console.error("Get ContractData Error!", e);
      _contractData = {}
    }
  return _contractData;
}
export function getAddress(chainId: number, name: string) {
  return getContractCache()[chainId]?.[name];
}
export function saveAddress(chainId: number, name: string, address: string) {
  const contractCache = getContractCache();
  contractCache[chainId] ||= {};
  contractCache[chainId][name] = address;
  saveContractCache();
}
export function saveContractCache() {
  fs.writeFileSync(EthereumConfig().contractsFile, JSON.stringify(_contractData))
}

// endregion

// region Contract Operations

export function getContract<T extends ContractName>(
  name: T, cacheName?: string, address?: string) {
  const res = findContract(name, cacheName, address);
  const nameStr = cacheName == name ? name : `${cacheName}(${name})`;
  if (!res) throw `${nameStr} is not found!`
  return res;
}

export function findContract<T extends ContractName>(
  name: T, cacheNameOrAddress?: string, address?: string): ContractOf<T> {
  let cacheName: string = name;
  if (cacheNameOrAddress?.startsWith("0x")) address = cacheNameOrAddress;
  else cacheName = cacheNameOrAddress || name;

  const nameStr = cacheName == name ? name : `${cacheName}(${name})`;
  console.info(`Getting ${nameStr} from ${address || "cache"}`)

  const eth = ethereum();
  const hasAddress = !!address;
  address ||= getAddress(eth.config.chainId, cacheName);

  if (!address) {
    console.error(`... Get miss!`);
    return null
  }
  if (!hasAddress) console.log(`... Cached address of ${nameStr} is ${address}`);

  const res = new Contract(
    ContractABIs[name] as Contracts[T], eth, address);

  console.info(`... Completed!`);

  return res;
}

// endregion
