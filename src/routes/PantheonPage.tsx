import { Link } from 'react-router'
import { Medal, Meander } from '@/components/brand'
import { SubHeader } from '@/components/layout'
import { EmptyState, Eyebrow, Spinner } from '@/components/ui/surface'
import { useGlory, type Medal as MedalData } from '@/features/glory/data'
import { formatShortDate } from '@/lib/dates'
import { formatKg } from '@/lib/format'
import { toRoman } from '@/lib/glory'
import { MUSCLE_GROUPS, type MuscleGroup } from '@/lib/types'

/** Panteão: a maior carga de cada exercício, como medalha, por grupo muscular. */
export function PantheonPage() {
  const glory = useGlory()
  const pantheon = glory.data?.pantheon
  if (!pantheon) return <Spinner />

  const groups = (Object.keys(MUSCLE_GROUPS) as MuscleGroup[])
    .map((g) => ({
      group: g,
      medals: pantheon.filter((m) => m.exercise.muscle_group === g).sort((a, b) => b.entry.load_kg - a.entry.load_kg),
    }))
    .filter((g) => g.medals.length > 0)

  return (
    <>
      <SubHeader back="/treino" context="Treino" />
      <header className="mb-2 flex flex-col items-center gap-1 text-center">
        <h1 className="inscription m-0 text-[30px] font-bold tracking-[0.16em] text-bronze">PANTEÃO</h1>
        <p className="m-0 font-display text-sm text-muted italic">a maior carga de cada exercício</p>
      </header>
      <Meander className="mb-5" />

      {groups.length === 0 ? (
        <EmptyState title="O panteão espera">Registre cargas nos seus exercícios. A maior de cada um vira medalha aqui.</EmptyState>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map(({ group, medals }) => (
            <section key={group} className="flex flex-col gap-2.5">
              <Eyebrow>{MUSCLE_GROUPS[group]}</Eyebrow>
              <ul className="m-0 grid list-none grid-cols-3 gap-2.5 p-0">
                {medals.map((m) => (
                  <PantheonMedal key={m.exercise.id} medal={m} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  )
}

function PantheonMedal({ medal }: { medal: MedalData }) {
  return (
    <li>
      <Link
        to={`/treino/exercicios/${medal.exercise.id}`}
        className="gold-edge flex h-full flex-col items-center gap-2 rounded-[18px] border border-line bg-surface px-1.5 pt-3.5 pb-2.5 text-text no-underline"
      >
        <Medal size={62}>
          <span className="font-display text-[18px] leading-none font-semibold tabular">{formatKg(medal.entry.load_kg)}</span>
          <span className="text-[9px] font-bold tracking-[0.1em]">KG</span>
        </Medal>
        <span className="line-clamp-2 text-center text-xs leading-tight font-medium">{medal.exercise.name}</span>
        <span className="text-[10px] text-muted">
          <span className="inscription text-bronze">{toRoman(medal.mark)}</span> · {formatShortDate(medal.entry.recorded_on)}
        </span>
      </Link>
    </li>
  )
}
