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
exports.doTry = exports.errorCatcher = void 0;
var MathUtils_1 = require("./MathUtils");
function errorCatcher(logFlag, defaultV) {
    return function (obj, key, desc) {
        var oriFunc = desc.value;
        desc.value = function () {
            var p = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                p[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, oriFunc.call.apply(oriFunc, __spreadArray([this], p, false))];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2:
                            e_1 = _a.sent();
                            console.log("[".concat(logFlag, " Request Error]"), e_1, "\n Params: ", p);
                            return [2 /*return*/, defaultV];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
    };
}
exports.errorCatcher = errorCatcher;
var TryHandler = /** @class */ (function () {
    function TryHandler(title, name, handler) {
        this.handlers = [];
        this.title = title;
        if (name && handler)
            this.or(name, handler);
    }
    TryHandler.prototype.or = function (name, handler) {
        this.handlers.push({ name: name, handler: handler });
        return this;
    };
    TryHandler.prototype["do"] = function () {
        return __awaiter(this, void 0, void 0, function () {
            var id, res, i, _a, name_1, handler, e_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        id = "".concat(this.title, "-").concat(MathUtils_1.MathUtils.randomString(8));
                        console.log("[TryHandler: ".concat(id, "] Do"), this.title, this.handlers.map(function (h) { return h.name; }));
                        i = 0;
                        _b.label = 1;
                    case 1:
                        if (!(i < this.handlers.length)) return [3 /*break*/, 6];
                        _a = this.handlers[i], name_1 = _a.name, handler = _a.handler;
                        console.log("[TryHandler: ".concat(id, "] Trying ").concat(name_1, "(").concat(i + 1, "/").concat(this.handlers.length, ")"));
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, handler()];
                    case 3:
                        res = _b.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        e_2 = _b.sent();
                        if (i < this.handlers.length - 1)
                            console.error("[TryHandler: ".concat(id, "] Error ").concat(name_1, "(").concat(i + 1, "/").concat(this.handlers.length, "), try next one"), e_2);
                        else {
                            console.error("[TryHandler: ".concat(id, "] All trials are failed"), e_2);
                            throw e_2;
                        }
                        return [3 /*break*/, 5];
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6:
                        console.log("[TryHandler: ".concat(id, "] Done by ").concat(this.handlers[i].name, "(").concat(i + 1, "/").concat(this.handlers.length, ")"), res);
                        return [2 /*return*/, res];
                }
            });
        });
    };
    return TryHandler;
}());
function doTry(title, name, handler) {
    return new TryHandler(title, name, handler);
}
exports.doTry = doTry;
