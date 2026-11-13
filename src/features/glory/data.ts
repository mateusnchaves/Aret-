import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import * as nutritionApi from '@/lib/api-nutrition'
import { addDays, goalProgress, summarizeWeek, weekStart } from '@/lib/cardio'
import { todayISO } from '@/lib/dates'
import { bestEntry, checkinsByWeek, constancyGrid, prEvents, trainingStreak, weeklyCrown } from '@/lib/glory'
import type { Exercise, LoadEntry } from '@/lib/types'
import { useCardioSessions, useCheckins, useExercises, useLoadEntries, useProfile } from '../data'
import { useNutritionTargets } from '../nutrition/data'

export const GRID_WEEKS = 12

/** kcal por dia das últimas 12 semanas. Fica sob ['diary'] para atualizar junto com o diário. */
export function useKcalRange() {
  const today = todayISO()
  const from = addDays(weekStart(today), -7 * (GRID_WEEKS - 1))
  return useQuery({ queryKey: ['diary', 'range', from, today], queryFn: () => nutritionApi.kcalByDay(from, today) })
}

/** Sequência, coroa da semana e mapa de constância. */
export function useDiscipline() {
  const profile = useProfile()
  const checkins = useCheckins()
  const cardio = useCardioSessions()
  const kcal = useKcalRange()
  const targets = useNutritionTargets()

  const data = useMemo(() => {
    if (!profile.data || !checkins.data || !cardio.data || !kcal.data) return undefined
    const today = todayISO()
    const week = weekStart(today)
    const target = profile.data.training_week_target
    const weekKcal = new Map([...kcal.data].filter(([d]) => d >= week))
    const summary = summarizeWeek(cardio.data, week)
    const cardioGoal = goalProgress(summary, profile.data.cardio_goal_unit, profile.data.cardio_goal_value)

    return {
      target,
      streak: trainingStreak(checkins.data, target, today),
      crown: weeklyCrown({
        checkinsThisWeek: checkinsByWeek(checkins.data).get(week) ?? 0,
        trainingTarget: target,
        cardioDone: cardioGoal.done,
        cardioGoal: cardioGoal.goal,
        kcalByDay: weekKcal,
        kcalTarget: targets?.kcal ?? null,
      }),
      cardioUnit: profile.data.cardio_goal_unit,
      grid: constancyGrid({
        today,
        weeks: GRID_WEEKS,
        checkinDays: new Set(checkins.data.map((c) => c.done_on)),
        cardioDays: new Set(cardio.data.map((s) => s.done_on)),
        kcalByDay: kcal.data,
        kcalTarget: targets?.kcal ?? null,
      }),
    }
  }, [profile.data, checkins.data, cardio.data, kcal.data, targets])

  return { data, isPending: profile.isPending || checkins.isPending || cardio.isPending || kcal.isPending }
}

export interface Medal {
  exercise: Exercise
  entry: LoadEntry
  mark: number
}

/** Recordes recentes (Glória) e o melhor de cada exercício (Panteão). */
export function useGlory() {
  const entries = useLoadEntries()
  const exercises = useExercises()

  const data = useMemo(() => {
    if (!entries.data || !exercises.data) return undefined
    const byId = new Map(exercises.data.map((e) => [e.id, e]))
    const grouped = new Map<string, LoadEntry[]>()
    for (const e of entries.data) grouped.set(e.exercise_id, [...(grouped.get(e.exercise_id) ?? []), e])

    const recent: Medal[] = []
    const pantheon: Medal[] = []
    for (const [exerciseId, list] of grouped) {
      const exercise = byId.get(exerciseId)
      if (!exercise) continue
      for (const pr of prEvents(list)) recent.push({ exercise, entry: pr.entry, mark: pr.mark })
      const best = bestEntry(list)
      if (best) {
        const asc = [...list].sort((a, b) => a.recorded_on.localeCompare(b.recorded_on) || a.created_at.localeCompare(b.created_at))
        pantheon.push({ exercise, entry: best, mark: asc.indexOf(best) + 1 })
      }
    }
    recent.sort((a, b) => b.entry.recorded_on.localeCompare(a.entry.recorded_on) || b.entry.created_at.localeCompare(a.entry.created_at))
    return { recent, pantheon }
  }, [entries.data, exercises.data])

  return { data, isPending: entries.isPending || exercises.isPending }
}
