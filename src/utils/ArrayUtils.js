"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.getIntersection = exports.arraysEqual = exports.customGroupBy = exports.groupBy = exports.splitArray = exports.removeDuplicates = void 0;
function removeDuplicates(arr) {
    return __spreadArray([], new Set(arr), true);
    // return arr.filter((item, index) => arr.indexOf(item) === index);
}
exports.removeDuplicates = removeDuplicates;
function splitArray(arr, chunkSize) {
    var res = [];
    for (var i = 0; i < arr.length; i += chunkSize)
        res.push(arr.slice(i, i + chunkSize));
    return res;
}
exports.splitArray = splitArray;
function groupBy(arr) {
    var keys = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        keys[_i - 1] = arguments[_i];
    }
    return customGroupBy(arr, function (e) { return keys.map(function (k) { return e[k]; }).join("-"); });
    // 等价于：
    // return arr.reduce((res, e) => {
    //   const key = keys.map(k => e[k]).join("-");
    //   res[key] ||= [];
    //   res[key].push(e);
    //   return res;
    // }, {});
}
exports.groupBy = groupBy;
function customGroupBy(arr, keyFunc) {
    return arr.reduce(function (res, e) {
        var key = keyFunc(e);
        res[key] || (res[key] = []);
        res[key].push(e);
        return res;
    }, {});
}
exports.customGroupBy = customGroupBy;
function arraysEqual(a, b) {
    if (a === b)
        return true;
    if (a == null || b == null)
        return false;
    if (a.length !== b.length)
        return false;
    for (var i = 0; i < a.length; ++i)
        if (a[i] !== b[i])
            return false;
    return true;
}
exports.arraysEqual = arraysEqual;
function getIntersection(arrays) {
    if (!arrays || arrays.length === 0)
        return [];
    if (arrays.length === 1)
        return arrays[0];
    // 使用 reduce 函数来计算交集
    var intersection = arrays.reduce(function (acc, currentArray, i) {
        if (i == 0)
            return acc;
        var currentSet = new Set(currentArray);
        for (var _i = 0, acc_1 = acc; _i < acc_1.length; _i++) {
            var item = acc_1[_i];
            if (!currentSet.has(item))
                acc["delete"](item);
        }
        return acc;
    }, new Set(arrays[0]));
    return Array.from(intersection);
}
exports.getIntersection = getIntersection;
