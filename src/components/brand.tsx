import { useId } from 'react'
import { cn } from '@/lib/cn'

/** Monograma Α + nome. */
export function Logo({ withName = true, className }: { withName?: boolean; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="flex size-9 items-center justify-center rounded-[10px] border border-accent font-display text-[22px] font-semibold text-accent">
        Α
      </div>
      {withName && <span className="font-display text-[22px] font-semibold tracking-[0.02em]">Areté</span>}
    </div>
  )
}

/** Meandro grego — só como divisor fino. */
export function Meander({ className }: { className?: string }) {
  const id = useId()
  return (
    <svg className={cn('block h-2.5 w-full', className)} aria-hidden="true">
      <defs>
        <pattern id={id} width="20" height="10" patternUnits="userSpaceOnUse">
          <path d="M0 9 H18 V1 H6 V6 H12 V4" fill="none" stroke="var(--color-meander)" strokeWidth="1.2" />
        </pattern>
      </defs>
      <rect width="100%" height="10" fill={`url(#${id})`} />
    </svg>
  )
}

/** Coroa de louros — reservada para conquistas. */
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

export function PersonalRecordBadge() {
  return (
    <span className="inline-flex animate-[laurel-in_420ms_ease-out] items-center gap-1.5 rounded-full border border-bronze-line bg-bronze-soft py-1 pr-2.5 pl-2 text-xs font-semibold text-bronze">
      <Laurel />
      Recorde pessoal
    </span>
  )
}

/** Anel de progresso (0–1). */
export function Ring({
  value,
  size = 72,
  stroke = 7,
  label,
  children,
}: {
  value: number
  size?: number
  stroke?: number
  label: string
  children?: React.ReactNode
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(1, value))
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${clamped * c} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-[stroke-dasharray] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}
