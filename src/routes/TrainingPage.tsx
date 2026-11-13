import { useState } from 'react'
import { Link } from 'react-router'
import { IconArchive, IconPencil, IconPlus } from '@/components/icons'
import { Laurel } from '@/components/brand'
import { PageTitle } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { ErrorNote } from '@/components/ui/form'
import { Card, EmptyState, Spinner } from '@/components/ui/surface'
import { useTrainingOverview, type TrainingOverview } from '@/features/data'
import { ExerciseRow } from '@/features/training/components'
import { CheckinButton } from '@/features/training/CheckinButton'
import type { Workout } from '@/lib/types'

export function TrainingPage() {
  const { data, isPending, error, checkins } = useTrainingOverview()
  const [showArchived, setShowArchived] = useState(false)

  if (isPending) return <Spinner />
  if (error || !data) return <ErrorNote error={error ?? 'Não foi possível carregar.'} />

  const usesCheckins = checkins.length > 0

  return (
    <>
      <PageTitle
        aside={
          <div className="flex gap-2">
            <Button asChild size="icon" variant="outline" className="border-bronze-line text-bronze">
              <Link to="/treino/panteao" aria-label="Panteão: seus recordes" className="no-underline">
                <Laurel size={20} />
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/treino/fichas/nova" className="no-underline">
                <IconPlus size={18} />
                Nova ficha
              </Link>
            </Button>
          </div>
        }
      >
        Treino
      </PageTitle>

      {data.activeWorkouts.length === 0 ? (
        <EmptyState
          title="Nenhuma ficha ainda"
          action={
            <Button asChild>
              <Link to="/treino/fichas/nova" className="no-underline">
                Criar a primeira ficha
              </Link>
            </Button>
          }
        >
          Crie suas fichas (Treino A, B, C…) e adicione os exercícios de cada uma.
          <br />
          Areté se constrói um treino por vez.
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-4">
          {data.activeWorkouts.map((w) => (
            <WorkoutCard key={w.id} workout={w} data={data} usesCheckins={usesCheckins} isNext={data.next?.id === w.id} />
          ))}
        </div>
      )}

      {data.archivedWorkouts.length > 0 && (
        <section className="mt-8">
          <Button variant="ghost" size="sm" onClick={() => setShowArchived(!showArchived)} aria-expanded={showArchived}>
            <IconArchive size={18} />
            {showArchived ? 'Ocultar arquivadas' : `Fichas arquivadas (${data.archivedWorkouts.length})`}
          </Button>
          {showArchived && (
            <ul className="mt-2 m-0 flex list-none flex-col gap-2 p-0">
              {data.archivedWorkouts.map((w) => (
                <li key={w.id}>
                  <Link
                    to={`/treino/fichas/${w.id}`}
                    className="flex min-h-12 items-center justify-between rounded-[14px] border border-line px-4 text-text-2 no-underline hover:bg-surface"
                  >
                    <span>{w.name}</span>
                    <span className="text-xs text-muted">{w.workout_exercises.length} exercícios</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  )
}

function WorkoutCard({
  workout,
  data,
  usesCheckins,
  isNext,
}: {
  workout: Workout
  data: TrainingOverview
  usesCheckins: boolean
  isNext: boolean
}) {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="m-0 font-display text-2xl font-semibold">{workout.name}</h2>
            {isNext && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent-hi">Próximo</span>}
          </div>
          {workout.focus && <p className="m-0 mt-0.5 text-sm text-text-2">{workout.focus}</p>}
        </div>
        <Link
          to={`/treino/fichas/${workout.id}`}
          aria-label={`Editar ${workout.name}`}
          className="-mt-1 -mr-2 flex size-11 items-center justify-center rounded-xl text-muted hover:bg-surface-2 hover:text-text"
        >
          <IconPencil size={18} />
        </Link>
      </div>

      {workout.workout_exercises.length === 0 ? (
        <p className="m-0 py-2 text-sm text-muted">
          Sem exercícios.{' '}
          <Link to={`/treino/fichas/${workout.id}`} className="font-semibold">
            Adicionar
          </Link>
        </p>
      ) : (
        <ul className="m-0 list-none divide-y divide-line p-0">
          {workout.workout_exercises.map((we) => {
            const status = data.statusByExercise.get(we.exercise_id)
            return status ? (
              <li key={we.id}>
                <ExerciseRow status={status} usesCheckins={usesCheckins} />
              </li>
            ) : null
          })}
        </ul>
      )}

      {workout.workout_exercises.length > 0 && (
        <CheckinButton workout={workout} variant={isNext ? 'primary' : 'outline'} className="mt-1 w-full" />
      )}
    </Card>
  )
}
