import {
  Contract as _Contract,
  ContractSendMethod,
  CallOptions,
  SendOptions,
  EventData as _EventData,
  EventOptions as _EventOptions,
  PastEventOptions as _PastEventOptions,
} from "web3-eth-contract";
import {AbiItem, AbiType, StateMutabilityType} from "web3-utils";
import {ethMgr} from "../EthereumManager";
import {PromiEvent, TransactionReceipt} from "web3-core";
import {ETHInstance} from "./ETHInstance";

// export type ElementOf<T extends any[]> = T extends (infer T1)[] ? T1 : never;
export type ElementOf<T extends readonly any[]> = T[number];

export interface AbiInput {
  readonly name: string;
  readonly type: string;
  readonly indexed?: boolean;
  readonly components?: readonly AbiInput[];
  readonly internalType?: string;
}
export interface AbiOutput {
  readonly name: string;
  readonly type: string;
  readonly components?: readonly AbiOutput[];
  readonly internalType?: string;
}

export interface ReadonlyAbiItem {
  readonly anonymous?: boolean;
  readonly constant?: boolean;
  readonly inputs?: readonly AbiInput[];
  readonly name?: string;
  readonly outputs?: readonly AbiOutput[];
  readonly payable?: boolean;
  readonly stateMutability?: StateMutabilityType;
  readonly type: AbiType | "receive" | "error";
  readonly gas?: number;
}

export type ABI = readonly ReadonlyAbiItem[];

export type FunctionsOf<T extends ABI> =
  ElementOf<T> & {type: "function"};
export type FunctionNames<T extends ABI> = FunctionsOf<T>["name"]
export type FunctionOf<T extends ABI, Name extends FunctionNames<T>> =
  FunctionsOf<T> & {name: Name}

export type FunctionInputsOf<T extends ABI, Name extends FunctionNames<T>> =
  ElementOf<FunctionOf<T, Name>["inputs"]>
export type FunctionOutputsOf<T extends ABI, Name extends FunctionNames<T>> =
  ElementOf<FunctionOf<T, Name>["outputs"]>

export type FunctionInputTypesOf<T extends ABI, Name extends FunctionNames<T>> =
  InputTypeConvert<FunctionInputsOf<T, Name>["type"]>
export type FunctionOutputTypesOf<T extends ABI, Name extends FunctionNames<T>> =
  InputTypeConvert<FunctionOutputsOf<T, Name>["type"]>
export type FunctionInputNamesOf<T extends ABI, Name extends FunctionNames<T>> =
  FunctionInputsOf<T, Name>["name"] // & number
export type FunctionOutputNamesOf<T extends ABI, Name extends FunctionNames<T>> =
  FunctionOutputsOf<T, Name>["name"]

export type FunctionInputOf<
  T extends ABI, Name extends FunctionNames<T>,
  FName extends FunctionInputNamesOf<T, Name>> =
  FunctionInputsOf<T, Name> & {name: FName}
export type FunctionOutputOf<
  T extends ABI, Name extends FunctionNames<T>,
  FName extends FunctionInputNamesOf<T, Name>> =
  FunctionOutputsOf<T, Name> & {name: FName}

export type FunctionInputFieldOf<T extends ABI, Name extends FunctionNames<T>> =
  {[K in FunctionInputNamesOf<T, Name>]: InputTypeConvert<FunctionInputOf<T, Name, K>["type"]>}
export type FunctionOutputFieldOf<T extends ABI, Name extends FunctionNames<T>> =
  FunctionOf<T, Name>["outputs"][1] extends undefined ? // 如果只有一个参数
    OutputTypeConvert<FunctionOutputsOf<T, Name>["type"]> :
    FunctionOutputsOf<T, Name>["name"] extends "" ? // 如果都是匿名参数
      OutputTypeConvert<FunctionOutputsOf<T, Name>["type"]>[] :
      {[K in FunctionOutputNamesOf<T, Name>]: OutputTypeConvert<FunctionOutputOf<T, Name, K>["type"]>};

export type ConstructorOf<T extends ABI> =
  ElementOf<T> & {type: "constructor"};
export type ConstructorInputsOf<T extends ABI> =
  ElementOf<ConstructorOf<T>["inputs"]>
