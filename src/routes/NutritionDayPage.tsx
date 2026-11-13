import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { CountUp, Laurel, Ring } from '@/components/brand'
import { IconBack, IconCheck, IconChevronRight, IconPlus } from '@/components/icons'
import { PageTitle } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { ErrorNote } from '@/components/ui/form'
import { Card, Sheet, Spinner } from '@/components/ui/surface'
import { AmountForm } from '@/features/nutrition/AmountForm'
import {
  amountLabel,
  diaryRow,
  entryMacros,
  nkeys,
  totalOf,
  useDiary,
  useDiets,
  useFoods,
  useMealSlots,
  useNutritionTargets,
} from '@/features/nutrition/data'
import { FoodPicker } from '@/features/nutrition/FoodPicker'
import { MacroColumns } from '@/features/nutrition/MacroColumns'
import * as api from '@/lib/api-nutrition'
import { addDays } from '@/lib/cardio'
import { cn } from '@/lib/cn'
import { formatWeekdayDate, todayISO, type ISODate } from '@/lib/dates'
import { formatInt } from '@/lib/format'
import { hapticSuccess } from '@/lib/haptics'
import { adherence, macrosForGrams, sumMacros } from '@/lib/nutrition'
import type { DiaryEntry, MealSlot } from '@/lib/types'

export function NutritionDayPage() {
  const [params, setParams] = useSearchParams()
  const today = todayISO()
  const raw = params.get('dia')
  const date: ISODate = raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) && raw <= today ? raw : today
  const go = (d: ISODate) => setParams(d === today ? {} : { dia: d }, { replace: true })

  const diary = useDiary(date)
  const slots = useMealSlots()
  const targets = useNutritionTargets()
  const [picker, setPicker] = useState<MealSlot | null>(null)
  const [editing, setEditing] = useState<DiaryEntry | null>(null)
  const queryClient = useQueryClient()
  const foods = useFoods()

  if (diary.isPending || slots.isPending) return <Spinner />
  const error = diary.error ?? slots.error
  if (error) return <ErrorNote error={error} />

  const entries = diary.data ?? []
  const total = totalOf(entries)
  // Refeições arquivadas ainda aparecem nos dias em que têm registros.
  const visibleSlots = (slots.data ?? []).filter((s) => !s.archived_at || entries.some((e) => e.meal_slot_id === s.id))

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: nkeys.diaryAll }),
      queryClient.invalidateQueries({ queryKey: nkeys.recents }),
    ])

  return (
    <>
      <PageTitle
        aside={
          <div className="flex items-center gap-1">
            <Button asChild variant="outline" size="sm">
              <Link to="/alimentacao/dietas" className="no-underline">
                Dietas
              </Link>
            </Button>
          </div>
        }
      >
        Alimentação
      </PageTitle>

      <nav aria-label="Dia" className="-mt-2 mb-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" aria-label="Dia anterior" onClick={() => go(addDays(date, -1))}>
          <IconBack size={18} />
        </Button>
        <span className="text-sm font-medium">{date === today ? `Hoje, ${formatWeekdayDate(date).split(', ')[1]}` : formatWeekdayDate(date)}</span>
        <Button variant="ghost" size="icon" aria-label="Próximo dia" disabled={date >= today} onClick={() => go(addDays(date, 1))}>
          <IconChevronRight size={18} />
        </Button>
      </nav>

      <DaySummary total={total} targets={targets} />

      <div className="mt-5 flex flex-col gap-3">
        {visibleSlots.map((slot) => (
          <MealCard
            key={slot.id}
            slot={slot}
            date={date}
            entries={entries.filter((e) => e.meal_slot_id === slot.id)}
            onAdd={() => setPicker(slot)}
            onEdit={setEditing}
            onChanged={refresh}
          />
        ))}
        {visibleSlots.length === 0 && (
          <p className="m-0 text-center text-sm text-muted">
            Nenhuma refeição configurada. <Link to="/perfil">Adicione no Perfil</Link>.
          </p>
        )}
      </div>

      <FoodPicker
        open={picker !== null}
        onClose={() => setPicker(null)}
        title={picker ? `Adicionar · ${picker.name}` : 'Adicionar'}
        onPick={async (food, amount) => {
          await api.addDiaryEntries([diaryRow(food, amount, { eaten_on: date, meal_slot_id: picker!.id })])
          hapticSuccess()
          await refresh()
        }}
        onPickCombo={async (combo) => {
          const rows = combo.combo_items.flatMap((i) => {
            const f = foods.byId.get(i.food_id)
            return f ? [diaryRow(f, i, { eaten_on: date, meal_slot_id: picker!.id })] : []
          })
          await api.addDiaryEntries(rows)
          hapticSuccess()
          await refresh()
        }}
      />

      <Sheet open={editing !== null} onClose={() => setEditing(null)} title="Editar item">
        {editing && <EditEntry entry={editing} onDone={() => setEditing(null)} onChanged={refresh} />}
      </Sheet>
    </>
  )
}

