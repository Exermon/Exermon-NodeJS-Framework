export function addrEq(addr1: string, addr2: string) {
  if (addr1 == addr2) return true;
  if (!addr1 || !addr2) return false;
  const addr1Len = addr1.length, addr2Len = addr2.length;
  return addr1.slice(addr1Len - 40).toLowerCase() === addr2.slice(addr2Len - 40).toLowerCase();
}
export function addrInclude(addrList: string[], addr: string) {
  return addrList?.some(a => addrEq(a, addr));
}
