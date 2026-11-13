import { useState } from 'react'
import { useParams } from 'react-router'
import { CountUp, Medal, Wreath } from '@/components/brand'
import { IconPencil, IconPlus } from '@/components/icons'
import { FloatingAction, SubHeader } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { ErrorNote } from '@/components/ui/form'
import { Card, EmptyState, Eyebrow, Spinner } from '@/components/ui/surface'
import { useTrainingOverview } from '@/features/data'
import { PrCelebration, type PrInfo } from '@/features/glory/PrCelebration'
import { ExerciseSheet } from '@/features/training/ExerciseSheet'
import { LoadChart } from '@/features/training/LoadChart'
import { LoadSheet } from '@/features/training/LoadSheet'
import { cn } from '@/lib/cn'
import { formatShortDate } from '@/lib/dates'
import { formatKg, plural } from '@/lib/format'
import { prEvents, toRoman } from '@/lib/glory'
import { totalGain } from '@/lib/training'
import { MUSCLE_GROUPS, type LoadEntry } from '@/lib/types'

export function ExercisePage() {
  const { id = '' } = useParams()
  const { data, isPending, error, checkins } = useTrainingOverview()
  const [sheet, setSheet] = useState<{ editing?: LoadEntry } | null>(null)
  const [editingExercise, setEditingExercise] = useState(false)
  const [celebration, setCelebration] = useState<PrInfo | null>(null)

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
  const prIds = new Set(prEvents(entries).map((p) => p.entry.id))
  const stag = status?.stagnation

  return (
    <>
      <SubHeader
        back="/treino"
        context={[MUSCLE_GROUPS[exercise.muscle_group], ...workoutNames].join(' · ')}
        actions={
          exercise.user_id && (
            <Button variant="ghost" size="icon" aria-label="Editar exercício" onClick={() => setEditingExercise(true)}>
              <IconPencil size={18} />
            </Button>
          )
        }
      />

      {current && status ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              <h1 className="inscription m-0 text-[22px] leading-tight font-bold tracking-[0.06em] uppercase">{exercise.name}</h1>
              <span className="font-display text-[64px] leading-none font-semibold tracking-tight tabular">
                <CountUp value={current.load_kg} format={(n) => formatKg(Math.round(n * 2) / 2)} />
                <span className="text-[24px] font-normal text-text-2"> kg</span>
              </span>
              <span className="text-base font-medium text-text-2 tabular">
                {current.sets} × {current.reps}
              </span>
            </div>
            {status.personalRecord && (
              <div className="relative shrink-0" style={{ width: 108, height: 108 }} role="img" aria-label={`Recorde pessoal, marco ${toRoman(entries.length)}`}>
                <Wreath size={108} color="var(--color-bronze)" leaves={7} />
                <div className="absolute inset-0 flex animate-[laurel-in_480ms_ease-out_both] items-center justify-center">
                  <Medal size={64}>
                    <span className="inscription text-[9px] font-bold tracking-[0.08em]">RECORDE</span>
                    <span className="inscription text-lg leading-none font-bold">{toRoman(entries.length)}</span>
                  </Medal>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat label="ganho total" value={`${gain > 0 ? '+' : gain < 0 ? '−' : ''}${formatKg(Math.abs(gain))} kg`} tone={gain > 0 ? 'laurel' : undefined} />
            <Stat label="nesta carga" value={stag ? plural(stag.days, 'dia', 'dias') : '—'} />
            <Stat
              label={usesCheckins ? 'treinos' : 'semanas'}
              value={stag ? (usesCheckins ? String(stag.sessions) : String(Math.floor(stag.days / 7))) : '—'}
              tone={stag?.stagnant ? 'accent' : undefined}
              hint={stag?.stagnant ? 'pede atenção' : undefined}
            />
          </div>

          <Card className="mt-4 px-2.5 pt-3.5 pb-2">
            <Eyebrow className="px-2">Ascensão</Eyebrow>
            {entries.length > 1 ? (
              <LoadChart entries={entries} />
            ) : (
              <p className="m-0 px-2 py-8 text-center text-sm text-muted">A ascensão aparece a partir do segundo marco.</p>
            )}
          </Card>

          <section className="mt-5">
            <h2 className="eyebrow m-0 mb-1">Marcos</h2>
            <ol className="m-0 list-none p-0">
              {entries.map((e, i) => {
                const mark = entries.length - i
                return (
                  <li key={e.id} className="border-b border-line">
                    <button
                      type="button"
                      onClick={() => setSheet({ editing: e })}
                      aria-label={`Marco ${toRoman(mark)}: ${formatKg(e.load_kg)} kg, ${e.sets} × ${e.reps}, ${formatShortDate(e.recorded_on)}. Corrigir.`}
                      className="flex min-h-12 w-full cursor-pointer items-center gap-3 border-0 bg-transparent px-0 text-left text-text"
                    >
                      <span className={cn('inscription w-9 text-[15px] font-bold', prIds.has(e.id) ? 'text-bronze' : mark === 1 ? 'text-text-2' : 'text-laurel')}>
                        {toRoman(mark)}
                      </span>
                      <span className="flex-1 font-display text-[17px] font-semibold tabular">
                        {formatKg(e.load_kg)} kg{' '}
                        <span className="font-sans text-[13px] font-normal text-text-2">
                          {e.sets} × {e.reps}
                        </span>
                      </span>
                      <span className="text-[13px] text-muted">{formatShortDate(e.recorded_on)}</span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </section>
        </>
      ) : (
        <>
          <h1 className="inscription m-0 mb-4 text-[22px] font-bold tracking-[0.06em] uppercase">{exercise.name}</h1>
          <EmptyState title="Toda coluna começa pela base">Defina a carga e o esquema de séries que você faz hoje.</EmptyState>
        </>
      )}

      <FloatingAction>
        <Button size="lg" className="w-full" onClick={() => setSheet({})}>
          <IconPlus size={18} />
          {current ? 'Novo marco' : 'Primeiro marco'}
        </Button>
      </FloatingAction>

      <LoadSheet
        open={sheet !== null}
        onClose={() => setSheet(null)}
        exerciseId={exercise.id}
        current={current}
        editing={sheet?.editing}
        entries={entries}
        onRecord={(r) => setCelebration({ exerciseName: exercise.name, ...r })}
      />

      {exercise.user_id && (
        <ExerciseSheet open={editingExercise} onClose={() => setEditingExercise(false)} exercise={exercise} entryCount={entries.length} />
      )}

      <PrCelebration info={celebration} onClose={() => setCelebration(null)} />
    </>
  )
}

function Stat({ label, value, tone, hint }: { label: string; value: string; tone?: 'laurel' | 'accent'; hint?: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-2xl border border-line bg-surface px-3 py-2.5">
      <span className="text-[11px] text-muted">{label}</span>
      <span className={cn('font-display text-lg font-semibold tabular', tone === 'laurel' && 'text-laurel', tone === 'accent' && 'text-accent-hi')}>{value}</span>
      {hint && <span className="text-[10px] font-semibold text-accent-hi">{hint}</span>}
    </div>
  )
}
