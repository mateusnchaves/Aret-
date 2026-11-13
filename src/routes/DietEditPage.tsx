import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { IconPlus } from '@/components/icons'
import { SubHeader } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { ErrorNote, Input } from '@/components/ui/form'
import { Card, EmptyState, Eyebrow, Sheet, Spinner } from '@/components/ui/surface'
import { AmountForm } from '@/features/nutrition/AmountForm'
import { amountLabel, nkeys, useDiets, useFoods, useMealSlots, useNutritionTargets } from '@/features/nutrition/data'
import { FoodPicker } from '@/features/nutrition/FoodPicker'
import { MacroBars } from '@/features/nutrition/MacroBars'
import * as api from '@/lib/api-nutrition'
import { formatInt } from '@/lib/format'
import { macrosForGrams, sumMacros } from '@/lib/nutrition'
import type { Diet, DietItem, MealSlot } from '@/lib/types'

export function DietEditPage() {
  const { id } = useParams()
  const diets = useDiets()
  if (diets.isPending) return <Spinner />
  if (diets.error) return <ErrorNote error={diets.error} />
  const diet = diets.data?.find((d) => d.id === id)
  if (!diet) return <EmptyState title="Dieta não encontrada" />
  return <DietEditor key={diet.id} diet={diet} />
}

function DietEditor({ diet }: { diet: Diet }) {
  const slots = useMealSlots()
  const foods = useFoods()
  const targets = useNutritionTargets()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [name, setName] = useState(diet.name)
  const [picker, setPicker] = useState<MealSlot | null>(null)
  const [editing, setEditing] = useState<DietItem | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const refresh = () => queryClient.invalidateQueries({ queryKey: nkeys.diets })
  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true)
    setError(null)
    try {
      await fn()
      await refresh()
    } catch (e) {
      setError(e)
    } finally {
      setBusy(false)
    }
  }

  const macrosOf = (items: DietItem[]) =>
    sumMacros(
      items.flatMap((i) => {
        const f = foods.byId.get(i.food_id)
        return f ? [macrosForGrams(f, i.grams)] : []
      }),
    )
  const total = macrosOf(diet.diet_items)
  const editingFood = editing ? foods.byId.get(editing.food_id) : undefined

  return (
    <>
      <SubHeader back="/alimentacao/dietas" context={diet.is_active ? 'Dieta ativa' : 'Dieta'} />

      <div className="flex gap-2">
        <Input aria-label="Nome da dieta" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} className="font-display text-xl font-semibold" />
        {name.trim() && name.trim() !== diet.name && (
          <Button disabled={busy} onClick={() => run(() => api.renameDiet(diet.id, name))}>
            Salvar
          </Button>
        )}
      </div>

      <Card className="mt-4 flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <Eyebrow>Total da dieta</Eyebrow>
          {targets && <span className="text-xs text-muted">meta {formatInt(targets.kcal)} kcal</span>}
        </div>
        <p className="m-0 font-display text-3xl font-semibold tabular">
          {formatInt(total.kcal)} <span className="font-sans text-sm font-normal text-muted">kcal</span>
        </p>
        {targets && <MacroBars total={total} targets={targets} />}
      </Card>

      <ErrorNote error={error} />

      <div className="mt-4 flex flex-col gap-3">
        {slots.active.map((slot) => {
          const items = diet.diet_items.filter((i) => i.meal_slot_id === slot.id)
          return (
            <Card key={slot.id} className="flex flex-col gap-1 py-3.5">
              <div className="flex items-center justify-between">
                <h2 className="m-0 text-[15px] font-medium">{slot.name}</h2>
                <div className="flex items-center gap-1">
                  {items.length > 0 && <span className="text-sm text-text-2 tabular">{formatInt(macrosOf(items).kcal)} kcal</span>}
                  <Button variant="ghost" size="icon" aria-label={`Adicionar à dieta: ${slot.name}`} onClick={() => setPicker(slot)}>
                    <IconPlus size={18} />
                  </Button>
                </div>
              </div>
              {items.length > 0 && (
                <ul className="m-0 list-none p-0">
                  {items.map((i) => {
                    const f = foods.byId.get(i.food_id)
                    return (
                      <li key={i.id}>
                        <button
                          type="button"
                          onClick={() => setEditing(i)}
                          className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent px-0 text-left text-text"
                        >
                          <span className="flex min-w-0 flex-col">
                            <span className="truncate text-[13px]">{f?.name ?? '…'}</span>
                            <span className="text-xs text-muted">{amountLabel(i)}</span>
                          </span>
                          <span className="shrink-0 text-[13px] text-text-2 tabular">{f ? formatInt(macrosForGrams(f, i.grams).kcal) : ''}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </Card>
          )
        })}
      </div>

      <div className="mt-8 flex flex-col gap-2">
        {!diet.is_active && (
          <Button disabled={busy} onClick={() => run(() => api.setActiveDiet(diet.id))}>
            Usar esta dieta
          </Button>
        )}
        <Button
          variant="danger"
          disabled={busy}
          onClick={() => {
            if (!window.confirm(`Apagar a dieta “${diet.name}”? O que já está no diário continua.`)) return
            void run(async () => {
              await api.deleteDiet(diet.id)
              navigate('/alimentacao/dietas', { replace: true })
            })
          }}
        >
          Apagar dieta
        </Button>
      </div>

      <FoodPicker
        open={picker !== null}
        onClose={() => setPicker(null)}
        title={picker ? `${picker.name} da dieta` : 'Adicionar'}
        onPick={async (food, amount) => {
          const position = diet.diet_items.filter((i) => i.meal_slot_id === picker!.id).length
          await api.addDietItem({ diet_id: diet.id, meal_slot_id: picker!.id, food_id: food.id, position, ...amount })
          await refresh()
        }}
      />

      <Sheet open={editing !== null} onClose={() => setEditing(null)} title="Editar item da dieta">
        {editing && editingFood && (
          <AmountForm
            food={editingFood}
            initial={editing}
            submitLabel="Salvar"
            onSubmit={async (a) => {
              await api.updateDietItem(editing.id, a)
              await refresh()
              setEditing(null)
            }}
            onDelete={async () => {
              await api.deleteDietItem(editing.id)
              await refresh()
              setEditing(null)
            }}
          />
        )}
      </Sheet>
    </>
  )
}
