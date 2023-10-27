export class StringUtils {

	public static makeURLString(url: string, data?: object) {
		return data ? url + "?" + this.makeQueryParam(data) : url;
	}

	public static makeQueryParam(data) {
		if (!data) return "";

		let res = Object.keys(data).filter(key => data[key] != null).reduce(
			(res, key) => (res + key + '=' + this.convertParam(data[key]) + '&'), '');

		if (res !== '') res = res.substr(0, res.lastIndexOf('&'));

		return res;
	}

	public static convertParam(data) {
		let res = data;
		if (typeof data === 'object') res = JSON.stringify(res);
		return res; // encodeURIComponent(res);
	}

	public static line2Hump(str: string) {
		return str.replace(/\-(\w)/g,
			(all, letter) => letter.toUpperCase());
	}
	public static hump2Line(str: string) {
		return str.replace(/([A-Z])/g,"-$1")
			.toLowerCase().substring(1);
	}
	public static str2KebabCase(input: string): string {
		return input.trim().toLowerCase().replace(/\s+/g, '-')
	}

	public static fillData2Str(str, data, deleteKey = true, re = /{(.+?)}/g) {
		let res = str, match;

		while ((match = re.exec(str)) !== null) {
			res = res.replace(match[0], data[match[1]] + (match[2] || ""))
			if (deleteKey) delete data[match[1]];
		}
		return res;
	}
	// public static fillData2StrInSignText(str, data, deleteKey = true) {
	// 	return this.fillData2Str(str, data, deleteKey, /\${(.+?)}/g)
	// }
	public static fillData2StrInUrl(str, data, deleteKey = true) {
		return this.fillData2Str(str, data, deleteKey, /:(.+?)(\/|$|&)/g)
	}

	public static validateEmail(email) {
		// 使用正则表达式验证邮箱格式
		const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

		// 使用test方法检查邮箱是否符合正则表达式
		return emailPattern.test(email);
	}


}
