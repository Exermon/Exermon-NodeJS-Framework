import {Constructor, getSingleton} from "../../utils/SingletonUtils";
import bodyparser from "body-parser";
import 'reflect-metadata'
import {Express, Request, Response, Router} from "express";
import * as path from "path";
import {BaseManager, getManager, manager} from "../../app/ManagerContext";
import {httpMgr} from "./HTTPManager";
import {getMetaData, isChildClassOf} from "../../utils/TypeUtils";
import {
	BaseError,
	BaseResponse,
	DatabaseError,
	NoJsonResponse,
	PrueResponse,
	SuccessResponse
} from "./utils/ResponseUtils";
import {config} from "../../config/ConfigManager";
import HTTPConfig from "./HTTPConfig";

export class ParamDef {
	name: string;
	type: Constructor;
	index: number;
	optional: boolean = false;
	default_: any = null;
}

export class RequestData {
	method: 'post' | 'get';
	path: string;
	obj: any;
	key: string;
	desc: { value: Function }
}

export function route<T extends BaseInterface>(route = "/") {
	return (clazz: Constructor<T>) => {
		const setting = InterfaceBuilder.getSetting(clazz);
		setting.instance = new clazz();
		setting.path = route;

		interfaceMgr().registerInterface(clazz);
	}
}

export function post(path: string) {
	return (obj, key, desc) => {
		const clazz = obj.constructor;
		InterfaceBuilder.createInterface(
			clazz, key, "post", path);
	}
}
export function get(path: string) {
	return (obj, key, desc) => {
		const clazz = obj.constructor;
		InterfaceBuilder.createInterface(
			clazz, key, "get", path);
	}
}
export function put(path: string) {
	return (obj, key, desc) => {
		const clazz = obj.constructor;
		InterfaceBuilder.createInterface(
			clazz, key, "put", path);
	}
}
export function del(path: string) {
	return (obj, key, desc) => {
		const clazz = obj.constructor;
		InterfaceBuilder.createInterface(
			clazz, key, "delete", path);
	}
}

export function body(name: string,
					 optional: boolean = false, default_?) {
	return (obj, key, index) => {
		const clazz = obj.constructor;
		const type = Reflect.getMetadata("design:paramtypes", obj, key)[index];
		InterfaceBuilder.createParam(clazz, key, "body",
			index, name, type, optional, default_);
	}
}
export function query(name: string,
					  optional: boolean = false, default_?) {
	return (obj, key, index) => {
		const clazz = obj.constructor;
		const type = Reflect.getMetadata("design:paramtypes", obj, key)[index];
		InterfaceBuilder.createParam(clazz, key, "query",
			index, name, type, optional, default_);
	}
}
export function params(name: string,
											 optional: boolean = false, default_?) {
	return (obj, key, index) => {
		const clazz = obj.constructor;
		const type = Reflect.getMetadata("design:paramtypes", obj, key)[index];
		InterfaceBuilder.createParam(clazz, key, "params",
			index, name, type, optional, default_);
	}
}
export function custom(name: string) {
	return (obj, key, index) => {
		const clazz = obj.constructor;
		InterfaceBuilder.createParam(clazz, key, "custom", index, name);
	}
}

export function makeMiddle(obj, key, desc, nameOrFunc: string | MiddleFunc, func?: MiddleFunc) {
	const flag = typeof nameOrFunc == "string";
	const name = flag ? nameOrFunc : nameOrFunc.name;
	if (!flag) func = nameOrFunc;

	const clazz = obj.constructor;
	const setting = InterfaceBuilder.createInterface(clazz, key);
	setting.middles.push(func);
	func.keyName = name;
}

export function middleWare(obj, key, desc) {
	interfaceMgr().addMiddleWare(desc.value);
}

export function routeMiddleWare(obj, key, desc) {
	interfaceMgr().addRouteMiddleWare(desc.value);
}

export function localMiddleWare(middleFunc: any) {
	return (obj, key, desc: PropertyDescriptor) => {
		const clazz = obj.constructor;
		const setting = InterfaceBuilder.createInterface(clazz, key);
		setting.middles.push(middleFunc)
	}
}

export function interfaceMgr() {
	return getManager(InterfaceManager)
}
export type MiddleWareFunc = (req: any, res: any, next: Function) => any;
export type RouteMiddleWare = (itf: InterfaceSetting) => MiddleWareFunc;

export type ParamSetting = {
	method: 'body' | 'query' | 'params' | 'common'
	name: string
	type: Constructor
	index: number
	optional: boolean
	default_: any
}

export type MiddleFunc<P extends {} = any> = ((req: Request, res?: Response, next?) => Promise<P>) & {keyName?: string};

