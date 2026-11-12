import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { Logo } from '@/components/brand'
import { Button } from '@/components/ui/button'
import { ErrorNote, Field, Input, Segmented } from '@/components/ui/form'
import { Card, Eyebrow, Spinner } from '@/components/ui/surface'
import { useUserId } from '@/features/auth/context'
import { keys, useProfile } from '@/features/data'
import * as api from '@/lib/api'
import { nowTimestamp, todayISO } from '@/lib/dates'
import { formatInt, parseDecimal } from '@/lib/format'
import {
  ACTIVITY_LABELS,
  ageOn,
  dailyTargets,
  GOAL_LABELS,
  type ActivityLevel,
  type Goal,
  type Sex,
} from '@/lib/nutrition'
import { useQueryClient } from '@tanstack/react-query'

const STEPS = ['Você', 'Corpo', 'Rotina', 'Objetivo'] as const

interface Draft {
  name: string
  sex: Sex | null
  birthDate: string
  height: string
  weight: string
  activity: ActivityLevel | null
  goal: Goal | null
}

export function OnboardingPage() {
  const profile = useProfile()
  const userId = useUserId()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<unknown>(null)

  if (profile.isPending) return <Spinner />
  if (profile.data?.onboarded_at) return <Navigate to="/" replace />

  const d: Draft = draft ?? {
    name: profile.data?.display_name ?? '',
    sex: null,
    birthDate: '',
    height: '',
    weight: '',
    activity: null,
    goal: null,
  }
  const set = (patch: Partial<Draft>) => setDraft({ ...d, ...patch })

  const today = todayISO()
  const heightCm = parseDecimal(d.height)
  const weightKg = parseDecimal(d.weight)
  const age = d.birthDate ? ageOn(d.birthDate, today) : null

  const errors = {
    birthDate: age !== null && (age < 13 || age > 100) ? 'Informe uma data de nascimento válida.' : null,
    height: d.height && (heightCm === null || heightCm < 80 || heightCm > 260) ? 'Altura em cm, entre 80 e 260.' : null,
    weight: d.weight && (weightKg === null || weightKg < 20 || weightKg > 400) ? 'Peso em kg, entre 20 e 400.' : null,
  }

  const valid = [
    Boolean(d.sex && d.birthDate && !errors.birthDate),
    Boolean(heightCm && weightKg && !errors.height && !errors.weight),
    Boolean(d.activity),
    Boolean(d.goal),
  ]

  const targets =
    d.sex && age !== null && heightCm && weightKg && d.activity && d.goal
      ? dailyTargets({ sex: d.sex, age, heightCm, weightKg, activity: d.activity, goal: d.goal })
      : null

  async function finish() {
    if (!weightKg || !heightCm) return
    setSaving(true)
    setError(null)
    try {
      await api.saveWeight(weightKg, today)
      await api.updateProfile(userId, {
        display_name: d.name.trim() || null,
        sex: d.sex,
        birth_date: d.birthDate,
        height_cm: heightCm,
        activity_level: d.activity,
        goal: d.goal,
        onboarded_at: nowTimestamp(),
      })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: keys.profile }),
        queryClient.invalidateQueries({ queryKey: keys.weights }),
      ])
      navigate('/', { replace: true })
    } catch (e) {
      setError(e)
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-5 pt-12 pb-10">
      <Logo />

      <ol className="m-0 grid list-none grid-cols-4 gap-2 p-0" aria-label="Etapas">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-col gap-1.5" aria-current={i === step ? 'step' : undefined}>
            <span className={`h-1 rounded-full ${i <= step ? 'bg-accent' : 'bg-line'}`} />
            <span className={`text-xs ${i === step ? 'font-semibold text-text' : 'text-muted'}`}>{label}</span>
          </li>
        ))}
      </ol>

      <div className="flex flex-1 flex-col gap-5">
        {step === 0 && (
          <>
            <StepTitle title="Primeiro, sobre você" text="Usamos estes dados para calcular suas metas. Dá para mudar tudo depois no Perfil." />
            <Field label="Como quer ser chamado?" hint="Opcional">
              {(p) => <Input {...p} autoComplete="given-name" value={d.name} onChange={(e) => set({ name: e.target.value })} />}
            </Field>
            <Segmented
              name="sex"
              legend="Sexo biológico (para a fórmula de gasto calórico)"
              value={d.sex}
              onChange={(sex) => set({ sex })}
              options={[
                { value: 'male', label: 'Masculino' },
                { value: 'female', label: 'Feminino' },
              ]}
            />
            <Field label="Data de nascimento" error={errors.birthDate}>
              {(p) => (
                <Input {...p} type="date" max={today} value={d.birthDate} onChange={(e) => set({ birthDate: e.target.value })} />
              )}
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <StepTitle title="Seu corpo hoje" text="O peso vira o primeiro ponto do seu histórico." />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Altura (cm)" error={errors.height}>
                {(p) => (
                  <Input {...p} inputMode="decimal" placeholder="178" value={d.height} onChange={(e) => set({ height: e.target.value })} />
                )}
              </Field>
              <Field label="Peso (kg)" error={errors.weight}>
                {(p) => (
                  <Input {...p} inputMode="decimal" placeholder="80,5" value={d.weight} onChange={(e) => set({ weight: e.target.value })} />
                )}
              </Field>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <StepTitle title="Sua rotina" text="O nível de atividade já inclui o seu treino." />
            <Segmented
              name="activity"
              legend="Nível de atividade"
              columns={1}
              value={d.activity}
              onChange={(activity) => set({ activity })}
              options={(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((value) => ({ value, ...ACTIVITY_LABELS[value] }))}
            />
          </>
        )}

        {step === 3 && (
          <>
            <StepTitle title="Seu objetivo" text="Define a meta de calorias da fase de alimentação." />
            <Segmented
              name="goal"
              legend="Objetivo"
              columns={1}
              value={d.goal}
              onChange={(goal) => set({ goal })}
              options={(Object.keys(GOAL_LABELS) as Goal[]).map((value) => ({ value, ...GOAL_LABELS[value] }))}
            />
            {targets && (
              <Card className="flex flex-col gap-3">
                <Eyebrow>Sua meta diária</Eyebrow>
                <p className="m-0 font-display text-4xl font-semibold tabular">
                  {formatInt(targets.kcal)} <span className="font-sans text-base font-normal text-muted">kcal</span>
                </p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <Macro label="Proteína" grams={targets.proteinG} color="bg-protein" />
                  <Macro label="Carbo" grams={targets.carbsG} color="bg-carb" />
                  <Macro label="Gordura" grams={targets.fatG} color="bg-fat" />
                </div>
                <p className="m-0 text-xs text-muted">
                  Basal {formatInt(targets.bmr)} kcal · gasto diário {formatInt(targets.tdee)} kcal (Mifflin-St Jeor).
                </p>
              </Card>
            )}
            <ErrorNote error={error} />
          </>
        )}
      </div>

      <div className="flex gap-3">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(step - 1)} disabled={saving}>
            Voltar
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button className="flex-1" disabled={!valid[step]} onClick={() => setStep(step + 1)}>
            Continuar
          </Button>
        ) : (
          <Button className="flex-1" disabled={!valid.every(Boolean) || saving} onClick={finish}>
            {saving ? 'Salvando…' : 'Começar'}
          </Button>
        )}
      </div>
    </main>
  )
}

function StepTitle({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h1 className="m-0 font-display text-[30px] leading-tight font-semibold">{title}</h1>
      <p className="mt-2 mb-0 text-[15px] text-text-2">{text}</p>
    </div>
  )
}

function Macro({ label, grams, color }: { label: string; grams: number; color: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-muted">
        <span className={`size-2 rounded-full ${color}`} aria-hidden="true" />
        {label}
      </span>
      <span className="font-display text-lg font-semibold tabular">{grams} g</span>
    </div>
  )
}
