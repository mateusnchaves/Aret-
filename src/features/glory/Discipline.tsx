import { Laurel } from '@/components/brand'
import { Card, Eyebrow } from '@/components/ui/surface'
import { cn } from '@/lib/cn'
import { formatShortDate } from '@/lib/dates'
import type { Streak } from '@/lib/glory'

const LEVEL_BG = ['bg-surface-2', 'bg-laurel-low', 'bg-laurel-mid', 'bg-laurel'] as const
const LEVEL_LABEL = ['nada', 'uma frente', 'duas frentes', 'treino, cardio e dieta'] as const

/** Sequência de semanas na meta + mapa de constância (12 semanas). */
export function DisciplineCard({
  streak,
  target,
  grid,
}: {
  streak: Streak
  target: number
  grid: { date: string; level: 0 | 1 | 2 | 3; future: boolean }[][]
}) {
  return (
    <Card className="flex flex-col gap-3 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <Eyebrow className="text-laurel">Disciplina</Eyebrow>
          <span className="font-display text-[26px] leading-tight font-semibold tabular">
            {streak.current} {streak.current === 1 ? 'semana' : 'semanas'}
            <span className="font-sans text-[13px] font-normal text-muted"> seguidas na meta</span>
          </span>
          <span className="text-[11px] text-muted">meta: {target} treinos por semana</span>
        </div>
        {streak.best > 0 && (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-bronze/35 bg-bronze/10 px-2.5 py-1.5 text-xs font-semibold text-bronze">
            <Laurel size={16} />
            recorde: {streak.best}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="grid grid-cols-12 gap-1" role="img" aria-label="Constância das últimas 12 semanas: cada quadrado é um dia; quanto mais verde, mais frentes cumpridas.">
          {grid.map((week) => (
            <div key={week[0]!.date} className="flex flex-col gap-1">
              {week.map((d) => (
                <div
                  key={d.date}
                  title={`${formatShortDate(d.date)}: ${LEVEL_LABEL[d.level]}`}
                  className={cn('h-3.5 rounded-[4px]', d.future ? 'bg-transparent outline outline-1 -outline-offset-1 outline-line' : LEVEL_BG[d.level])}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[11px] text-muted">
          <span>constância · 12 semanas</span>
          <span className="flex items-center gap-1.5" aria-hidden="true">
            menos
            {LEVEL_BG.map((bg) => (
              <span key={bg} className={cn('size-2.5 rounded-[3px]', bg)} />
            ))}
            mais
          </span>
        </div>
      </div>
    </Card>
  )
}
