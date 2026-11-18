import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Laurel, Medal, PersonalRecordBadge, Ring } from '@/components/brand'
import { IconAmphora, IconCheck, IconDumbbell, IconTorch } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { MacroColumns } from '@/features/nutrition/MacroColumns'
import { cn } from '@/lib/cn'
import { formatInt, formatKg } from '@/lib/format'
import { toRoman } from '@/lib/glory'
import { Reveal, SectionHead } from './parts'

const TABS = [
  {
    id: 'treino',
    label: 'Treino',
    icon: IconDumbbell,
    title: 'Cada degrau é uma carga nova',
    text: 'Você registra só quando a carga sobe. O gráfico vira uma escada, e cada recorde ganha medalha.',
    points: ['Histórico por exercício, de qualquer ficha', 'Alerta depois de 6 treinos sem evoluir', 'Marcos numerados em romano'],
  },
  {
    id: 'cardio',
    label: 'Cardio',
    icon: IconTorch,
    title: 'A meta da semana, enchendo',
    text: 'Esteira, bike, corrida. As calorias saem do seu peso e da intensidade, e o anel enche até a meta.',
    points: ['Meta semanal em minutos ou calorias', 'Calorias estimadas por MET', 'A semana dia a dia'],
  },
  {
    id: 'alimentacao',
    label: 'Alimentação',
    icon: IconAmphora,
    title: 'A dieta, marcada num toque',
    text: 'Monte a dieta da nutricionista e marque cada refeição como feita. Calorias e macros acompanham.',
    points: ['591 alimentos da tabela TACO', 'Meta calculada ou definida por você', 'Proteína, carboidrato e gordura'],
  },
] as const

type TabId = (typeof TABS)[number]['id']

export function Demo() {
  const [tab, setTab] = useState<TabId>('treino')
  const index = TABS.findIndex((t) => t.id === tab)
  const current = TABS[index]!
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  function onKey(e: KeyboardEvent) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = (index + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length
    setTab(TABS[next]!.id)
    refs.current[next]?.focus()
  }

  return (
    <section id="demo" className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-24 md:px-8 md:py-32">
      <SectionHead
        center
        title="Experimente antes de criar a conta"
        text="Toque nos botões e veja o Areté responder, do mesmo jeito que no app."
        className="mx-auto"
      />

      <Reveal delay={120} className="mt-12 flex justify-center">
        <div role="tablist" aria-label="Áreas do app" onKeyDown={onKey} className="relative grid grid-cols-3 rounded-full border border-line bg-surface/70 p-1.5 backdrop-blur">
          <span
            aria-hidden="true"
            className="absolute top-1.5 bottom-1.5 left-1.5 rounded-full bg-[linear-gradient(180deg,var(--color-laurel-hi),var(--color-laurel))] shadow-[0_6px_20px_rgba(140,192,132,0.35)] transition-transform duration-500 ease-[cubic-bezier(0.2,0.9,0.3,1.1)]"
            style={{ width: 'calc((100% - 0.75rem) / 3)', transform: `translateX(${index * 100}%)` }}
          />
          {TABS.map((t, i) => {
            const Icon = t.icon
            const active = t.id === tab
            return (
              <button
                key={t.id}
                ref={(el) => {
                  refs.current[i] = el
                }}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={active}
                aria-controls={`panel-${t.id}`}
                tabIndex={active ? 0 : -1}
                onClick={() => setTab(t.id)}
                className={cn(
                  'relative z-10 flex cursor-pointer items-center justify-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-semibold transition-colors sm:px-6',
                  active ? 'text-on-laurel' : 'text-text-2 hover:text-text',
                )}
              >
                <Icon size={17} className="hidden sm:block" />
                {t.label}
              </button>
            )
          })}
        </div>
      </Reveal>

      <Reveal delay={200} className="mt-10">
        <div
          role="tabpanel"
          id={`panel-${tab}`}
          aria-labelledby={`tab-${tab}`}
          className="grid items-center gap-10 rounded-[32px] border border-line bg-[linear-gradient(160deg,rgb(28_38_25/0.85),var(--color-surface)_55%)] p-5 md:grid-cols-[0.9fr_1.1fr] md:gap-12 md:p-10"
        >
          <div key={tab} className="flex animate-[fade-swap_500ms_ease-out_both] flex-col gap-4">
            <h3 className="m-0 font-display text-[28px] leading-tight font-semibold md:text-[34px]">{current.title}</h3>
            <p className="m-0 max-w-[42ch] leading-relaxed text-text-2">{current.text}</p>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 pt-2">
              {current.points.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-[15px]">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-laurel text-on-laurel">
                    <IconCheck size={12} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div key={`${tab}-demo`} className="animate-[fade-swap_500ms_ease-out_80ms_both]">
            {tab === 'treino' && <TrainingDemo />}
            {tab === 'cardio' && <CardioDemo />}
            {tab === 'alimentacao' && <NutritionDemo />}
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function DemoCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('gold-edge stone flex flex-col gap-5 rounded-[26px] border border-line bg-bg/70 p-5 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)] md:p-6', className)}>
      {children}
    </div>
  )
}

