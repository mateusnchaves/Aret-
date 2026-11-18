import { useState, type CSSProperties } from 'react'
import { cn } from '@/lib/cn'
import { PhoneFrame, Reveal, SectionHead } from './parts'

const SCREENS = [
  { src: '/landing/inicio.jpg', label: 'Início', alt: 'Tela inicial com o treino do dia, a coroa da semana e a disciplina' },
  { src: '/landing/progressao.jpg', label: 'Progressão', alt: 'Progressão do supino reto com gráfico em degraus' },
  { src: '/landing/recorde.jpg', label: 'Novo recorde', alt: 'Tela de novo recorde com coroa de louros' },
  { src: '/landing/alimentacao.jpg', label: 'Alimentação', alt: 'Diário de alimentação com anel de calorias e colunas de macros' },
]
const FAN = [
  { rotate: -9, y: 40 },
  { rotate: -3, y: 0 },
  { rotate: 3, y: 0 },
  { rotate: 9, y: 40 },
]

/** As telas em leque; a que recebe o cursor sobe e endireita. */
export function Gallery() {
  const [hover, setHover] = useState<number | null>(null)
  return (
    <section id="telas" className="relative scroll-mt-24 overflow-hidden py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHead
          center
          className="mx-auto"
          title="Pensado para a academia"
          text="Telas grandes, toques rápidos e nada de anotar série por série. Abriu, registrou, voltou para o treino."
        />
      </div>

      <div className="mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-10 [scrollbar-width:none] md:justify-center md:gap-0 md:overflow-visible md:px-8 md:pb-16">
        {SCREENS.map((s, i) => {
          const fan = FAN[i]!
          const active = hover === i
          return (
            <Reveal key={s.src} delay={i * 110} className="shrink-0 snap-center">
              <figure
                className="m-0 flex flex-col items-center gap-4 md:-mx-3"
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
              >
                <div
                  className={cn(
                    'relative w-[220px] transition-all duration-500 ease-[cubic-bezier(0.2,0.9,0.3,1.1)] md:w-[230px] lg:w-[250px]',
                    active ? 'md:-translate-y-[18px] md:scale-[1.04] md:rotate-0' : 'md:translate-y-(--ty) md:rotate-(--r)',
                  )}
                  style={{
                    '--ty': `${fan.y}px`,
                    '--r': `${fan.rotate}deg`,
                    zIndex: active ? 20 : i === 1 || i === 2 ? 10 : 1,
                  } as CSSProperties}
                >
                  <PhoneFrame src={s.src} alt={s.alt} />
                </div>
                <figcaption className={cn('text-sm font-semibold transition-colors md:mt-8', active ? 'text-laurel' : 'text-muted')}>{s.label}</figcaption>
              </figure>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
