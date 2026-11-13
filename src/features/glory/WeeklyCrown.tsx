import { Link } from 'react-router'
import { IconAmphora, IconDumbbell, IconTorch } from '@/components/icons'
import { Card, Eyebrow } from '@/components/ui/surface'
import { formatDuration } from '@/lib/cardio'
import { cn } from '@/lib/cn'
import { formatInt } from '@/lib/format'
import type { Branch, WeeklyCrown as Crown } from '@/lib/glory'

const SIZE = 132
const LEAVES_PER_BRANCH = 6

/**
 * Coroa da semana: três ramos de louro (treino, cardio, alimentação) que ficam verdes
 * conforme cada meta da semana é cumprida. Os três completos: a coroa inteira vira ouro.
 */
export function WeeklyCrownCard({ crown, cardioUnit }: { crown: Crown; cardioUnit: 'minutes' | 'kcal' }) {
  const golden = crown.complete === 3
  const branches: { key: string; branch: Branch; label: string; detail: string; to: string; icon: typeof IconDumbbell }[] = [
    {
      key: 'training',
      branch: crown.training,
      label: 'Treino',
      detail: `${crown.training.done}/${crown.training.goal} treinos`,
      to: '/treino',
      icon: IconDumbbell,
    },
    {
      key: 'cardio',
      branch: crown.cardio,
      label: 'Cardio',
      detail:
        cardioUnit === 'minutes'
          ? `${formatDuration(crown.cardio.done)} de ${formatDuration(crown.cardio.goal)}`
          : `${formatInt(crown.cardio.done)}/${formatInt(crown.cardio.goal)} kcal`,
      to: '/cardio',
      icon: IconTorch,
    },
    {
      key: 'nutrition',
      branch: crown.nutrition,
      label: 'Alimentação',
      detail: `${crown.nutrition.done}/${crown.nutrition.goal} dias na meta`,
      to: '/alimentacao',
      icon: IconAmphora,
    },
  ]

  return (
    <Card className={cn('flex items-center gap-4 py-4', golden && 'border-bronze-line')}>
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <CrownArt crown={crown} golden={golden} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
          <span className={cn('font-display text-[30px] leading-none font-semibold tabular', golden && 'text-bronze')}>
            {crown.complete}
            <span className="text-base text-muted">/3</span>
          </span>
          <span className="mt-1 text-[10px] text-muted">{golden ? 'coroa completa' : 'ramos'}</span>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <Eyebrow className={golden ? 'text-bronze' : undefined}>Coroa da semana</Eyebrow>
        {branches.map(({ key, branch, label, detail, to, icon: Icon }) => (
          <Link key={key} to={to} className="flex items-center gap-2.5 text-text no-underline">
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full border',
                branch.complete ? 'border-laurel bg-laurel-soft text-laurel' : 'border-line-strong text-muted',
              )}
            >
              <Icon size={16} />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-[13px] font-medium">{label}</span>
              <span className={cn('truncate text-[11px] tabular', branch.complete ? 'text-laurel' : 'text-muted')}>{detail}</span>
            </span>
          </Link>
        ))}
      </div>
    </Card>
  )
}

/** Três arcos de folhas: treino à esquerda, cardio na base, alimentação à direita. */
function CrownArt({ crown, golden }: { crown: Crown; golden: boolean }) {
  const c = SIZE / 2
  const ry = SIZE * 0.06
  const rx = ry * 0.46
  const baseY = SIZE - ry * 1.15
  const parts: { branch: Branch; from: number; to: number }[] = [
    { branch: crown.training, from: -112, to: -40 },
    { branch: crown.cardio, from: -34, to: 34 },
    { branch: crown.nutrition, from: 40, to: 112 },
  ]
  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
      <circle cx={c} cy={c} r={c - ry * 2.6} fill="none" stroke="var(--color-line)" strokeWidth="1" strokeDasharray="2 5" />
      {parts.map(({ branch, from, to }, p) => {
        const ratio = branch.goal > 0 ? Math.min(1, branch.done / branch.goal) : 0
        const lit = Math.round(ratio * LEAVES_PER_BRANCH)
        return Array.from({ length: LEAVES_PER_BRANCH }, (_, i) => {
          const t = i / (LEAVES_PER_BRANCH - 1)
          const angle = from + (to - from) * t
          // Acende a partir da ponta mais baixa de cada ramo.
          const order = p === 0 ? LEAVES_PER_BRANCH - 1 - i : p === 2 ? i : Math.abs(i - (LEAVES_PER_BRANCH - 1) / 2) * 2
          const on = order < lit
          const fill = golden ? 'var(--color-bronze)' : on ? 'var(--color-laurel)' : 'var(--color-line-strong)'
          const tilt = angle < 0 ? -30 : angle > 0 ? 30 : 0
          return (
            <ellipse
              key={`${p}-${i}`}
              cx={c}
              cy={baseY}
              rx={rx}
              ry={ry}
              fill={fill}
              opacity={on || golden ? 0.95 : 0.7}
              transform={`rotate(${angle} ${c} ${c}) rotate(${tilt} ${c} ${baseY})`}
              className="transition-[fill] duration-700"
            />
          )
        })
      })}
    </svg>
  )
}
