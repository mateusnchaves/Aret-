import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { monthLabel, parseISODate, toISODate, todayISO, formatShortDate } from '@/lib/dates'
import { formatKg } from '@/lib/format'
import type { LoadEntry } from '@/lib/types'

interface Point {
  t: number
  load: number
  label: string
  scheme: string
  isNow?: boolean
}

/** Gráfico em degraus: a carga fica constante até a próxima mudança, e o último degrau vai até hoje. */
export function LoadChart({ entries }: { entries: LoadEntry[] }) {
  const ascending = [...entries].reverse()
  const points: Point[] = ascending.map((e) => ({
    t: parseISODate(e.recorded_on).getTime(),
    load: e.load_kg,
    label: formatShortDate(e.recorded_on),
    scheme: `${e.sets} × ${e.reps}`,
  }))
  const last = points[points.length - 1]
  const now = parseISODate(todayISO()).getTime()
  if (last && now > last.t) points.push({ ...last, t: now, label: 'hoje', isNow: true })

  const loads = points.map((p) => p.load)
  const peakIndex = points.findIndex((p) => p.load === Math.max(...loads) && !p.isNow)
  const min = Math.min(...loads)
  const max = Math.max(...loads)
  // Marcas do eixo em múltiplos "de anilha" (2,5 / 5 / 10…), no máximo ~5 linhas.
  const step = [2.5, 5, 10, 20, 25, 50, 100].find((s) => (max - min + 2 * s) / s <= 5) ?? 100
  const lo = Math.max(0, Math.floor(min / step) * step - (min % step === 0 ? step : 0))
  const hi = Math.ceil(max / step) * step + (max % step === 0 ? step : 0)
  const ticks = Array.from({ length: Math.round((hi - lo) / step) + 1 }, (_, i) => lo + i * step)

  const description = ascending.map((e) => `${formatShortDate(e.recorded_on)}: ${formatKg(e.load_kg)} kg`).join(', ')

  return (
    <figure className="m-0" role="img" aria-label={`Carga ao longo do tempo. ${description}`}>
      <ResponsiveContainer width="100%" height={190}>
        <LineChart data={points} margin={{ top: 10, right: 12, bottom: 0, left: -8 }}>
          <CartesianGrid stroke="var(--color-line)" vertical={false} />
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(t: number) => monthLabel(toISODate(new Date(t)))}
            tick={{ fill: 'var(--color-faint)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            domain={[lo, hi]}
            ticks={ticks}
            tickFormatter={(v: number) => formatKg(v)}
            tick={{ fill: 'var(--color-faint)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
            allowDecimals
          />
          <Tooltip
            cursor={{ stroke: 'var(--color-line-strong)' }}
            content={({ active, payload }) => {
              const p = payload?.[0]?.payload as Point | undefined
              if (!active || !p) return null
              return (
                <div className="rounded-xl border border-line-strong bg-surface-2 px-3 py-2 text-xs">
                  <div className="text-muted">{p.label}</div>
                  <div className="font-display text-base font-semibold">{formatKg(p.load)} kg</div>
                  <div className="text-text-2">{p.scheme}</div>
                </div>
              )
            }}
          />
          <Line
            type="stepAfter"
            dataKey="load"
            stroke="var(--color-accent-hi)"
            strokeWidth={2.5}
            isAnimationActive
            animationDuration={600}
            dot={(props: { cx?: number; cy?: number; index?: number; payload?: Point }) => {
              const { cx, cy, index, payload } = props
              if (cx === undefined || cy === undefined || payload?.isNow) return <g key={`d-${index}`} />
              // O ponto mais alto (a primeira vez que a carga máxima apareceu) ganha a cor da glória.
              if (index === peakIndex && ascending.length >= 2) {
                return (
                  <g key={`d-${index}`}>
                    <circle cx={cx} cy={cy} r={11} fill="var(--color-bronze)" opacity={0.18} />
                    <circle cx={cx} cy={cy} r={5.5} fill="var(--color-bronze)" stroke="var(--color-bg)" strokeWidth={2} />
                  </g>
                )
              }
              return (
                <circle key={`d-${index}`} cx={cx} cy={cy} r={4} fill="var(--color-bg)" stroke="var(--color-accent-hi)" strokeWidth={2} />
              )
            }}
            activeDot={{ r: 5, fill: 'var(--color-accent)', stroke: 'var(--color-bg)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </figure>
  )
}