export type ConstructorInputNamesOf<T extends ABI> =
  ConstructorInputsOf<T>["name"]
export type ConstructorInputOf<T extends ABI,
  FName extends ConstructorInputNamesOf<T>> =
  ElementOf<ConstructorOf<T>["inputs"]>
export type ConstructorInputFieldOf<T extends ABI> =
  {[K in ConstructorInputNamesOf<T>]: InputTypeConvert<ConstructorInputOf<T, K>["type"]>}

export type EventsOf<T extends ABI> =
  ElementOf<T> & {type: "event"};
export type EventNames<T extends ABI> = EventsOf<T>["name"]
export type EventOf<T extends ABI, Name extends EventNames<T>> =
  EventsOf<T> & {name: Name}

export type EventInputsOf<T extends ABI, Name extends EventNames<T>> =
  ElementOf<EventOf<T, Name>["inputs"]>
export type EventInputsNamesOf<T extends ABI, Name extends EventNames<T>> =
  EventInputsOf<T, Name>["name"]
export type EventInputOf<
  T extends ABI, Name extends EventNames<T>,
  EName extends EventInputsNamesOf<T, Name>> =
  EventInputsOf<T, Name> & {name: EName}

export type Number = number;
export type NumberType = `uint${Number}` | `int${Number}`;
export type ArrayType = `${string}[]`;

export type InputTypeConvert<T extends string> = (
  T extends NumberType ? number :
    T extends ArrayType ? any[] :
      T extends "bool" ? boolean :
        T extends "tuple" ? object : string
  ) | string;
export type OutputTypeConvert<T extends string> =
  T extends "bool" ? boolean :
    T extends "tuple" ? any : string;

export type EventValues<T extends ABI, Name extends EventNames<T>> = {
  [K in EventInputsNamesOf<T, Name>]: InputTypeConvert<EventInputOf<T, Name, K>["type"]>
}
export type EventFilter<T extends ABI, Name extends EventNames<T>> = Partial<EventValues<T, Name>>
export type EventOptions<T extends ABI, Name extends EventNames<T>> =
  _EventOptions & { filter?: EventFilter<T, Name> };
export type PastEventOptions<T extends ABI, Name extends EventNames<T>> =
  _PastEventOptions & { filter?: EventFilter<T, Name> };

export type EventData<T extends ABI, Name extends EventNames<T>> =
  _EventData & { returnValues: EventValues<T, Name> }

export type EventListenerCallback<T extends ABI, Name extends EventNames<T>> =
  (err: Error, event: EventData<T, Name>) => void
export type EventListenerRegister<T extends ABI, Name extends EventNames<T>> =
  (options: EventOptions<T, Name>, callback: EventListenerCallback<T, Name>) => any

export type QuickSendOptions = Omit<SendOptions, "from"> & {
  gasMult?: number, log?: boolean
}

export interface ContractMethod<T extends ABI = any, Name extends FunctionNames<T> = any> extends ContractSendMethod {
  call(options?: CallOptions): Promise<FunctionOutputFieldOf<T, Name>>
  quickSend(options?: QuickSendOptions): Promise<TransactionReceipt>; // : PromiEvent<_Contract>;
}

export class Contract<T extends ABI> {

  public ethInstance: ETHInstance;
  public abiItems: T
  public contract: _Contract;

  public address: string
  public data: string

  public methods: {
    [K in FunctionNames<T>]?: (firstArgs?: FunctionInputFieldOf<T, K> | InputTypeConvert<FunctionInputOf<T, K, string>["type"]>,
                               ...args: InputTypeConvert<FunctionInputOf<T, K, string>["type"]>[]) => ContractMethod<T, K>
  } = {}
  public events: {
    [K in EventNames<T>]?: EventListenerRegister<T, K>
  } = {}

  public get web3() { return this.ethInstance.web3; }
  public get account() { return this.ethInstance.account; }

  // region 初始化

