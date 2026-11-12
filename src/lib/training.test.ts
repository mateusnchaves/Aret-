import { describe, expect, it } from 'vitest'
import {
  currentEntry,
  isChange,
  isPersonalRecord,
  nextWorkout,
  sessionsSince,
  stagnation,
  totalGain,
  trend,
  type CheckinLike,
  type LoadEntryLike,
} from './training'

const entry = (recorded_on: string, load_kg: number, sets = 4, reps = 10, created_at = `${recorded_on}T10:00:00Z`): LoadEntryLike => ({
  recorded_on,
  load_kg,
  sets,
  reps,
  created_at,
})

const checkin = (workout_id: string, done_on: string, created_at = `${done_on}T18:00:00Z`): CheckinLike => ({
  workout_id,
  done_on,
  created_at,
})

describe('currentEntry', () => {
  it('pega a mais recente por data, desempatando pela criação', () => {
    const entries = [
      entry('2026-10-01', 40),
      entry('2026-10-24', 42.5, 4, 10, '2026-10-24T09:00:00Z'),
      entry('2026-10-24', 45, 4, 8, '2026-10-24T11:00:00Z'),
    ]
    expect(currentEntry(entries)?.load_kg).toBe(45)
  })

  it('retorna undefined sem entradas', () => {
    expect(currentEntry([])).toBeUndefined()
  })
})

describe('sessionsSince', () => {
  const ids = new Set(['A', 'D'])
  const checkins = [
    checkin('A', '2026-10-20'),
    checkin('A', '2026-10-24'), // mesmo dia da mudança: conta
    checkin('B', '2026-10-26'), // ficha sem o exercício
    checkin('D', '2026-11-02'),
    checkin('A', '2026-11-09'),
  ]

  it('conta só fichas que contêm o exercício, a partir da mudança', () => {
    expect(sessionsSince(checkins, ids, '2026-10-24')).toBe(3)
  })
})

describe('stagnation', () => {
  it('usa o limite de treinos quando há check-ins', () => {
    expect(stagnation({ lastChange: '2026-10-01', today: '2026-11-11', sessions: 5, threshold: 6, usesCheckins: true }))
      .toEqual({ days: 41, sessions: 5, stagnant: false })
    expect(stagnation({ lastChange: '2026-10-01', today: '2026-11-11', sessions: 6, threshold: 6, usesCheckins: true }).stagnant)
      .toBe(true)
  })

  it('cai para 28 dias quando o usuário não usa check-in', () => {
    expect(stagnation({ lastChange: '2026-10-15', today: '2026-11-11', sessions: 0, threshold: 6, usesCheckins: false }).stagnant)
      .toBe(false)
    expect(stagnation({ lastChange: '2026-10-14', today: '2026-11-11', sessions: 0, threshold: 6, usesCheckins: false }).stagnant)
      .toBe(true)
  })

  it('atravessa o horário de verão sem errar a conta', () => {
    expect(stagnation({ lastChange: '2026-03-01', today: '2026-04-01', sessions: 0, threshold: 6, usesCheckins: false }).days)
      .toBe(31)
  })
})

describe('nextWorkout', () => {
  const workouts = [
    { id: 'B', position: 1, archived_at: null },
    { id: 'A', position: 0, archived_at: null },
    { id: 'C', position: 2, archived_at: null },
    { id: 'old', position: 3, archived_at: '2026-09-01T00:00:00Z' },
  ]

  it('começa pela primeira ficha sem check-ins', () => {
    expect(nextWorkout(workouts, [])?.id).toBe('A')
  })

  it('segue a sequência e volta ao início', () => {
    expect(nextWorkout(workouts, [checkin('A', '2026-11-09')])?.id).toBe('B')
    expect(nextWorkout(workouts, [checkin('A', '2026-11-09'), checkin('C', '2026-11-10')])?.id).toBe('A')
  })

  it('ignora check-ins de fichas arquivadas', () => {
    expect(nextWorkout(workouts, [checkin('B', '2026-11-01'), checkin('old', '2026-11-10')])?.id).toBe('C')
  })

  it('não sugere nada sem fichas ativas', () => {
    expect(nextWorkout([{ id: 'x', position: 0, archived_at: '2026-01-01' }], [])).toBeUndefined()
  })
})

describe('trend', () => {
  it('compara carga, depois volume', () => {
    expect(trend([entry('2026-09-01', 40), entry('2026-10-01', 42.5)])).toBe('up')
    expect(trend([entry('2026-09-01', 40), entry('2026-10-01', 37.5)])).toBe('down')
    expect(trend([entry('2026-09-01', 40, 4, 10), entry('2026-10-01', 40, 4, 12)])).toBe('up')
    expect(trend([entry('2026-09-01', 40)])).toBe('new')
  })
})

describe('isPersonalRecord', () => {
  it('é recorde só quando supera todas as cargas anteriores', () => {
    expect(isPersonalRecord([entry('2026-09-01', 40), entry('2026-10-01', 42.5)])).toBe(true)
    expect(isPersonalRecord([entry('2026-08-01', 45), entry('2026-09-01', 40), entry('2026-10-01', 42.5)])).toBe(false)
    expect(isPersonalRecord([entry('2026-09-01', 40, 4, 10), entry('2026-10-01', 40, 4, 12)])).toBe(false)
    expect(isPersonalRecord([entry('2026-10-01', 40)])).toBe(false)
  })
})

describe('totalGain', () => {
  it('soma a variação desde o primeiro registro', () => {
    expect(totalGain([entry('2026-06-10', 35), entry('2026-07-18', 37.5), entry('2026-10-24', 42.5)])).toBe(7.5)
    expect(totalGain([])).toBe(0)
  })
})

describe('isChange', () => {
  it('detecta mudança de carga ou de esquema', () => {
    const current = { load_kg: 40, sets: 4, reps: 10 }
    expect(isChange(current, { load_kg: 40, sets: 4, reps: 10 })).toBe(false)
    expect(isChange(current, { load_kg: 40, sets: 4, reps: 12 })).toBe(true)
    expect(isChange(undefined, { load_kg: 40, sets: 4, reps: 10 })).toBe(true)
  })
})
