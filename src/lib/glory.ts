/**
 * Disciplina e glória: sequência de semanas, coroa da semana, mapa de constância e recordes.
 * Tudo derivado de dados que o app já guarda (check-ins, cardio, diário e histórico de carga).
 */
import { addDays, weekStart } from './cardio'
import type { ISODate } from './dates'
import { adherence } from './nutrition'
import { sortEntriesDesc, type LoadEntryLike } from './training'

// ───────────── Algarismos romanos (marcos, semanas) ─────────────

const ROMAN: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
  [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
]

export function toRoman(n: number): string {
  if (!Number.isInteger(n) || n <= 0 || n >= 4000) return String(n)
  let rest = n
  let out = ''
  for (const [value, symbol] of ROMAN) {
    while (rest >= value) {
      out += symbol
      rest -= value
    }
  }
  return out
}

// ───────────── Semanas de treino ─────────────

/** Check-ins por semana (chave = segunda-feira). */
export function checkinsByWeek(checkins: readonly { done_on: ISODate }[]): Map<ISODate, number> {
  const map = new Map<ISODate, number>()
  for (const c of checkins) {
    const w = weekStart(c.done_on)
    map.set(w, (map.get(w) ?? 0) + 1)
  }
  return map
}

export interface Streak {
  /** Semanas seguidas batendo a meta de treinos, terminando na atual (se já bateu) ou na anterior. */
  current: number
  best: number
}

/**
 * A semana atual ainda está em andamento: se não bateu a meta, não quebra a sequência,
 * só não conta ainda.
 */
export function trainingStreak(checkins: readonly { done_on: ISODate }[], target: number, today: ISODate): Streak {
  if (target <= 0) return { current: 0, best: 0 }
  const byWeek = checkinsByWeek(checkins)
  const met = (w: ISODate) => (byWeek.get(w) ?? 0) >= target
  const thisWeek = weekStart(today)

  let current = 0
  let w = met(thisWeek) ? thisWeek : addDays(thisWeek, -7)
  while (met(w)) {
    current++
    w = addDays(w, -7)
  }

  let best = 0
  const weeks = [...byWeek.keys()].sort()
  if (weeks.length > 0) {
    let run = 0
    let cursor = weeks[0]!
    while (cursor <= thisWeek) {
      run = met(cursor) ? run + 1 : 0
      best = Math.max(best, run)
      cursor = addDays(cursor, 7)
    }
  }
  return { current, best: Math.max(best, current) }
}

// ───────────── Coroa da semana ─────────────

export interface Branch {
  done: number
  goal: number
  complete: boolean
}

export interface WeeklyCrown {
  training: Branch
  cardio: Branch
  nutrition: Branch
  /** Quantos ramos completos (0–3). Com os 3, a coroa fica dourada. */
  complete: number
}

/** Dias na meta de calorias para o ramo da alimentação contar. */
export const NUTRITION_DAYS_GOAL = 5

const branch = (done: number, goal: number): Branch => ({ done, goal, complete: goal > 0 && done >= goal })

export function weeklyCrown(input: {
  checkinsThisWeek: number
  trainingTarget: number
  cardioDone: number
  cardioGoal: number
  /** kcal consumidas por dia da semana (dias sem registro não entram). */
  kcalByDay: ReadonlyMap<ISODate, number>
  kcalTarget: number | null
}): WeeklyCrown {
  const okDays = input.kcalTarget
    ? [...input.kcalByDay.values()].filter((k) => k > 0 && adherence(k, input.kcalTarget!) === 'ok').length
    : 0
  const training = branch(input.checkinsThisWeek, input.trainingTarget)
  const cardio = branch(input.cardioDone, input.cardioGoal)
  const nutrition = branch(okDays, NUTRITION_DAYS_GOAL)
  return { training, cardio, nutrition, complete: [training, cardio, nutrition].filter((b) => b.complete).length }
}

// ───────────── Mapa de constância ─────────────

/** 0–3: quantas frentes o dia teve (treino, cardio, calorias na meta). */
export function constancyGrid(input: {
  today: ISODate
  weeks: number
  checkinDays: ReadonlySet<ISODate>
  cardioDays: ReadonlySet<ISODate>
  kcalByDay: ReadonlyMap<ISODate, number>
  kcalTarget: number | null
}): { date: ISODate; level: 0 | 1 | 2 | 3; future: boolean }[][] {
  const first = addDays(weekStart(input.today), -7 * (input.weeks - 1))
  return Array.from({ length: input.weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = addDays(first, w * 7 + d)
      const kcal = input.kcalByDay.get(date) ?? 0
      const fed = input.kcalTarget !== null && kcal > 0 && adherence(kcal, input.kcalTarget) === 'ok'
      const level = (Number(input.checkinDays.has(date)) + Number(input.cardioDays.has(date)) + Number(fed)) as 0 | 1 | 2 | 3
      return { date, level, future: date > input.today }
    }),
  )
}

// ───────────── Recordes ─────────────

export interface PrEvent<T extends LoadEntryLike> {
  entry: T
  /** Número do marco (1 = primeira carga registrada). */
  mark: number
}

/** Entradas que, quando registradas, superaram todas as cargas anteriores do exercício. Mais recente primeiro. */
export function prEvents<T extends LoadEntryLike>(entries: readonly T[]): PrEvent<T>[] {
  const asc = sortEntriesDesc(entries).reverse()
  const out: PrEvent<T>[] = []
  let best = -Infinity
  asc.forEach((e, i) => {
    if (i > 0 && e.load_kg > best) out.push({ entry: e, mark: i + 1 })
    best = Math.max(best, e.load_kg)
  })
  return out.reverse()
}

/** A carga nova seria recorde? (existe histórico e ela supera todas as anteriores). */
export function wouldBePr(entries: readonly LoadEntryLike[], loadKg: number): boolean {
  return entries.length > 0 && entries.every((e) => loadKg > e.load_kg)
}

export function bestEntry<T extends LoadEntryLike>(entries: readonly T[]): T | undefined {
  return [...entries].sort((a, b) => b.load_kg - a.load_kg || a.recorded_on.localeCompare(b.recorded_on))[0]
}