function DaySummary({ total, targets }: { total: ReturnType<typeof totalOf>; targets: ReturnType<typeof useNutritionTargets> }) {
  if (!targets) {
    return (
      <Card>
        <p className="m-0 font-display text-3xl font-semibold tabular">
          {formatInt(total.kcal)} <span className="font-sans text-sm font-normal text-muted">kcal</span>
        </p>
        <p className="m-0 mt-1 text-sm text-muted">
          Complete o perfil para ver sua meta. <Link to="/perfil">Abrir Perfil</Link>
        </p>
      </Card>
    )
  }
  const left = targets.kcal - total.kcal
  const status = adherence(total.kcal, targets.kcal)
  return (
    <Card hero className="flex items-center gap-1.5 px-3.5 py-4">
      <Ring
        value={total.kcal / targets.kcal}
        size={168}
        stroke={11}
        color={status === 'ok' ? 'var(--color-bronze)' : 'var(--color-accent-hi)'}
        wreath={{ color: status === 'ok' ? 'var(--color-bronze)' : 'var(--color-laurel)', lit: Math.min(1, total.kcal / targets.kcal) }}
        label={`${formatInt(total.kcal)} de ${formatInt(targets.kcal)} kcal`}
      >
        <span className="font-display text-[30px] leading-none font-semibold tabular">
          <CountUp value={total.kcal} format={formatInt} />
        </span>
        <span className="mt-1 text-[11px] text-muted">de {formatInt(targets.kcal)} kcal</span>
        {status === 'ok' ? (
          <span className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-bronze">
            <Laurel size={12} />
            na meta
          </span>
        ) : (
          <span className={cn('mt-0.5 text-[11px] font-semibold', left >= 0 ? 'text-accent-hi' : 'text-danger')}>
            {left >= 0 ? `faltam ${formatInt(left)}` : `${formatInt(-left)} acima`}
          </span>
        )}
      </Ring>
      <MacroColumns total={total} targets={targets} />
    </Card>
  )
}

