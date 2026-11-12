const kgFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })
const intFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

/** 42.5 → "42,5" · 40 → "40" · 1.25 → "1,25" */
export function formatKg(value: number): string {
  return kgFormatter.format(value)
}

/** 1366 → "1.366" */
export function formatInt(value: number): string {
  return intFormatter.format(Math.round(value))
}

/** Aceita "42,5" ou "42.5". Retorna null para entrada inválida. */
export function parseDecimal(input: string): number | null {
  const normalized = input.trim().replace(/\s/g, '').replace(',', '.')
  if (normalized === '' || !/^\d+(\.\d+)?$/.test(normalized)) return null
  return Number(normalized)
}

export function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`
}
