import { Link } from 'react-router'
import { Medal } from '@/components/brand'
import { Eyebrow } from '@/components/ui/surface'
import { daysBetween, relativeDays, todayISO } from '@/lib/dates'
import { formatKg } from '@/lib/format'
import type { Medal as MedalData } from './data'

/** Os três recordes mais recentes, como medalhas. */
export function GloryRecent({ medals }: { medals: MedalData[] }) {
  const today = todayISO()
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between">
        <Eyebrow className="text-bronze">Glória recente</Eyebrow>
        <Link to="/treino/panteao" className="text-xs font-semibold text-accent-hi no-underline">
          Panteão
        </Link>
      </div>
      {medals.length === 0 ? (
        <p className="m-0 rounded-[20px] border border-line bg-surface px-4 py-4 text-sm text-muted">
          Supere uma carga e a sua primeira medalha aparece aqui.
        </p>
      ) : (
        <ul className="m-0 grid list-none grid-cols-3 gap-2.5 p-0">
          {medals.slice(0, 3).map((m) => (
            <li key={m.entry.id}>
              <Link
                to={`/treino/exercicios/${m.exercise.id}`}
                className="flex h-full flex-col items-center gap-2 rounded-[18px] border border-line bg-surface px-1.5 pt-3 pb-2.5 text-text no-underline"
              >
                <Medal>
                  <span className="font-display text-[17px] leading-none font-semibold tabular">{formatKg(m.entry.load_kg)}</span>
                  <span className="text-[9px] font-bold tracking-[0.1em]">KG</span>
                </Medal>
                <span className="line-clamp-2 text-center text-xs leading-tight font-medium">{m.exercise.name}</span>
                <span className="text-[10px] text-muted">{relativeDays(daysBetween(m.entry.recorded_on, today))}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
