import { Link } from 'react-router'
import { Logo, Meander } from '@/components/brand'
import { Button } from '@/components/ui/button'
import { ErrorNote } from '@/components/ui/form'
import { Card, Eyebrow, Spinner } from '@/components/ui/surface'
import { useProfile, useTrainingOverview } from '@/features/data'
import { useDiscipline, useGlory } from '@/features/glory/data'
import { DisciplineCard } from '@/features/glory/Discipline'
import { GloryRecent } from '@/features/glory/GloryRecent'
import { MaximOfDay } from '@/features/glory/Maxim'
import { WeeklyCrownCard } from '@/features/glory/WeeklyCrown'
import { CheckinButton } from '@/features/training/CheckinButton'
import { toRoman } from '@/lib/glory'
import { daysBetween, parseISODate, relativeDays, todayISO } from '@/lib/dates'
import { plural } from '@/lib/format'

const WEEKDAYS = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO']
const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

export function HomePage() {
  const profile = useProfile()
  const { data, isPending, error, checkins } = useTrainingOverview()
  const discipline = useDiscipline()
  const glory = useGlory()
  const today = todayISO()
  const d = parseISODate(today)

  const name = profile.data?.display_name?.split(' ')[0]

  return (
    <>
      <header className="flex items-center justify-between">
        <Logo />
        <div className="text-right leading-tight" aria-label={`Hoje, ${d.getDate()}/${d.getMonth() + 1}`}>
          <div className="inscription text-[11px] tracking-[0.2em] text-muted">{WEEKDAYS[d.getDay()]}</div>
          <div className="inscription text-[13px] tracking-[0.12em] text-text-2">
            {toRoman(d.getDate())} · {MONTHS[d.getMonth()]}
          </div>
        </div>
      </header>
      <h1 className="sr-only">{name ? `Olá, ${name}` : 'Início'}</h1>

      <div className="mt-5 flex flex-col gap-4">
        {isPending ? (
          <Spinner />
        ) : error || !data ? (
          <ErrorNote error={error ?? 'Não foi possível carregar.'} />
        ) : (
          <AgonCard data={data} checkinsToday={checkins.some((c) => c.done_on === today)} />
        )}

        {discipline.data && <WeeklyCrownCard crown={discipline.data.crown} cardioUnit={discipline.data.cardioUnit} />}
        {discipline.data && <DisciplineCard streak={discipline.data.streak} target={discipline.data.target} grid={discipline.data.grid} />}
        {glory.data && <GloryRecent medals={glory.data.recent} />}

        <Meander className="mt-1" />
        <MaximOfDay />
      </div>
    </>
  )
}

function AgonCard({ data, checkinsToday }: { data: NonNullable<ReturnType<typeof useTrainingOverview>['data']>; checkinsToday: boolean }) {
  const today = todayISO()
  const next = data.next

  if (!next) {
    return (
      <Card hero className="flex flex-col gap-3 overflow-hidden">
        <Eyebrow className="text-accent-hi">Ágon de hoje</Eyebrow>
        <p className="inscription m-0 text-2xl font-bold">MONTE SUA PRIMEIRA FICHA</p>
        <p className="m-0 text-sm text-text-2">Cadastre seus treinos e as cargas atuais. A areté começa pela base.</p>
        <Button asChild>
          <Link to="/treino/fichas/nova" className="no-underline">
            Criar ficha
          </Link>
        </Button>
      </Card>
    )
  }

  const attention = next.workout_exercises.filter((we) => data.statusByExercise.get(we.exercise_id)?.stagnation?.stagnant).length

  return (
    <Card hero className="relative flex flex-col gap-3.5 overflow-hidden">
      <div aria-hidden="true" className="fluted absolute -top-2 -right-3 -bottom-2 w-28" />
      <div className="relative flex items-baseline justify-between">
        <Eyebrow className="text-accent-hi">Ágon de hoje</Eyebrow>
        {data.lastCheckin && (
          <span className="text-xs text-muted">
            último: {data.lastCheckin.workout?.name ?? '—'}, {relativeDays(daysBetween(data.lastCheckin.done_on, today))}
          </span>
        )}
      </div>
      <Link to="/treino" className="relative flex flex-col gap-1.5 text-text no-underline">
        <h2 className="inscription m-0 text-[32px] leading-none font-bold tracking-[0.06em] uppercase">{next.name}</h2>
        <p className="m-0 text-sm text-text-2">
          {[next.focus, plural(next.workout_exercises.length, 'exercício', 'exercícios')].filter(Boolean).join(' · ')}
          {attention > 0 && <span className="text-accent-hi"> · {plural(attention, 'pede atenção', 'pedem atenção')}</span>}
        </p>
      </Link>
      <div className="relative flex gap-2.5">
        {next.workout_exercises.length > 0 ? (
          <CheckinButton workout={next} className="h-[50px] flex-1 rounded-2xl" shimmer={!checkinsToday} />
        ) : (
          <Button asChild className="flex-1">
            <Link to={`/treino/fichas/${next.id}`} className="no-underline">
              Adicionar exercícios
            </Link>
          </Button>
        )}
        {data.activeWorkouts.length > 1 && (
          <Button asChild variant="outline" className="h-[50px] w-24 rounded-2xl">
            <Link to="/treino" className="no-underline">
              Trocar
            </Link>
          </Button>
        )}
      </div>
    </Card>
  )
}
