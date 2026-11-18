import { useEffect, useState, type ReactNode } from 'react'
import { Medal } from '@/components/brand'
import { IconArrowUp, IconDownload, IconLock, IconWifiOff } from '@/components/icons'
import { cn } from '@/lib/cn'
import { MAXIMS } from '@/lib/maxims'
import { trackPointer, useInView } from './hooks'
import { Reveal, SectionHead } from './parts'

export function Bento() {
  return (
    <section id="recursos" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 md:px-8 md:py-32">
      <SectionHead
        title="Tudo para manter a constância"
        text="O que você precisa ver para continuar evoluindo, e nada que te faça perder tempo entre uma série e outra."
      />
      <div className="mt-12 grid gap-4 md:grid-cols-6">
        <Cell className="md:col-span-4 md:row-span-2" delay={0}>
          <ProgressCell />
        </Cell>
        <Cell className="md:col-span-2" delay={80}>
          <StagnationCell />
        </Cell>
        <Cell className="md:col-span-2" delay={160}>
          <PantheonCell />
        </Cell>
        <Cell className="md:col-span-3" delay={0}>
          <ConstancyCell />
        </Cell>
        <Cell className="md:col-span-3" delay={80}>
          <MaximCell />
        </Cell>
        <Cell className="md:col-span-2" delay={0}>
          <SmallFact icon={<IconWifiOff size={22} />} title="Consulta sem sinal" text="As últimas cargas ficam no aparelho para quando a academia não tem internet." />
        </Cell>
        <Cell className="md:col-span-2" delay={80}>
          <SmallFact icon={<IconDownload size={22} />} title="Instala como app" text="No celular e no computador, com ícone próprio e sem a barra do navegador." />
        </Cell>
        <Cell className="md:col-span-2" delay={160}>
          <SmallFact icon={<IconLock size={22} />} title="Seus dados são só seus" text="Cada conta enxerga apenas os próprios registros, com a regra aplicada no banco." />
        </Cell>
      </div>
    </section>
  )
}

function Cell({ children, className, delay }: { children: ReactNode; className?: string; delay: number }) {
  return (
    <Reveal delay={delay} className={cn('h-full', className)}>
      <article
        onPointerMove={trackPointer}
        className="spotlight flex h-full flex-col gap-5 overflow-hidden rounded-[26px] border border-line bg-surface/80 p-6 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-laurel/35 md:p-7"
      >
        {children}
      </article>
    </Reveal>
  )
}

function CellHead({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="m-0 font-display text-[22px] leading-tight font-semibold">{title}</h3>
      <p className="m-0 max-w-[46ch] text-[15px] leading-relaxed text-text-2">{text}</p>
    </div>
  )
}

/* Progressão: a linha em degraus se desenha ao aparecer. */
const LOADS = [40, 40, 42.5, 45, 45, 47.5, 50, 52.5, 52.5, 55, 57.5, 60]

function ProgressCell() {
  const [ref, inView] = useInView<HTMLDivElement>(0.35)
  const W = 600
  const H = 250
  const pad = 18
  const left = 44
  const min = 37.5
  const max = 62.5
  const x = (i: number) => left + (i / (LOADS.length - 1)) * (W - left - pad)
  const y = (v: number) => H - pad - ((v - min) / (max - min)) * (H - pad * 2)
  let d = `M ${x(0)} ${y(LOADS[0]!)}`
  LOADS.forEach((v, i) => {
    if (i === 0) return
    d += ` H ${x(i)} V ${y(v)}`
  })
  const area = `${d} V ${H} H ${x(0)} Z`
  const last = LOADS.length - 1

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <CellHead title="A escada de cada exercício" text="Um gráfico por exercício, venha de qualquer ficha. O ponto mais alto ganha a cor da glória." />
        <span className="flex items-center gap-1.5 rounded-full bg-laurel/15 px-3 py-1.5 text-sm font-semibold text-laurel">
          <IconArrowUp size={15} />
          +20 kg em 6 meses
        </span>
      </div>
      <div ref={ref} className="relative mt-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Gráfico de carga subindo de 40 para 60 kg">
          <defs>
            <linearGradient id="bento-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-laurel)" stopOpacity="0.32" />
              <stop offset="100%" stopColor="var(--color-laurel)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[40, 45, 50, 55, 60].map((v) => (
            <g key={v}>
              <line x1={left} x2={W - pad} y1={y(v)} y2={y(v)} stroke="var(--color-line)" strokeWidth="1" />
              <text x={left - 10} y={y(v) + 4} textAnchor="end" fontSize="13" fill="var(--color-faint)">
                {v}
              </text>
            </g>
          ))}
          <path d={area} fill="url(#bento-area)" className={cn('transition-opacity delay-700 duration-1000', inView ? 'opacity-100' : 'opacity-0')} />
          <path
            d={d}
            fill="none"
            stroke="var(--color-laurel)"
            strokeWidth="3"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset="1"
            style={inView ? { animation: 'draw 1800ms cubic-bezier(0.4,0,0.2,1) 200ms forwards' } : undefined}
          />
          {LOADS.map((v, i) =>
            i > 0 && v !== LOADS[i - 1] ? (
              <circle
                key={i}
                cx={x(i)}
                cy={y(v)}
                r={i === last ? 7 : 4}
                fill={i === last ? 'var(--color-bronze)' : 'var(--color-bg)'}
                stroke={i === last ? 'var(--color-bg)' : 'var(--color-laurel)'}
                strokeWidth="2"
                className={cn('transition-opacity duration-500', inView ? 'opacity-100' : 'opacity-0')}
                style={{ transitionDelay: `${300 + (i / last) * 1500}ms` }}
              />
            ) : null,
          )}
          <circle
            cx={x(last)}
            cy={y(LOADS[last]!)}
            r="16"
            fill="var(--color-bronze)"
            className={cn('transition-opacity duration-700', inView ? 'animate-pulse opacity-25' : 'opacity-0')}
            style={{ transitionDelay: '1900ms' }}
          />
        </svg>
      </div>
    </>
  )
}

