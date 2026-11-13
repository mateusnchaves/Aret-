/**
 * Supabase · alimentação. Numéricos do Postgres (numeric) são normalizados para number.
 */
import { unwrap } from './db'
import type { ISODate } from './dates'
import { supabase } from './supabase'
import type { Amount, Combo, Diet, DiaryEntry, Food, FoodPortion, MealSlot } from './types'

const n = (v: unknown) => Number(v)
const nn = (v: unknown) => (v == null ? null : Number(v))

const amount = <T extends Amount>(r: T): T => ({ ...r, grams: n(r.grams), portion_qty: nn(r.portion_qty) })

// ───────────── Alimentos ─────────────

const FOOD_COLUMNS = 'id, user_id, taco_id, category_id, name, kcal, protein_g, carbs_g, fat_g, fiber_g'

const food = (r: Food): Food => ({
  ...r,
  kcal: n(r.kcal),
  protein_g: n(r.protein_g),
  carbs_g: n(r.carbs_g),
  fat_g: n(r.fat_g),
  fiber_g: nn(r.fiber_g),
})

/** TACO (~600) + próprios. Pequeno o bastante para buscar no cliente, sem acento. */
export async function listFoods(): Promise<Food[]> {
  const rows = unwrap<Food[]>(await supabase.from('foods').select(FOOD_COLUMNS).order('name').range(0, 4999))
  return rows.map(food)
}

export type FoodInput = Pick<Food, 'name' | 'kcal' | 'protein_g' | 'carbs_g' | 'fat_g' | 'fiber_g'>

export async function createFood(input: FoodInput): Promise<Food> {
  return food(unwrap<Food>(await supabase.from('foods').insert({ ...input, name: input.name.trim() }).select(FOOD_COLUMNS).single()))
}

export async function updateFood(id: string, input: FoodInput): Promise<void> {
  unwrap(await supabase.from('foods').update({ ...input, name: input.name.trim() }).eq('id', id))
}

export async function deleteFood(id: string): Promise<void> {
  unwrap(await supabase.from('foods').delete().eq('id', id))
}

export async function listPortions(): Promise<FoodPortion[]> {
  const rows = unwrap<FoodPortion[]>(await supabase.from('food_portions').select('id, food_id, label, grams').order('label'))
  return rows.map((r) => ({ ...r, grams: n(r.grams) }))
}

export async function addPortion(foodId: string, label: string, grams: number): Promise<FoodPortion> {
  const r = unwrap<FoodPortion>(
    await supabase.from('food_portions').insert({ food_id: foodId, label: label.trim(), grams }).select('id, food_id, label, grams').single(),
  )
  return { ...r, grams: n(r.grams) }
}

export async function deletePortion(id: string): Promise<void> {
  unwrap(await supabase.from('food_portions').delete().eq('id', id))
}

export async function listFavorites(): Promise<string[]> {
  return unwrap<{ food_id: string }[]>(await supabase.from('food_favorites').select('food_id')).map((r) => r.food_id)
}

export async function setFavorite(foodId: string, on: boolean): Promise<void> {
  if (on) unwrap(await supabase.from('food_favorites').upsert({ food_id: foodId }, { onConflict: 'user_id,food_id', ignoreDuplicates: true }))
  else unwrap(await supabase.from('food_favorites').delete().eq('food_id', foodId))
}

// ───────────── Refeições ─────────────

export async function listMealSlots(): Promise<MealSlot[]> {
  return unwrap<MealSlot[]>(await supabase.from('meal_slots').select('id, name, position, archived_at').order('position'))
}

export async function createMealSlot(name: string, position: number): Promise<void> {
  unwrap(await supabase.from('meal_slots').insert({ name: name.trim(), position }))
}

export async function updateMealSlot(id: string, patch: Partial<Pick<MealSlot, 'name' | 'archived_at'>>): Promise<void> {
  unwrap(await supabase.from('meal_slots').update(patch).eq('id', id))
}

export async function reorderMealSlots(ids: string[]): Promise<void> {
  await Promise.all(ids.map(async (id, position) => unwrap(await supabase.from('meal_slots').update({ position }).eq('id', id))))
}

// ───────────── Dietas ─────────────

const DIET_ITEM_COLUMNS = 'id, diet_id, meal_slot_id, food_id, grams, portion_label, portion_qty, position'

export async function listDiets(): Promise<Diet[]> {
  const rows = unwrap<Diet[]>(
    await supabase.from('diets').select(`id, name, is_active, created_at, diet_items(${DIET_ITEM_COLUMNS})`).order('created_at'),
  )
  return rows.map((d) => ({
    ...d,
    diet_items: d.diet_items.map(amount).sort((a, b) => a.position - b.position),
  }))
}

export async function createDiet(name: string, active: boolean): Promise<string> {
  const row = unwrap<{ id: string }>(await supabase.from('diets').insert({ name: name.trim() }).select('id').single())
  if (active) await setActiveDiet(row.id)
  return row.id
}

