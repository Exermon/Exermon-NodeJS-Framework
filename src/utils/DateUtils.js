"use strict";
exports.__esModule = true;
exports.DateUtils = exports.inYesterday = exports.inToday = void 0;
/*
判断给定时间戳是否为今天
 */
function inToday(time) {
    if (!time)
        return false;
    return new Date(time).toDateString() === new Date().toDateString();
}
exports.inToday = inToday;
/*
判断给定时间戳是否为上一天
 */
function inYesterday(time) {
    if (!time)
        return false;
    var yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24); //真实的昨天
    var test = new Date(time);
    return yesterday.getFullYear() === test.getFullYear() && yesterday.getMonth() === test.getMonth() && yesterday.getDate() === test.getDate();
}
exports.inYesterday = inYesterday;
var DateUtils = /** @class */ (function () {
    function DateUtils() {
    }
    DateUtils.dateStr2Time = function (dateStr) {
        var days = Number(dateStr.split(" ")[0]);
        var timeStr = dateStr.split(" ")[1];
        var hours = Number(timeStr.split(":")[0]);
        var minutes = Number(timeStr.split(":")[1]);
        var seconds = Number(timeStr.split(":")[2]);
        return seconds * this.Second + minutes * this.Minute +
            hours * this.Hour + days * this.Day;
    };
    /**
     * 日期转化为字符串
     */
    DateUtils.time2DateStr = function (time) {
        if (!time)
            return "";
        var date = new Date(time);
        var year = date.getFullYear().toString();
        var month = (date.getMonth() + 1).toString().padStart(2, "0");
        var day = date.getDate().toString().padStart(2, "0");
        return "".concat(year, "/").concat(month, "/").concat(day);
    };
    /**
     * 日期转化为字符串
     */
    DateUtils.time2TimeStr = function (time) {
        if (!time)
            return "";
        var date = new Date(time);
        var hour = date.getHours().toString().padStart(2, "0");
        var minute = date.getMinutes().toString().padStart(2, "0");
        var second = date.getSeconds().toString().padStart(2, "0");
        return "".concat(hour, ":").concat(minute, ":").concat(second);
    };
    /**
     * 日期转化为字符串
     */
    DateUtils.time2Str = function (time, separator) {
        if (separator === void 0) { separator = "/"; }
        if (!time)
            return "";
        var date = new Date(time);
        var year = date.getFullYear().toString();
        var month = (date.getMonth() + 1).toString().padStart(2, "0");
        var day = date.getDate().toString().padStart(2, "0");
        var hour = date.getHours().toString().padStart(2, "0");
        var minute = date.getMinutes().toString().padStart(2, "0");
        var second = date.getSeconds().toString().padStart(2, "0");
        return "".concat(year).concat(separator).concat(month).concat(separator).concat(day, " ").concat(hour, ":").concat(minute, ":").concat(second);
    };
    /**
     * 日期转化为字符串
     */
    DateUtils.time2StrWithTZ = function (time) {
        if (!time)
            return "";
        var date = new Date(time);
        var year = date.getFullYear().toString();
        var month = (date.getMonth() + 1).toString().padStart(2, "0");
        var day = date.getDate().toString().padStart(2, "0");
        var hour = date.getHours().toString().padStart(2, "0");
        var minute = date.getMinutes().toString().padStart(2, "0");
        var second = date.getSeconds().toString().padStart(2, "0");
        return "".concat(year, "-").concat(month, "-").concat(day, "T").concat(hour, ":").concat(minute, ":").concat(second, "Z");
    };
    /**
     * 获取某天当天的开始时间戳
     */
    DateUtils.startMillsOfDay = function (year, month, day) {
        var d = new Date(year, month, day, 0, 0, 0);
        return d.getTime();
    };
    /**
     * YYYY/MM/DD HH:MM:SS 字符串转换成日期
     */
    DateUtils.str2Date = function (timeStr) {
        var _a = timeStr.split(" "), date = _a[0], time = _a[1];
        var _b = date.split("/"), year = _b[0], month = _b[1], day = _b[2];
        var _c = time.split(":"), hour = _c[0], minute = _c[1], second = _c[2];
        return new Date(Number(year), Number(month), Number(day), Number(hour), Number(minute), Number(second));
    };
    /**
     * YYYY/MM/DD HH:MM:SS字符串转换成时间戳
     */
    DateUtils.str2Timestamp = function (timeStr) {
        return DateUtils.str2Date(timeStr).valueOf();
    };
    /**
     * 时间转化为字符串
     */
    DateUtils.sec2Str = function (sec) {
        if (sec == null)
            return "";
        sec = Math.round(sec);
        var minStr = Math.floor(sec / 60).toString().padStart(2, "0");
        var secStr = (sec % 60).toString().padStart(2, "0");
        return "".concat(minStr, ":").concat(secStr);
    };
    /**
     * 将时间转换为日期
     * @param date
     */
    DateUtils.date2DayStart = function (date) {
        var res = new Date(date);
        res.setHours(0, 0, 0, 0);
        return res;
    };
    /**
     * 判断指定日期是否为今天
     * @param date
     */
    DateUtils.isToday = function (date) {
        return this.dayDiff(new Date(), date) == 0;
    };
    /**
     * 获取date1到date2之间相隔的天数
     */
    DateUtils.dayDiff = function (date1, date2) {
        if (typeof date1 == 'number' && date1 <= 0)
            return Number.NEGATIVE_INFINITY;
        if (typeof date2 == 'number' && date2 <= 0)
            return Number.POSITIVE_INFINITY;
        var day1 = this.date2DayStart(date1).getTime();
        var day2 = this.date2DayStart(date2).getTime();
        return (day1 - day2) / this.Day;
    };
    /**
     * 时间差值转化为具体时间
     */
    DateUtils.diff2Time = function (diff) {
        var days = Math.floor(diff / this.Day);
        var hours = Math.floor(diff % this.Day / this.Hour);
        var minute = Math.floor(diff % this.Hour / this.Minute);
        var seconds = Math.floor(diff % this.Minute / this.Second);
        return [days, hours, minute, seconds];
    };
    DateUtils.Second = 1000;
    DateUtils.Minute = 60 * DateUtils.Second;
    DateUtils.Hour = 60 * DateUtils.Minute;
    DateUtils.Day = 24 * DateUtils.Hour;
    return DateUtils;
}());
exports.DateUtils = DateUtils;
