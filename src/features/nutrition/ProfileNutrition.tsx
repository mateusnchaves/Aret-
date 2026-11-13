import { useState, type FormEvent } from 'react'
import { IconArchive, IconMoveDown, IconMoveUp, IconPlus } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { ErrorNote, Field, Input } from '@/components/ui/form'
import { Card, Eyebrow } from '@/components/ui/surface'
import * as api from '@/lib/api-nutrition'
import { todayISO } from '@/lib/dates'
import { formatInt } from '@/lib/format'
import { ageOn, dailyTargets } from '@/lib/nutrition'
import type { Profile } from '@/lib/types'
import { keys, useCurrentWeight, useInvalidatingMutation, useUpdateProfile } from '../data'
import { nkeys, useMealSlots, useNutritionTargets } from './data'

const FIELDS = [
  { key: 'kcal_target', label: 'Calorias (kcal)', calc: 'kcal', max: 10000 },
  { key: 'protein_target_g', label: 'Proteína (g)', calc: 'proteinG', max: 1000 },
  { key: 'carbs_target_g', label: 'Carboidrato (g)', calc: 'carbsG', max: 2000 },
  { key: 'fat_target_g', label: 'Gordura (g)', calc: 'fatG', max: 1000 },
] as const

type TargetKey = (typeof FIELDS)[number]['key']