/* ---------------- Treino: a escada ---------------- */

interface Step {
  mark: number
  load: number
}
const FIRST_LOAD = 40
const START: Step[] = [40, 42.5, 45, 47.5, 50].map((load, i) => ({ mark: i + 1, load }))
const VISIBLE = 7
const CEILING = 300

function TrainingDemo() {
  const [steps, setSteps] = useState(START)
  const [climbed, setClimbed] = useState(false)
  const top = steps[steps.length - 1] ?? START[0]!
  const loads = steps.map((s) => s.load)
  const min = Math.min(...loads)
  const max = Math.max(...loads)

  function climb() {
    if (top.load >= CEILING) return
    setClimbed(true)
    setSteps((prev) => {
      const last = prev[prev.length - 1]!
      const next = [...prev, { mark: last.mark + 1, load: last.load + 2.5 }]
      return next.length > VISIBLE ? next.slice(1) : next
    })
  }

  return (
    <DemoCard>
      <div className="flex items-center gap-4">
        <div key={top.mark} className="animate-[laurel-in_520ms_cubic-bezier(0.2,0.9,0.3,1.2)_both]">
          <Medal size={74} className="gold-sheen">
            <span className="font-display text-[22px] leading-none font-semibold tabular">{formatKg(top.load)}</span>
            <span className="text-[10px] font-bold tracking-[0.15em]">KG</span>
          </Medal>
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="m-0 font-display text-xl font-semibold">Supino reto</p>
          <p className="m-0 text-sm text-muted">
            Marco {toRoman(top.mark)}, <span className="font-semibold text-laurel">+{formatKg(top.load - FIRST_LOAD)} kg</span> desde o primeiro
          </p>
          {climbed && <PersonalRecordBadge key={top.mark} />}
        </div>
      </div>

      <div className="flex h-48 items-end md:h-56" role="img" aria-label={`Escada de cargas: ${loads.map(formatKg).join(', ')} kg`}>
        {steps.map((s, i) => {
          const isTop = i === steps.length - 1
          const height = 22 + ((s.load - min) / Math.max(max - min, 1)) * 78
          return (
            <div key={s.mark} className="flex h-full flex-1 flex-col justify-end animate-[rise_520ms_cubic-bezier(0.2,0.8,0.2,1)_both]">
              <span className={cn('mb-1.5 text-center text-[11px] tabular', isTop ? 'font-semibold text-bronze' : 'text-laurel/80')}>
                {formatKg(s.load)}
              </span>
              <div
                className={cn(
                  'border-t transition-[height] duration-500 ease-out',
                  i > 0 && 'border-l border-l-bg/60',
                  isTop
                    ? 'border-t-bronze bg-[linear-gradient(180deg,rgb(216_180_90/0.35),var(--color-bronze-soft))] shadow-[0_-12px_32px_rgba(216,180,90,0.25)]'
                    : 'border-t-laurel/70 bg-[linear-gradient(180deg,var(--color-laurel-low),var(--color-laurel-soft))]',
                )}
                style={{ height: `${height}%` }}
              >
                <span className={cn('inscription block pt-2 text-center text-[11px]', isTop ? 'text-bronze' : 'text-laurel-hi/70')}>
                  {toRoman(s.mark)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {climbed && (
          <Button variant="ghost" size="sm" onClick={() => (setSteps(START), setClimbed(false))}>
            Recomeçar
          </Button>
        )}
        <Button size="sm" onClick={climb} disabled={top.load >= CEILING}>
          Registrar +2,5 kg
        </Button>
      </div>
      <p className="sr-only" aria-live="polite">
        {climbed ? `Novo recorde: ${formatKg(top.load)} kg.` : ''}
      </p>
    </DemoCard>
  )
}

/* ---------------- Cardio: o anel da semana ---------------- */

const CARDIO_GOAL = 150
const WEIGHT = 75
const ACTIVITIES = [
  { label: 'Esteira', minutes: 30, met: 6 },
  { label: 'Bike', minutes: 20, met: 7 },
  { label: 'Corrida', minutes: 15, met: 9.8 },
]
const DAYS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
const TODAY = 3
const CARDIO_START = [30, 0, 25, 0, 0, 0, 0]

function CardioDemo() {
  const [days, setDays] = useState(CARDIO_START)
  const [kcal, setKcal] = useState(Math.round((6 * WEIGHT * 55) / 60))
  const total = days.reduce((a, b) => a + b, 0)
  const done = total >= CARDIO_GOAL
  const peak = Math.max(60, ...days)

  function add(a: (typeof ACTIVITIES)[number]) {
    setDays((d) => d.map((v, i) => (i === TODAY ? Math.min(v + a.minutes, 240) : v)))
    setKcal((k) => k + Math.round((a.met * WEIGHT * a.minutes) / 60))
  }

  return (
    <DemoCard>
      <div className="flex items-center gap-5">
        <Ring
          value={total / CARDIO_GOAL}
          size={150}
          stroke={9}
          label={`${total} de ${CARDIO_GOAL} minutos`}
          color={done ? 'var(--color-bronze)' : 'var(--color-laurel)'}
          wreath={{ color: done ? 'var(--color-bronze)' : 'var(--color-laurel)', lit: total / CARDIO_GOAL }}
        >
          <span className="font-display text-[30px] leading-none font-semibold tabular">{total}</span>
          <span className="text-xs text-muted">de {CARDIO_GOAL} min</span>
        </Ring>
        <div className="flex flex-col gap-2">
          <p className="m-0 text-sm text-muted">Esta semana</p>
          <p className="m-0 font-display text-2xl font-semibold tabular">{formatInt(kcal)} kcal</p>
          {done ? (
            <span key="done" className="inline-flex w-fit animate-[laurel-in_420ms_ease-out] items-center gap-1.5 rounded-full border border-bronze-line bg-bronze-soft py-1 pr-2.5 pl-2 text-xs font-semibold text-bronze">
              <Laurel />
              Meta batida
            </span>
          ) : (
            <p className="m-0 text-sm text-laurel">Faltam {CARDIO_GOAL - total} min</p>
          )}
        </div>
      </div>

      <div className="flex h-24 items-end gap-2" aria-hidden="true">
        {days.map((m, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex h-16 w-full items-end rounded-md bg-surface-2">
              <div
                className={cn('w-full rounded-md transition-[height] duration-700 ease-out', i === TODAY ? 'bg-laurel' : 'bg-laurel-mid')}
                style={{ height: `${(m / peak) * 100}%` }}
              />
            </div>
            <span className={cn('text-[11px]', i === TODAY ? 'font-bold text-laurel' : 'text-faint')}>{DAYS[i]}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {ACTIVITIES.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={() => add(a)}
            disabled={(days[TODAY] ?? 0) >= 240}
            className="flex cursor-pointer flex-col items-center gap-0.5 rounded-2xl border border-laurel/35 bg-laurel-soft py-2.5 transition-[background-color,transform] duration-200 hover:bg-laurel-low active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="text-sm font-semibold text-laurel-hi">{a.label}</span>
            <span className="text-xs text-text-2">+{a.minutes} min</span>
          </button>
        ))}
      </div>
      {total !== 55 && (
        <Button variant="ghost" size="sm" className="-mt-2 self-end" onClick={() => (setDays(CARDIO_START), setKcal(Math.round((6 * WEIGHT * 55) / 60)))}>
          Recomeçar
        </Button>
      )}
    </DemoCard>
  )
}

/* ---------------- Alimentação: a dieta do dia ---------------- */

const KCAL_TARGET = 2100
const MACRO_TARGETS = { proteinG: 140, carbsG: 250, fatG: 60 }
const MEALS = [
  { name: 'Café da manhã', desc: 'Pão integral, ovos e café', kcal: 430, proteinG: 28, carbsG: 45, fatG: 15 },
  { name: 'Almoço', desc: 'Arroz, feijão, frango e salada', kcal: 690, proteinG: 50, carbsG: 80, fatG: 17 },
  { name: 'Lanche da tarde', desc: 'Iogurte, banana e aveia', kcal: 330, proteinG: 18, carbsG: 52, fatG: 6 },
  { name: 'Jantar', desc: 'Batata-doce, carne e legumes', kcal: 610, proteinG: 42, carbsG: 62, fatG: 19 },
]

function NutritionDemo() {
  const [eaten, setEaten] = useState([true, false, false, false])
  const totals = MEALS.reduce(
    (acc, m, i) =>
      eaten[i]
        ? { kcal: acc.kcal + m.kcal, proteinG: acc.proteinG + m.proteinG, carbsG: acc.carbsG + m.carbsG, fatG: acc.fatG + m.fatG }
        : acc,
    { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  )
  const onTarget = Math.abs(totals.kcal - KCAL_TARGET) <= KCAL_TARGET * 0.1

  return (
    <DemoCard>
      <div className="flex items-center gap-4">
        <Ring
          value={totals.kcal / KCAL_TARGET}
          size={132}
          stroke={8}
          label={`${totals.kcal} de ${KCAL_TARGET} quilocalorias`}
          color={onTarget ? 'var(--color-bronze)' : 'var(--color-accent)'}
          wreath={{ color: onTarget ? 'var(--color-bronze)' : 'var(--color-laurel)', lit: totals.kcal / KCAL_TARGET }}
        >
          <span className="font-display text-[24px] leading-none font-semibold tabular">{formatInt(totals.kcal)}</span>
          <span className="text-[11px] text-muted">de {formatInt(KCAL_TARGET)}</span>
        </Ring>
        <MacroColumns
          total={{ kcal: totals.kcal, proteinG: totals.proteinG, carbsG: totals.carbsG, fatG: totals.fatG }}
          targets={{ kcal: KCAL_TARGET, ...MACRO_TARGETS }}
        />
      </div>

      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {MEALS.map((m, i) => {
          const on = eaten[i]
          return (
            <li key={m.name}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => setEaten((e) => e.map((v, j) => (j === i ? !v : v)))}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors',
                  on ? 'border-laurel/40 bg-laurel-soft' : 'border-line bg-surface hover:border-line-strong',
                )}
              >
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full border transition-all duration-300',
                    on ? 'scale-100 border-laurel bg-laurel text-on-laurel' : 'border-line-strong text-transparent',
                  )}
                >
                  <IconCheck size={13} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[15px] font-semibold">{m.name}</span>
                  <span className="truncate text-xs text-muted">{m.desc}</span>
                </span>
                <span className={cn('text-sm tabular', on ? 'text-laurel' : 'text-faint')}>{m.kcal} kcal</span>
              </button>
            </li>
          )
        })}
      </ul>
      <p className="m-0 text-center text-sm" aria-live="polite">
        {onTarget ? <span className="font-semibold text-bronze">Na meta do dia.</span> : <span className="text-muted">Marque as refeições que você fez.</span>}
      </p>
    </DemoCard>
  )
}
