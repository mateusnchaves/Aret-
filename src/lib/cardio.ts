import { parseISODate, toISODate, type ISODate } from './dates'

export type CardioKind = 'treadmill' | 'walk' | 'run' | 'bike' | 'elliptical' | 'stairs' | 'swim' | 'other'
export type Intensity = 'light' | 'moderate' | 'vigorous'
export type CardioGoalUnit = 'minutes' | 'kcal'

export const CARDIO_KINDS: Record<CardioKind, string> = {
  treadmill: 'Esteira',
  walk: 'Caminhada',
  run: 'Corrida',
  bike: 'Bike',
  elliptical: 'Elíptico',
  stairs: 'Escada',
  swim: 'Natação',
  other: 'Outro',
}

export const INTENSITIES: Record<Intensity, { label: string; hint: string }> = {
  light: { label: 'Leve', hint: 'Conversa fácil' },
  moderate: { label: 'Moderada', hint: 'Fala com esforço' },
  vigorous: { label: 'Intensa', hint: 'Mal consegue falar' },
}

/**
 * MET por tipo × intensidade, aproximados do Compendium of Physical Activities (Ainsworth, 2011).
 * Esteira leve = caminhada ~5 km/h; intensa = corrida ~10 km/h.
 */
export const MET: Record<CardioKind, Record<Intensity, number>> = {
  treadmill: { light: 3.5, moderate: 6.0, vigorous: 9.8 },
  walk: { light: 3.0, moderate: 4.3, vigorous: 5.0 },
  run: { light: 7.0, moderate: 9.8, vigorous: 11.5 },
  bike: { light: 3.5, moderate: 6.8, vigorous: 8.8 },
  elliptical: { light: 4.0, moderate: 5.0, vigorous: 7.0 },
  stairs: { light: 5.0, moderate: 7.0, vigorous: 9.0 },
  swim: { light: 5.8, moderate: 8.3, vigorous: 10.0 },
  other: { light: 3.0, moderate: 5.0, vigorous: 8.0 },
}

/** kcal = MET × peso (kg) × horas */
export function estimateKcal(params: { kind: CardioKind; intensity: Intensity; weightKg: number; minutes: number }): number {
  return Math.round(MET[params.kind][params.intensity] * params.weightKg * (params.minutes / 60))
}

export function addDays(iso: ISODate, days: number): ISODate {
  const d = parseISODate(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

/** Segunda-feira da semana que contém `iso`. */
export function weekStart(iso: ISODate): ISODate {
  const offset = (parseISODate(iso).getDay() + 6) % 7
  return addDays(iso, -offset)
}

export function weekDays(start: ISODate): ISODate[] {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export interface CardioSessionLike {
  done_on: ISODate
  duration_min: number
  kcal: number
}

export interface DayTotal {
  date: ISODate
  minutes: number
  kcal: number
  sessions: number
}

export interface WeekSummary {
  start: ISODate
  days: DayTotal[]
  minutes: number
  kcal: number
  sessions: number
}

export function summarizeWeek(sessions: readonly CardioSessionLike[], start: ISODate): WeekSummary {
  const days: DayTotal[] = weekDays(start).map((date) => ({ date, minutes: 0, kcal: 0, sessions: 0 }))
  const byDate = new Map(days.map((d) => [d.date, d]))
  for (const s of sessions) {
    const day = byDate.get(s.done_on)
    if (!day) continue
    day.minutes += s.duration_min
    day.kcal += s.kcal
    day.sessions += 1
  }
  return {
    start,
    days,
    minutes: days.reduce((sum, d) => sum + d.minutes, 0),
    kcal: days.reduce((sum, d) => sum + d.kcal, 0),
    sessions: days.reduce((sum, d) => sum + d.sessions, 0),
  }
}

export function goalProgress(summary: Pick<WeekSummary, 'minutes' | 'kcal'>, unit: CardioGoalUnit, goal: number) {
  const done = unit === 'minutes' ? summary.minutes : summary.kcal
  return { done, goal, ratio: goal > 0 ? done / goal : 0, reached: done >= goal }
}

/** "1h 15min" · "45 min" */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}min`
}
