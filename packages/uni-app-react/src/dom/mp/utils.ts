export function toCamel(name: string) {
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}
