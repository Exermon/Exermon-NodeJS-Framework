"use strict";
exports.__esModule = true;
exports.StringUtils = void 0;
var StringUtils = /** @class */ (function () {
    function StringUtils() {
    }
    StringUtils.makeURLString = function (url, data) {
        return data ? url + "?" + this.makeQueryParam(data) : url;
    };
    StringUtils.makeQueryParam = function (data) {
        var _this = this;
        if (!data)
            return "";
        var res = Object.keys(data).filter(function (key) { return data[key] != null; }).reduce(function (res, key) { return (res + key + '=' + _this.convertParam(data[key]) + '&'); }, '');
        if (res !== '')
            res = res.substr(0, res.lastIndexOf('&'));
        return res;
    };
    StringUtils.convertParam = function (data) {
        var res = data;
        if (typeof data === 'object')
            res = JSON.stringify(res);
        return res; // encodeURIComponent(res);
    };
    StringUtils.prototype.line2Hump = function (str) {
        return str.replace(/\-(\w)/g, function (all, letter) { return letter.toUpperCase(); });
    };
    StringUtils.prototype.hump2Line = function (str) {
        return str.replace(/([A-Z])/g, "-$1")
            .toLowerCase().substring(1);
    };
    StringUtils.fillData2Str = function (str, data, deleteKey, re) {
        if (deleteKey === void 0) { deleteKey = true; }
        if (re === void 0) { re = /{(.+?)}/g; }
        var res = str, match;
        while ((match = re.exec(str)) !== null) {
            res = res.replace(match[0], data[match[1]] + (match[2] || ""));
            if (deleteKey)
                delete data[match[1]];
        }
        return res;
    };
    // public static fillData2StrInSignText(str, data, deleteKey = true) {
    // 	return this.fillData2Str(str, data, deleteKey, /\${(.+?)}/g)
    // }
    StringUtils.fillData2StrInUrl = function (str, data, deleteKey) {
        if (deleteKey === void 0) { deleteKey = true; }
        return this.fillData2Str(str, data, deleteKey, /:(.+?)(\/|$|&)/g);
    };
    StringUtils.validateEmail = function (email) {
        // 使用正则表达式验证邮箱格式
        var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        // 使用test方法检查邮箱是否符合正则表达式
        return emailPattern.test(email);
    };
    return StringUtils;
}());
exports.StringUtils = StringUtils;
