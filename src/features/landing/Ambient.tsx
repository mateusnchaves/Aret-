import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { cn } from '@/lib/cn'
import { useInView } from './hooks'

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/** Grão de pedra fixo sobre a página. */
export function Grain() {
  return <div aria-hidden="true" className="grain pointer-events-none fixed inset-0 z-[70]" />
}

/* ---------------- Monte Olimpo: o progresso da rolagem ---------------- */

// Trilha em zigue-zague subindo a montanha (viewBox 0 0 120 300).
const TRAIL = 'M60 288 C24 270 96 252 60 234 C32 218 88 200 60 182 C40 166 80 148 60 130 C50 116 70 100 60 84 C55 70 65 56 60 40'
const MOUNTAIN = 'M0 296 L16 252 L26 260 L40 196 L48 204 L56 110 L60 40 L68 104 L76 96 L90 196 L100 188 L120 296 Z'

/**
 * Uma montanha na lateral: o ponto sobe a trilha conforme a página rola e,
 * no fim, a tocha do cume acende. No celular vira uma barra fina no topo.
 */
export function OlympusProgress() {
  const trail = useRef<SVGPathElement>(null)
  const [p, setP] = useState(0)
  const [point, setPoint] = useState({ x: 60, y: 288 })

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      setP(value)
      const path = trail.current
      if (path) {
        const at = path.getPointAtLength(path.getTotalLength() * value)
        setPoint({ x: at.x, y: at.y })
      }
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

  const summit = p > 0.97

  return (
    <>
      {/* Celular e tablet: barra no topo, do louro ao ouro. */}
      <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[60] h-[3px] xl:hidden">
        <div className="h-full origin-left bg-[linear-gradient(90deg,var(--color-laurel),var(--color-bronze-hi))]" style={{ transform: `scaleX(${p})` }} />
      </div>

      {/* Telas largas: a montanha na lateral direita. */}
      <div aria-hidden="true" className="pointer-events-none fixed top-1/2 right-5 z-40 hidden -translate-y-1/2 flex-col items-center gap-2 xl:flex">
        <span className={cn('inscription text-[10px] font-bold tracking-[0.3em] transition-colors duration-500', summit ? 'text-bronze' : 'text-faint')}>
          ΟΛΥΜΠΟΣ
        </span>
        <svg width="84" height="210" viewBox="0 0 120 300" className="overflow-visible">
          <defs>
            <linearGradient id="oly-m" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3a322c" />
              <stop offset="1" stopColor="#1e1a17" />
            </linearGradient>
          </defs>
          <path d={MOUNTAIN} fill="url(#oly-m)" stroke="var(--color-line-strong)" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M60 40 L67 82 L62 76 L57 86 L53 78 Z" fill="#e8dcc8" opacity="0.45" />
          <path ref={trail} d={TRAIL} fill="none" stroke="var(--color-line-strong)" strokeWidth="1.6" strokeDasharray="2 4" />
          <path
            d={TRAIL}
            fill="none"
            stroke="var(--color-laurel)"
            strokeWidth="2"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={1 - p}
          />
          {/* Tocha no cume. */}
          <g transform="translate(60 40)">
            <rect x="-1.5" y="-12" width="3" height="12" fill="#8c7f71" />
            <g style={{ transformOrigin: '0 -12px', transformBox: 'view-box' }} className={cn('transition-opacity duration-700', summit ? 'opacity-100' : 'opacity-0')}>
              <path d="M0 -30 C6 -22 6 -16 0 -12 C-6 -16 -6 -22 0 -30 Z" fill="#e8936b" className="animate-[flicker_0.9s_ease-in-out_infinite]" style={{ transformOrigin: '0 -12px' }} />
              <path d="M0 -24 C3 -19 3 -15 0 -13 C-3 -15 -3 -19 0 -24 Z" fill="#fff0bd" />
              <circle cx="0" cy="-20" r="16" fill="#d8b45a" opacity="0.18" />
            </g>
          </g>
          <circle cx={point.x} cy={point.y} r="5" fill={summit ? 'var(--color-bronze)' : 'var(--color-laurel)'} stroke="var(--color-bg)" strokeWidth="2" />
          <circle cx={point.x} cy={point.y} r="10" fill={summit ? 'var(--color-bronze)' : 'var(--color-laurel)'} opacity="0.2" />
        </svg>
        <span className="text-[11px] text-muted tabular">{Math.round(p * 100)}%</span>
      </div>
    </>
  )
}

/* ---------------- Folhas de louro ---------------- */

interface Leaf {
  id: number
  left: number
  size: number
  duration: number
  dx: number
  rot: number
  opacity: number
  gold: boolean
  delay: number
}

let leafId = 0
function makeLeaf(gold: boolean, delay = 0): Leaf {
  return {
    id: leafId++,
    left: Math.random() * 100,
    size: 12 + Math.random() * 12,
    duration: 9 + Math.random() * 6,
    dx: (Math.random() - 0.5) * 160,
    rot: 180 + Math.random() * 360,
    opacity: gold ? 0.9 : 0.35 + Math.random() * 0.25,
    gold,
    delay,
  }
}

function LeafShape({ leaf, fall }: { leaf: Leaf; fall: string }) {
  return (
    <span
      className="absolute top-0"
      style={
        {
          left: `${leaf.left}%`,
          '--dx': `${leaf.dx}px`,
          '--rot': `${leaf.rot}deg`,
          '--leaf-o': leaf.opacity,
          '--fall': fall,
          animation: `leaf-fall ${leaf.duration}s linear ${leaf.delay}ms both`,
        } as CSSProperties
      }
    >
      <span className="block" style={{ animation: `leaf-sway ${2.4 + (leaf.id % 3) * 0.6}s ease-in-out infinite` }}>
        <svg width={leaf.size} height={leaf.size * 2} viewBox="0 0 12 24">
          <path d="M6 0 C11 6 11 16 6 24 C1 16 1 6 6 0 Z" fill={leaf.gold ? '#d8b45a' : '#6f9e63'} />
          <path d="M6 2 V22" stroke={leaf.gold ? '#9c7a2e' : '#3e5c37'} strokeWidth="0.8" />
        </svg>
      </span>
    </span>
  )
}

/** De vez em quando, uma folha de louro atravessa a tela. Discreto e nunca em cima de nada clicável. */
export function LaurelRain() {
  const [leaves, setLeaves] = useState<Leaf[]>([])
  useEffect(() => {
    if (reducedMotion()) return
    const spawn = () => setLeaves((prev) => [...prev.slice(-5), makeLeaf(false)])
    const first = setTimeout(spawn, 2500)
    const timer = setInterval(spawn, 6500)
    return () => {
      clearTimeout(first)
      clearInterval(timer)
    }
  }, [])
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {leaves.map((l) => (
        <LeafShape key={l.id} leaf={l} fall="112vh" />
      ))}
    </div>
  )
}

/** Chuva de folhas douradas, uma vez, quando o elemento aparece. */
export function LeafBurst({ count = 26 }: { count?: number }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.5)
  const [leaves, setLeaves] = useState<Leaf[]>([])
  useEffect(() => {
    if (!inView || reducedMotion()) return
    const t = setTimeout(() => setLeaves(Array.from({ length: count }, (_, i) => makeLeaf(true, i * 90))), 0)
    return () => clearTimeout(t)
  }, [inView, count])
  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]">
      {leaves.map((l) => (
        <LeafShape key={l.id} leaf={{ ...l, duration: 4 + (l.id % 5) * 0.7 }} fall="620px" />
      ))}
    </div>
  )
}
