import { daysBetween, type ISODate } from './dates'

/** Dias sem evoluir que contam como estagnação quando o usuário não usa check-in. */
export const STAGNATION_DAYS_WITHOUT_CHECKINS = 28

export interface LoadEntryLike {
  recorded_on: ISODate
  created_at: string
  load_kg: number
  sets: number
  reps: number
}

export interface CheckinLike {
  workout_id: string
  done_on: ISODate
  created_at: string
}

export interface WorkoutLike {
  id: string
  position: number
  archived_at: string | null
}

/** Mais recente primeiro: por data e, no mesmo dia, pela hora em que foi criado. */
export function sortEntriesDesc<T extends LoadEntryLike>(entries: readonly T[]): T[] {
  return [...entries].sort(
    (a, b) => b.recorded_on.localeCompare(a.recorded_on) || b.created_at.localeCompare(a.created_at),
  )
}

export function currentEntry<T extends LoadEntryLike>(entries: readonly T[]): T | undefined {
  return sortEntriesDesc(entries)[0]
}

/**
 * Quantos check-ins de fichas que contêm o exercício aconteceram desde a última mudança.
 * Um check-in no mesmo dia da mudança conta: o treino foi feito com a carga nova.
 */
export function sessionsSince(
  checkins: readonly CheckinLike[],
  workoutIds: ReadonlySet<string>,
  since: ISODate,
): number {
  return checkins.filter((c) => workoutIds.has(c.workout_id) && c.done_on >= since).length
}

export interface StagnationInput {
  lastChange: ISODate
  today: ISODate
  sessions: number
  threshold: number
  /** Se o usuário já fez algum check-in. Sem check-ins, a regra passa a ser por dias. */
  usesCheckins: boolean
}

export interface StagnationStatus {
  days: number
  sessions: number
  stagnant: boolean
}

export function stagnation(input: StagnationInput): StagnationStatus {
  const days = Math.max(0, daysBetween(input.lastChange, input.today))
  const stagnant = input.usesCheckins
    ? input.sessions >= input.threshold
    : days >= STAGNATION_DAYS_WITHOUT_CHECKINS
  return { days, sessions: input.sessions, stagnant }
}

/** Próxima ficha da sequência (A→B→C→A) depois do último check-in em uma ficha ativa. */
export function nextWorkout<T extends WorkoutLike>(
  workouts: readonly T[],
  checkins: readonly CheckinLike[],
): T | undefined {
  const active = workouts.filter((w) => !w.archived_at).sort((a, b) => a.position - b.position)
  if (active.length === 0) return undefined

  const activeIds = new Set(active.map((w) => w.id))
  const last = [...checkins]
    .filter((c) => activeIds.has(c.workout_id))
    .sort((a, b) => b.done_on.localeCompare(a.done_on) || b.created_at.localeCompare(a.created_at))[0]
  if (!last) return active[0]

  const index = active.findIndex((w) => w.id === last.workout_id)
  return active[(index + 1) % active.length]
}

export type Trend = 'up' | 'down' | 'flat' | 'new'

/** Compara a entrada atual com a anterior: carga primeiro, depois volume (séries × reps). */
export function trend(entries: readonly LoadEntryLike[]): Trend {
  const [current, previous] = sortEntriesDesc(entries)
  if (!current) return 'new'
  if (!previous) return 'new'
  if (current.load_kg !== previous.load_kg) return current.load_kg > previous.load_kg ? 'up' : 'down'
  const volume = current.sets * current.reps - previous.sets * previous.reps
  if (volume === 0) return 'flat'
  return volume > 0 ? 'up' : 'down'
}

/** A carga atual é maior que qualquer carga anterior desse exercício. */
export function isPersonalRecord(entries: readonly LoadEntryLike[]): boolean {
  const [current, ...previous] = sortEntriesDesc(entries)
  if (!current || previous.length === 0) return false
  return previous.every((e) => current.load_kg > e.load_kg)
}

/** Variação de carga desde o primeiro registro. */
export function totalGain(entries: readonly LoadEntryLike[]): number {
  const sorted = sortEntriesDesc(entries)
  const current = sorted[0]
  const first = sorted[sorted.length - 1]
  if (!current || !first) return 0
  return Math.round((current.load_kg - first.load_kg) * 100) / 100
}

/** Uma nova entrada só faz sentido se algo mudou em relação à atual. */
export function isChange(
  current: Pick<LoadEntryLike, 'load_kg' | 'sets' | 'reps'> | undefined,
  next: Pick<LoadEntryLike, 'load_kg' | 'sets' | 'reps'>,
): boolean {
  if (!current) return true
  return current.load_kg !== next.load_kg || current.sets !== next.sets || current.reps !== next.reps
}
