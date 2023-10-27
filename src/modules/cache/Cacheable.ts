import {CacheableType, cacheMgr} from "./CacheManager";

export type KeyGenFunc = ((...args) => string);

export function cacheable(
  objOrKeyGenFnOrSecondsOrType?: object | KeyGenFunc | number | CacheableType,
  keyOrSecondsOrType?: string | number | CacheableType,
  descOrType?: CacheableType | PropertyDecorator | any): any {
  let obj: object, key: string, desc: PropertyDecorator,
    keyGenFn: KeyGenFunc, seconds: number, type: CacheableType;

  if ([Number, String, Boolean, Object]
    .includes(objOrKeyGenFnOrSecondsOrType as CacheableType))
    type = objOrKeyGenFnOrSecondsOrType as CacheableType;
  else if (objOrKeyGenFnOrSecondsOrType instanceof Function)
    keyGenFn = objOrKeyGenFnOrSecondsOrType as KeyGenFunc;
  else if (typeof objOrKeyGenFnOrSecondsOrType == "number")
    seconds = objOrKeyGenFnOrSecondsOrType
  else obj = objOrKeyGenFnOrSecondsOrType as object;

  if ([Number, String, Boolean, Object]
    .includes(keyOrSecondsOrType as CacheableType))
    type = keyOrSecondsOrType as CacheableType;
  else if (typeof keyOrSecondsOrType == "number")
    seconds = keyOrSecondsOrType
  else if (typeof keyOrSecondsOrType == "string")
    key = keyOrSecondsOrType

  if ([Number, String, Boolean, Object]
    .includes(descOrType as CacheableType))
    type = descOrType as CacheableType;
  else desc = descOrType as PropertyDecorator;

  // 本身是一个修饰器
  if (desc) cacheable()(obj, key, desc);

  else return (obj, key, desc) => {
    keyGenFn ||= (...p) => `${key}:${p.join(",")}`;
    type ||= String;

    const oriFunc = desc.value;
    desc.value = async function (...p) {
      const pLen = p.length;
      const force =
        pLen == oriFunc.length && // 实际参数长度和函数的参数长度一致
        p[pLen - 1] === true; // 最后一个boolean参数为Force的标志

      // 除force外的真实参数
      const realP = force ? p.slice(0, pLen - 1) : p;
      const key = keyGenFn(...realP);

      let data = force ? null : (await cacheMgr().getKV(key, type));
      if (data == null) {
        data = await oriFunc.call(this, ...p);
        await cacheMgr().setKV(key, data, seconds);
      }
      return data;
    }
  }
}

// /**
//  * 从缓存中获取数据，如果不存在，执行realFn获取并重建缓存
//  * @param args 参数标识
//  * @param keyGenFn cache key生成函数
//  * @param realFn 获取真实函数
//  * @param seconds 过期秒数
//  */
// export async function obtain<Arg extends any[], T>(
//   keyGenFn: (...args: Arg) => string,
//   realFn:  (...args: Arg)  => Promise<T>,
//   args: Arg,
//   type?: CacheableType,
//   seconds?: number
// ): Promise<T> {
//   const data = (await cacheMgr().getKV(keyGenFn(...args))) as T;
//   if (!data) {
//     const realData = await realFn(id)
//     await cacheMgr().setKV(keyGenFn(id), realData, seconds)
//     return realData
//   }
//   return data
// }
//
// // export async function clearCache(
// //   id: string,
// //   keyGenFn: (id: string) => string,
// // ) {
// //   await cacheMgr().deleteKV(keyGenFn(id));
// // }
//
// export async function forceUpdate<T>(
//   id: string,
//   keyGenFn: (id: string) => string,
//   realFn:  (id: string) => Promise<T>,
//   expireSeconds?: number
// ): Promise<T> {
//   const realData = await realFn(id)
//   await cacheMgr().setKV(keyGenFn(id), realData, expireSeconds)
//   return realData
// }
