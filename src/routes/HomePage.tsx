import { Link } from 'react-router'
import { Logo, Meander } from '@/components/brand'
import { IconWarning } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { ErrorNote } from '@/components/ui/form'
import { Card, Eyebrow, Spinner } from '@/components/ui/surface'
import { useProfile, useTrainingOverview } from '@/features/data'
import { CheckinButton } from '@/features/training/CheckinButton'
import { StagnationBadge } from '@/features/training/components'
import { daysBetween, formatWeekdayDate, relativeDays, todayISO } from '@/lib/dates'
import { formatKg, plural } from '@/lib/format'

export function HomePage() {
  const profile = useProfile()
  const { data, isPending, error, checkins } = useTrainingOverview()
  const today = todayISO()

  const greeting = profile.data?.display_name ? `Olá, ${profile.data.display_name.split(' ')[0]}` : 'Hoje'

  return (
    <div className="flex flex-col gap-4.5">
      <header className="flex items-center justify-between">
        <Logo />
        <span className="text-[13px] text-muted">{formatWeekdayDate(today)}</span>
      </header>
      <Meander />
      <h1 className="sr-only">{greeting}</h1>

      {isPending ? (
        <Spinner />
      ) : error || !data ? (
        <ErrorNote error={error ?? 'Não foi possível carregar.'} />
      ) : (
        <>
          <Card className="flex flex-col gap-3.5">
            {data.next ? (
              <>
                <div className="flex items-baseline justify-between">
                  <Eyebrow>Próximo treino</Eyebrow>
                  {data.lastCheckin && (
                    <span className="text-xs text-muted">
                      Último: {data.lastCheckin.workout?.name ?? '—'}, {relativeDays(daysBetween(data.lastCheckin.done_on, today))}
                    </span>
                  )}
                </div>
                <Link to="/treino" className="flex flex-col gap-1 text-text no-underline">
                  <h2 className="m-0 font-display text-[30px] leading-[1.1] font-semibold">{data.next.name}</h2>
                  <p className="m-0 text-[15px] text-text-2">
                    {[data.next.focus, plural(data.next.workout_exercises.length, 'exercício', 'exercícios')]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </Link>
                <div className="flex gap-2.5">
                  {data.next.workout_exercises.length > 0 ? (
                    <CheckinButton workout={data.next} className="flex-1" />
                  ) : (
                    <Button asChild className="flex-1">
                      <Link to={`/treino/fichas/${data.next.id}`} className="no-underline">
                        Adicionar exercícios
                      </Link>
                    </Button>
                  )}
                  {data.activeWorkouts.length > 1 && (
                    <Button asChild variant="outline" className="w-24">
                      <Link to="/treino" className="no-underline">
                        Trocar
                      </Link>
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <Eyebrow>Treino</Eyebrow>
                <p className="m-0 font-display text-2xl font-semibold">Monte sua primeira ficha</p>
                <p className="m-0 text-sm text-text-2">Cadastre seus treinos e as cargas atuais para acompanhar a progressão.</p>
                <Button asChild>
                  <Link to="/treino/fichas/nova" className="no-underline">
                    Criar ficha
                  </Link>
                </Button>
              </>
            )}
          </Card>

          {data.stagnant.length > 0 && (
            <Card className="flex flex-col gap-1 py-4">
              <div className="flex items-center gap-2">
                <IconWarning size={16} className="text-accent" />
                <Eyebrow>Sem evoluir</Eyebrow>
              </div>
              <ul className="m-0 list-none divide-y divide-line p-0">
                {data.stagnant.slice(0, 4).map((s) => (
                  <li key={s.exercise.id}>
                    <Link
                      to={`/treino/exercicios/${s.exercise.id}`}
                      className="flex min-h-14 items-center justify-between gap-3 text-text no-underline"
                    >
                      <span className="flex flex-col gap-0.5">
                        <span className="text-[15px] font-medium">{s.exercise.name}</span>
                        {s.current && (
                          <span className="text-[13px] text-muted tabular">
                            {formatKg(s.current.load_kg)} kg · {s.current.sets} × {s.current.reps}
                          </span>
                        )}
                      </span>
                      <StagnationBadge status={s} usesCheckins={checkins.length > 0} />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Link to="/cardio" className="no-underline">
              <Card className="flex h-full flex-col gap-2 p-4 text-text">
                <Eyebrow>Cardio</Eyebrow>
                <span className="text-sm text-muted">Meta semanal chega na fase 2.</span>
              </Card>
            </Link>
            <Link to="/alimentacao" className="no-underline">
              <Card className="flex h-full flex-col gap-2 p-4 text-text">
                <Eyebrow>Alimentação</Eyebrow>
                <span className="text-sm text-muted">Calorias e macros chegam na fase 3.</span>
              </Card>
            </Link>
          </div>
        </>
      )}

      <p className="m-0 mt-1 text-center font-display text-sm text-faint italic">Areté se constrói um treino por vez.</p>
    </div>
  )
}