export type InterfaceSetting = {
	method: 'post' | 'get' | 'put' | 'delete'
	path: string
	key: string
	params: ParamSetting[]
	middles: MiddleFunc[]
}

type RouteSetting<M extends BaseInterface> = {
	instance: M
	path: string
	interfaces: {[T: string]: InterfaceSetting}
}
const InterfaceSettingKey = "interfaceSetting";

export class InterfaceBuilder {

	public static getSetting<T extends BaseInterface>(type: Constructor<T>) {
		return getMetaData<RouteSetting<T>>(
			type, InterfaceSettingKey, {
				instance: null, path: "/", interfaces: {}
			});
	}

	public static createInterface<T extends BaseInterface>(
		clazz: Constructor<T>, key, method?, route?) {
		const setting = this.getSetting(clazz);
		const res: InterfaceSetting =
			setting.interfaces[key] ||= {} as InterfaceSetting;
		res.method ||= method; res.path ||= route;
		res.key ||= key; res.params ||= []
		res.middles ||= []
		return res;
	}
	public static createParam<T extends BaseInterface>(
		clazz: Constructor<T>, key, method, index, name, type?,
		optional = false, default_ = undefined) {
		const setting = this.createInterface(clazz, key);
		const res = setting.params[index] ||= {} as ParamSetting;
		res.method = method; res.index = index;
		res.name = name; res.type = type;
		res.default_ = default_; res.optional = optional;
		return res;
	}
}

@manager
class InterfaceManager extends BaseManager {

	public baseMiddleWares: MiddleWareFunc[] = [];
	public routeMiddleWares: RouteMiddleWare[] = [];
	public requests: RequestData[] = [];
	public interfaceTypes: Constructor<BaseInterface>[] = [];

	constructor() {
		super();
		this.setupAppProcessors();
	}

