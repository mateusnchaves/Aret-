import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { cn } from '@/lib/cn'

const STAGES = [
  { title: 'Pedra bruta', text: 'Todo começo é um bloco sem forma. A primeira carga, o primeiro treino.' },
  { title: 'Forma', text: 'Cada repetição tira um pedaço do que sobra. A evolução aparece aos poucos.' },
  { title: 'Glória', text: 'O que você repete vira quem você é. É isso que os gregos chamavam de areté.' },
]

/**
 * A estátua se esculpe com a rolagem: sai do bloco de pedra, vira mármore e termina em ouro,
 * coroada de louros. O progresso vai para a variável CSS --p (0 a 1); só a etapa vira estado.
 */
export function StatueSection() {
  const ref = useRef<HTMLElement>(null)
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let frame = 0
    const update = () => {
      frame = 0
      const r = el.getBoundingClientRect()
      const travel = r.height - window.innerHeight
      const p = Math.min(1, Math.max(0, -r.top / Math.max(travel, 1)))
      el.style.setProperty('--p', p.toFixed(3))
      setStage(p < 0.34 ? 0 : p < 0.7 ? 1 : 2)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <section ref={ref} aria-label="A forma se esculpe na repetição" className="relative h-[260vh] border-y border-line" style={{ '--p': 0 } as CSSProperties}>
      <div className="sticky top-0 flex h-dvh items-center overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_70%_50%,rgb(216_180_90/0.22),transparent_70%)]"
          style={{ opacity: 'var(--p)' }}
        />
        <div className="mx-auto grid w-full max-w-6xl items-center gap-6 px-5 md:grid-cols-[1fr_1.1fr] md:gap-12 md:px-8">
          <div className="order-2 flex flex-col gap-5 md:order-1">
            <h2 className="m-0 font-display text-[32px] leading-[1.06] font-semibold tracking-[-0.015em] text-balance md:text-[50px]">
              A forma se esculpe na repetição
            </h2>
            <ol className="m-0 flex list-none flex-col gap-1 p-0">
              {STAGES.map((s, i) => (
                <li
                  key={s.title}
                  className={cn(
                    'border-l-2 py-2 pl-4 transition-all duration-500 md:py-3',
                    i === stage ? 'border-laurel opacity-100' : 'border-line opacity-40',
                    i === 2 && i === stage && 'border-bronze',
                  )}
                >
                  <p className={cn('m-0 font-display text-xl font-semibold md:text-2xl', i === 2 && i === stage && 'text-gold')}>{s.title}</p>
                  <p
                    className={cn(
                      'm-0 max-w-[40ch] overflow-hidden text-[15px] leading-relaxed text-text-2 transition-all duration-500',
                      i === stage ? 'mt-1 max-h-24 opacity-100' : 'max-h-0 opacity-0',
                    )}
                  >
                    {s.text}
                  </p>
                </li>
              ))}
            </ol>
          </div>
          <div className="order-1 mx-auto w-[min(62vw,280px)] md:order-2 md:w-[min(40vw,420px)]">
            <Bust />
          </div>
        </div>
      </div>
    </section>
  )
}

/** Um layer some e outro aparece conforme --p: bloco → mármore → ouro → louros. */
const fade = (from: number, speed: number) => ({ opacity: `clamp(0, calc((var(--p) - ${from}) * ${speed}), 1)` }) as CSSProperties
const fadeOut = (until: number) => ({ opacity: `clamp(0, calc(1 - var(--p) / ${until}), 1)` }) as CSSProperties

const HEAD =
  'M120 52 C127 60 131 70 132 82 L146 108 L137 112 L139 118 L133 122 L137 127 C137 133 136 137 133 141 C128 146 122 148 117 150 L118 162 C119 172 121 182 124 196 L66 196 C69 182 72 168 72 156 C64 148 58 132 58 112 C58 76 82 48 120 52 Z'
