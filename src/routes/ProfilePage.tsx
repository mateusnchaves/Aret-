import { useState, type FormEvent } from 'react'
import { PageTitle } from '@/components/layout'
import { IconTrash } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { ErrorNote, Field, Input, Select } from '@/components/ui/form'
import { Card, Eyebrow, Spinner } from '@/components/ui/surface'
import { useAuth, useUserId } from '@/features/auth/context'
import { keys, useInvalidatingMutation, useProfile, useUpdateProfile, useWeights } from '@/features/data'
import { MealSlotsCard, TargetsCard } from '@/features/nutrition/ProfileNutrition'
import * as api from '@/lib/api'
import { formatShortDate, todayISO } from '@/lib/dates'
import { formatKg, parseDecimal } from '@/lib/format'
import { ACTIVITY_LABELS, GOAL_LABELS, type ActivityLevel, type Goal } from '@/lib/nutrition'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/types'

export function ProfilePage() {
  const profile = useProfile()
  const weights = useWeights()

  if (profile.isPending || weights.isPending) return <Spinner />
  if (profile.error || weights.error) return <ErrorNote error={profile.error ?? weights.error} />

  return (
    <>
      <PageTitle>Perfil</PageTitle>
      <div className="flex flex-col gap-4">
        <TargetsCard key={`t-${profile.data.id}`} profile={profile.data} />
        <WeightCard />
        <ProfileForm key={profile.data.id} profile={profile.data} />
        <MealSlotsCard />
        <AccountCard />
      </div>
    </>
  )
}

