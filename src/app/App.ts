import dotenv from "dotenv"
dotenv.config();

export const IsScriptMode = process.env["SCRIPT"]?.toLowerCase() == "true";

import {getSingleton, singleton} from "../utils/SingletonUtils";
import {getFiles} from "../utils/FileUtils";
import 'reflect-metadata'
import {ServerConfig} from "../config/ConfigManager";
import {managerContext} from "./ManagerContext";
import {sequelizeMgr} from "../modules/sequelize/SequelizeManager";

export function app() {
	return getSingleton(App);
}

@singleton
export class App {

	public deltaTime = 0;
	public lastTime = 0;
	public nowTime = 0;

	private updateTask;

	constructor() {
		this.setupModules();
		this.setupPlugins();
	}

	// region 开始

	/**
	 * 启动
	 */
	public async start() {
		await managerContext().start();
	}
	public async ready() {
		await managerContext().ready();
		this.setupUpdateTask();
	}

	/**
	 * 初始化模块
	 */
	protected setupModules() {
		const settings = ServerConfig().installModules;
		const files = this.getFiles(`../modules`, settings);
		console.log("setupModules files: ", files);
		this.importFiles(files, "Module");

		// const root = `../modules`;
		// let files = getFiles(__dirname, root);
		// console.log("setupModules files: ", files)
		// this.importFiles(files, "Module");

		// if (modules == "all") {
		// 	const files = getFiles(__dirname, root);
		// 	this.importFiles(files, "Module");
		// } else {
		// 	if (!(modules instanceof Array))
		// 		modules = modules.split(/[ ,]/).filter(s => !!s);
		// 	modules.forEach(m => {
		// 		const files = getFiles(__dirname, `${root}/${m}`);
		// 		this.importFiles(files, "Module");
		// 	})
		// }
	}

	/**
	 * 初始化插件
	 */
	protected setupPlugins() {
		const settings = ServerConfig().installPlugins;
		const files = this.getFiles(`../plugins`, settings);
		console.log("setupPlugins files: ", files);
		this.importFiles(files, "Plugin");

		// const root = `../plugins`;
		// let files = getFiles(__dirname, root);
		// console.log("setupPlugins files: ", files)
		// if (plugins != "all") {
		// 	if (!(plugins instanceof Array))
		// 		plugins = plugins.split(/[ ,]/).filter(s => !!s);
		//
		// 	const allFlag = plugins.includes("all");
		// 	const includes =
		// 		plugins.filter(n => !n.startsWith("-"));
		// 	const excludes =
		// 		plugins.filter(n => n.startsWith("-")).map(n => n.slice(1));
		//
		// 	files = files.filter((f: string) => {
		// 		f = f.replace(/\\/g, "/");
		// 		if (excludes.some(n => f.includes(n))) return false;
		// 		if (allFlag || includes.some(n => f.includes(n))) return true;
		// 	})
		// }

		// const plugins = config().server.installPlugins;
		// const root = `../plugins`;
		// if (plugins == "all") {
		// 	const files = getFiles(__dirname, root);
		// 	this.importFiles(files, "Plugin");
		// } else if (plugins instanceof Array) {
		// 	plugins.forEach(m => {
		// 		const files = getFiles(__dirname, `${root}/${m}`);
		// 		this.importFiles(files, "Plugin");
		// 	})
		// }
	}

	private getFiles(root, setting: string | string[]) {
		let res = getFiles(__dirname, root);
		if (setting != "all") {
			if (!(setting instanceof Array))
				setting = setting.split(/[ ,]/).filter(s => !!s);

			const allFlag = setting.includes("all");
			const includes =
				setting.filter(n => !n.startsWith("-"));
			const excludes =
				setting.filter(n => n.startsWith("-")).map(n => n.slice(1));

			res = res.filter((f: string) => {
				f = f.replace(/\\/g, "/");
				if (excludes.some(n => f.includes(n))) return false;
				if (allFlag || includes.some(n => f.includes(n))) return true;

				// const mName = f.split(/[\\/]/)[2];
				// if (setting.indexOf(`-${mName}`) >= 0) return false;
				// if (allFlag || setting.indexOf(mName) >= 0) return true;
			})
		}
		return res;
	}
	private importFiles(files, name?) {
		files = files.filter(f => f.endsWith(".js"));
		console.log(`Import ${name}s`, files);
		files.forEach(f => {
			console.log(`Import`, f); require(f)
		});
	}

	/**
	 * 初始化Update任务
	 */
	protected setupUpdateTask() {
		this.updateTask = setInterval(() => {
			this.lastTime = this.nowTime;
			this.nowTime = Date.now();
			if (this.lastTime == 0) return; // 第一帧跳过

			this.deltaTime = this.nowTime - this.lastTime;
			managerContext().update(this.deltaTime);
		}, ServerConfig().updateInterval)
	}

	// endregion
}
