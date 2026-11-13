import type { ISODate } from './dates'
import type { CardioKind, Intensity } from './cardio'
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
  /** Metas manuais de alimentação; null = usar o cálculo. */
  kcal_target: number | null
  protein_target_g: number | null
  carbs_target_g: number | null
  fat_target_g: number | null
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

export interface CardioSession {
  id: string
  done_on: ISODate
  kind: CardioKind
  intensity: Intensity
  duration_min: number
  distance_km: number | null
  kcal: number
  kcal_manual: boolean
  note: string | null
  created_at: string
}

// ───────────── Alimentação ─────────────

export interface Food {
  id: string
  user_id: string | null
  taco_id: number | null
  category_id: number | null
  name: string
  /** por 100 g */
  kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number | null
}

export interface FoodPortion {
  id: string
  food_id: string
  label: string
  grams: number
}

export interface MealSlot {
  id: string
  name: string
  position: number
  archived_at: string | null
}

/** Quantidade de um alimento: sempre em gramas, opcionalmente lembrando a medida caseira usada. */
export interface Amount {
  grams: number
  portion_label: string | null
  portion_qty: number | null
}

export interface DietItem extends Amount {
  id: string
  diet_id: string
  meal_slot_id: string
  food_id: string
  position: number
}

export interface Diet {
  id: string
  name: string
  is_active: boolean
  created_at: string
  diet_items: DietItem[]
}

export interface DiaryEntry extends Amount {
  id: string
  eaten_on: ISODate
  meal_slot_id: string
  food_id: string | null
  food_name: string
  kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
  from_diet_id: string | null
  created_at: string
}

export interface ComboItem extends Amount {
  id: string
  food_id: string
  position: number
}

export interface Combo {
  id: string
  name: string
  combo_items: ComboItem[]
}
