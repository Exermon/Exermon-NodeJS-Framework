import {Constructor, getSingleton, singleton} from "../utils/SingletonUtils";
import {BaseContext} from "./BaseContext";

export function managerContext() {
	return getSingleton(ManagerContext)
}

@singleton
export class ManagerContext extends BaseContext<BaseManager> {

	get contentName(): string { return "Manager"; }

	public start() {
		return Promise.all(this.list.map(m => m?.onStart()))
	}
	public ready() {
		return Promise.all(this.list.map(m => m?.onReady()))
	}
	public update(dt: number) {
		this.list.forEach(c => c?.update(dt));
	}
}

export function manager<T extends BaseManager>(
	clazz: Constructor<T>) {
	managerContext().create(clazz);
	return clazz;
}

export function getManager<T extends BaseManager>(
	clazz: Constructor<T> | string) {
	return managerContext().instance(clazz);
}

export class BaseManager {

	protected deltaTime = -1;

	public onStart() { }

	public onReady() { }

	public update(dt: number) {
		this.deltaTime = dt;
	}

}