  constructor(abiItems: T);
  constructor(abiItems: T, ethInstance: ETHInstance);
  constructor(abiItems: T, ethInstance: ETHInstance, data: string);
  constructor(abiItems: T, ethInstance: ETHInstance, address: string);
  constructor(abiItems: T, ethInstance: ETHInstance, data: string, address: string);
  constructor(abiItems: T, ethInstance?: ETHInstance,
              addressOrData?: string, address?: string) {
    if (!addressOrData?.startsWith("0x"))
      addressOrData = "0x" + addressOrData;
    if (!address?.startsWith("0x"))
      address = "0x" + address;

    const isAddress = addressOrData.length == 42;

    this.ethInstance = ethInstance;
    this.abiItems = abiItems;
    this.address = isAddress ? addressOrData : address;
    this.data = isAddress ? null : addressOrData;

    this.generateContract();
  }

  private generateContract() {
    // @ts-ignore
    this.contract = new this.web3.eth.Contract(
      this.abiItems as any, this.address);
    this.createMethods();
    this.createEvents();
  }
  private createMethods() {
    this.abiItems.forEach(abi => this.createMethod(abi))
  }
  private createMethod(abi: ReadonlyAbiItem) {
    if (!abi.name) return;

    this.methods[abi.name] = (firstArgs?, ...args) => {
      // if (typeof firstArgs == "object")
      const isObjectArgs = (typeof firstArgs == "object" && args.length <= 0);
      const params = isObjectArgs ? this.paramsConvert(firstArgs, abi.inputs) :
        firstArgs == undefined ? [...args] : [firstArgs, ...args]
      const tx = this.contract.methods[abi.name](...params) as ContractSendMethod;
      return this.contractMethodWrapper(tx);
    }
  }
  private createEvents() {
    this.events = this.contract.events;
  }

  // endregion

  // region 事件

  public once<Name extends EventNames<T>>(
    event: Name,
    callbackOrOptions?: EventListenerCallback<T, Name> | PastEventOptions<T, Name>,
    callback?: EventListenerCallback<T, Name>
  ) {
    if (callbackOrOptions instanceof Function)
      this.contract.once(event, callbackOrOptions)
    else
      this.contract.once(event, callbackOrOptions, callback)
  }
  public async getPastEvents<Name extends EventNames<T>>(
    event: Name, options?: PastEventOptions<T, Name>) {
    return await this.contract.getPastEvents(event, options) as EventData<T, Name>[];
  }

  // endregion

  // region 数据封装转换

  private paramsConvert(params: object, inputs: ReadonlyAbiItem["inputs"]) {
    const res = [];
    params && Object.keys(params).forEach(key => {
      const idx = inputs.findIndex(i => i.name == key);
      res[idx] = params[key];
    })
    return res;
  }
  private contractMethodWrapper(tx: ContractSendMethod) {
    return {
      ...tx,
      quickSend: async (options: QuickSendOptions) => {
        const method = tx["_method"]?.name, args = tx["arguments"];
        console.log("quickSend Start:", method, args, tx)
        try {
          const web3 = this.web3;
          const from = this.account.address;
          if (options?.log) console.log("... Estimating gas from", from)
          const gas = await tx.estimateGas({ from })
          if (options?.log) console.log("... Gas:", gas)
          let gasPrice = web3.utils.toBN(await web3.eth.getGasPrice());
          if (options?.gasMult) gasPrice = gasPrice.muln(options.gasMult);
          if (options?.log) console.log("... Gas price:", gasPrice.toString())
          const res: any = await tx.send({
            from, gas, gasPrice: gasPrice.toString(), ...options
          })
          console.log("... Success!", method, tx, res);
          return res as TransactionReceipt;
        } catch (e) {
          console.error("... Error!", method, tx, e);
          throw e;
        }
      },
    } as ContractMethod
  }

  // endregion

  // region 部署

  private get constructorABI() {
    return this.abiItems.find(abi => abi.type == "constructor")
  }

  public deploy(args?: ConstructorInputFieldOf<T>) {
    if (!this.data) throw "No deploy data!";

    const params = this.paramsConvert(args, this.constructorABI.inputs)
    const tx = this.contract.deploy({
      data: this.data,
      arguments: params
    });

    return this.contractMethodWrapper(tx);
  }
  public quickDeploy(args?: ConstructorInputFieldOf<T>, options?: QuickSendOptions) {
    return this.deploy(args).quickSend(options);
  }

  // endregion
}
