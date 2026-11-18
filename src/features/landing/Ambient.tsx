import { useEffect, useState, type CSSProperties } from 'react'
import { useInView } from './hooks'

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/** Grão de pedra fixo sobre a página. */
export function Grain() {
  return <div aria-hidden="true" className="grain pointer-events-none fixed inset-0 z-[70]" />
}

/* ---------------- Progresso da rolagem ---------------- */

/** Barra fina no topo, do louro ao ouro, que enche conforme a página rola. */
export function ScrollProgress() {
  const [p, setP] = useState(0)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      setP(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0)
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
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[60] h-[3px]">
      <div className="h-full origin-left bg-[linear-gradient(90deg,var(--color-laurel),var(--color-bronze-hi))]" style={{ transform: `scaleX(${p})` }} />
    </div>
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
