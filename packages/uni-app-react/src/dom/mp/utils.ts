export function toCamelCase(name: string) {
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}

export const toKebabCase = function (s: string) {
  return s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}