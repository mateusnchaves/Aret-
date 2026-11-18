import { useEffect, useRef, useState } from 'react'
import { IconAmphora, IconCheck, IconDumbbell, IconTorch } from '@/components/icons'
import { cn } from '@/lib/cn'
import { useInView } from './hooks'
import { Reveal, SectionHead } from './parts'

const BRANCHES = [
  { label: 'Treino', detail: '3 treinos na semana', icon: IconDumbbell, from: -116, to: -42 },
  { label: 'Cardio', detail: '150 minutos', icon: IconTorch, from: -34, to: 34 },
  { label: 'Alimentação', detail: '5 dias na meta', icon: IconAmphora, from: 42, to: 116 },
]
const LEAVES = 9
const SIZE = 340

export function CrownSection() {
  const [ref, inView] = useInView<HTMLDivElement>(0.45)
  const [lit, setLit] = useState([false, false, false])
  const touched = useRef(false)

  // Ao aparecer na tela, os ramos acendem um por vez (até a pessoa mexer).
  useEffect(() => {
    if (!inView) return
    const timers = BRANCHES.map((_, i) =>
      setTimeout(() => {
        if (!touched.current) setLit((prev) => prev.map((v, j) => (j === i ? true : v)))
      }, 500 + i * 750),
    )
    return () => timers.forEach(clearTimeout)
  }, [inView])

  const golden = lit.every(Boolean)
  const count = lit.filter(Boolean).length

  return (
    <section id="coroa" className="relative scroll-mt-24 overflow-hidden border-y border-line bg-[radial-gradient(80%_70%_at_70%_50%,rgb(28_38_25/0.9),var(--color-bg)_70%)]">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-24 md:grid-cols-2 md:px-8 md:py-32">
        <div className="flex flex-col gap-8">
          <SectionHead
            title="Três ramos. Uma coroa."
            text="Cada semana tem três metas: treino, cardio e alimentação. Cada uma é um ramo de louros. Feche os três e a coroa fica dourada."
          />
          <Reveal delay={150} className="flex flex-col gap-3">
            {BRANCHES.map((b, i) => {
              const Icon = b.icon
              const on = lit[i]
              return (
                <button
                  key={b.label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    touched.current = true
                    setLit((prev) => prev.map((v, j) => (j === i ? !v : v)))
                  }}
                  className={cn(
                    'flex cursor-pointer items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition-all duration-300',
                    on ? 'border-laurel/50 bg-laurel-soft shadow-[0_10px_30px_-12px_rgba(140,192,132,0.45)]' : 'border-line bg-surface/60 hover:border-line-strong',
                  )}
                >
                  <span className={cn('flex size-10 items-center justify-center rounded-xl transition-colors', on ? 'bg-laurel text-on-laurel' : 'bg-surface-2 text-muted')}>
                    <Icon size={20} />
                  </span>
                  <span className="flex flex-1 flex-col">
                    <span className="font-semibold">{b.label}</span>
                    <span className="text-sm text-muted">{b.detail}</span>
                  </span>
                  <span
                    className={cn(
                      'flex size-6 items-center justify-center rounded-full border transition-all duration-300',
                      on ? 'border-laurel bg-laurel text-on-laurel' : 'border-line-strong text-transparent',
                    )}
                  >
                    <IconCheck size={13} />
                  </span>
                </button>
              )
            })}
          </Reveal>
        </div>

        <div ref={ref} className="relative order-first mx-auto flex aspect-square w-full max-w-[320px] items-center justify-center md:order-none md:max-w-[380px]">
          <div
            aria-hidden="true"
            className={cn(
              'absolute inset-[8%] rounded-full blur-3xl transition-all duration-1000',
              golden ? 'bg-bronze/35 opacity-100' : 'bg-laurel/20',
              count === 0 && 'opacity-40',
            )}
          />
          <CrownArt lit={lit} golden={golden} />
          <div className="absolute inset-0 flex flex-col items-center justify-center" aria-live="polite">
            {golden ? (
              <div key="gold" className="flex animate-[laurel-in_700ms_cubic-bezier(0.2,0.9,0.3,1.2)_both] flex-col items-center gap-2">
                <img src="/icons/coin.svg" alt="" width={120} height={120} className="drop-shadow-[0_0_30px_rgba(216,180,90,0.55)]" />
                <span className="inscription text-sm font-bold tracking-[0.3em] text-bronze">GLÓRIA</span>
              </div>
            ) : (
              <div key="count" className="flex flex-col items-center">
                <span className="font-display text-[64px] leading-none font-semibold tabular">
                  {count}
                  <span className="text-[32px] text-muted">/3</span>
                </span>
                <span className="text-sm text-muted">ramos da semana</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function CrownArt({ lit, golden }: { lit: boolean[]; golden: boolean }) {
  const c = SIZE / 2
  const ry = SIZE * 0.052
  const rx = ry * 0.46
  const baseY = SIZE - ry * 1.2
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="relative h-full w-full" aria-hidden="true">
      <circle cx={c} cy={c} r={c - ry * 2.7} fill="none" stroke="var(--color-line-strong)" strokeWidth="1" strokeDasharray="2 6" />
      {BRANCHES.map((b, p) =>
        Array.from({ length: LEAVES }, (_, i) => {
          const t = i / (LEAVES - 1)
          const angle = b.from + (b.to - b.from) * t
          const tilt = angle < -4 ? -32 : angle > 4 ? 32 : 0
          const on = lit[p]
          const fill = golden ? 'var(--color-bronze)' : on ? 'var(--color-laurel)' : 'var(--color-line-strong)'
          // A rotação fica no <g>: a transição só mexe na cor e na escala da folha.
          return (
            <g key={`${p}-${i}`} transform={`rotate(${angle} ${c} ${c}) rotate(${tilt} ${c} ${baseY})`}>
              <ellipse
                cx={c}
                cy={baseY}
                rx={rx}
                ry={ry}
                fill={fill}
                opacity={on || golden ? 1 : 0.55}
                style={{
                  transition: 'fill 600ms ease, opacity 600ms ease, transform 600ms cubic-bezier(0.2,0.9,0.3,1.3)',
                  transitionDelay: `${i * 45}ms`,
                  transform: on || golden ? 'scale(1)' : 'scale(0.82)',
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                }}
              />
            </g>
          )
        }),
      )}
    </svg>
  )
}
