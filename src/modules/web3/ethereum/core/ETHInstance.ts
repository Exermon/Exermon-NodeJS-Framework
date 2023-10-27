import {ChainConfig, ChainType} from "../EthereumConfig";
import Web3 from "web3";
import {Account} from "web3-core";
import {WebsocketProviderOptions} from "web3-core-helpers";

export class ETHInstance<T extends ChainType = any> {

  public chainType: T;

  public config: ChainConfig;
  public privateKey: string;

  public web3: Web3
  public account?: Account

  public isStarted = false;

  constructor(type: T, urlOrConfig: string | ChainConfig, privateKey?: string) {
    if (typeof urlOrConfig == "string")
      urlOrConfig = {url: urlOrConfig, chainId: 0}

    this.chainType = type;
    this.config = urlOrConfig;
    this.privateKey = privateKey;
  }

  public start() {
    if (this.isStarted) return this
    this.isStarted = true;
    this.refresh(true)

    return this
  }

  public refresh(force = false) {
    if (!this.config.needRefresh && !force) return;

    // Clear
    if (this.web3) {
      this.web3.eth.clearSubscriptions((err, res) =>
        console.log("clearSubscriptions", err, res));
      this.web3.setProvider(null);
      this.web3 = null;
    }

    // WebSocketProvider
    if (this.config.url.startsWith("ws://") || this.config.url.startsWith("wss://")) {
      const options: WebsocketProviderOptions = {
        timeout: 30000, // ms

        clientConfig: {
          // Useful if requests are large
          maxReceivedFrameSize: 100000000,   // bytes - default: 1MiB
          maxReceivedMessageSize: 100000000, // bytes - default: 8MiB

          // Useful to keep a connection alive
          keepalive: true,
          keepaliveInterval: -1 // ms
        },

        // Enable auto reconnection
        reconnect: {
          auto: true,
          delay: 1000, // ms
          maxAttempts: 10,
          onTimeout: false
        }
      };
      const provider = new Web3.providers.WebsocketProvider(this.config.url, options)
      this.web3 = new Web3(provider);
    } // OtherProvider
    else this.web3 = new Web3(this.config.url);

    if (this.privateKey) {
      this.account = this.web3.eth.accounts.privateKeyToAccount(this.privateKey);
      this.web3.eth.accounts.wallet.add(this.account);
      // this.web3.defaultAccount = this.account.address;
    }

    console.log("[Web3Provider Refresh]", this.chainType, this)
  }

  public get eth() {
    return this.web3.eth
  }

  public get utils() {
    return this.web3.utils
  }

  // public async getBlock(blockHashOrBlockNumber: BlockNumber | string) {
  //   return this.web3.eth.getBlock(blockHashOrBlockNumber);
  // }
  // public async getTransaction(txHash: string) {
  //   return this.web3.eth.getTransaction(txHash);
  // }
}