function WeightCard() {
  const weights = useWeights()
  const [value, setValue] = useState('')
  const kg = parseDecimal(value)
  const save = useInvalidatingMutation(() => api.saveWeight(kg!), [keys.weights])
  const remove = useInvalidatingMutation((id: string) => api.deleteWeight(id), [keys.weights])
  const list = weights.data ?? []

  function submit(e: FormEvent) {
    e.preventDefault()
    save.mutate(undefined, { onSuccess: () => setValue('') })
  }

  return (
    <Card className="flex flex-col gap-3">
      <Eyebrow>Peso</Eyebrow>
      {list[0] && (
        <p className="m-0 font-display text-3xl font-semibold tabular">
          {formatKg(list[0].weight_kg)} <span className="font-sans text-sm font-normal text-muted">kg · {formatShortDate(list[0].measured_on)}</span>
        </p>
      )}
      <form onSubmit={submit} className="flex gap-2">
        <Input
          aria-label="Peso de hoje em kg"
          inputMode="decimal"
          placeholder="Peso de hoje (kg)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button type="submit" disabled={kg === null || kg < 20 || kg > 400 || save.isPending}>
          Salvar
        </Button>
      </form>
      <ErrorNote error={save.error ?? remove.error} />
      {list.length > 1 && (
        <ul className="m-0 list-none divide-y divide-line p-0">
          {list.slice(0, 6).map((w) => (
            <li key={w.id} className="flex min-h-11 items-center justify-between text-sm">
              <span className="text-muted">{formatShortDate(w.measured_on)}</span>
              <span className="flex items-center gap-1">
                <span className="tabular">{formatKg(w.weight_kg)} kg</span>
                <Button variant="ghost" size="icon" aria-label={`Apagar peso de ${formatShortDate(w.measured_on)}`} onClick={() => remove.mutate(w.id)}>
                  <IconTrash size={16} />
                </Button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function ProfileForm({ profile }: { profile: Profile }) {
  const update = useUpdateProfile()
  const [form, setForm] = useState({
    display_name: profile.display_name ?? '',
    birth_date: profile.birth_date ?? '',
    height_cm: profile.height_cm ? formatKg(profile.height_cm) : '',
    activity_level: profile.activity_level ?? 'moderate',
    goal: profile.goal ?? 'maintain',
    stagnation_threshold: String(profile.stagnation_threshold),
    cardio_goal_unit: profile.cardio_goal_unit,
    cardio_goal_value: String(profile.cardio_goal_value),
  })
  const [saved, setSaved] = useState(false)
  const set = (patch: Partial<typeof form>) => {
    setSaved(false)
    setForm({ ...form, ...patch })
  }

  const height = parseDecimal(form.height_cm)
  const threshold = Number.parseInt(form.stagnation_threshold, 10)
  const cardioGoal = Number.parseInt(form.cardio_goal_value, 10)
  const valid =
    height !== null &&
    height >= 80 &&
    height <= 260 &&
    threshold >= 1 &&
    threshold <= 50 &&
    cardioGoal >= 1 &&
    cardioGoal <= 20000 &&
    Boolean(form.birth_date)

  function submit(e: FormEvent) {
    e.preventDefault()
    update.mutate(
      {
        display_name: form.display_name.trim() || null,
        birth_date: form.birth_date,
        height_cm: height,
        activity_level: form.activity_level as ActivityLevel,
        goal: form.goal as Goal,
        stagnation_threshold: threshold,
        cardio_goal_unit: form.cardio_goal_unit,
        cardio_goal_value: cardioGoal,
      },
      { onSuccess: () => setSaved(true) },
    )
  }

  return (
    <Card>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Eyebrow>Seus dados</Eyebrow>
        <Field label="Nome">
          {(p) => <Input {...p} value={form.display_name} onChange={(e) => set({ display_name: e.target.value })} />}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nascimento">
            {(p) => <Input {...p} type="date" max={todayISO()} value={form.birth_date} onChange={(e) => set({ birth_date: e.target.value })} />}
          </Field>
          <Field label="Altura (cm)">
            {(p) => <Input {...p} inputMode="decimal" value={form.height_cm} onChange={(e) => set({ height_cm: e.target.value })} />}
          </Field>
        </div>
        <Field label="Nível de atividade">
          {(p) => (
            <Select {...p} value={form.activity_level} onChange={(e) => set({ activity_level: e.target.value as ActivityLevel })}>
              {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((a) => (
                <option key={a} value={a}>
                  {ACTIVITY_LABELS[a].label} — {ACTIVITY_LABELS[a].hint}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Objetivo">
          {(p) => (
            <Select {...p} value={form.goal} onChange={(e) => set({ goal: e.target.value as Goal })}>
              {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => (
                <option key={g} value={g}>
                  {GOAL_LABELS[g].label} — {GOAL_LABELS[g].hint}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Alerta de estagnação" hint="Quantos treinos sem evoluir até o exercício ser destacado.">
          {(p) => (
            <Input
              {...p}
              type="number"
              inputMode="numeric"
              min={1}
              max={50}
              value={form.stagnation_threshold}
              onChange={(e) => set({ stagnation_threshold: e.target.value })}
            />
          )}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Meta semanal de cardio">
            {(p) => (
              <Input
                {...p}
                type="number"
                inputMode="numeric"
                min={1}
                value={form.cardio_goal_value}
                onChange={(e) => set({ cardio_goal_value: e.target.value })}
              />
            )}
          </Field>
          <Field label="Unidade">
            {(p) => (
              <Select
                {...p}
                value={form.cardio_goal_unit}
                onChange={(e) => {
                  const unit = e.target.value as 'minutes' | 'kcal'
                  // Trocar de unidade sugere um valor de partida coerente.
                  set({ cardio_goal_unit: unit, cardio_goal_value: unit === 'minutes' ? '150' : '2000' })
                }}
              >
                <option value="minutes">minutos</option>
                <option value="kcal">kcal</option>
              </Select>
            )}
          </Field>
        </div>
        <ErrorNote error={update.error} />
        <Button type="submit" disabled={!valid || update.isPending}>
          {update.isPending ? 'Salvando…' : saved ? 'Salvo' : 'Salvar'}
        </Button>
      </form>
    </Card>
  )
}

function AccountCard() {
  const userId = useUserId()
  const { session } = useAuth()
  const [busy, setBusy] = useState<'export' | 'delete' | null>(null)
  const [error, setError] = useState<unknown>(null)

  async function exportData() {
    setBusy('export')
    setError(null)
    try {
      const data = await api.exportMyData(userId)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `arete-dados-${todayISO()}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e)
    } finally {
      setBusy(null)
    }
  }

  async function deleteAccount() {
    const typed = window.prompt('Isso apaga sua conta e TODOS os seus dados, sem volta. Digite EXCLUIR para confirmar.')
    if (typed?.trim().toUpperCase() !== 'EXCLUIR') return
    setBusy('delete')
    setError(null)
    try {
      await api.deleteMyAccount()
    } catch (e) {
      setError(e)
      setBusy(null)
    }
  }

  return (
    <Card className="flex flex-col gap-3">
      <Eyebrow>Conta</Eyebrow>
      <p className="m-0 truncate text-sm text-text-2">{session?.user.email}</p>
      <ErrorNote error={error} />
      <Button variant="outline" onClick={() => supabase.auth.signOut()}>
        Sair
      </Button>
      <Button variant="outline" disabled={busy !== null} onClick={exportData}>
        {busy === 'export' ? 'Gerando…' : 'Exportar meus dados (JSON)'}
      </Button>
      <Button variant="danger" disabled={busy !== null} onClick={deleteAccount}>
        {busy === 'delete' ? 'Excluindo…' : 'Excluir minha conta'}
      </Button>
    </Card>
  )
}
