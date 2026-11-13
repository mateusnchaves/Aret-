import { Link } from 'react-router'
import { Card, Eyebrow } from '@/components/ui/surface'
import { todayISO } from '@/lib/dates'
import { formatInt } from '@/lib/format'
import { totalOf, useDiary, useNutritionTargets } from './data'
import { MacroBars } from './MacroBars'

/** Card do Início: calorias e macros de hoje. */
export function NutritionCard() {
  const diary = useDiary(todayISO())
  const targets = useNutritionTargets()
  const total = totalOf(diary.data ?? [])

  return (
    <Link to="/alimentacao" className="no-underline">
      <Card className="flex h-full flex-col gap-2.5 p-4 text-text">
        <Eyebrow>Hoje</Eyebrow>
        <div className="flex flex-col gap-0.5">
          <span className="font-display text-[26px] leading-[1.1] font-semibold tabular">{formatInt(total.kcal)}</span>
          <span className="text-[13px] text-muted">{targets ? `de ${formatInt(targets.kcal)} kcal` : 'kcal'}</span>
        </div>
        {targets && <MacroBars total={total} targets={targets} compact />}
      </Card>
    </Link>
  )
}
