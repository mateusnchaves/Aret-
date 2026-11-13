import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { ErrorNote, Field, Input } from '@/components/ui/form'
import * as api from '@/lib/api-nutrition'
import { formatKg, parseDecimal } from '@/lib/format'
import type { Food } from '@/lib/types'
import { useInvalidatingMutation } from '../data'
import { nkeys } from './data'

/** Alimento próprio (rótulo), valores por 100 g. Cria ou edita. */
export function FoodForm({
  initialName = '',
  editing,
  onSaved,
  onDeleted,
}: {
  initialName?: string
  editing?: Food
  onSaved: (food: Food) => void
  onDeleted?: () => void
}) {
  const fmt = (v: number | null | undefined) => (v == null ? '' : formatKg(v))
  const [f, setF] = useState({
    name: editing?.name ?? initialName,
    kcal: fmt(editing?.kcal),
    protein: fmt(editing?.protein_g),
    carbs: fmt(editing?.carbs_g),
    fat: fmt(editing?.fat_g),
    fiber: fmt(editing?.fiber_g),
  })
  const set = (patch: Partial<typeof f>) => setF({ ...f, ...patch })

  const kcal = parseDecimal(f.kcal)
  const protein = f.protein.trim() ? parseDecimal(f.protein) : 0
  const carbs = f.carbs.trim() ? parseDecimal(f.carbs) : 0
  const fat = f.fat.trim() ? parseDecimal(f.fat) : 0
  const fiber = f.fiber.trim() ? parseDecimal(f.fiber) : null
  const inRange = (v: number | null, max: number) => v !== null && v >= 0 && v <= max
  const macroSum = (protein ?? 0) + (carbs ?? 0) + (fat ?? 0)
  const valid =
    f.name.trim().length > 0 &&
    inRange(kcal, 1000) &&
    inRange(protein, 100) &&
    inRange(carbs, 100) &&
    inRange(fat, 100) &&
    (fiber === null || inRange(fiber, 100)) &&
    macroSum <= 100

  const save = useInvalidatingMutation(async () => {
    const input: api.FoodInput = { name: f.name, kcal: kcal!, protein_g: protein!, carbs_g: carbs!, fat_g: fat!, fiber_g: fiber }
    if (editing) {
      await api.updateFood(editing.id, input)
      return { ...editing, ...input, name: input.name.trim() }
    }
    return api.createFood(input)
  }, [nkeys.foods])

  const remove = useInvalidatingMutation(async () => {
    await api.deleteFood(editing!.id)
    onDeleted?.()
  }, [nkeys.foods, nkeys.diets, nkeys.combos, nkeys.favorites])

  function submit(e: FormEvent) {
    e.preventDefault()
    save.mutate(undefined, { onSuccess: onSaved })
  }

  const duplicate = save.error instanceof Error && save.error.message.includes('foods_unique_name')

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Nome" error={duplicate ? 'Você já tem um alimento com esse nome.' : null}>
        {(p) => <Input {...p} required maxLength={120} value={f.name} onChange={(e) => set({ name: e.target.value })} data-autofocus />}
      </Field>
      <p className="m-0 -mb-1 text-sm font-medium text-text-2">Por 100 g (veja no rótulo)</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Calorias (kcal)">
          {(p) => <Input {...p} inputMode="decimal" required value={f.kcal} onChange={(e) => set({ kcal: e.target.value })} />}
        </Field>
        <Field label="Proteína (g)">
          {(p) => <Input {...p} inputMode="decimal" placeholder="0" value={f.protein} onChange={(e) => set({ protein: e.target.value })} />}
        </Field>
        <Field label="Carboidrato (g)">
          {(p) => <Input {...p} inputMode="decimal" placeholder="0" value={f.carbs} onChange={(e) => set({ carbs: e.target.value })} />}
        </Field>
        <Field label="Gordura (g)">
          {(p) => <Input {...p} inputMode="decimal" placeholder="0" value={f.fat} onChange={(e) => set({ fat: e.target.value })} />}
        </Field>
        <Field label="Fibra (g)" hint="Opcional">
          {(p) => <Input {...p} inputMode="decimal" value={f.fiber} onChange={(e) => set({ fiber: e.target.value })} />}
        </Field>
      </div>
      {macroSum > 100 && <p className="m-0 text-sm text-danger">Proteína + carbo + gordura passam de 100 g em 100 g.</p>}
      <ErrorNote error={duplicate ? null : (save.error ?? remove.error)} />
      <Button type="submit" size="lg" disabled={!valid || save.isPending}>
        {save.isPending ? 'Salvando…' : editing ? 'Salvar alimento' : 'Criar alimento'}
      </Button>
      {editing && (
        <Button
          variant="danger"
          disabled={remove.isPending}
          onClick={() => {
            if (window.confirm(`Apagar “${editing.name}”? Ele sai das dietas e combos; o que já está no diário continua.`)) remove.mutate()
          }}
        >
          Apagar alimento
        </Button>
      )}
    </form>
  )
}