	/**
	 * 通过指定url获取接口设置
	 * @param url
	 */
	private urlCache: {[T: string]: InterfaceSetting} = {};
	public getSettingByUrl(url: string) {
		if (!this.urlCache[url]) {
			const rawUrl = url;
			url = url.split("?")[0]; // 把get请求的参数去掉得到路由部分

			const settings = this.interfaceTypes
				.map(it => InterfaceBuilder.getSetting(it));
			const setting = settings.find(s => url.startsWith(s.path));
			if (!setting) return null;

			url = url.replace(/\//g, "\\");

			for (let key in setting.interfaces) {
				const iSetting = setting.interfaces[key];
				const fullPath = path.join(setting.path, iSetting.path)
				if (url == fullPath)
					return this.urlCache[rawUrl] = iSetting;
			}
			return null;
		}
		return this.urlCache[url];
	}

	// region APP接口处理

	private setupAppProcessors() {
		httpMgr().registerAppProcessor(this.setupBase.bind(this));
		httpMgr().registerAppProcessor(this.setupMiddleWares.bind(this));
		httpMgr().registerAppProcessor(this.setupInterfaces.bind(this));
	}
	private setupBase(app: Express) {
		// app.get("", () => {}, ())

		// 设置跨域
		app.all('*', (req, res, next) => {
			this.logRequest("RECEIVE", req);

			res.header("Access-Control-Allow-Origin", req.headers.origin); // 设置允许来自哪里的跨域请求访问（req.headers.origin为当前访问来源的域名与端口）
			res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS"); // 设置允许接收的请求类型
			res.header("Access-Control-Allow-Headers",
				"Content-Type, x-requested-with, X-Custom-Header, Request-Ajax, Authorization"); // 设置请求头中允许携带的参数
			res.header("Access-Control-Allow-Credentials", "true"); // 允许客户端携带证书式访问。保持跨域请求中的Cookie。注意：此处设true时，Access-Control-Allow-Origin的值不能为 '*'
			res.header("Access-Control-Max-Age", "1000"); // 设置请求通过预检后多少时间内不再检验，减少预请求发送次数

			next();
		});

		app.use(bodyparser.json({limit: '10mb'}))
		app.use(bodyparser.urlencoded({limit: '10mb', extended: true}))
	}

	// region 中间件

	public addMiddleWare(func: MiddleWareFunc) {
		this.baseMiddleWares.push(func);
	}
	public addRouteMiddleWare(func: RouteMiddleWare) {
		this.routeMiddleWares.push(func);
	}

	private setupMiddleWares(app: Express) {
		this.baseMiddleWares.forEach(func => app.use(func));
	}

	// endregion

	// endregion

	// region 接口

	/**
	 * 注册接口类
	 * @param type
	 */
	public registerInterface<T extends BaseInterface>(
		type: Constructor<T>) {
		this.interfaceTypes.push(type);
	}

	/**
	 * 初始化接口
	 */
	protected setupInterfaces(app: Express) {
		this.interfaceTypes.forEach(it => this.setupInterfaceType(app, it));
	}

	private setupInterfaceType<T extends BaseInterface>(
		app: Express, type: Constructor<T>) {
		const setting = InterfaceBuilder.getSetting(type);
		const interface_ = setting.instance;
		const router = Router();

		for (const key in setting.interfaces)
			this.setupInterface(interface_, router,
				setting.interfaces[key]);

		const path = (HTTPConfig().baseRoute || "") + setting.path;
		app.use(path, router);
	}

	private setupInterface<T extends BaseInterface>(
		interface_: T, router: Router, itf: InterfaceSetting) {
		const func = interface_[itf.key];

		const middles = this.routeMiddleWares.map(m => m(itf)); // 全局中间件
		const handlers = itf.middles.map(m => this.middleHandler(m)); // 单个路径中间件

		router[itf.method](itf.path, ...middles, ...handlers, async (req, res) => {
			try {
				const params = [];
				itf.params.forEach(p => this.processParam(
					params, p, req[p.method][p.name], p.name));

				// @ts-ignore req.custom 中间件传输的自定义参数
				this.logRequest("CALL", req, ...params, "CUSTOM", req.custom);
				// @ts-ignore
				const iRes = await func.call(interface_, ...params, req.custom)

				this.processSuccess(iRes, req, res);
			} catch (e) {
				this.processError(e, req, res);
			}
		})
	}
	private middleHandler<Ps extends {} = {}>(
		middle: MiddleFunc<Ps>, name?: string) {
		return async (req: Request, res: Response, next: Function) => {
			try {
				this.logRequest("MIDDLE", req, name || middle.name);
				if (middle.length === 3) // 为第三方中间件
					await middle(req, res, next);
				else {
					const result = await middle(req, res);
					// @ts-ignore 中间件传输的自定义参数
					req.custom = {...req.custom, [middle.keyName]: result};
					next();
				}
			} catch (e) {
				this.processError(e, req, res);
			}
		}
	}
	private processParam(outParams, param: ParamSetting, reqData, key) {
		if (reqData !== undefined) // 如果有参数
			outParams[param.index] = this.convertType(reqData, param.type);
		else if (param.optional)
			outParams[param.index] = param.default_;
		else throw "Missing Param：" + key;
	}

	private processSuccess(iRes, req: Request, res: Response) {
		// 用于标识特殊的相应结果
		if (iRes instanceof PrueResponse)
			res.status(iRes.code).json(iRes.payload);
		else if (!(iRes instanceof NoJsonResponse)) {
			if (!(iRes instanceof BaseResponse))
				iRes = new SuccessResponse(iRes);

			res.status(iRes.code).json(iRes);
			this.logRequest("SUCCESS", req, iRes);
		}
	}
	private processError(e: any, req: Request, res: Response) {
		const rawE = e;

		// TODO: 完善异常处理
		if (!(e instanceof BaseError))
			e = new BaseError({r: e});

		else if (e instanceof DatabaseError)
			e = new DatabaseError("SQL Error");

		this.logRequest("ERROR", req, rawE, e);
		// 所有异常都将转化为自定义异常并抛出
		res.status(e.code).json(e);
	}

	private logRequest(type, req: Request, ...data) {
		console.log(`[${type}: ${Date.now()}]`, req.originalUrl,
			req.header('Authorization'), ...data);

	}

	// region 请求处理

	private convertType(val, type) {
		let res = val;

		try {
			switch (type) {
				case Number: res = Number(val); break;
				case String: break; // 默认就是字符串
				case Boolean: res = !!this.eval(val); break;
				case Array: res = this.eval(val); break;
				// case Object: res = val; break;
				default:
					if (type instanceof Function) // 类
						res = Object.assign(new type, this.eval(val));
					else
						res = this.eval(val)
			}
		} catch (e) {
			throw "Type Error：" + e + " val: " + val; // TODO: 封装成自定义异常
		}
		if (!type) return res;
		if (res?.constructor != type) throw "Type Error"; // TODO: 封装成自定义异常
		return res;
	}

	private eval(val) {
		if (typeof val == "string")
			try { return eval(`(${val})`) }
			catch (e) { console.error("convertType.eval error", e) }
		return val;
	}

	// endregion

	// endregion

	// endregion

}

export class BaseInterface {

}

export function findParam(req: Request, key: string) {
	return req.params?.[key] || req.query?.[key] || req.body?.[key] ||
		(req["custom"] && Object.values(req["custom"]).map(v => v[key]).find(v => !!v))
}


