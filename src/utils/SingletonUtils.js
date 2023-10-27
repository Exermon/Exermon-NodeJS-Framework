"use strict";
exports.__esModule = true;
exports.getSingleton = exports.singleton = void 0;
var SingletonUtils = /** @class */ (function () {
    function SingletonUtils() {
    }
    SingletonUtils.instance = function (clazz) {
        if (!clazz)
            return null;
        var res = typeof clazz == 'string' ?
            this.singletons[clazz] : this.instance(clazz.name);
        if (!res)
            console.error("[Singleton GET MISS] ", { clazz: clazz, res: res, "this": this });
        return res;
        // if (typeof clazz == 'string')
        // 	return this.singletons[clazz];
        // return this.instance(clazz.name);
    };
    SingletonUtils.add = function (clazz, value) {
        this.singletons[clazz.name] = value;
        console.log("[Singleton ADD] ", { clazz: clazz, "this": this });
    };
    SingletonUtils.remove = function (clazz) {
        this.singletons[clazz.name] = null;
        console.log("[Singleton REMOVE] ", { clazz: clazz, "this": this });
    };
    SingletonUtils.singletons = {};
    return SingletonUtils;
}());
function singleton(clazz) {
    SingletonUtils.add(clazz, new clazz());
}
exports.singleton = singleton;
function getSingleton(clazz) {
    return SingletonUtils.instance(clazz);
}
exports.getSingleton = getSingleton;
