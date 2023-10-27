"use strict";
// /**
//  * 从数组中等概率抽取count个元素
//  */
// export function randomPick<T>(arr: T[], count: number) {
//   if(count > arr.length) return arr
//   const idxArr: number[] = []
//   for (let i = 0; i < arr.length; i++) {
//     idxArr.push(i)
//   }
//
//   const res: T[] = []
//   for (let i = 0; i < count; i++) {
//     const idx = randomInt(i, arr.length - 1, true) //生成[i,arr.length - 1]之间的随机数
//     res.push(arr[idxArr[idx]])
//
//     //交换idxArr的idx位置和i位置
//     const cur = idxArr[idx]
//     idxArr[idx] = idxArr[i]
//     idxArr[i] = cur
//   }
//   return res
// }
//
// /**
//  * 范围随机整数
//  * @param include 是否包含右端点
//  */
// function randomInt(min, max, include = false) {
//   return random(min, max + (include ? 1 : 0), 0);
// }
//
//
// function random(min = 0, max = 1, dig?: number) {
//   const res = Math.random() * (max - min) + min;
//   if (dig != undefined) return floor2Dig(res, dig);
//   return res;
// }
//
// function floor2Dig(num: number, dig = 2) {
//   const base = Math.pow(10, dig);
//   return Math.floor(num * base) / base;
// }
exports.__esModule = true;
exports.MathUtils = void 0;
var MathUtils = /** @class */ (function () {
    function MathUtils() {
    }
    MathUtils.sigmoid = function (x) {
        return 1 / (1 + Math.pow(Math.E, -x));
    };
    /**
     * 四舍五入保留指定位数小数
     */
    MathUtils.round2Dig = function (num, dig) {
        if (dig === void 0) { dig = 2; }
        var base = Math.pow(10, dig);
        return Math.round(num * base) / base;
    };
    MathUtils.floor2Dig = function (num, dig) {
        if (dig === void 0) { dig = 2; }
        var base = Math.pow(10, dig);
        return Math.floor(num * base) / base;
    };
    MathUtils.ceil2Dig = function (num, dig) {
        if (dig === void 0) { dig = 2; }
        var base = Math.pow(10, dig);
        return Math.ceil(num * base) / base;
    };
    /**
     * CLAMP
     */
    MathUtils.clamp = function (val, min, max) {
        if (min === void 0) { min = 0; }
        if (max === void 0) { max = 1; }
        return Math.max(Math.min(val, max), min);
    };
    /**
     * 获取随机范围数
     */
    MathUtils.random = function (min, max) {
        if (min === void 0) { min = 0; }
        if (max === void 0) { max = 1; }
        return Math.random() * (max - min) + min;
    };
    /**
     * 随机插入
     */
    MathUtils.randomInsert = function (arr, val) {
        var index = this.randomInt(0, arr.length + 1);
        arr.splice(index, 0, val);
    };
    /**
     * 获取随机范围数
     */
    MathUtils.randomInt = function (min, max, include) {
        if (min === void 0) { min = 0; }
        if (max === void 0) { max = 2; }
        if (include === void 0) { include = false; }
        return Math.floor(this.random(min, max + (include ? 1 : 0)));
    };
    /**
     * 生成随机字符串
     */
    MathUtils.randomString = function (len, chars /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/) {
        if (len === void 0) { len = 32; }
        if (chars === void 0) { chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; }
        var maxPos = chars.length;
        var res = '';
        for (var i = 0; i < len; i++)
            res += chars.charAt(Math.floor(Math.random() * maxPos));
        return res;
    };
    /**
     * 随机选择
     * @param array
     */
    MathUtils.randomPick = function (array) {
        return array[Math.floor(Math.random() * array.length)];
    };
    /**
     * 随机选择多个
     * @param array 选择的数组
     * @param count 选择个数（传了该参数，返回值将变为数组）
     * @param repeat 能否重复
     */
    MathUtils.randomPickMany = function (array, count, repeat) {
        if (repeat === void 0) { repeat = false; }
        var res = [];
        if (repeat) // 如果可以重复
            for (var i = 0; i < count; i++)
                res.push(this.randomPick(array));
        else {
            var tmp = array.slice(0);
            for (var i = 0; i < count; i++) {
                var idx = Math.floor(Math.random() * tmp.length);
                res.push(tmp[idx]); // 如果tmp为空，添加的都是空值
                tmp.splice(idx, 1);
            }
        }
        return res;
    };
    return MathUtils;
}());
exports.MathUtils = MathUtils;
