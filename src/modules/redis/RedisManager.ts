import {BaseManager, getManager, manager} from "../../app/ManagerContext";
import {createClient, RedisClientType} from "redis";
import {config} from "../../config/ConfigManager";
import {CacheableResult, CacheableType, cacheMgr, ICacheHandler} from "../cache/CacheManager";
import {stringify} from "ts-jest";
import {scheduleTask} from "../../utils/CronUtils";
import RedisConfig from "./RedisConfig";

class RedisCacheHandler implements ICacheHandler {

  public get name() { return "Redis" }

  public setKV<T>(key: string, val: T, seconds?: number): Promise<T> {
    return redisMgr().setKVData<T>(key, val, seconds);
  }
  public getKV<T>(key: string): Promise<T> {
    return redisMgr().getKVData<T>(key);
  }
  public deleteKV(key: string) {
    return redisMgr().deleteKV(key)
  }

  public set<T>(group: string, key: string, val: T): Promise<T> {
    return redisMgr().setData<T>(group, key, val);
  }
  public get<T>(group: string, key: string): Promise<T> {
    return redisMgr().getData<T>(group, key);
  }
  public delete(group: string, key: string) {
    return redisMgr().delete(group, key)
  }
}


export type zsetPair = {
  key: string
  score: number
}


export enum DelayQueueName {
  SBTReward = "sbtReward"
}

export function redisMgr() {
  return getManager(RedisManager)
}

export function redis() {
  return redisMgr().client
}

@manager
export class RedisManager extends BaseManager {
  public client: RedisClientType<any, any>;

  public async onStart() {
    super.onStart();
    // await this.connect();
    // this.setupCacheHandler();
  }
  public async connect() {
    if (!RedisConfig()) return;
    const host = RedisConfig().host
    const port = RedisConfig().port
    const password = RedisConfig().password
    const db = RedisConfig().db || 0

    this.client = createClient({
      url: this.getConnectStr({ host, port, password, db})
    })
    this.client.on('error', console.error)
    await this.client.connect()
  }
  private getConnectStr(config) {
    return `redis://:${config.password}@${config.host}:${config.port}/${config.db}`
  }

  private setupCacheHandler() {
    cacheMgr().registerHandler(new RedisCacheHandler());
  }

  // region 简单kv结构

  /**
   * 设置KV
   */
  public async setKV(key: string, value: string, seconds?: number) {
    await this.client.set(key, value)
    seconds && this.setExpireTime(key, seconds);
    return value
  }
  public async setKVData<T>(key: string, data: T, seconds?: number) {
    const value = JSON.stringify(data);
    await this.setKV(key, value, seconds);
    return data;
  }

  /**
   * 获取KV
   * @param key
   */
  public async getKV(key: string) {
    try { return await this.client.get(key) }
    catch (e) { return null }
  }
  public async getKVData<T>(key: string) {
    return JSON.parse(await this.getKV(key)) as T;
  }

  /**
   * 删除KV
   * @param key
   */
  public async deleteKV(key: string) {
    await this.client.del(key);
  }

  /**
   * 设置过期时间
   */
  public setExpireTime(key: string, seconds: number){
    this.client.expire(key, seconds);
  }

  // endregion

  // region 查询

  public async mGet<T extends CacheableType>(
    keys: string[], type?: T) {
    const rawValues = await this.client.mGet(keys);
    const values = cacheMgr().convertTypeForArray(rawValues, type);
    return values.reduce((res, v, i) => ({...res, [keys[i]]: v}), {});
  }

  // endregion

  // region Hash结构设置数据

  /**
   * 设置数据
   */
  public setString(key: string, field: string, value: string) {
    return this.client.hSet(key, field, value);
  }
  public async setData<T>(key: string, field: string, data: T) {
    const value = JSON.stringify(data);
    await this.setString(key, field, value);
    return data;
  }

  /**
   * 获取数据（type不填则为string）
   */
  public getString(key: string, field: string) {
    return this.client.hGet(key, field);
  }
  public async getData<T>(key: string, field: string){
    return JSON.parse(await this.getString(key, field)) as T;
  }

  /**
   * 删除
   */
  public delete(key, field) {
    return this.client.hDel(key, field);
  }

  // endregion

  //region list操作
  /**
   * 向队列名为key的list结构中插入列表
   * @param key
   * @param values
   */
  public queuePush(key: string, values: string[]) {
    this.client.rPush(key, values); //从右边插入
  }

  public async queuePop(key: string) {
    return await this.client.lPop(key);
  }
  //endregion


  //region 延迟队列功能
  private relayQueues = new Map<DelayQueueName, boolean>();

  public activeQueueTask(queueName: DelayQueueName, frequency: number, task: Function) {
    if (this.relayQueues.get(queueName)) return //消费任务初始化成功
    //启动持续消费任务
    scheduleTask(`*/${frequency} * * * * *`, async function () {
      //从queue中取参数
      const arg = await redisMgr().queuePop(queueName)
      if (!arg) return
      //将参数进行解析，任务执行
      const o = JSON.parse(arg)
      await task.apply(this, o)
    }, false)
    this.relayQueues.set(queueName, true)
  }

  //endregion


  //region ZSET
  public async zsetAdd(set: string, ...pairs:[zsetPair]) {
    await this.client.ZADD(set, pairs.map(v => {
      return {score: v.score, value: v.key}
    }))
  }

  public async zsetRemove(set: string, ...values: [string]) {
    await this.client.ZREM(set, values);
  }


  public async zsetMinScore(set: string) {
    const list =  await this.client.ZRANGE_WITHSCORES(set, 0, 0);
    if (list.length == 0) return null
    return list[0];
  }

  public async zsetMaxScore(set: string) {
    const list =  await this.client.ZRANGE_WITHSCORES(set, -1, -1);
    if (list.length == 0) return null
    return list[0];
  }

  //endregion
}

/**
 * @param queueName 队列名字
 * @param frequency 每隔几秒钟进行执行
 */
export function delay<T>(queueName: DelayQueueName, frequency: number) {
  return function(target:any,methodName:any,desc:any){
    const method: Function = desc.value;
    redisMgr().activeQueueTask(queueName, frequency, method)
    desc.value = function (arg:any){
      const queueValue = JSON.stringify(arg);
      redisMgr().queuePush(queueName, [queueValue])
    }
  }
}
