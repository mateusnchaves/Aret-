import { useState } from 'react'
import { Laurel, Ring } from '@/components/brand'
import { IconChevronRight, IconPlus } from '@/components/icons'
import { PageTitle } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { ErrorNote } from '@/components/ui/form'
import { Card, EmptyState, Eyebrow, Spinner } from '@/components/ui/surface'
import { CardioSheet } from '@/features/cardio/CardioSheet'
import { useCardioWeek } from '@/features/cardio/useCardioWeek'
import { addDays, CARDIO_KINDS, formatDuration, INTENSITIES, type DayTotal } from '@/lib/cardio'
import { cn } from '@/lib/cn'
import { formatShortDate, parseISODate } from '@/lib/dates'
import { formatInt, formatKg } from '@/lib/format'
import type { CardioSession } from '@/lib/types'

type View = 'today' | 'week'
const DAY_LETTERS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']

export function CardioPage() {
  const { data, sessions, isPending, error } = useCardioWeek()
  const [view, setView] = useState<View>('today')
  const [sheet, setSheet] = useState<{ editing?: CardioSession } | null>(null)

  if (isPending) return <Spinner />
  if (error || !data) return <ErrorNote error={error ?? 'Não foi possível carregar.'} />

  const { summary, today, unit } = data
  const weekEnd = addDays(summary.start, 6)
  const listed =
    view === 'today' ? sessions.filter((s) => s.done_on === today) : sessions.filter((s) => s.done_on >= summary.start && s.done_on <= weekEnd)
  const todayTotal = summary.days.find((d) => d.date === today)

  return (
    <>
      <PageTitle>Cardio</PageTitle>

      <Card className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <Eyebrow>Meta da semana</Eyebrow>
          <span className="text-xs text-muted">{weekRangeLabel(summary.start, weekEnd)}</span>
        </div>

        <div className="flex items-center gap-5">
          <Ring value={data.ratio} size={112} stroke={10} label={`${formatInt(data.done)} de ${formatInt(data.goal)} ${unitLabel(unit)} na semana`}>
            <span className="font-display text-2xl leading-none font-semibold tabular">{Math.min(999, Math.round(data.ratio * 100))}%</span>
          </Ring>
          <div className="flex flex-col gap-1">
            <p className="m-0 font-display text-[28px] leading-none font-semibold tabular">
              {formatInt(data.done)}
              <span className="font-sans text-sm font-normal text-muted">
                {' '}
                / {formatInt(data.goal)} {unitLabel(unit)}
              </span>
            </p>
            <p className="m-0 text-sm text-text-2">
              {unit === 'minutes' ? `${formatInt(summary.kcal)} kcal` : formatDuration(summary.minutes)} · {summary.sessions}{' '}
              {summary.sessions === 1 ? 'sessão' : 'sessões'}
            </p>
            {data.reached ? (
              <span className="mt-1 inline-flex w-fit animate-[laurel-in_420ms_ease-out] items-center gap-1.5 rounded-full border border-bronze-line bg-bronze-soft py-1 pr-2.5 pl-2 text-xs font-semibold text-bronze">
                <Laurel />
                Meta batida
              </span>
            ) : (
              <p className="m-0 text-xs text-muted">
                Faltam {formatInt(data.goal - data.done)} {unitLabel(unit)}
              </p>
            )}
          </div>
        </div>

        <WeekBars days={summary.days} today={today} unit={unit} />
      </Card>

      <div className="mt-5 mb-2 flex items-center justify-between">
        <div role="tablist" aria-label="Período" className="flex rounded-xl border border-line bg-surface p-1">
          {(['today', 'week'] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={cn(
                'h-9 cursor-pointer rounded-lg border-0 px-4 text-sm font-medium transition-colors',
                view === v ? 'bg-accent-soft text-accent-hi' : 'bg-transparent text-muted hover:text-text',
              )}
            >
              {v === 'today' ? 'Hoje' : 'Semana'}
            </button>
          ))}
        </div>
        {view === 'today' && todayTotal && todayTotal.sessions > 0 && (
          <span className="text-sm text-text-2 tabular">
            {formatDuration(todayTotal.minutes)} · {formatInt(todayTotal.kcal)} kcal
          </span>
        )}
      </div>

      {listed.length === 0 ? (
        <EmptyState title={view === 'today' ? 'Nenhum cardio hoje' : 'Nenhum cardio nesta semana'}>
          Registre esteira, bike, corrida… e o Areté calcula as calorias.
        </EmptyState>
      ) : (
        <ul className="m-0 list-none divide-y divide-line p-0">
          {listed.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setSheet({ editing: s })}
                className="flex min-h-16 w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent px-0 text-left text-text"
              >
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[15px] font-medium">
                    {CARDIO_KINDS[s.kind]}
                    {view === 'week' && <span className="font-normal text-muted"> · {formatShortDate(s.done_on)}</span>}
                  </span>
                  <span className="text-[13px] text-muted">
                    {[INTENSITIES[s.intensity].label, formatDuration(s.duration_min), s.distance_km != null ? `${formatKg(s.distance_km)} km` : null]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-display text-lg font-semibold tabular">
                    {formatInt(s.kcal)}
                    <span className="font-sans text-xs font-normal text-muted"> kcal</span>
                  </span>
                  <IconChevronRight size={18} className="text-faint" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="h-16" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-10 mx-auto max-w-md px-5">
        <Button size="lg" className="w-full shadow-[0_8px_24px_rgba(0,0,0,0.45)]" onClick={() => setSheet({})}>
          <IconPlus size={18} />
          Registrar cardio
        </Button>
      </div>

      <CardioSheet open={sheet !== null} onClose={() => setSheet(null)} editing={sheet?.editing} />
    </>
  )
}

function WeekBars({ days, today, unit }: { days: DayTotal[]; today: string; unit: 'minutes' | 'kcal' }) {
  const value = (d: DayTotal) => (unit === 'minutes' ? d.minutes : d.kcal)
  const max = Math.max(1, ...days.map(value))
  return (
    <ol className="m-0 grid list-none grid-cols-7 gap-2 p-0" aria-label="Cardio por dia">
      {days.map((d, i) => {
        const v = value(d)
        const isToday = d.date === today
        const future = d.date > today
        return (
          <li key={d.date} className="flex flex-col items-center gap-1.5">
            <div className="flex h-16 w-full items-end justify-center rounded-md bg-surface-2" aria-hidden="true">
              {v > 0 && (
                <div
                  className={cn('w-full rounded-md transition-[height] duration-500', isToday ? 'bg-accent' : 'bg-accent/55')}
                  style={{ height: `${Math.max(8, (v / max) * 100)}%` }}
                />
              )}
            </div>
            <span className={cn('text-[11px]', isToday ? 'font-semibold text-accent-hi' : future ? 'text-faint' : 'text-muted')}>
              {DAY_LETTERS[i]}
            </span>
            <span className="sr-only">
              {formatShortDate(d.date)}: {v > 0 ? `${formatInt(v)} ${unitLabel(unit)}` : 'sem cardio'}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function unitLabel(unit: 'minutes' | 'kcal') {
  return unit === 'minutes' ? 'min' : 'kcal'
}

function weekRangeLabel(start: string, end: string) {
  const a = parseISODate(start)
  const b = parseISODate(end)
  const startLabel = formatShortDate(start)
  return a.getMonth() === b.getMonth() ? `${a.getDate()}–${formatShortDate(end)}` : `${startLabel} – ${formatShortDate(end)}`
}
