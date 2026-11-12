import { describe, expect, it } from 'vitest'
import { addDays, estimateKcal, formatDuration, goalProgress, summarizeWeek, weekDays, weekStart } from './cardio'

describe('estimateKcal', () => {
  it('aplica MET × peso × horas', () => {
    // esteira moderada: 6 MET × 80 kg × 0,5 h = 240
    expect(estimateKcal({ kind: 'treadmill', intensity: 'moderate', weightKg: 80, minutes: 30 })).toBe(240)
    // bike intensa: 8,8 × 69 × 0,75 = 455,4
    expect(estimateKcal({ kind: 'bike', intensity: 'vigorous', weightKg: 69, minutes: 45 })).toBe(455)
  })
})

describe('semana', () => {
  it('começa na segunda', () => {
    expect(weekStart('2026-11-12')).toBe('2026-11-09') // quinta → segunda
    expect(weekStart('2026-11-09')).toBe('2026-11-09') // segunda
    expect(weekStart('2026-11-15')).toBe('2026-11-09') // domingo ainda é da mesma semana
    expect(weekStart('2026-11-16')).toBe('2026-11-16')
  })

  it('atravessa mês e ano', () => {
    expect(weekStart('2027-01-01')).toBe('2026-12-28')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(weekDays('2026-12-28').at(-1)).toBe('2027-01-03')
  })
})

describe('summarizeWeek', () => {
  const sessions = [
    { done_on: '2026-11-08', duration_min: 60, kcal: 500 }, // domingo anterior: fora
    { done_on: '2026-11-09', duration_min: 30, kcal: 240 },
    { done_on: '2026-11-09', duration_min: 15, kcal: 100 },
    { done_on: '2026-11-12', duration_min: 40, kcal: 320 },
    { done_on: '2026-11-16', duration_min: 20, kcal: 150 }, // próxima segunda: fora
  ]

  it('soma só a semana e agrupa por dia', () => {
    const s = summarizeWeek(sessions, '2026-11-09')
    expect(s.minutes).toBe(85)
    expect(s.kcal).toBe(660)
    expect(s.sessions).toBe(3)
    expect(s.days).toHaveLength(7)
    expect(s.days[0]).toEqual({ date: '2026-11-09', minutes: 45, kcal: 340, sessions: 2 })
    expect(s.days[3]?.minutes).toBe(40)
  })
})

describe('goalProgress', () => {
  it('usa a unidade escolhida', () => {
    expect(goalProgress({ minutes: 95, kcal: 700 }, 'minutes', 150)).toEqual({ done: 95, goal: 150, ratio: 95 / 150, reached: false })
    expect(goalProgress({ minutes: 95, kcal: 2100 }, 'kcal', 2000).reached).toBe(true)
  })
})

describe('formatDuration', () => {
  it('formata minutos e horas', () => {
    expect(formatDuration(45)).toBe('45 min')
    expect(formatDuration(60)).toBe('1h')
    expect(formatDuration(75)).toBe('1h 15min')
  })
})
