import { todayISO } from '@/lib/dates'
import { maximOfDay } from '@/lib/maxims'

/** Máxima do dia, com capitular em Cinzel dourado. */
export function MaximOfDay() {
  const m = maximOfDay(todayISO())
  const first = m.text.charAt(0)
  const rest = m.text.slice(1)
  return (
    <figure className="m-0 flex flex-col gap-2 px-1 py-2">
      <blockquote className="m-0 font-display text-[16px] leading-relaxed text-text-2 italic">
        <span aria-hidden="true" className="inscription float-left mt-1 mr-2 text-[40px] leading-[0.8] font-bold text-bronze not-italic">
          {first}
        </span>
        <span className="sr-only">{first}</span>
        {rest}
      </blockquote>
      <figcaption className="eyebrow text-right text-[10px]">
        {m.author} · <span className="normal-case tracking-normal italic">{m.source}</span>
      </figcaption>
    </figure>
  )
}
