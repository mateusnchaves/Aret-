/**
 * Datas "de calendário" (sem hora) como strings ISO `YYYY-MM-DD`, sempre no fuso local.
 * É o mesmo formato das colunas `date` do Postgres.
 */
export type ISODate = string

export function toISODate(date: Date): ISODate {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayISO(): ISODate {
  return toISODate(new Date())
}

/** Instante atual como timestamptz ISO. */
export function nowTimestamp(): string {
  return new Date().toISOString()
}

export function parseISODate(iso: ISODate): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

/** Dias inteiros de `from` até `to` (positivo se `to` é depois). Imune a horário de verão. */
export function daysBetween(from: ISODate, to: ISODate): number {
  const a = parseISODate(from)
  const b = parseISODate(to)
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
  return Math.round((utcB - utcA) / 86_400_000)
}

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

/** "24 out" — ou "24 out 2025" quando o ano difere do atual. */
export function formatShortDate(iso: ISODate, today: ISODate = todayISO()): string {
  const d = parseISODate(iso)
  const base = `${d.getDate()} ${MONTHS[d.getMonth()]}`
  return iso.slice(0, 4) === today.slice(0, 4) ? base : `${base} ${d.getFullYear()}`
}

/** "Quarta, 11 nov" */
export function formatWeekdayDate(iso: ISODate): string {
  const d = parseISODate(iso)
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export function monthLabel(iso: ISODate): string {
  return MONTHS[parseISODate(iso).getMonth()] ?? ''
}

/** "hoje", "ontem", "há 3 dias" */
export function relativeDays(days: number): string {
  if (days <= 0) return 'hoje'
  if (days === 1) return 'ontem'
  return `há ${days} dias`
}
