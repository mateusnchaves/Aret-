import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { toRoman } from '@/lib/glory'
import { Bust } from './Statue'

const WORD = 'ARETÉ'
const YEAR = toRoman(new Date().getFullYear())
const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

/**
 * A abertura é um verbete: o nome do app gravado na pedra, com a definição embaixo,
 * e o busto ao lado sob uma luz só, como peça de museu.
 */
export function Hero({ cta }: { cta: { to: string; label: string } }) {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Uma única luz quente vindo de cima, à direita, sobre a estátua. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(42%_60%_at_76%_38%,rgb(216_180_90/0.17),transparent_70%),radial-gradient(70%_80%_at_20%_100%,rgb(0_0_0/0.45),transparent_70%)]"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-14 pb-20 md:grid-cols-[1.25fr_1fr] md:gap-8 md:px-8 md:pt-20 md:pb-28">
        <div className="flex flex-col">
          <h1 className="m-0">
            <span className="sr-only">Areté: a excelência alcançada pela prática constante.</span>
            <span aria-hidden="true" className="engraved inscription flex text-[64px] leading-none font-semibold tracking-[0.1em] sm:text-[96px] lg:text-[124px]">
              {WORD.split('').map((letter, i) => (
                <span key={i} className="inline-block animate-[carve_900ms_cubic-bezier(0.2,0.8,0.2,1)_both]" style={{ animationDelay: `${120 + i * 140}ms` }}>
                  {letter}
                </span>
              ))}
            </span>
          </h1>
          <span
            aria-hidden="true"
            className="mt-4 block h-px w-full max-w-[34rem] origin-left animate-[rule-draw_900ms_cubic-bezier(0.6,0,0.2,1)_900ms_both] bg-[linear-gradient(90deg,var(--color-bronze),rgb(216_180_90/0.15))]"
          />

          <p className="hero-in m-0 mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-text-2" style={delay(1150)}>
            <span className="font-display text-2xl text-text italic">ἀρετή</span>
            <span className="text-muted">(a·re·tê)</span>
            <span className="font-display text-sm text-muted italic">substantivo feminino</span>
          </p>

          <ol className="m-0 mt-6 flex max-w-[34rem] list-none flex-col gap-4 p-0">
            <li className="hero-in flex gap-4" style={delay(1300)}>
              <span className="w-5 shrink-0 pt-1 font-display text-lg text-bronze">1.</span>
              <span className="font-display text-[22px] leading-snug md:text-[26px]">A excelência alcançada pela prática constante.</span>
            </li>
            <li className="hero-in flex gap-4" style={delay(1450)}>
              <span className="w-5 shrink-0 pt-0.5 font-display text-lg text-laurel">2.</span>
              <span className="text-[17px] leading-relaxed text-text-2 md:text-lg">
                Um app para registrar cada carga, cada treino e cada refeição, até ela aparecer.
              </span>
            </li>
          </ol>

          <div className="hero-in mt-10 flex flex-wrap items-center gap-x-6 gap-y-3" style={delay(1650)}>
            <Button asChild size="lg" className="px-7">
              <Link to={cta.to}>{cta.label}</Link>
            </Button>
            <a href="#demo" className="text-[15px] font-medium text-text-2 underline decoration-line-strong underline-offset-[6px] transition-colors hover:text-laurel-hi hover:decoration-laurel">
              Ver como funciona
            </a>
          </div>
        </div>

        <figure className="hero-in m-0 mx-auto flex w-full max-w-[300px] flex-col items-center gap-5 md:max-w-[380px]" style={delay(500)}>
          <div className="relative w-full" style={{ '--p': 1 } as CSSProperties}>
            <div aria-hidden="true" className="absolute inset-x-[10%] top-[8%] bottom-[30%] -z-10 rounded-full bg-bronze/20 blur-3xl" />
            <Bust half label="Busto clássico de mármore, com louros e parte dourada" />
          </div>
          <figcaption className="rounded-md border border-line-strong bg-surface/70 px-4 py-2.5 text-center">
            <span className="block font-display text-sm italic">Busto laureado, mármore e ouro</span>
            <span className="block text-xs text-muted">Coleção Areté, {YEAR}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
