import { useState, type FormEvent } from 'react'
import { IconPlus, IconTrash } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { ErrorNote, Field, Input, Select } from '@/components/ui/form'
import * as api from '@/lib/api-nutrition'
import { formatInt, formatKg, parseDecimal } from '@/lib/format'
import { macrosForGrams } from '@/lib/nutrition'
import type { Amount, Food } from '@/lib/types'
import { useInvalidatingMutation } from '../data'
import { nkeys, usePortions } from './data'

const GRAMS = '__g'

/**
 * Quantidade de um alimento: em gramas ou numa medida caseira do usuário ("1 unidade = 50 g").
 * Mostra os macros ao vivo.
 */
export function AmountForm({
  food,
  initial,
  submitLabel,
  onSubmit,
  onDelete,
}: {
  food: Food
  initial?: Amount
  submitLabel: string
  onSubmit: (amount: Amount) => Promise<void>
  onDelete?: () => Promise<void>
}) {
  const portions = (usePortions().data ?? []).filter((p) => p.food_id === food.id)
  // null = ainda não escolhido: um alimento novo abre na sua primeira medida caseira ("1 scoop"), senão em 100 g.
  const [unitChoice, setUnit] = useState<string | null>(initial ? (initial.portion_label ?? GRAMS) : null)
  const [qtyChoice, setQty] = useState<string | null>(
    initial ? formatKg(initial.portion_label ? (initial.portion_qty ?? 1) : initial.grams) : null,
  )
  const unit = unitChoice ?? portions[0]?.label ?? GRAMS
  const qty = qtyChoice ?? (unit === GRAMS ? '100' : '1')
  const [newPortion, setNewPortion] = useState<{ label: string; grams: string } | null>(null)
  const [busy, setBusy] = useState<'save' | 'delete' | null>(null)
  const [error, setError] = useState<unknown>(null)

  const portion = portions.find((p) => p.label === unit)
  // Medida que veio do registro mas foi apagada: cai para gramas.
  const effectiveUnit = unit !== GRAMS && !portion && !(initial?.portion_label === unit) ? GRAMS : unit
  const portionGrams = portion?.grams ?? (initial?.portion_label === unit && initial.portion_qty ? initial.grams / initial.portion_qty : null)

  const q = parseDecimal(qty)
  const grams = q === null ? null : effectiveUnit === GRAMS ? q : portionGrams ? q * portionGrams : null
  const valid = grams !== null && grams > 0 && grams <= 5000
  const m = valid ? macrosForGrams(food, grams) : null

  const addPortion = useInvalidatingMutation(
    (p: { label: string; grams: number }) => api.addPortion(food.id, p.label, p.grams),
    [nkeys.portions],
  )
  const removePortion = useInvalidatingMutation((id: string) => api.deletePortion(id), [nkeys.portions])

  const newGrams = newPortion ? parseDecimal(newPortion.grams) : null
  const newValid = Boolean(newPortion?.label.trim()) && newGrams !== null && newGrams > 0 && newGrams <= 5000

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!valid || grams === null || q === null) return
    setBusy('save')
    setError(null)
    try {
      await onSubmit({
        grams: Math.round(grams * 100) / 100,
        portion_label: effectiveUnit === GRAMS ? null : effectiveUnit,
        portion_qty: effectiveUnit === GRAMS ? null : q,
      })
    } catch (err) {
      setError(err)
      setBusy(null)
    }
  }

  async function remove() {
    if (!onDelete) return
    setBusy('delete')
    setError(null)
    try {
      await onDelete()
    } catch (err) {
      setError(err)
      setBusy(null)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <p className="m-0 text-[15px] font-medium">{food.name}</p>
        <p className="m-0 mt-0.5 text-xs text-muted tabular">
          Por 100 g: {formatInt(food.kcal)} kcal · P {formatKg(food.protein_g)} · C {formatKg(food.carbs_g)} · G {formatKg(food.fat_g)}
        </p>
      </div>

      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3">
        <Field label="Quantidade">
          {(p) => <Input {...p} inputMode="decimal" required value={qty} onChange={(e) => setQty(e.target.value)} data-autofocus />}
        </Field>
        <Field label="Medida">
          {(p) => (
            <Select
              {...p}
              value={effectiveUnit}
              onChange={(e) => {
                const next = e.target.value
                if (next === unit) return
                setUnit(next)
                setQty(next === GRAMS ? '100' : '1')
              }}
            >
              <option value={GRAMS}>gramas</option>
              {portions.map((p) => (
                <option key={p.id} value={p.label}>
                  {p.label} ({formatKg(p.grams)} g)
                </option>
              ))}
              {initial?.portion_label && !portions.some((p) => p.label === initial.portion_label) && (
                <option value={initial.portion_label}>{initial.portion_label}</option>
              )}
            </Select>
          )}
        </Field>
      </div>

      {newPortion ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-line-strong p-3">
          <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-3">
            <Field label="Nova medida" hint="Ex.: 1 unidade, 1 colher">
              {(p) => <Input {...p} maxLength={40} value={newPortion.label} onChange={(e) => setNewPortion({ ...newPortion, label: e.target.value })} />}
            </Field>
            <Field label="Peso (g)">
              {(p) => <Input {...p} inputMode="decimal" value={newPortion.grams} onChange={(e) => setNewPortion({ ...newPortion, grams: e.target.value })} />}
            </Field>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setNewPortion(null)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              className="flex-1"
              disabled={!newValid || addPortion.isPending}
              onClick={() =>
                addPortion.mutate(
                  { label: newPortion.label, grams: newGrams! },
                  {
                    onSuccess: (p) => {
                      setUnit(p.label)
                      setQty('1')
                      setNewPortion(null)
                    },
                  },
                )
              }
            >
              Salvar medida
            </Button>
          </div>
          <ErrorNote error={addPortion.error} />
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <Button variant="link" size="sm" className="h-auto" onClick={() => setNewPortion({ label: '', grams: '' })}>
            <IconPlus size={16} />
            Medida caseira
          </Button>
          {portion && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-muted"
              disabled={removePortion.isPending}
              onClick={() => {
                if (!window.confirm(`Apagar a medida “${portion.label}”?`)) return
                removePortion.mutate(portion.id, {
                  onSuccess: () => {
                    setUnit(GRAMS)
                    setQty(formatKg(Math.round((q ?? 1) * portion.grams)))
                  },
                })
              }}
            >
              <IconTrash size={14} />
              Apagar medida
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 rounded-2xl border border-line bg-surface-2 p-3 text-center" aria-live="polite">
        <MacroCell label="kcal" value={m ? formatInt(m.kcal) : '—'} strong />
        <MacroCell label="Prot." value={m ? `${formatKg(m.proteinG)} g` : '—'} />
        <MacroCell label="Carbo" value={m ? `${formatKg(m.carbsG)} g` : '—'} />
        <MacroCell label="Gord." value={m ? `${formatKg(m.fatG)} g` : '—'} />
      </div>
      {valid && effectiveUnit !== GRAMS && grams !== null && <p className="-mt-2 mb-0 text-center text-xs text-muted">= {formatKg(Math.round(grams * 10) / 10)} g</p>}

      <ErrorNote error={error} />
      <Button type="submit" size="lg" disabled={!valid || busy !== null}>
        {busy === 'save' ? 'Salvando…' : submitLabel}
      </Button>
      {onDelete && (
        <Button variant="danger" disabled={busy !== null} onClick={remove}>
          {busy === 'delete' ? 'Removendo…' : 'Remover'}
        </Button>
      )}
    </form>
  )
}

function MacroCell({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className={strong ? 'font-display text-lg font-semibold tabular' : 'text-sm font-semibold tabular'}>{value}</span>
      <span className="text-[11px] text-muted">{label}</span>
    </div>
  )
}