/** Meta diária: o cálculo aparece como sugestão; o que for preenchido vence (ex.: valores da nutricionista). */
export function TargetsCard({ profile }: { profile: Profile }) {
  const weightKg = useCurrentWeight()
  const resolved = useNutritionTargets()
  const update = useUpdateProfile()
  const [form, setForm] = useState<Record<TargetKey, string>>(() =>
    Object.fromEntries(FIELDS.map((f) => [f.key, profile[f.key] == null ? '' : String(profile[f.key])])) as Record<TargetKey, string>,
  )
  const [saved, setSaved] = useState(false)

  const calc =
    profile.sex && profile.birth_date && profile.height_cm && profile.activity_level && profile.goal && weightKg
      ? dailyTargets({
          sex: profile.sex,
          age: ageOn(profile.birth_date, todayISO()),
          heightCm: profile.height_cm,
          weightKg,
          activity: profile.activity_level,
          goal: profile.goal,
        })
      : null

  const parsed = Object.fromEntries(
    FIELDS.map((f) => {
      const v = form[f.key].trim()
      const n = Number.parseInt(v, 10)
      return [f.key, v === '' ? null : Number.isFinite(n) && n >= 0 && n <= f.max ? n : NaN]
    }),
  ) as Record<TargetKey, number | null>
  const valid = Object.values(parsed).every((v) => v === null || !Number.isNaN(v))
  const dirty = FIELDS.some((f) => parsed[f.key] !== profile[f.key])

  function submit(e: FormEvent) {
    e.preventDefault()
    update.mutate(parsed, { onSuccess: () => setSaved(true) })
  }

  return (
    <Card>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <Eyebrow>Meta diária</Eyebrow>
          {resolved && (
            <span className="text-xs text-muted">{resolved.manual ? 'com valores manuais' : 'calculada (Mifflin-St Jeor)'}</span>
          )}
        </div>
        {resolved && (
          <p className="m-0 font-display text-3xl font-semibold tabular">
            {formatInt(resolved.kcal)} <span className="font-sans text-sm font-normal text-muted">kcal</span>
            <span className="ml-2 font-sans text-sm font-normal text-text-2">
              P {resolved.proteinG} · C {resolved.carbsG} · G {resolved.fatG}
            </span>
          </p>
        )}
        <p className="m-0 text-xs text-muted">
          Deixe em branco para usar o cálculo. Se a nutricionista passou números, preencha aqui. Sem carboidrato definido, ele completa as calorias.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {FIELDS.map((f) => (
            <Field key={f.key} label={f.label} error={Number.isNaN(parsed[f.key]) ? 'Número inteiro' : null}>
              {(p) => (
                <Input
                  {...p}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={f.max}
                  placeholder={calc ? String(calc[f.calc]) : '—'}
                  value={form[f.key]}
                  onChange={(e) => {
                    setSaved(false)
                    setForm({ ...form, [f.key]: e.target.value })
                  }}
                />
              )}
            </Field>
          ))}
        </div>
        <ErrorNote error={update.error} />
        <div className="flex gap-2">
          {FIELDS.some((f) => form[f.key] !== '') && (
            <Button
              variant="outline"
              onClick={() => {
                setSaved(false)
                setForm({ kcal_target: '', protein_target_g: '', carbs_target_g: '', fat_target_g: '' })
              }}
            >
              Usar o cálculo
            </Button>
          )}
          <Button type="submit" className="flex-1" disabled={!valid || !dirty || update.isPending}>
            {update.isPending ? 'Salvando…' : saved && !dirty ? 'Salvo' : 'Salvar meta'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

/** Refeições do dia: renomear, reordenar, adicionar e arquivar. */
export function MealSlotsCard() {
  const slots = useMealSlots()
  const [newName, setNewName] = useState('')
  const [names, setNames] = useState<Record<string, string>>({})
  const invalidate = [nkeys.slots, keys.profile]
  const rename = useInvalidatingMutation((v: { id: string; name: string }) => api.updateMealSlot(v.id, { name: v.name.trim() }), invalidate)
  const archive = useInvalidatingMutation((id: string) => api.updateMealSlot(id, { archived_at: new Date().toISOString() }), invalidate)
  const reorder = useInvalidatingMutation((ids: string[]) => api.reorderMealSlots(ids), invalidate)
  const create = useInvalidatingMutation(() => api.createMealSlot(newName, (slots.data ?? []).length), invalidate)
  const list = slots.active
  const busy = rename.isPending || archive.isPending || reorder.isPending || create.isPending

  function move(i: number, delta: -1 | 1) {
    const ids = list.map((s) => s.id)
    const a = ids[i]
    const b = ids[i + delta]
    if (!a || !b) return
    ids[i] = b
    ids[i + delta] = a
    reorder.mutate(ids)
  }

  return (
    <Card className="flex flex-col gap-2">
      <Eyebrow>Refeições do dia</Eyebrow>
      <p className="m-0 text-xs text-muted">Valem para o diário e para as dietas. Arquivar não apaga o histórico.</p>
      <ErrorNote error={rename.error ?? archive.error ?? reorder.error ?? create.error} />
      <ul className="m-0 list-none divide-y divide-line p-0">
        {list.map((s, i) => {
          const value = names[s.id] ?? s.name
          const changed = value.trim() !== s.name && value.trim().length > 0
          return (
            <li key={s.id} className="flex min-h-13 items-center gap-1">
              <Input
                aria-label={`Nome da refeição ${i + 1}`}
                maxLength={40}
                value={value}
                onChange={(e) => setNames({ ...names, [s.id]: e.target.value })}
                onBlur={() => {
                  if (changed) rename.mutate({ id: s.id, name: value })
                }}
                className="h-10 border-transparent bg-transparent px-1 focus:border-accent"
              />
              <Button variant="ghost" size="icon" aria-label={`Subir ${s.name}`} disabled={busy || i === 0} onClick={() => move(i, -1)}>
                <IconMoveUp size={18} />
              </Button>
              <Button variant="ghost" size="icon" aria-label={`Descer ${s.name}`} disabled={busy || i === list.length - 1} onClick={() => move(i, 1)}>
                <IconMoveDown size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Arquivar ${s.name}`}
                disabled={busy}
                onClick={() => {
                  if (window.confirm(`Arquivar “${s.name}”? Ela sai do diário e das dietas, mas o histórico continua.`)) archive.mutate(s.id)
                }}
              >
                <IconArchive size={16} />
              </Button>
            </li>
          )
        })}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          create.mutate(undefined, { onSuccess: () => setNewName('') })
        }}
        className="flex gap-2"
      >
        <Input aria-label="Nova refeição" placeholder="Nova refeição (ex.: Pré-treino)" maxLength={40} value={newName} onChange={(e) => setNewName(e.target.value)} />
        <Button type="submit" variant="outline" disabled={!newName.trim() || busy}>
          <IconPlus size={18} />
          Adicionar
        </Button>
      </form>
    </Card>
  )
}