export async function renameDiet(id: string, name: string): Promise<void> {
  unwrap(await supabase.from('diets').update({ name: name.trim() }).eq('id', id))
}

export async function deleteDiet(id: string): Promise<void> {
  unwrap(await supabase.from('diets').delete().eq('id', id))
}

export async function setActiveDiet(id: string): Promise<void> {
  unwrap(await supabase.rpc('set_active_diet', { target: id }))
}

export async function addDietItem(input: { diet_id: string; meal_slot_id: string; food_id: string; position: number } & Amount) {
  unwrap(await supabase.from('diet_items').insert(input))
}

export async function updateDietItem(id: string, a: Amount): Promise<void> {
  unwrap(await supabase.from('diet_items').update(a).eq('id', id))
}

export async function deleteDietItem(id: string): Promise<void> {
  unwrap(await supabase.from('diet_items').delete().eq('id', id))
}

// ───────────── Diário ─────────────

const DIARY_COLUMNS =
  'id, eaten_on, meal_slot_id, food_id, food_name, grams, portion_label, portion_qty, kcal, protein_g, carbs_g, fat_g, from_diet_id, created_at'

const diary = (r: DiaryEntry): DiaryEntry => ({
  ...amount(r),
  kcal: n(r.kcal),
  protein_g: n(r.protein_g),
  carbs_g: n(r.carbs_g),
  fat_g: n(r.fat_g),
})

export async function listDiary(date: ISODate): Promise<DiaryEntry[]> {
  const rows = unwrap<DiaryEntry[]>(
    await supabase.from('diary_entries').select(DIARY_COLUMNS).eq('eaten_on', date).order('created_at'),
  )
  return rows.map(diary)
}

export type DiaryInput = Omit<DiaryEntry, 'id' | 'created_at'>

export async function addDiaryEntries(rows: DiaryInput[]): Promise<void> {
  if (rows.length === 0) return
  unwrap(await supabase.from('diary_entries').insert(rows))
}

export async function updateDiaryEntry(
  id: string,
  patch: Amount & Pick<DiaryEntry, 'kcal' | 'protein_g' | 'carbs_g' | 'fat_g' | 'meal_slot_id'>,
): Promise<void> {
  unwrap(await supabase.from('diary_entries').update(patch).eq('id', id))
}

export async function deleteDiaryEntries(ids: string[]): Promise<void> {
  unwrap(await supabase.from('diary_entries').delete().in('id', ids))
}

/** kcal por dia num período (inclusive), para a coroa da semana e o mapa de constância. */
export async function kcalByDay(from: ISODate, to: ISODate): Promise<Map<ISODate, number>> {
  const rows = unwrap<{ eaten_on: ISODate; kcal: number }[]>(
    await supabase.from('diary_entries').select('eaten_on, kcal').gte('eaten_on', from).lte('eaten_on', to).range(0, 9999),
  )
  const map = new Map<ISODate, number>()
  for (const r of rows) map.set(r.eaten_on, (map.get(r.eaten_on) ?? 0) + Number(r.kcal))
  return map
}

/** Últimos alimentos usados, mais recente primeiro, sem repetir. */
export async function listRecentFoodIds(limit = 15): Promise<string[]> {
  const rows = unwrap<{ food_id: string | null }[]>(
    await supabase.from('diary_entries').select('food_id').not('food_id', 'is', null).order('created_at', { ascending: false }).limit(120),
  )
  return [...new Set(rows.map((r) => r.food_id).filter((id): id is string => id !== null))].slice(0, limit)
}

// ───────────── Combos ─────────────

export async function listCombos(): Promise<Combo[]> {
  const rows = unwrap<Combo[]>(
    await supabase.from('combos').select('id, name, combo_items(id, food_id, grams, portion_label, portion_qty, position)').order('name'),
  )
  return rows.map((c) => ({ ...c, combo_items: c.combo_items.map(amount).sort((a, b) => a.position - b.position) }))
}

export async function createCombo(name: string, items: ({ food_id: string } & Amount)[]): Promise<void> {
  const combo = unwrap<{ id: string }>(await supabase.from('combos').insert({ name: name.trim() }).select('id').single())
  unwrap(await supabase.from('combo_items').insert(items.map((i, position) => ({ ...i, combo_id: combo.id, position }))))
}

export async function deleteCombo(id: string): Promise<void> {
  unwrap(await supabase.from('combos').delete().eq('id', id))
}

/** Tudo de alimentação para a exportação de dados. */
export async function exportNutrition() {
  const [foods, portions, favorites, slots, diets, combos, entries] = await Promise.all([
    listFoods(),
    listPortions(),
    listFavorites(),
    listMealSlots(),
    listDiets(),
    listCombos(),
    supabase.from('diary_entries').select(DIARY_COLUMNS).order('eaten_on').range(0, 49999),
  ])
  return {
    custom_foods: foods.filter((f) => f.user_id !== null),
    food_portions: portions,
    favorite_food_ids: favorites,
    meal_slots: slots,
    diets,
    combos,
    diary_entries: unwrap<DiaryEntry[]>(entries).map(diary),
  }
}
