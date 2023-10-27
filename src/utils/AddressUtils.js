"use strict";
exports.__esModule = true;
exports.addrInclude = exports.addrEq = void 0;
function addrEq(addr1, addr2) {
    return (addr1 === null || addr1 === void 0 ? void 0 : addr1.toLowerCase()) === (addr2 === null || addr2 === void 0 ? void 0 : addr2.toLowerCase());
}
exports.addrEq = addrEq;
function addrInclude(addrList, addr) {
    return addrList === null || addrList === void 0 ? void 0 : addrList.some(function (a) { return addrEq(a, addr); });
}
exports.addrInclude = addrInclude;
