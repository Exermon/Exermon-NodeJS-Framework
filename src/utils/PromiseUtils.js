"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.PromiseUtils = void 0;
var PromiseUtils = /** @class */ (function () {
    function PromiseUtils() {
    }
    PromiseUtils.wait = function (time) {
        return new Promise(function (resolve) {
            return setTimeout(function () { return resolve(true); }, time);
        });
    };
    PromiseUtils.waitFor = function (cond, interval, maxTimes, mode, title) {
        var _this = this;
        if (interval === void 0) { interval = 100; }
        if (maxTimes === void 0) { maxTimes = 10000; }
        if (mode === void 0) { mode = 'timeout'; }
        return new Promise(function (resolve) {
            var check = function (success, fail) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (title)
                                console.log("Waiting for:", title, cond);
                            return [4 /*yield*/, cond()];
                        case 1:
                            res = _a.sent();
                            if (title)
                                console.log("Current result:", title, res);
                            if (res || --maxTimes <= 0) {
                                success && success();
                                resolve(res);
                            }
                            else
                                fail && fail();
                            return [2 /*return*/];
                    }
                });
            }); };
            var check_;
            switch (mode) {
                case "timeout":
                    check_ = function () { return check(null, function () { return setTimeout(check_, interval); }); };
                    check_().then();
                    break;
                case "interval":
                    check_ = function () { return check(function () { return clearInterval(handle_1); }); };
                    var handle_1 = setInterval(check_, interval);
                    break;
            }
        });
    };
    PromiseUtils.waitForResult = function (promise, maxWaitTime, default_, useReject) {
        if (maxWaitTime === void 0) { maxWaitTime = 30000; }
        if (useReject === void 0) { useReject = false; }
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                return useReject ? reject(default_) : resolve(default_);
            }, maxWaitTime);
            promise.then(resolve)["catch"](reject);
        });
    };
    PromiseUtils.catcher = function (func, onCatch, onFinal) {
        var isPromise = false;
        try {
            var res = func();
            isPromise = res instanceof Promise;
            return isPromise ? res["catch"](onCatch)["finally"](onFinal) : res;
        }
        catch (e) {
            !isPromise && onCatch && onCatch(e);
        }
        finally {
            !isPromise && onFinal && onFinal();
        }
    };
    return PromiseUtils;
}());
exports.PromiseUtils = PromiseUtils;
