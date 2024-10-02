export function shortAddress(address = '', trimLeft = 6, trimRight = 4) {
  return address.length > 10
    ? `${address.slice(0, trimLeft)}...${address.slice(-trimRight)}`
    : address;
}
