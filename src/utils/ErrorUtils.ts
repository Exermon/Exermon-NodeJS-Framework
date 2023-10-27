import {MathUtils} from "./MathUtils";

export function errorCatcher<T>(logFlag: string, defaultV?: T) {
  return (obj, key, desc) => {
    const oriFunc = desc.value;
    desc.value = async function (...p) {
      try { return await oriFunc.call(this, ...p) }
      catch (e: any) {
        console.log(`[${logFlag} Request Error]`, e, "\n Params: ", p)
        return defaultV
      }
    }
  }
}

class TryHandler<T = any> {
  private readonly title: string;
  private handlers: {name: string, handler: () => Promise<T>}[] = [];

  constructor(title: string, name?: string, handler?: () => Promise<T>) {
    this.title = title;
    if (name && handler) this.or(name, handler);
  }

  public or(name: string, handler: () => Promise<T>) {
    this.handlers.push({name, handler});
    return this;
  }
  public async do() {
    const id = `${this.title}-${MathUtils.randomString(8)}`;
    console.log(`[TryHandler: ${id}] Do`, this.title, this.handlers.map(h => h.name));

    let res: T, i;
    for (i = 0; i < this.handlers.length; i++) {
      const {name, handler} = this.handlers[i];
      console.log(`[TryHandler: ${id}] Trying ${name}(${i + 1}/${this.handlers.length})`);
      try {
        res = await handler(); break;
      } catch (e) {
        if (i < this.handlers.length - 1)
          console.error(`[TryHandler: ${id}] Error ${name}(${i + 1}/${this.handlers.length}), try next one`, e)
        else {
          console.error(`[TryHandler: ${id}] All trials are failed`, e)
          throw e;
        }
      }
    }
    console.log(`[TryHandler: ${id}] Done by ${this.handlers[i].name}(${i + 1}/${this.handlers.length})`, res);
    return res;
  }
}
export function doTry<T>(title: string, name?: string, handler?: () => Promise<T>) {
  return new TryHandler(title, name, handler);
}
