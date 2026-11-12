import { Link } from 'react-router'
import { Laurel, Ring } from '@/components/brand'
import { Card, Eyebrow } from '@/components/ui/surface'
import { formatInt } from '@/lib/format'
import { useCardioWeek } from './useCardioWeek'

/** Card do Início: progresso da meta semanal de cardio. */
export function CardioCard() {
  const { data } = useCardioWeek()
  const unit = data?.unit === 'kcal' ? 'kcal' : 'min'

  return (
    <Link to="/cardio" className="no-underline">
      <Card className="flex h-full flex-col gap-2.5 p-4 text-text">
        <Eyebrow>Cardio</Eyebrow>
        {data ? (
          <>
            <Ring value={data.ratio} label={`${formatInt(data.done)} de ${formatInt(data.goal)} ${unit} na semana`}>
              {data.reached ? (
                <Laurel size={26} className="text-bronze" />
              ) : (
                <span className="font-display text-[17px] font-semibold tabular">{Math.round(data.ratio * 100)}%</span>
              )}
            </Ring>
            <div className="flex flex-col gap-0.5">
              <span className="font-display text-xl font-semibold tabular">
                {formatInt(data.done)}
                <span className="font-sans text-[13px] font-normal text-muted">
                  {' '}
                  / {formatInt(data.goal)} {unit}
                </span>
              </span>
              <span className="text-xs text-muted">nesta semana</span>
            </div>
          </>
        ) : (
          <span className="text-sm text-muted">Carregando…</span>
        )}
      </Card>
    </Link>
  )
}
