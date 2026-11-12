import type { ISODate } from './dates'
import type { ActivityLevel, Goal, Sex } from './nutrition'

export interface Profile {
  id: string
  display_name: string | null
  birth_date: ISODate | null
  sex: Sex | null
  height_cm: number | null
  activity_level: ActivityLevel | null
  goal: Goal | null
  stagnation_threshold: number
  cardio_goal_unit: 'minutes' | 'kcal'
  cardio_goal_value: number
  onboarded_at: string | null
  created_at: string
}

export interface WeightEntry {
  id: string
  measured_on: ISODate
  weight_kg: number
  created_at: string
}

export const MUSCLE_GROUPS = {
  peito: 'Peito',
  costas: 'Costas',
  ombros: 'Ombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  antebraco: 'Antebraço',
  quadriceps: 'Quadríceps',
  posterior: 'Posterior',
  gluteos: 'Glúteos',
  panturrilha: 'Panturrilha',
  abdomen: 'Abdômen',
  corpo_todo: 'Corpo todo',
} as const

export type MuscleGroup = keyof typeof MUSCLE_GROUPS

export interface Exercise {
  id: string
  user_id: string | null
  name: string
  muscle_group: MuscleGroup
}

export interface WorkoutExercise {
  id: string
  exercise_id: string
  position: number
}

export interface Workout {
  id: string
  name: string
  focus: string | null
  position: number
  archived_at: string | null
  created_at: string
  workout_exercises: WorkoutExercise[]
}

export interface LoadEntry {
  id: string
  exercise_id: string
  recorded_on: ISODate
  load_kg: number
  sets: number
  reps: number
  created_at: string
}

export interface Checkin {
  id: string
  workout_id: string
  done_on: ISODate
  created_at: string
}