function StagnationCell() {
  const rows = [
    { name: 'Supino reto', status: 'subiu há 5 dias', alert: false },
    { name: 'Agachamento', status: '6 treinos sem evoluir', alert: true },
    { name: 'Remada curvada', status: 'subiu há 12 dias', alert: false },
  ]
  return (
    <>
      <CellHead title="Alerta de estagnação" text="Quem parou de evoluir aparece primeiro." />
      <ul className="m-0 mt-auto flex list-none flex-col gap-2 p-0">
        {rows.map((r) => (
          <li
            key={r.name}
            className={cn('flex items-center gap-3 rounded-xl border px-3 py-2.5', r.alert ? 'border-accent/40 bg-accent-soft' : 'border-line bg-bg/40')}
          >
            <span
              className={cn('size-2.5 shrink-0 rounded-full', r.alert ? 'animate-[ping-soft_1.6s_ease-out_infinite] bg-accent' : 'bg-laurel')}
            />
            <span className="flex-1 text-sm font-medium">{r.name}</span>
            <span className={cn('text-xs', r.alert ? 'font-semibold text-accent-hi' : 'text-muted')}>{r.status}</span>
          </li>
        ))}
      </ul>
    </>
  )
}

function PantheonCell() {
  const medals = [
    { load: 120, name: 'Agachamento' },
    { load: 60, name: 'Supino' },
    { load: 80, name: 'Remada' },
  ]
  return (
    <>
      <CellHead title="Panteão" text="A maior carga de cada exercício, em medalhas." />
      <div className="mt-auto flex items-end justify-around gap-2">
        {medals.map((m, i) => (
          <div key={m.name} className={cn('flex flex-col items-center gap-2 transition-transform duration-300 hover:-translate-y-1', i === 0 && 'order-2 -translate-y-2')}>
            <Medal size={i === 0 ? 64 : 52}>
              <span className={cn('font-display leading-none font-bold', i === 0 ? 'text-lg' : 'text-[15px]')}>{m.load}</span>
              <span className="text-[8px] font-bold tracking-[0.12em]">KG</span>
            </Medal>
            <span className="text-xs text-muted">{m.name}</span>
          </div>
        ))}
      </div>
    </>
  )
}

/* Grade de constância: 12 semanas × 7 dias, com o verde ficando mais forte com o tempo. */
const GRID = Array.from({ length: 12 * 7 }, (_, i) => {
  const week = Math.floor(i / 7)
  const day = i % 7
  const seed = (week * 7 + day * 13 + week * day) % 10
  const bias = week / 11
  if (day === 6 && seed < 6) return 0
  const v = seed / 10 + bias * 0.55
  return v > 1 ? 3 : v > 0.72 ? 2 : v > 0.42 ? 1 : 0
})
const TONES = ['bg-line', 'bg-laurel-low', 'bg-laurel-mid', 'bg-laurel']

function ConstancyCell() {
  const [ref, inView] = useInView<HTMLDivElement>(0.4)
  return (
    <>
      <CellHead title="Grade de constância" text="Doze semanas de treino, cardio e dieta num olhar só." />
      <div ref={ref} className="mt-auto grid grid-flow-col grid-rows-7 gap-1.5" aria-hidden="true">
        {GRID.map((level, i) => (
          <span
            key={i}
            className={cn('aspect-square rounded-[4px]', TONES[level], inView ? 'animate-[cell-in_400ms_ease-out_both]' : 'opacity-0')}
            style={{ animationDelay: `${Math.floor(i / 7) * 55 + (i % 7) * 18}ms` }}
          />
        ))}
      </div>
      <div className="flex items-center justify-end gap-1.5 text-xs text-muted">
        menos
        {TONES.map((t) => (
          <span key={t} className={cn('size-3 rounded-[3px]', t)} />
        ))}
        mais
      </div>
    </>
  )
}

function MaximCell() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % MAXIMS.length), 6500)
    return () => clearInterval(t)
  }, [])
  const m = MAXIMS[i]!
  return (
    <>
      <span className="font-display text-[64px] leading-[0.6] text-bronze" aria-hidden="true">
        “
      </span>
      <figure key={i} className="m-0 flex animate-[fade-swap_700ms_ease-out_both] flex-col gap-3">
        <blockquote className="m-0 font-display text-[22px] leading-snug italic md:text-[24px]">{m.text}</blockquote>
        <figcaption className="text-sm text-muted">
          {m.author}, <cite>{m.source}</cite>
        </figcaption>
      </figure>
      <p className="m-0 mt-auto text-xs text-faint">Uma máxima clássica nova a cada dia, na tela inicial.</p>
    </>
  )
}

function SmallFact({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <>
      <span className="flex size-11 items-center justify-center rounded-2xl bg-laurel/15 text-laurel">{icon}</span>
      <CellHead title={title} text={text} />
    </>
  )
}
