import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Medal, Ring } from '@/components/brand'
import { IconArrowUp, IconCheck } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import { Aurora, PhoneFrame } from './parts'

const WORDS = [
  { text: 'no treino.', className: 'text-accent-hi' },
  { text: 'no cardio.', className: 'text-laurel' },
  { text: 'na dieta.', className: 'text-bronze' },
]

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

export function Hero({ cta }: { cta: { to: string; label: string } }) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIndex((n) => (n + 1) % WORDS.length), 2600)
    return () => clearInterval(t)
  }, [])
  const word = WORDS[index]!

  return (
    <section className="relative isolate">
      <Aurora />
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-5 pt-8 pb-20 md:grid-cols-[1.08fr_1fr] md:gap-10 md:px-8 md:pt-14 md:pb-28">
        <div className="flex flex-col items-start gap-6">
          <a
            href="#coroa"
            className="hero-in group inline-flex items-center gap-2.5 rounded-full border border-laurel/30 bg-laurel-soft/80 py-1 pr-3.5 pl-1 text-sm text-text-2 backdrop-blur transition-colors hover:border-laurel/60"
            style={delay(0)}
          >
            <span className="rounded-full bg-laurel px-2 py-0.5 text-xs font-bold text-on-laurel">Novo</span>
            Coroa da semana e Panteão
          </a>

          <h1 className="hero-in m-0 font-display text-[46px] leading-[1.02] font-semibold tracking-[-0.02em] sm:text-[56px] md:text-[70px]" style={delay(90)}>
            <span className="sr-only">Acompanhe sua evolução no treino, no cardio e na dieta.</span>
            <span aria-hidden="true">
              Acompanhe sua <span className="text-gradient-laurel">evolução</span>
              <span className="relative block h-[1.12em] overflow-hidden">
                <span key={index} className={cn('absolute inset-x-0 top-0 animate-[word-in_650ms_cubic-bezier(0.2,0.8,0.2,1)_both]', word.className)}>
                  {word.text}
                </span>
              </span>
            </span>
          </h1>

          <p className="hero-in m-0 max-w-[46ch] text-[17px] leading-relaxed text-text-2 md:text-lg" style={delay(180)}>
            Cargas, cardio e alimentação num só lugar. O Areté mostra o quanto você subiu, avisa quando um exercício estagnou
            e transforma cada recorde num momento de glória.
          </p>

          <div className="hero-in flex flex-wrap items-center gap-3 pt-1" style={delay(270)}>
            <Button asChild size="lg" className="px-7">
              <Link to={cta.to}>{cta.label}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-laurel/40 bg-laurel-soft/40 backdrop-blur hover:bg-laurel-soft">
              <a href="#demo">Experimentar a demo</a>
            </Button>
          </div>

          <ul className="hero-in m-0 flex list-none flex-wrap gap-x-5 gap-y-2 p-0 text-sm text-text-2" style={delay(360)}>
            {['Gratuito', 'Funciona sem sinal', 'Instala como app'].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <span className="flex size-5 items-center justify-center rounded-full bg-laurel/15 text-laurel">
                  <IconCheck size={12} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <HeroVisual />
      </div>
    </section>
  )
}

/** O celular inclina seguindo o cursor; os cartões flutuam em profundidades diferentes. */
function HeroVisual() {
  const ref = useRef<HTMLDivElement>(null)

  function move(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== 'mouse' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
    ref.current.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
  }
  function leave() {
    ref.current?.style.setProperty('--mx', '0')
    ref.current?.style.setProperty('--my', '0')
  }

  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={leave} className="relative mx-auto w-full max-w-[440px] [perspective:1400px]">
      <div aria-hidden="true" className="absolute inset-x-4 top-16 bottom-4 -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(140_192_132/0.38),transparent)] blur-2xl" />

      <div className="hero-in" style={delay(200)}>
        <div
          className="mx-auto w-[240px] transition-transform duration-500 ease-out sm:w-[270px] md:w-[290px]"
          style={{ transform: 'rotateY(calc(var(--mx, 0) * 16deg - 6deg)) rotateX(calc(var(--my, 0) * -10deg + 3deg))' }}
        >
          <PhoneFrame src="/landing/progressao.jpg" alt="Tela de progressão do Areté: supino reto em 60 kg com medalha de recorde e gráfico em degraus" eager />
        </div>
      </div>

      <Chip depth={46} enter={520} bob={0} className="top-[9%] -left-1 sm:left-0">
        <Medal size={42}>
          <span className="font-display text-[15px] leading-none font-bold">60</span>
        </Medal>
        <div>
          <p className="m-0 text-xs font-semibold text-bronze">Novo recorde</p>
          <p className="m-0 text-sm font-medium">Supino reto, 60 kg</p>
        </div>
      </Chip>

      <Chip depth={-34} enter={680} bob={1.2} className="top-[40%] -right-1 sm:right-0">
        <Ring value={1} size={50} stroke={4} label="Coroa da semana completa" color="var(--color-bronze)" wreath={{ color: 'var(--color-bronze)' }}>
          <span className="text-[11px] font-bold">3/3</span>
        </Ring>
        <div>
          <p className="m-0 text-xs font-semibold text-laurel">Coroa da semana</p>
          <p className="m-0 text-sm font-medium">Treino, cardio e dieta</p>
        </div>
      </Chip>

      <Chip depth={28} enter={840} bob={2.1} className="bottom-[22%] -left-2 hidden sm:flex">
        <StreakMini />
        <div>
          <p className="m-0 text-xs font-semibold text-laurel">Disciplina</p>
          <p className="m-0 text-sm font-medium">6 semanas seguidas</p>
        </div>
      </Chip>

      <Chip depth={-22} enter={1000} bob={0.6} className="right-2 bottom-[6%]">
        <span className="flex size-9 items-center justify-center rounded-full bg-laurel/15 text-laurel">
          <IconArrowUp size={18} />
        </span>
        <div>
          <p className="m-0 font-display text-lg leading-none font-semibold text-laurel">+10 kg</p>
          <p className="m-0 text-xs text-muted">desde agosto</p>
        </div>
      </Chip>
    </div>
  )
}

function Chip({
  depth,
  enter,
  bob,
  className,
  children,
}: {
  depth: number
  enter: number
  bob: number
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn('absolute z-10 flex', className)}
      style={{
        transform: `translate3d(calc(var(--mx, 0) * ${depth}px), calc(var(--my, 0) * ${depth}px), 0)`,
        transition: 'transform 500ms ease-out',
      }}
    >
      <div className="hero-in" style={delay(enter)}>
        <div
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-surface/75 py-2.5 pr-4 pl-2.5 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.75)] backdrop-blur-md"
          style={{ animation: `bob 6s ease-in-out ${bob}s infinite` }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

const STREAK = [1, 2, 2, 3, 2, 3, 3, 1, 2, 3, 3, 2, 3, 3]

function StreakMini() {
  const tones = ['bg-line-strong', 'bg-laurel-low', 'bg-laurel-mid', 'bg-laurel']
  return (
    <div className="grid grid-flow-col grid-rows-2 gap-[3px]" aria-hidden="true">
      {STREAK.map((level, i) => (
        <span key={i} className={cn('size-[9px] rounded-[2px]', tones[level])} />
      ))}
    </div>
  )
}
