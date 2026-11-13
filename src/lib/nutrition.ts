import { parseISODate, type ISODate } from './dates'

export type Sex = 'male' | 'female'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type Goal = 'cut' | 'maintain' | 'bulk'

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

export const ACTIVITY_LABELS: Record<ActivityLevel, { label: string; hint: string }> = {
  sedentary: { label: 'Sedentário', hint: 'Pouco ou nenhum exercício' },
  light: { label: 'Leve', hint: 'Treino 1–3× por semana' },
  moderate: { label: 'Moderado', hint: 'Treino 3–5× por semana' },
  active: { label: 'Ativo', hint: 'Treino 6–7× por semana' },
  very_active: { label: 'Muito ativo', hint: 'Treino pesado diário ou trabalho físico' },
}

export const GOAL_ADJUSTMENT: Record<Goal, number> = {
  cut: -0.2,
  maintain: 0,
  bulk: 0.1,
}

export const GOAL_LABELS: Record<Goal, { label: string; hint: string }> = {
  cut: { label: 'Cutting', hint: 'Perder gordura · −20% kcal' },
  maintain: { label: 'Manutenção', hint: 'Manter o peso' },
  bulk: { label: 'Bulking', hint: 'Ganhar massa · +10% kcal' },
}

export const PROTEIN_G_PER_KG = 2
export const FAT_G_PER_KG = 0.8

export function ageOn(birthDate: ISODate, today: ISODate): number {
  const b = parseISODate(birthDate)
  const t = parseISODate(today)
  let age = t.getFullYear() - b.getFullYear()
  const beforeBirthday = t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())
  if (beforeBirthday) age -= 1
  return age
}

/** Taxa metabólica basal — Mifflin-St Jeor (kcal/dia). */
export function bmrMifflinStJeor(params: { sex: Sex; weightKg: number; heightCm: number; age: number }): number {
  const base = 10 * params.weightKg + 6.25 * params.heightCm - 5 * params.age
  return params.sex === 'male' ? base + 5 : base - 161
}

export interface BodyProfile {
  sex: Sex
  weightKg: number
  heightCm: number
  age: number
  activity: ActivityLevel
  goal: Goal
}

export interface DailyTargets {
  bmr: number
  tdee: number
  kcal: number
  proteinG: number
  fatG: number
  carbsG: number
}

export function dailyTargets(p: BodyProfile): DailyTargets {
  const bmr = bmrMifflinStJeor(p)
  const tdee = bmr * ACTIVITY_FACTORS[p.activity]
  const kcal = Math.round(tdee * (1 + GOAL_ADJUSTMENT[p.goal]))
  const proteinG = Math.round(p.weightKg * PROTEIN_G_PER_KG)
  const fatG = Math.round(p.weightKg * FAT_G_PER_KG)
  const carbsG = Math.max(0, Math.round((kcal - proteinG * 4 - fatG * 9) / 4))
  return { bmr: Math.round(bmr), tdee: Math.round(tdee), kcal, proteinG, fatG, carbsG }
}

// ───────────── Diário e metas ─────────────

export interface Macros {
  kcal: number
  proteinG: number
  carbsG: number
  fatG: number
}

export const ZERO_MACROS: Macros = { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 }

/** Valores por 100 g, como na TACO. */
export interface Per100g {
  kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

const round1 = (n: number) => Math.round(n * 10) / 10

export function macrosForGrams(food: Per100g, grams: number): Macros {
  const f = grams / 100
  return {
    kcal: round1(food.kcal * f),
    proteinG: round1(food.protein_g * f),
    carbsG: round1(food.carbs_g * f),
    fatG: round1(food.fat_g * f),
  }
}

export function sumMacros(items: readonly Macros[]): Macros {
  return items.reduce<Macros>(
    (acc, m) => ({
      kcal: round1(acc.kcal + m.kcal),
      proteinG: round1(acc.proteinG + m.proteinG),
      carbsG: round1(acc.carbsG + m.carbsG),
      fatG: round1(acc.fatG + m.fatG),
    }),
    ZERO_MACROS,
  )
}

export interface TargetOverrides {
  kcal: number | null
  proteinG: number | null
  carbsG: number | null
  fatG: number | null
}

export interface ResolvedTargets extends Macros {
  /** true quando algum valor veio do Perfil em vez do cálculo. */
  manual: boolean
}

/**
 * Meta final do dia: cada valor manual vence o calculado. Se o carboidrato não foi fixado,
 * ele completa as calorias que sobram depois de proteína e gordura.
 */
export function resolveTargets(calculated: DailyTargets | null, o: TargetOverrides): ResolvedTargets | null {
  const kcal = o.kcal ?? calculated?.kcal ?? null
  const proteinG = o.proteinG ?? calculated?.proteinG ?? null
  const fatG = o.fatG ?? calculated?.fatG ?? null
  if (kcal === null || proteinG === null || fatG === null) return null
  const carbsG = o.carbsG ?? Math.max(0, Math.round((kcal - proteinG * 4 - fatG * 9) / 4))
  const manual = [o.kcal, o.proteinG, o.carbsG, o.fatG].some((v) => v !== null)
  return { kcal, proteinG, carbsG, fatG, manual }
}

export type Adherence = 'under' | 'ok' | 'over'

/** Dentro de ±10% da meta conta como "bateu". */
export function adherence(consumed: number, target: number, tolerance = 0.1): Adherence {
  if (target <= 0) return 'ok'
  const ratio = consumed / target
  if (ratio < 1 - tolerance) return 'under'
  if (ratio > 1 + tolerance) return 'over'
  return 'ok'
}
