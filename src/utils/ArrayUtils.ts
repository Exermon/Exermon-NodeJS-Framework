export function removeDuplicates<T>(arr: T[]) {
  return [...new Set(arr)];
  // return arr.filter((item, index) => arr.indexOf(item) === index);
}
export function splitArray<T>(arr: T[], chunkSize) {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += chunkSize)
    res.push(arr.slice(i, i + chunkSize));
  return res;
}
export function groupBy<T>(arr: T[], ...keys: (keyof T)[]) {
  return customGroupBy(arr, e => keys.map(k => e[k]).join("-"));
  // 等价于：
  // return arr.reduce((res, e) => {
  //   const key = keys.map(k => e[k]).join("-");
  //   res[key] ||= [];
  //   res[key].push(e);
  //   return res;
  // }, {});
}
export function customGroupBy<T>(
  arr: T[], keyFunc: (e: T) => string) {
  return arr.reduce((res, e) => {
    const key = keyFunc(e);
    res[key] ||= [];
    res[key].push(e);
    return res;
  }, {} as Record<string, T[]>);
}
export function arraysEqual<T>(a: T[], b: T[]) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i)
    if (a[i] !== b[i]) return false;

  return true;
}
export function getIntersection<T>(arrays: T[][]) {
  if (!arrays || arrays.length === 0) return [];
  if (arrays.length === 1) return arrays[0];

  // 使用 reduce 函数来计算交集
  const intersection = arrays.reduce((acc, currentArray, i) => {
    if (i == 0) return acc;

    const currentSet = new Set(currentArray);
    for (const item of acc)
      if (!currentSet.has(item)) acc.delete(item);
    return acc;
  }, new Set(arrays[0]));

  return Array.from(intersection);
}
