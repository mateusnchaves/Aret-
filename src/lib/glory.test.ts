import { describe, expect, it } from 'vitest'
import { bestEntry, constancyGrid, prEvents, toRoman, trainingStreak, weeklyCrown, wouldBePr } from './glory'
import { MAXIMS, maximOfDay } from './maxims'

const c = (done_on: string) => ({ done_on })
const e = (recorded_on: string, load_kg: number) => ({ recorded_on, load_kg, sets: 4, reps: 10, created_at: `${recorded_on}T10:00:00Z` })

describe('toRoman', () => {
  it('converte números comuns', () => {
    expect([1, 4, 5, 9, 14, 46, 2026].map(toRoman)).toEqual(['I', 'IV', 'V', 'IX', 'XIV', 'XLVI', 'MMXXVI'])
    expect(toRoman(0)).toBe('0')
  })
})

describe('trainingStreak', () => {
  // semanas começando em: 19/out, 26/out, 02/nov, 09/nov (atual: 12/nov é quinta)
  const checkins = [
    c('2026-10-13'), c('2026-10-15'), c('2026-10-17'), // semana de 12/out: 3 ✓
    // semana de 19/out: 1 ✗
    c('2026-10-20'),
    c('2026-10-27'), c('2026-10-29'), c('2026-10-31'), // 26/out ✓
    c('2026-11-02'), c('2026-11-04'), c('2026-11-06'), // 02/nov ✓
    c('2026-11-10'), // semana atual: 1 de 3, ainda em andamento
  ]

  it('semana atual incompleta não quebra a sequência', () => {
    expect(trainingStreak(checkins, 3, '2026-11-12')).toEqual({ current: 2, best: 2 })
  })

  it('semana atual completa entra na conta', () => {
    expect(trainingStreak([...checkins, c('2026-11-11'), c('2026-11-12')], 3, '2026-11-12').current).toBe(3)
  })

  it('uma semana vazia no meio zera', () => {
    expect(trainingStreak([c('2026-10-13'), c('2026-11-10')], 1, '2026-11-12')).toEqual({ current: 1, best: 1 })
  })

  it('sem check-ins', () => {
    expect(trainingStreak([], 3, '2026-11-12')).toEqual({ current: 0, best: 0 })
  })
})

describe('weeklyCrown', () => {
  it('conta ramos completos', () => {
    const kcalByDay = new Map([
      ['2026-11-09', 2050], ['2026-11-10', 1950], ['2026-11-11', 2400], ['2026-11-12', 2000], ['2026-11-13', 2100], ['2026-11-14', 1900],
    ])
    const crown = weeklyCrown({ checkinsThisWeek: 3, trainingTarget: 3, cardioDone: 90, cardioGoal: 150, kcalByDay, kcalTarget: 2000 })
    expect(crown.training.complete).toBe(true)
    expect(crown.cardio).toEqual({ done: 90, goal: 150, complete: false })
    expect(crown.nutrition).toEqual({ done: 5, goal: 5, complete: true }) // 2400 está fora dos ±10%
    expect(crown.complete).toBe(2)
  })
})

describe('constancyGrid', () => {
  it('soma as frentes de cada dia e marca o futuro', () => {
    const grid = constancyGrid({
      today: '2026-11-12',
      weeks: 2,
      checkinDays: new Set(['2026-11-10', '2026-11-03']),
      cardioDays: new Set(['2026-11-10']),
      kcalByDay: new Map([['2026-11-10', 2000]]),
      kcalTarget: 2000,
    })
    expect(grid).toHaveLength(2)
    expect(grid[0]![0]!.date).toBe('2026-11-02')
    expect(grid[0]![1]!.level).toBe(1)
    expect(grid[1]![1]).toEqual({ date: '2026-11-10', level: 3, future: false })
    expect(grid[1]![4]!.future).toBe(true)
  })
})

describe('recordes', () => {
  const entries = [e('2026-06-10', 35), e('2026-07-18', 37.5), e('2026-08-22', 40), e('2026-09-19', 40), e('2026-10-01', 37.5), e('2026-10-24', 42.5)]

  it('prEvents lista só as cargas que superaram todas as anteriores, com o número do marco', () => {
    expect(prEvents(entries).map((p) => [p.entry.load_kg, p.mark])).toEqual([[42.5, 6], [40, 3], [37.5, 2]])
  })

  it('wouldBePr', () => {
    expect(wouldBePr(entries, 45)).toBe(true)
    expect(wouldBePr(entries, 42.5)).toBe(false)
    expect(wouldBePr([], 50)).toBe(false)
  })

  it('bestEntry pega a maior carga, a primeira vez que ela apareceu', () => {
    expect(bestEntry([e('2026-08-22', 40), e('2026-09-19', 40)])?.recorded_on).toBe('2026-08-22')
  })
})

describe('maximOfDay', () => {
  it('é estável no dia e muda no seguinte', () => {
    expect(maximOfDay('2026-11-12')).toEqual(maximOfDay('2026-11-12'))
    expect(maximOfDay('2026-11-12')).not.toEqual(maximOfDay('2026-11-13'))
    expect(MAXIMS.every((m) => m.author && m.source)).toBe(true)
  })
})
