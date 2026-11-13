import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import * as api from '@/lib/api-nutrition'
import { todayISO, type ISODate } from '@/lib/dates'
import { ageOn, dailyTargets, macrosForGrams, resolveTargets, sumMacros, type Macros } from '@/lib/nutrition'
import type { Amount, DiaryEntry, Food } from '@/lib/types'
import { useCurrentWeight, useProfile } from '../data'

export const nkeys = {
  foods: ['foods'] as const,
  portions: ['food-portions'] as const,
  favorites: ['food-favorites'] as const,
  recents: ['food-recents'] as const,
  slots: ['meal-slots'] as const,
  diets: ['diets'] as const,
  combos: ['combos'] as const,
  diary: (date: ISODate) => ['diary', date] as const,
  diaryAll: ['diary'] as const,
}

export function useFoods() {
  const q = useQuery({ queryKey: nkeys.foods, queryFn: api.listFoods, staleTime: 10 * 60_000 })
  const byId = useMemo(() => new Map((q.data ?? []).map((f) => [f.id, f])), [q.data])
  return { ...q, byId }
}

export function usePortions() {
  return useQuery({ queryKey: nkeys.portions, queryFn: api.listPortions, staleTime: 5 * 60_000 })
}

export function useFavorites() {
  const q = useQuery({ queryKey: nkeys.favorites, queryFn: api.listFavorites })
  const set = useMemo(() => new Set(q.data ?? []), [q.data])
  return { ...q, set }
}

export function useRecentFoodIds() {
  return useQuery({ queryKey: nkeys.recents, queryFn: () => api.listRecentFoodIds() })
}

export function useMealSlots() {
  const q = useQuery({ queryKey: nkeys.slots, queryFn: api.listMealSlots })
  const active = useMemo(() => (q.data ?? []).filter((s) => !s.archived_at), [q.data])
  return { ...q, active }
}

export function useDiets() {
  const q = useQuery({ queryKey: nkeys.diets, queryFn: api.listDiets })
  const active = useMemo(() => q.data?.find((d) => d.is_active), [q.data])
  return { ...q, active }
}

export function useCombos() {
  return useQuery({ queryKey: nkeys.combos, queryFn: api.listCombos })
}

export function useDiary(date: ISODate) {
  return useQuery({ queryKey: nkeys.diary(date), queryFn: () => api.listDiary(date) })
}

/** Meta do dia: cálculo do perfil + metas manuais. */
export function useNutritionTargets() {
  const profile = useProfile()
  const weightKg = useCurrentWeight()
  return useMemo(() => {
    const p = profile.data
    if (!p) return null
    const calculated =
      p.sex && p.birth_date && p.height_cm && p.activity_level && p.goal && weightKg
        ? dailyTargets({
            sex: p.sex,
            age: ageOn(p.birth_date, todayISO()),
            heightCm: p.height_cm,
            weightKg,
            activity: p.activity_level,
            goal: p.goal,
          })
        : null
    return resolveTargets(calculated, {
      kcal: p.kcal_target,
      proteinG: p.protein_target_g,
      carbsG: p.carbs_target_g,
      fatG: p.fat_target_g,
    })
  }, [profile.data, weightKg])
}

export const entryMacros = (e: Pick<DiaryEntry, 'kcal' | 'protein_g' | 'carbs_g' | 'fat_g'>): Macros => ({
  kcal: e.kcal,
  proteinG: e.protein_g,
  carbsG: e.carbs_g,
  fatG: e.fat_g,
})

export const totalOf = (entries: readonly DiaryEntry[]) => sumMacros(entries.map(entryMacros))

/** Linha do diário com o retrato dos macros calculado agora. */
export function diaryRow(
  food: Food,
  a: Amount,
  where: { eaten_on: ISODate; meal_slot_id: string; from_diet_id?: string | null },
): api.DiaryInput {
  const m = macrosForGrams(food, a.grams)
  return {
    eaten_on: where.eaten_on,
    meal_slot_id: where.meal_slot_id,
    from_diet_id: where.from_diet_id ?? null,
    food_id: food.id,
    food_name: food.name,
    grams: a.grams,
    portion_label: a.portion_label,
    portion_qty: a.portion_qty,
    kcal: m.kcal,
    protein_g: m.proteinG,
    carbs_g: m.carbsG,
    fat_g: m.fatG,
  }
}

/** "150 g" · "2 × 1 unidade (100 g)" */
export function amountLabel(a: Amount): string {
  const g = `${Math.round(a.grams * 10) / 10} g`.replace('.', ',')
  if (!a.portion_label || !a.portion_qty) return g
  const qty = String(a.portion_qty).replace('.', ',')
  return `${qty} × ${a.portion_label} (${g})`
}
