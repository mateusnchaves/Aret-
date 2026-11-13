import { cn } from '@/lib/cn'
import { formatInt } from '@/lib/format'
import type { Macros } from '@/lib/nutrition'

const ROWS = [
  { key: 'proteinG', label: 'Proteína', short: 'P', color: 'bg-protein' },
  { key: 'carbsG', label: 'Carbo', short: 'C', color: 'bg-carb' },
  { key: 'fatG', label: 'Gordura', short: 'G', color: 'bg-fat' },
] as const

/** Barras de proteína, carbo e gordura: consumido / meta. `compact` = versão do Início. */
export function MacroBars({
  total,
  targets,
  compact,
  className,
}: {
  total: Macros
  targets: Macros
  compact?: boolean
  className?: string
}) {
  return (
    <div className={cn('flex flex-col', compact ? 'gap-1.5' : 'gap-3', className)}>
      {ROWS.map((r) => {
        const value = total[r.key]
        const goal = targets[r.key]
        const pct = goal > 0 ? Math.min(100, (value / goal) * 100) : 0
        return compact ? (
          <div key={r.key} className="flex items-center gap-1.5" title={`${r.label}: ${formatInt(value)} de ${formatInt(goal)} g`}>
            <span className="w-3.5 text-[11px] font-semibold text-text-2">{r.short}</span>
            <div className="h-[5px] flex-1 rounded-full bg-line">
              <div className={cn('h-[5px] rounded-full', r.color)} style={{ width: `${pct}%` }} />
            </div>
            <span className="sr-only">
              {r.label}: {formatInt(value)} de {formatInt(goal)} g
            </span>
          </div>
        ) : (
          <div key={r.key} className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[13px]">
              <span className="font-medium">{r.label}</span>
              <span className={cn('tabular', value > goal * 1.1 ? 'text-danger' : 'text-text-2')}>
                {formatInt(value)} / {formatInt(goal)} g
              </span>
            </div>
            <div
              className="h-1.5 rounded-full bg-line"
              role="progressbar"
              aria-label={r.label}
              aria-valuemin={0}
              aria-valuemax={goal}
              aria-valuenow={Math.round(value)}
            >
              <div className={cn('h-1.5 rounded-full transition-[width] duration-500', r.color)} style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