function MealCard({
  slot,
  date,
  entries,
  onAdd,
  onEdit,
  onChanged,
}: {
  slot: MealSlot
  date: ISODate
  entries: DiaryEntry[]
  onAdd: () => void
  onEdit: (e: DiaryEntry) => void
  onChanged: () => Promise<unknown>
}) {
  const diets = useDiets()
  const foods = useFoods()
  const queryClient = useQueryClient()
  const [busy, setBusy] = useState<'diet' | 'combo' | null>(null)
  const [error, setError] = useState<unknown>(null)
  const subtotal = sumMacros(entries.map(entryMacros))

  const dietItems = diets.active?.diet_items.filter((i) => i.meal_slot_id === slot.id) ?? []
  const dietKcal = sumMacros(
    dietItems.flatMap((i) => {
      const f = foods.byId.get(i.food_id)
      return f ? [macrosForGrams(f, i.grams)] : []
    }),
  ).kcal
  const ateFromDiet = entries.some((e) => e.from_diet_id && e.from_diet_id === diets.active?.id)
  const canLogDiet = !slot.archived_at && dietItems.length > 0 && !ateFromDiet

  async function logDiet() {
    setBusy('diet')
    setError(null)
    try {
      const rows = dietItems.flatMap((i) => {
        const f = foods.byId.get(i.food_id)
        return f ? [diaryRow(f, i, { eaten_on: date, meal_slot_id: slot.id, from_diet_id: diets.active!.id })] : []
      })
      await api.addDiaryEntries(rows)
      hapticSuccess()
      await onChanged()
    } catch (e) {
      setError(e)
    } finally {
      setBusy(null)
    }
  }

  async function saveCombo() {
    const name = window.prompt('Nome do combo (ex.: Meu pré-treino):', slot.name)?.trim()
    if (!name) return
    setBusy('combo')
    setError(null)
    try {
      const items = entries.filter((e) => e.food_id).map((e) => ({ food_id: e.food_id!, grams: e.grams, portion_label: e.portion_label, portion_qty: e.portion_qty }))
      await api.createCombo(name, items)
      await queryClient.invalidateQueries({ queryKey: nkeys.combos })
    } catch (e) {
      setError(e)
    } finally {
      setBusy(null)
    }
  }

  const done = ateFromDiet || (entries.length > 0 && dietItems.length === 0)

  return (
    <Card className={cn('flex flex-col gap-2 py-3.5', entries.length === 0 && canLogDiet && 'border-dashed border-line-strong bg-transparent')}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className={cn(
              'flex size-[22px] shrink-0 items-center justify-center rounded-full',
              done ? 'bg-laurel text-on-laurel' : 'border-[1.5px] border-accent',
              entries.length === 0 && !done && 'border-line-strong',
            )}
          >
            {done && <IconCheck size={12} strokeWidth={3} />}
          </span>
          <div className="flex min-w-0 flex-col">
            <h2 className="m-0 truncate text-[15px] font-medium">{slot.name}</h2>
            {ateFromDiet && <span className="text-xs text-laurel">da dieta</span>}
            {entries.length === 0 && dietItems.length > 0 && <span className="text-xs text-muted">dieta: {formatInt(dietKcal)} kcal</span>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {entries.length > 0 && (
            <span className="font-display text-base font-semibold tabular">
              {formatInt(subtotal.kcal)} <span className="font-sans text-xs font-normal text-muted">kcal</span>
            </span>
          )}
          {!slot.archived_at && (
            <Button variant="ghost" size="icon" aria-label={`Adicionar alimento: ${slot.name}`} onClick={onAdd}>
              <IconPlus size={18} />
            </Button>
          )}
        </div>
      </div>

      {entries.length > 0 && (
        <ul className="m-0 list-none p-0 pl-8">
          {entries.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => onEdit(e)}
                className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent px-0 text-left text-text"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[13px]">{e.food_name}</span>
                  <span className="text-xs text-muted">{amountLabel(e)}</span>
                </span>
                <span className="shrink-0 text-[13px] text-text-2 tabular">{formatInt(e.kcal)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <ErrorNote error={error} />
      {canLogDiet && (
        <Button variant="accentOutline" size="sm" disabled={busy !== null} onClick={logDiet}>
          <IconCheck size={16} />
          {busy === 'diet' ? 'Lançando…' : 'Comi o que está na dieta'}
        </Button>
      )}
      {entries.length >= 2 && (
        <Button variant="link" size="sm" className="h-auto self-end text-xs" disabled={busy !== null} onClick={saveCombo}>
          {busy === 'combo' ? 'Salvando…' : 'Salvar como combo'}
        </Button>
      )}
    </Card>
  )
}

function EditEntry({ entry, onDone, onChanged }: { entry: DiaryEntry; onDone: () => void; onChanged: () => Promise<unknown> }) {
  const foods = useFoods()
  const food = entry.food_id ? foods.byId.get(entry.food_id) : undefined

  const remove = async () => {
    await api.deleteDiaryEntries([entry.id])
    await onChanged()
    onDone()
  }

  if (!food) {
    // Alimento apagado: o diário guarda só o retrato. Dá para remover, não recalcular.
    return (
      <div className="flex flex-col gap-4">
        <p className="m-0 text-[15px] font-medium">{entry.food_name}</p>
        <p className="m-0 text-sm text-muted">
          {amountLabel(entry)} · {formatInt(entry.kcal)} kcal. Este alimento foi apagado, então só dá para remover.
        </p>
        <Button variant="danger" onClick={remove}>
          Remover
        </Button>
      </div>
    )
  }

  return (
    <AmountForm
      food={food}
      initial={entry}
      submitLabel="Salvar"
      onSubmit={async (a) => {
        const m = macrosForGrams(food, a.grams)
        await api.updateDiaryEntry(entry.id, {
          ...a,
          meal_slot_id: entry.meal_slot_id,
          kcal: m.kcal,
          protein_g: m.proteinG,
          carbs_g: m.carbsG,
          fat_g: m.fatG,
        })
        await onChanged()
        onDone()
      }}
      onDelete={remove}
    />
  )
}
