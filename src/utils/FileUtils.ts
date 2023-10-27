import fs from "fs";
import * as path from "path";

export const downloadFileName = "users.csv"

const SplitChar = "\t"

export function data2CSV(titles: string[], contents: object[]): string{
  let data: string =  ""
  for (const title of titles) {
    data += title + SplitChar
  }
  data += "\n"
  for (const content of contents) {
    for (const property of titles) {
      const value = content[property] as string;
      data += value + SplitChar
    }
    data += "\n"
  }
  return data;
}

export function getFiles(root, dirPath, ext = "js", res = []){
  const realPath = path.join(root, dirPath)
  if (!fs.existsSync(realPath)) return res;

  // 根据文件路径读取文件，返回文件列表
  const files = fs.readdirSync(realPath)
  for (const file of files) {
    const filePath = path.join(realPath, file);
    const resFilePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    const isFile = stats.isFile(); // 是文件
    const isDir = stats.isDirectory(); // 是文件夹
    if (isFile && (!ext || resFilePath.endsWith(`.${ext}`)))
      res.push(resFilePath);
    if (isDir)
      getFiles(root, resFilePath, ext, res);
  }
  return res;
}


