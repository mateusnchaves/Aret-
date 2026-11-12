import { useState } from 'react'
import { useParams } from 'react-router'
import { PersonalRecordBadge } from '@/components/brand'
import { IconPencil, IconPlus } from '@/components/icons'
import { SubHeader } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { ErrorNote } from '@/components/ui/form'
import { Card, EmptyState, Eyebrow, Spinner } from '@/components/ui/surface'
import { useTrainingOverview } from '@/features/data'
import { StagnationBadge } from '@/features/training/components'
import { stalenessText } from '@/features/training/staleness'
import { LoadChart } from '@/features/training/LoadChart'
import { LoadSheet } from '@/features/training/LoadSheet'
import { formatShortDate } from '@/lib/dates'
import { formatKg } from '@/lib/format'
import { totalGain } from '@/lib/training'
import { MUSCLE_GROUPS, type LoadEntry } from '@/lib/types'

export function ExercisePage() {
  const { id = '' } = useParams()
  const { data, isPending, error, checkins } = useTrainingOverview()
  const [sheet, setSheet] = useState<{ editing?: LoadEntry } | null>(null)

  if (isPending) return <Spinner />
  if (error || !data) return <ErrorNote error={error ?? 'Não foi possível carregar.'} />

  const exercise = data.exercisesById.get(id)
  if (!exercise) return <EmptyState title="Exercício não encontrado" />

  const status = data.statusByExercise.get(id)
  const entries = status?.entries ?? []
  const current = status?.current
  const usesCheckins = checkins.length > 0
  const gain = totalGain(entries)
  const workoutNames = data.workouts.filter((w) => status?.workoutIds.has(w.id)).map((w) => w.name)

  return (
    <>
      <SubHeader back="/treino" context={[MUSCLE_GROUPS[exercise.muscle_group], ...workoutNames].join(' · ')} />

      <h1 className="m-0 font-display text-[28px] leading-tight font-semibold">{exercise.name}</h1>

      {current && status ? (
        <>
          <div className="mt-1.5 flex items-baseline gap-3">
            <span className="font-display text-[64px] leading-none font-semibold tracking-tight tabular">
              {formatKg(current.load_kg)}
              <span className="text-[26px] font-normal text-text-2"> kg</span>
            </span>
            <span className="text-[17px] font-medium text-text-2 tabular">
              {current.sets} × {current.reps}
            </span>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
            <span className="text-sm text-text-2">{stalenessText(status, usesCheckins)}</span>
            <StagnationBadge status={status} usesCheckins={usesCheckins} />
            {status.personalRecord && <PersonalRecordBadge />}
          </div>

          <Card className="mt-5 px-2.5 pt-3.5 pb-2.5">
            <div className="flex items-baseline justify-between px-2 pb-1.5">
              <Eyebrow>Carga ao longo do tempo</Eyebrow>
              {gain !== 0 && (
                <span className={`text-xs font-semibold ${gain > 0 ? 'text-accent-hi' : 'text-muted'}`}>
                  {gain > 0 ? '+' : '−'}
                  {formatKg(Math.abs(gain))} kg
                </span>
              )}
            </div>
            {entries.length > 1 ? (
              <LoadChart entries={entries} />
            ) : (
              <p className="m-0 px-2 py-8 text-center text-sm text-muted">O gráfico aparece a partir da segunda mudança de carga.</p>
            )}
          </Card>

          <section className="mt-5">
            <h2 className="eyebrow m-0 mb-1">Histórico</h2>
            <ul className="m-0 list-none divide-y divide-line p-0">
              {entries.map((e) => (
                <li key={e.id} className="flex min-h-12 items-center gap-2">
                  <span className="w-20 text-sm text-muted">{formatShortDate(e.recorded_on)}</span>
                  <span className="flex-1 font-display text-[17px] font-semibold tabular">{formatKg(e.load_kg)} kg</span>
                  <span className="text-sm text-text-2 tabular">
                    {e.sets} × {e.reps}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Corrigir registro de ${formatShortDate(e.recorded_on)}`}
                    onClick={() => setSheet({ editing: e })}
                  >
                    <IconPencil size={16} />
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <EmptyState title="Sem carga registrada">Defina a carga e o esquema de séries que você faz hoje.</EmptyState>
      )}

      <div className="h-16" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-10 mx-auto max-w-md px-5">
        <Button size="lg" className="w-full shadow-[0_8px_24px_rgba(0,0,0,0.45)]" onClick={() => setSheet({})}>
          <IconPlus size={18} />
          {current ? 'Registrar nova carga' : 'Definir carga inicial'}
        </Button>
      </div>

      <LoadSheet
        open={sheet !== null}
        onClose={() => setSheet(null)}
        exerciseId={exercise.id}
        current={current}
        editing={sheet?.editing}
      />
    </>
  )
}
