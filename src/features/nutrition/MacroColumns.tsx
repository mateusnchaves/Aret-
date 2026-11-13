import { formatInt } from '@/lib/format'
import type { Macros } from '@/lib/nutrition'

const COLS = [
  { key: 'proteinG', label: 'PROT', name: 'Proteína', color: 'var(--color-protein)' },
  { key: 'carbsG', label: 'CARB', name: 'Carboidrato', color: 'var(--color-carb)' },
  { key: 'fatG', label: 'GORD', name: 'Gordura', color: 'var(--color-fat)' },
] as const

const SHAFT_TOP = 13
const SHAFT_H = 96

/** Macros como três colunas gregas que se enchem de baixo para cima. */
export function MacroColumns({ total, targets }: { total: Macros; targets: Macros }) {
  const label = COLS.map((c) => `${c.name} ${formatInt(total[c.key])} de ${formatInt(targets[c.key])} g`).join(', ')
  return (
    <div className="grid flex-1 grid-cols-3 gap-1" role="img" aria-label={label}>
      {COLS.map((c) => {
        const value = total[c.key]
        const goal = targets[c.key]
        const h = goal > 0 ? Math.round(Math.min(1, value / goal) * SHAFT_H) : 0
        const over = value > goal * 1.1
        return (
          <div key={c.key} className="flex flex-col items-center gap-1.5">
            <svg width="44" height="124" viewBox="0 0 44 124" aria-hidden="true">
              <rect x="2" y="2" width="40" height="7" rx="2" fill="#4a3c31" />
              <rect x="5" y="9" width="34" height="4" fill="#3a2e26" />
              <rect x="9" y={SHAFT_TOP} width="26" height={SHAFT_H} fill="var(--color-surface-2)" />
              <rect
                x="9"
                y={SHAFT_TOP + SHAFT_H - h}
                width="26"
                height={h}
                fill={c.color}
                className="transition-[height,y] duration-700 ease-out"
              />
              {[15, 21.25, 27.5].map((x) => (
                <rect key={x} x={x} y={SHAFT_TOP} width="1.5" height={SHAFT_H} fill="var(--color-bg)" opacity="0.35" />
              ))}
              <rect x="5" y="109" width="34" height="4" fill="#3a2e26" />
              <rect x="2" y="113" width="40" height="8" rx="2" fill="#4a3c31" />
            </svg>
            <span className="inscription text-[10px] font-semibold tracking-[0.08em] text-text-2">{c.label}</span>
            <span className={`text-[11px] whitespace-nowrap tabular ${over ? 'text-danger' : 'text-muted'}`}>
              {formatInt(value)}/{formatInt(goal)} g
            </span>
          </div>
        )
      })}
    </div>
  )
}
