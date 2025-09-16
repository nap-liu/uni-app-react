let globalUidCounter = 0
const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

function encode(num: number): string {
  let str = ''
  const base = chars.length
  do {
    str = chars[num % base] + str
    num = Math.floor(num / base)
  } while (num > 0)
  return str
}

export function uid(): string {
  return '_' + encode(globalUidCounter++)
}
