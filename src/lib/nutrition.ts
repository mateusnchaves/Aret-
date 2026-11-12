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
