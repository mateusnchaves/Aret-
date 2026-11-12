import { Link } from 'react-router'
import { IconArrowDown, IconArrowUp, IconChevronRight, IconMinus } from '@/components/icons'
import { formatKg, plural } from '@/lib/format'
import type { Trend } from '@/lib/training'
import type { ExerciseStatus } from '../data'
import { stalenessText } from './staleness'

export function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === 'up') return <IconArrowUp size={16} className="text-accent-hi" aria-label="Evoluiu" role="img" aria-hidden={false} />
  if (trend === 'down') return <IconArrowDown size={16} className="text-muted" aria-label="Caiu" role="img" aria-hidden={false} />
  if (trend === 'flat') return <IconMinus size={16} className="text-muted" aria-label="Igual" role="img" aria-hidden={false} />
  return null
}

export function StagnationBadge({ status, usesCheckins }: { status: ExerciseStatus; usesCheckins: boolean }) {
  const s = status.stagnation
  if (!s?.stagnant) return null
  return (
    <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1.5 text-[13px] font-semibold text-accent-hi">
      {usesCheckins ? plural(s.sessions, 'treino', 'treinos') : `${s.days} dias`}
    </span>
  )
}

export function ExerciseRow({ status, usesCheckins }: { status: ExerciseStatus; usesCheckins: boolean }) {
  const { exercise, current } = status
  return (
    <Link
      to={`/treino/exercicios/${exercise.id}`}
      className="flex min-h-14 items-center justify-between gap-3 py-2 text-text no-underline"
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-[15px] font-medium">{exercise.name}</span>
        {current ? (
          <span className="flex items-center gap-1.5 text-[13px] text-muted">
            <span className="font-semibold text-text-2 tabular">
              {formatKg(current.load_kg)} kg · {current.sets} × {current.reps}
            </span>
            <TrendIcon trend={status.trend} />
            <span aria-hidden="true">·</span>
            {stalenessText(status, usesCheckins)}
          </span>
        ) : (
          <span className="text-[13px] font-medium text-accent-hi">Definir carga inicial</span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <StagnationBadge status={status} usesCheckins={usesCheckins} />
        <IconChevronRight size={18} className="text-faint" />
      </div>
    </Link>
  )
}