const CURLS = [
  [76, 62, 11],
  [91, 51, 11],
  [107, 48, 10],
  [64, 78, 11],
  [60, 96, 10],
  [62, 113, 10],
  [68, 129, 9],
]
const LEAVES = [
  [64, 94, -62],
  [68, 80, -48],
  [75, 68, -34],
  [85, 59, -18],
  [97, 54, -2],
  [109, 54, 16],
  [119, 59, 34],
]

function Bust() {
  const shape = (fill: string, stroke = 'none') => (
    <g fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round">
      <path d={HEAD} />
      {CURLS.map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
      ))}
    </g>
  )
  return (
    <svg viewBox="30 20 150 230" className="h-auto w-full overflow-visible" role="img" aria-label="Busto clássico que passa de pedra a ouro">
      <defs>
        <linearGradient id="st-marble" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#efe9df" />
          <stop offset="0.55" stopColor="#c9c1b4" />
          <stop offset="1" stopColor="#8e877c" />
        </linearGradient>
        <linearGradient id="st-gold" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stopColor="#7f5f22" />
          <stop offset="0.5" stopColor="#d8b45a" />
          <stop offset="1" stopColor="#fff0bd" />
        </linearGradient>
        <filter id="st-veins" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="turbulence" baseFrequency="0.012 0.05" numOctaves="3" seed="4" />
          <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.33  0 0 0 0 0.3  0 0 0 -3 1.1" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <filter id="st-rough">
          <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="2" />
          <feDisplacementMap in="SourceGraphic" scale="9" />
        </filter>
      </defs>

      {/* Pedestal com a inscrição. */}
      <rect x="48" y="196" width="112" height="10" rx="2" fill="#3a322c" />
      <rect x="56" y="206" width="96" height="30" fill="#2e2722" />
      <rect x="44" y="236" width="120" height="10" rx="2" fill="#3a322c" />
      <text x="104" y="226" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="11" fontWeight="700" letterSpacing="5" fill="#8c7f71">
        ΑΡΕΤΗ
      </text>

      {/* Mármore com veios (aparece logo no início). */}
      <g style={fade(0.04, 4)}>
        {shape('url(#st-marble)', '#6f685e')}
        <g filter="url(#st-veins)" opacity="0.5">
          {shape('#000')}
        </g>
        <path d="M122 90 C125 87.5 129.5 87.5 132 90 C129 92 125 92 122 90 Z" fill="#6f685e" />
        <path d="M84 104 C80 108 80 118 86 122 C90 118 90 108 84 104 Z" fill="none" stroke="#6f685e" strokeWidth="2" />
      </g>

      {/* Ouro por cima do mármore, no fim. */}
      <g style={fade(0.62, 3)} className="mix-blend-normal">
        {shape('url(#st-gold)', '#5a3f12')}
        <path d="M122 90 C125 87.5 129.5 87.5 132 90 C129 92 125 92 122 90 Z" fill="#4a3410" />
        <path d="M84 104 C80 108 80 118 86 122 C90 118 90 108 84 104 Z" fill="none" stroke="#5a3f12" strokeWidth="2.2" />
      </g>

      {/* Louros: uma folha de cada vez. */}
      {LEAVES.map(([cx, cy, r], i) => (
        <ellipse
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          rx="4.6"
          ry="10.5"
          fill="#6f9e63"
          stroke="#2f4a2a"
          strokeWidth="1"
          transform={`rotate(${r} ${cx} ${cy})`}
          style={fade(0.42 + i * 0.05, 14)}
        />
      ))}

      {/* O bloco de pedra que esconde tudo no começo e se desfaz. */}
      <g style={fadeOut(0.3)} filter="url(#st-rough)">
        <rect x="50" y="38" width="104" height="160" rx="4" fill="#4a423b" />
        <rect x="50" y="38" width="104" height="160" rx="4" fill="url(#st-marble)" opacity="0.18" />
        <path d="M70 60 L95 92 M120 50 L108 120 M62 150 L140 170" stroke="#2e2722" strokeWidth="2" fill="none" opacity="0.7" />
      </g>
    </svg>
  )
}
