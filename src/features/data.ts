import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { useMemo } from 'react'
import * as api from '@/lib/api'
import { todayISO } from '@/lib/dates'
import {
  currentEntry,
  isPersonalRecord,
  nextWorkout,
  sessionsSince,
  sortEntriesDesc,
  stagnation,
  trend,
  type StagnationStatus,
  type Trend,
} from '@/lib/training'
import type { Exercise, LoadEntry, Workout } from '@/lib/types'
import { useUserId } from './auth/context'

export const keys = {
  profile: ['profile'] as const,
  weights: ['weights'] as const,
  exercises: ['exercises'] as const,
  workouts: ['workouts'] as const,
  loadEntries: ['load-entries'] as const,
  checkins: ['checkins'] as const,
}

// ───────────── Leituras ─────────────

export function useProfile() {
  const userId = useUserId()
  return useQuery({ queryKey: keys.profile, queryFn: () => api.getProfile(userId) })
}

export function useWeights() {
  return useQuery({ queryKey: keys.weights, queryFn: api.listWeights })
}

export function useExercises() {
  return useQuery({ queryKey: keys.exercises, queryFn: api.listExercises, staleTime: 5 * 60_000 })
}

export function useWorkouts() {
  return useQuery({ queryKey: keys.workouts, queryFn: api.listWorkouts })
}

export function useLoadEntries() {
  return useQuery({ queryKey: keys.loadEntries, queryFn: api.listLoadEntries })
}

export function useCheckins() {
  return useQuery({ queryKey: keys.checkins, queryFn: api.listCheckins })
}

export function useCurrentWeight(): number | undefined {
  return useWeights().data?.[0]?.weight_kg
}

// ───────────── Escritas ─────────────

/** Mutação que invalida as chaves afetadas ao terminar. */
export function useInvalidatingMutation<TArgs, TResult = void>(
  fn: (args: TArgs) => Promise<TResult>,
  invalidate: QueryKey[],
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSettled: () => Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey }))),
  })
}

export function useUpdateProfile() {
  const userId = useUserId()
  return useInvalidatingMutation((patch: api.ProfilePatch) => api.updateProfile(userId, patch), [keys.profile])
}

// ───────────── Visão derivada do treino ─────────────

export interface ExerciseStatus {
  exercise: Exercise
  entries: LoadEntry[]
  current: LoadEntry | undefined
  stagnation: StagnationStatus | undefined
  trend: Trend
  personalRecord: boolean
  /** Fichas (ativas ou não) que contêm o exercício. */
  workoutIds: Set<string>
}

export interface TrainingOverview {
  workouts: Workout[]
  activeWorkouts: Workout[]
  archivedWorkouts: Workout[]
  exercisesById: Map<string, Exercise>
  statusByExercise: Map<string, ExerciseStatus>
  next: Workout | undefined
  lastCheckin: { workout: Workout | undefined; done_on: string } | undefined
  stagnant: ExerciseStatus[]
}

export function useTrainingOverview() {
  const profile = useProfile()
  const workouts = useWorkouts()
  const exercises = useExercises()
  const entries = useLoadEntries()
  const checkins = useCheckins()

  const queries = [profile, workouts, exercises, entries, checkins]
  const isPending = queries.some((q) => q.isPending)
  const error = queries.find((q) => q.error)?.error ?? null

  const data = useMemo<TrainingOverview | undefined>(() => {
    if (!profile.data || !workouts.data || !exercises.data || !entries.data || !checkins.data) return undefined
    const today = todayISO()
    const threshold = profile.data.stagnation_threshold
    const usesCheckins = checkins.data.length > 0

    const exercisesById = new Map(exercises.data.map((e) => [e.id, e]))
    const workoutsByExercise = new Map<string, Set<string>>()
    for (const w of workouts.data) {
      for (const we of w.workout_exercises) {
        const set = workoutsByExercise.get(we.exercise_id) ?? new Set<string>()
        set.add(w.id)
        workoutsByExercise.set(we.exercise_id, set)
      }
    }

    const entriesByExercise = new Map<string, LoadEntry[]>()
    for (const e of entries.data) {
      const list = entriesByExercise.get(e.exercise_id) ?? []
      list.push(e)
      entriesByExercise.set(e.exercise_id, list)
    }

    const statusByExercise = new Map<string, ExerciseStatus>()
    const relevantIds = new Set([...workoutsByExercise.keys(), ...entriesByExercise.keys()])
    for (const id of relevantIds) {
      const exercise = exercisesById.get(id)
      if (!exercise) continue
      const list = sortEntriesDesc(entriesByExercise.get(id) ?? [])
      const current = currentEntry(list)
      const workoutIds = workoutsByExercise.get(id) ?? new Set<string>()
      statusByExercise.set(id, {
        exercise,
        entries: list,
        current,
        workoutIds,
        trend: trend(list),
        personalRecord: isPersonalRecord(list),
        stagnation: current
          ? stagnation({
              lastChange: current.recorded_on,
              today,
              sessions: sessionsSince(checkins.data, workoutIds, current.recorded_on),
              threshold,
              usesCheckins,
            })
          : undefined,
      })
    }

    const activeWorkouts = workouts.data.filter((w) => !w.archived_at)
    const activeExerciseIds = new Set(activeWorkouts.flatMap((w) => w.workout_exercises.map((we) => we.exercise_id)))
    const stagnant = [...statusByExercise.values()]
      .filter((s) => s.stagnation?.stagnant && activeExerciseIds.has(s.exercise.id))
      .sort((a, b) => (b.stagnation?.sessions ?? 0) - (a.stagnation?.sessions ?? 0) || (b.stagnation?.days ?? 0) - (a.stagnation?.days ?? 0))

    const last = checkins.data[0]
    return {
      workouts: workouts.data,
      activeWorkouts,
      archivedWorkouts: workouts.data.filter((w) => w.archived_at),
      exercisesById,
      statusByExercise,
      next: nextWorkout(workouts.data, checkins.data),
      lastCheckin: last ? { workout: workouts.data.find((w) => w.id === last.workout_id), done_on: last.done_on } : undefined,
      stagnant,
    }
  }, [profile.data, workouts.data, exercises.data, entries.data, checkins.data])

  return { data, isPending, error, checkins: checkins.data ?? [] }
}
