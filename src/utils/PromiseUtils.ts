
export type UnPromise<T> = T extends Promise<infer U> ? U : never;

export function limitCall(maxCall: number) {
	const runningTask = new Set<Promise<any>>();
	let idCounter = 0;

	return function(obj: any, key: string, desc: PropertyDescriptor) {
		const oriFunc = desc.value;

		desc.value = function(...args: any[]) {
			const currentId = ++idCounter;

			const log = (status: string) => {
				console.log(`Task ${key} #${currentId} is ${status}.`);
				if (status === "end") {
					console.log(`Currently executing: ${runningTask.size - 1}`);
				}
			};

			// 等待，直到当前正在运行的函数数量少于最大并发数
			const wait = async () => {
				while (runningTask.size >= maxCall) {
					log("waiting");
					await Promise.race(runningTask);
				}
			};

			const run = async () => {
				await wait();
				log("start");
				const promise = oriFunc.apply(this, args)
					.finally(() => {
						log("end");
						runningTask.delete(promise);
					});
				runningTask.add(promise);
				return promise;
			};

			return run();
		};

		return desc;
	};
}

export class PromiseUtils {
	public static wait(time) {
		return new Promise<boolean>(resolve =>
			setTimeout(() => resolve(true), time)
		)
	}

	public static waitFor(cond, interval: number = 100, maxTimes: number = 10000,
												mode: 'timeout' | 'interval' = 'timeout', title?: string) {
		return new Promise<boolean>(resolve => {
			const check = async (success?, fail?) => {
				if (title) console.log("Waiting for:", title, cond);
				const res = await cond();
				if (title) console.log("Current result:", title, res);

				if (res || --maxTimes <= 0) {
					success && success(); resolve(res);
				} else fail && fail();
			}
			let check_;

			switch (mode) {
				case "timeout":
					check_ = () => check(null,
						() => setTimeout(check_, interval));
					check_().then();
					break;

				case "interval":
					check_ = () => check(() => clearInterval(handle));
					const handle = setInterval(check_, interval);
					break;
			}
		})
	}

	public static waitForResult<T>(promise: Promise<T>, maxWaitTime: number = 30000,
																 default_?: any, useReject: boolean = false) {
		return new Promise<T>((resolve, reject) => {
			setTimeout(() =>
					useReject ? reject(default_) : resolve(default_)
				, maxWaitTime);
			promise.then(resolve).catch(reject);
		})
	}

	public static catcher(func: Function,
												onCatch?: (e: any) => any,
												onFinal?: () => any) {
		let isPromise = false;
		try {
			const res = func();
			isPromise = res instanceof Promise;
			return isPromise ? res.catch(onCatch).finally(onFinal) : res;
		}
		catch (e) { !isPromise && onCatch && onCatch(e); }
		finally { !isPromise && onFinal && onFinal() }
	}
}
