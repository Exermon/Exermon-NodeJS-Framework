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

export class MathUtils {

  public static sigmoid(x: number) {
    return 1 / (1 + Math.pow(Math.E, -x))
  }

  /**
   * 四舍五入保留指定位数小数
   */
  public static round2Dig(num: number, dig = 2) {
    const base = Math.pow(10, dig);
    return Math.round(num * base) / base;
  }
  public static floor2Dig(num: number, dig = 2) {
    const base = Math.pow(10, dig);
    return Math.floor(num * base) / base;
  }
  public static ceil2Dig(num: number, dig = 2) {
    const base = Math.pow(10, dig);
    return Math.ceil(num * base) / base;
  }

  /**
   * CLAMP
   */
  public static clamp(val: number, min: number = 0, max: number = 1) {
    return Math.max(Math.min(val, max), min);
  }

  /**
   * 获取随机范围数
   */
  public static random(min = 0, max = 1) {
    return Math.random() * (max - min) + min;
  }

  /**
   * 随机插入
   */
  public static randomInsert<T>(arr: T[], val: T) {
    const index = this.randomInt(0, arr.length + 1);
    arr.splice(index, 0, val);
  }

  /**
   * 获取随机范围数
   */
  public static randomInt(min = 0, max = 2, include = false) {
    return Math.floor(this.random(min, max + (include ? 1 : 0)));
  }

  /**
   * 生成随机字符串
   */
  public static randomString(
    len = 32, chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678' /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/) {
    const maxPos = chars.length;

    let res = '';
    for (let i = 0; i < len; i++)
      res += chars.charAt(Math.floor(Math.random() * maxPos));
    return res;
  }

  /**
   * 随机选择
   * @param array
   */
  public static randomPick(array: any[]) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * 随机选择多个
   * @param array 选择的数组
   * @param count 选择个数（传了该参数，返回值将变为数组）
   * @param repeat 能否重复
   */
  public static randomPickMany<T>(array: T[], count: number, repeat = false): T[] {
    const res = [];
    if (repeat) // 如果可以重复
      for (let i = 0; i < count; i++)
        res.push(this.randomPick(array))
    else {
      const tmp = array.slice(0);
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * tmp.length);
        res.push(tmp[idx]); // 如果tmp为空，添加的都是空值
        tmp.splice(idx, 1);
      }
    }
    return res;
  }

}
