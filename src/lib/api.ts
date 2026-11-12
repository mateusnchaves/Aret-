/**
 * Acesso ao Supabase. Cada função devolve tipos do domínio e lança erro em falha,
 * para o TanStack Query tratar. O RLS garante que só as linhas do usuário voltam.
 */
import { todayISO, type ISODate } from './dates'
import { supabase } from './supabase'
import type { Checkin, Exercise, LoadEntry, MuscleGroup, Profile, WeightEntry, Workout } from './types'

function unwrap<T = unknown>(result: { data: unknown; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message)
  return result.data as T
}

const num = (v: unknown) => Number(v)

// ───────────── Perfil e peso ─────────────

export async function getProfile(userId: string): Promise<Profile> {
  const row = unwrap(await supabase.from('profiles').select('*').eq('id', userId).single())
  const p = row as Profile
  return { ...p, height_cm: p.height_cm == null ? null : num(p.height_cm) }
}

export type ProfilePatch = Partial<Omit<Profile, 'id' | 'created_at'>>

export async function updateProfile(userId: string, patch: ProfilePatch): Promise<void> {
  unwrap(await supabase.from('profiles').update(patch).eq('id', userId))
}

export async function listWeights(): Promise<WeightEntry[]> {
  const rows = unwrap(
    await supabase.from('weight_entries').select('id, measured_on, weight_kg, created_at').order('measured_on', { ascending: false }),
  ) as WeightEntry[]
  return rows.map((r) => ({ ...r, weight_kg: num(r.weight_kg) }))
}

/** Um registro por dia: pesar de novo no mesmo dia substitui o valor. */
export async function saveWeight(weightKg: number, measuredOn: ISODate = todayISO()): Promise<void> {
  const { data: auth } = await supabase.auth.getUser()
  unwrap(
    await supabase
      .from('weight_entries')
      .upsert({ user_id: auth.user?.id, weight_kg: weightKg, measured_on: measuredOn }, { onConflict: 'user_id,measured_on' }),
  )
}

export async function deleteWeight(id: string): Promise<void> {
  unwrap(await supabase.from('weight_entries').delete().eq('id', id))
}

// ───────────── Exercícios ─────────────

export async function listExercises(): Promise<Exercise[]> {
  return unwrap(
    await supabase.from('exercises').select('id, user_id, name, muscle_group').order('name'),
  ) as Exercise[]
}

export async function createExercise(name: string, muscleGroup: MuscleGroup): Promise<Exercise> {
  return unwrap(
    await supabase
      .from('exercises')
      .insert({ name: name.trim(), muscle_group: muscleGroup })
      .select('id, user_id, name, muscle_group')
      .single(),
  ) as Exercise
}

/** Só exercícios próprios: o RLS bloqueia alterações no catálogo. */
export async function updateExercise(id: string, patch: { name: string; muscle_group: MuscleGroup }): Promise<void> {
  unwrap(await supabase.from('exercises').update({ name: patch.name.trim(), muscle_group: patch.muscle_group }).eq('id', id))
}

/** Apaga o exercício próprio; histórico de carga e vínculos com fichas vão junto (cascade). */
export async function deleteExercise(id: string): Promise<void> {
  unwrap(await supabase.from('exercises').delete().eq('id', id))
}

// ───────────── Fichas ─────────────

export async function listWorkouts(): Promise<Workout[]> {
  const rows = unwrap(
    await supabase
      .from('workouts')
      .select('id, name, focus, position, archived_at, created_at, workout_exercises(id, exercise_id, position)')
      .order('position'),
  ) as Workout[]
  return rows.map((w) => ({
    ...w,
    workout_exercises: [...w.workout_exercises].sort((a, b) => a.position - b.position),
  }))
}

export async function createWorkout(input: { name: string; focus: string | null; position: number }): Promise<Workout> {
  const row = unwrap(
    await supabase
      .from('workouts')
      .insert({ name: input.name.trim(), focus: input.focus?.trim() || null, position: input.position })
      .select('id, name, focus, position, archived_at, created_at')
      .single(),
  ) as Omit<Workout, 'workout_exercises'>
  return { ...row, workout_exercises: [] }
}

export async function updateWorkout(
  id: string,
  patch: Partial<Pick<Workout, 'name' | 'focus' | 'position' | 'archived_at'>>,
): Promise<void> {
  unwrap(await supabase.from('workouts').update(patch).eq('id', id))
}

export async function addWorkoutExercise(workoutId: string, exerciseId: string, position: number): Promise<void> {
  unwrap(await supabase.from('workout_exercises').insert({ workout_id: workoutId, exercise_id: exerciseId, position }))
}

export async function removeWorkoutExercise(id: string): Promise<void> {
  unwrap(await supabase.from('workout_exercises').delete().eq('id', id))
}

/** Regrava as posições na ordem recebida. */
export async function reorderWorkoutExercises(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map(async (id, position) => unwrap(await supabase.from('workout_exercises').update({ position }).eq('id', id))),
  )
}

export async function reorderWorkouts(ids: string[]): Promise<void> {
  await Promise.all(ids.map(async (id, position) => unwrap(await supabase.from('workouts').update({ position }).eq('id', id))))
}

// ───────────── Cargas ─────────────

export async function listLoadEntries(): Promise<LoadEntry[]> {
  const rows = unwrap(
    await supabase
      .from('load_entries')
      .select('id, exercise_id, recorded_on, load_kg, sets, reps, created_at')
      .order('recorded_on', { ascending: false })
      .order('created_at', { ascending: false }),
  ) as LoadEntry[]
  return rows.map((r) => ({ ...r, load_kg: num(r.load_kg) }))
}

export type LoadEntryInput = Pick<LoadEntry, 'exercise_id' | 'recorded_on' | 'load_kg' | 'sets' | 'reps'>

export async function addLoadEntry(input: LoadEntryInput): Promise<void> {
  unwrap(await supabase.from('load_entries').insert(input))
}

export async function updateLoadEntry(id: string, patch: Omit<LoadEntryInput, 'exercise_id'>): Promise<void> {
  unwrap(await supabase.from('load_entries').update(patch).eq('id', id))
}

export async function deleteLoadEntry(id: string): Promise<void> {
  unwrap(await supabase.from('load_entries').delete().eq('id', id))
}

// ───────────── Check-ins ─────────────

export async function listCheckins(): Promise<Checkin[]> {
  return unwrap(
    await supabase
      .from('checkins')
      .select('id, workout_id, done_on, created_at')
      .order('done_on', { ascending: false })
      .order('created_at', { ascending: false }),
  ) as Checkin[]
}

export async function addCheckin(workoutId: string, doneOn: ISODate = todayISO()): Promise<void> {
  unwrap(await supabase.from('checkins').insert({ workout_id: workoutId, done_on: doneOn }))
}

export async function deleteCheckin(id: string): Promise<void> {
  unwrap(await supabase.from('checkins').delete().eq('id', id))
}

// ───────────── Conta ─────────────

export async function exportMyData(userId: string) {
  const [profile, weights, exercises, workouts, loadEntries, checkins] = await Promise.all([
    getProfile(userId),
    listWeights(),
    listExercises(),
    listWorkouts(),
    listLoadEntries(),
    listCheckins(),
  ])
  return {
    app: 'arete',
    exported_at: new Date().toISOString(),
    profile,
    weights,
    custom_exercises: exercises.filter((e) => e.user_id !== null),
    workouts,
    load_entries: loadEntries,
    checkins,
  }
}

export async function deleteMyAccount(): Promise<void> {
  unwrap(await supabase.rpc('delete_my_account'))
  await supabase.auth.signOut()
}
