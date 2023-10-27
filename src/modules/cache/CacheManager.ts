import {BaseManager, getManager, manager} from "../../app/ManagerContext";

export type CacheableType =
	NumberConstructor | StringConstructor | BooleanConstructor | ObjectConstructor;
export type CacheableResult<T extends CacheableType> =
	T extends NumberConstructor ? number :
		T extends StringConstructor ? string :
			T extends BooleanConstructor ? boolean : object

export interface ICacheHandler {
	get name(): string

	setKV<T>(key: string, val: T, seconds?: number): Promise<T>;
	getKV<T>(key: string): Promise<T>;
	deleteKV(key: string);

	set<T>(group: string, key: string, val: T, seconds?: number): Promise<T>;
	get<T>(group: string, key: string): Promise<T>;
	delete(group: string, key: string);
}

/**
 * 默认Handler
 */
class DefaultCacheHandler implements ICacheHandler {

	public get name() { return "Default" }

	/**
	 * KV
	 */
	public async setKV<T>(key: string, val: T, seconds?: number): Promise<T> {
		cacheMgr().kvCache[key] = val;
		seconds && this.setExpireTime(key, seconds);
		return val;
	}
	public async getKV<T>(key: string): Promise<T> {
		return cacheMgr().kvCache[key];
	}
	public deleteKV(key: string) {
		delete cacheMgr().kvCache[key];
	}

	/**
	 * 定时删除一个组下所有缓存
	 */
	public setExpireTime(key: string, seconds: number) {
		setTimeout(() => this.deleteKV(key), seconds * 1000)
	}

	/**
	 * Hash
	 */
	public async set<T>(group: string, key: string, val: T): Promise<T> {
		cacheMgr().hashCache[group] ||= {};
		return cacheMgr().hashCache[group][key] = val;
	}
	public async get<T>(group: string, key: string): Promise<T> {
		return cacheMgr().hashCache[group]?.[key];
	}
	public delete(group: string, key: string) {
		delete cacheMgr().hashCache[group]?.[key];
	}
}

export function cacheMgr() {
	return getManager(CacheManager)
}

@manager
export class CacheManager extends BaseManager {

	public kvCache: {[G: string]: any} = {};
	public hashCache: {[G: string]: {[K: string]: any}} = {};

	public cacheHandlers: ICacheHandler[] = [new DefaultCacheHandler()];

	public registerHandler(handler: ICacheHandler) {
		this.cacheHandlers.unshift(handler);
	}

	/**
	 * KV
	 */
	public async setKV(key: string, val: any, seconds?: number) {
		for (const handler of this.cacheHandlers)
			try { return await handler.setKV(key, val, seconds) }
			catch (error) { console.error("Set KV Cache Error: ", handler.name, {error, key, val, seconds}) }
	}
	public async getKV<T extends CacheableType>(
		key: string, type?: T): Promise<CacheableResult<T>> {
		for (const handler of this.cacheHandlers)
			try { return this.convertType(await handler.getKV(key), type); }
			catch (error) { console.error("Get KV Cache Error: ", handler.name, {error, key}) }
	}
	public async deleteKV(key: string) {
		for (const handler of this.cacheHandlers)
			try { return await handler.deleteKV(key) }
			catch (error) { console.error("Delete KV Cache Error: ", handler.name, {error, key}) }
	}

	public convertType<T extends CacheableType>(
		data: any, type?: T): CacheableResult<T> {
		if (typeof data == "string")
			switch (type) {
				case Number: data = Number(data); break;
				case Boolean:
					data = !["false", "null", "undefined", "0"].includes(data)
						&& Boolean(data); break;
				case Object: data = JSON.parse(data); break;
			}
		return data;
	}
	public convertTypeForArray<T extends CacheableType>(
		array: any[], type?: T): CacheableResult<T>[] {
		return array.map(d => this.convertType(d, type));
	}

	/**
	 * Hash
	 */
	public async set(group: string, key: string, val: any) {
		for (const handler of this.cacheHandlers)
			try { return await handler.set(group, key, val) }
			catch (error) { console.error("Set Cache Error: ", handler.name, {error, group, key, val}) }
	}
	public async get(group: string, key: string) {
		for (const handler of this.cacheHandlers)
			try { return await handler.get(group, key) }
			catch (error) { console.error("Get Cache Error: ", handler.name, {error, group, key}) }
	}
	public async delete(group: string, key: string) {
		for (const handler of this.cacheHandlers)
			try { return await handler.delete(group, key) }
			catch (error) { console.error("Delete Cache Error: ", handler.name, {error, group, key}) }
	}

}
