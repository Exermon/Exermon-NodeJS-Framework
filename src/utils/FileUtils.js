"use strict";
exports.__esModule = true;
exports.getFiles = exports.data2CSV = exports.downloadFileName = void 0;
var fs_1 = require("fs");
var path = require("path");
exports.downloadFileName = "users.csv";
var SplitChar = "\t";
function data2CSV(titles, contents) {
    var data = "";
    for (var _i = 0, titles_1 = titles; _i < titles_1.length; _i++) {
        var title = titles_1[_i];
        data += title + SplitChar;
    }
    data += "\n";
    for (var _a = 0, contents_1 = contents; _a < contents_1.length; _a++) {
        var content = contents_1[_a];
        for (var _b = 0, titles_2 = titles; _b < titles_2.length; _b++) {
            var property = titles_2[_b];
            var value = content[property];
            data += value + SplitChar;
        }
        data += "\n";
    }
    return data;
}
exports.data2CSV = data2CSV;
function getFiles(root, dirPath, ext, res) {
    if (ext === void 0) { ext = "js"; }
    if (res === void 0) { res = []; }
    var realPath = path.join(root, dirPath);
    if (!fs_1["default"].existsSync(realPath))
        return res;
    // 根据文件路径读取文件，返回文件列表
    var files = fs_1["default"].readdirSync(realPath);
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        var filePath = path.join(realPath, file);
        var resFilePath = path.join(dirPath, file);
        var stats = fs_1["default"].statSync(filePath);
        var isFile = stats.isFile(); // 是文件
        var isDir = stats.isDirectory(); // 是文件夹
        if (isFile && (!ext || resFilePath.endsWith(".".concat(ext))))
            res.push(resFilePath);
        if (isDir)
            getFiles(root, resFilePath, ext, res);
    }
    return res;
}
exports.getFiles = getFiles;
