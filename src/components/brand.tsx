import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** Moeda (a tetradracma do Areté) + nome. */
export function Logo({ withName = true, className, size = 42 }: { withName?: boolean; className?: string; size?: number }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <img
        src="/icons/coin.svg"
        width={size}
        height={size}
        alt={withName ? '' : 'Areté'}
        className="shrink-0 drop-shadow-[0_0_14px_rgba(216,180,90,0.28)]"
      />
      {withName && (
        <div className="flex flex-col leading-[1.05]">
          <span className="inscription text-[19px] font-semibold tracking-[0.18em]">ARETÉ</span>
          <span className="font-display text-xs text-muted italic">ἀρετή · excelência</span>
        </div>
      )}
    </div>
  )
}

/** Divisor: meandro curto dos dois lados de um losango. */
export function Meander({ className }: { className?: string }) {
  const id = useId()
  return (
    <div className={cn('flex items-center gap-3', className)} aria-hidden="true">
      <svg className="h-2.5 flex-1">
        <defs>
          <pattern id={`${id}-l`} width="20" height="10" patternUnits="userSpaceOnUse">
            <path d="M0 9 H18 V1 H6 V6 H12 V4" fill="none" stroke="var(--color-meander)" strokeWidth="1.2" />
          </pattern>
        </defs>
        <rect width="100%" height="10" fill={`url(#${id}-l)`} />
      </svg>
      <svg width="12" height="12" viewBox="0 0 12 12">
        <path d="M6 0.5 L11.5 6 L6 11.5 L0.5 6 Z" fill="none" stroke="var(--color-bronze)" strokeWidth="1.2" />
        <circle cx="6" cy="6" r="1.4" fill="var(--color-bronze)" />
      </svg>
      <svg className="h-2.5 flex-1 -scale-x-100">
        <rect width="100%" height="10" fill={`url(#${id}-l)`} />
      </svg>
    </div>
  )
}

/** Ramo de louros pequeno (selos e badges). */
export function Laurel({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={(size * 28) / 36} viewBox="0 0 36 28" fill="none" aria-hidden="true" className={className}>
      <path d="M17 26C9 24 4 17 5 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M19 26c8-2 13-9 12-18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="5" cy="6" rx="2" ry="3.6" fill="currentColor" />
      <ellipse cx="4" cy="13" rx="2" ry="3.4" fill="currentColor" transform="rotate(-30 4 13)" />
      <ellipse cx="7" cy="19.5" rx="2" ry="3.2" fill="currentColor" transform="rotate(-55 7 19.5)" />
      <ellipse cx="31" cy="6" rx="2" ry="3.6" fill="currentColor" />
      <ellipse cx="32" cy="13" rx="2" ry="3.4" fill="currentColor" transform="rotate(30 32 13)" />
      <ellipse cx="29" cy="19.5" rx="2" ry="3.2" fill="currentColor" transform="rotate(55 29 19.5)" />
    </svg>
  )
}

/**
 * Coroa de louros em volta de um círculo, aberta no topo.
 * `lit` (0–1) acende as folhas de baixo para cima; o resto fica apagado.
 */
export function Wreath({
  size,
  color = 'var(--color-laurel)',
  lit = 1,
  leaves = 8,
  className,
}: {
  size: number
  color?: string
  lit?: number
  leaves?: number
  className?: string
}) {
  const c = size / 2
  const leafRy = size * 0.055
  const leafRx = leafRy * 0.47
  const span = 112 // graus de cada lado, a partir da base
  const step = span / leaves
  const litCount = Math.round(Math.max(0, Math.min(1, lit)) * leaves)
  const items = Array.from({ length: leaves }, (_, i) => {
    const angle = step * (i + 0.5) // 0 = base
    return { angle, on: i < litCount }
  })
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className={cn('pointer-events-none absolute inset-0', className)}>
      {[-1, 1].map((side) =>
        items.map(({ angle, on }, i) => (
          <ellipse
            key={`${side}-${i}`}
            cx={c}
            cy={size - leafRy * 1.1}
            rx={leafRx}
            ry={leafRy}
            fill={on ? color : 'var(--color-line-strong)'}
            opacity={on ? 0.55 + (i / leaves) * 0.45 : 0.6}
            transform={`rotate(${side * angle} ${c} ${c}) rotate(${side * 32} ${c} ${size - leafRy * 1.1})`}
            className="transition-[fill] duration-500"
          />
        )),
      )}
    </svg>
  )
}

/** Anel de progresso (0–1). Com `wreath`, ganha a coroa de louros em volta. */
export function Ring({
  value,
  size = 72,
  stroke = 7,
  label,
  color = 'var(--color-accent)',
  wreath,
  children,
}: {
  value: number
  size?: number
  stroke?: number
  label: string
  color?: string
  wreath?: { color?: string; lit?: number }
  children?: ReactNode
}) {
  const inset = wreath ? size * 0.13 : 0
  const inner = size - inset * 2
  const r = (inner - stroke) / 2
  const circ = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(1, value))
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {wreath && <Wreath size={size} color={wreath.color} lit={wreath.lit ?? 1} />}
      <svg
        width={inner}
        height={inner}
        viewBox={`0 0 ${inner} ${inner}`}
        role="img"
        aria-label={label}
        className="absolute"
        style={{ left: inset, top: inset }}
      >
        <circle cx={inner / 2} cy={inner / 2} r={r} fill="none" stroke="var(--color-line)" strokeWidth={stroke} />
        {/* Sem progresso, a ponta arredondada viraria um ponto solto: não desenha. */}
        {clamped > 0 && (
          <circle
            cx={inner / 2}
            cy={inner / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${clamped * circ} ${circ}`}
            transform={`rotate(-90 ${inner / 2} ${inner / 2})`}
            className="transition-[stroke-dasharray] duration-700 ease-out"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}

/** Medalha dourada com a carga (Glória, Panteão). */
export function Medal({ children, size = 58, className }: { children: ReactNode; size?: number; className?: string }) {
  return (
    <div
      className={cn(
        'flex shrink-0 flex-col items-center justify-center rounded-full text-on-bronze',
        'bg-[radial-gradient(circle_at_35%_30%,var(--color-bronze-hi)_0%,var(--color-bronze)_45%,var(--color-bronze-deep)_100%)]',
        'shadow-[0_0_0_3px_var(--color-surface),0_0_0_4px_rgba(216,180,90,0.55),0_6px_14px_rgba(216,180,90,0.22)]',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {children}
    </div>
  )
}

export function PersonalRecordBadge() {
  return (
    <span className="inline-flex animate-[laurel-in_420ms_ease-out] items-center gap-1.5 rounded-full border border-bronze-line bg-bronze-soft py-1 pr-2.5 pl-2 text-xs font-semibold text-bronze">
      <Laurel />
      Recorde pessoal
    </span>
  )
}

/** Número que sobe de 0 até o valor ao aparecer (~450 ms). Respeita "reduzir movimento". */
export function CountUp({ value, format, duration = 450 }: { value: number; format: (n: number) => string; duration?: number }) {
  const [reduce] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
  const [shown, setShown] = useState(reduce ? value : 0)
  const from = useRef(0)
  useEffect(() => {
    if (reduce || !Number.isFinite(value)) return
    const start = performance.now()
    const origin = from.current
    let frame = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setShown(origin + (value - origin) * eased)
      if (t < 1) frame = requestAnimationFrame(tick)
      else from.current = value
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration, reduce])
  return <>{format(reduce || !Number.isFinite(value) ? value : shown)}</>
}

/** Coluna grega em traço fino, para estados vazios. */
export function ColumnArt({ className }: { className?: string }) {
  return (
    <svg width="56" height="84" viewBox="0 0 56 84" fill="none" aria-hidden="true" className={className}>
      <path d="M4 8h48M8 4h40v4M10 12h36" stroke="var(--color-meander)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 12v58M22 12v58M28 12v58M34 12v58M42 12v58" stroke="var(--color-line-strong)" strokeWidth="1.5" />
      <path d="M10 70h36M8 74h40M4 78h48" stroke="var(--color-meander)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M28 12v58" stroke="var(--color-bronze)" strokeWidth="1.5" opacity="0.5" />
    </svg>
  )
}
