import { useState } from 'react'
import { IconPlus } from '@/components/icons'
import { cn } from '@/lib/cn'
import { Reveal, SectionHead } from './parts'

const ITEMS = [
  {
    q: 'Preciso anotar cada série?',
    a: 'Não. Você registra só quando a carga, as séries ou as repetições mudam. No dia a dia, basta o check-in do treino, com um toque.',
  },
  { q: 'É gratuito?', a: 'Sim. O Areté é um projeto pessoal e de código aberto, sem anúncios e sem plano pago.' },
  {
    q: 'Funciona sem internet?',
    a: 'Para consultar, sim: as últimas cargas ficam guardadas no aparelho. Para registrar algo novo, ele precisa de conexão.',
  },
  {
    q: 'Como instalo no celular?',
    a: 'No Android, abra o site no Chrome e toque em Instalar app (ou Adicionar à tela inicial). No iPhone, abra no Safari e use Compartilhar, depois Adicionar à Tela de Início.',
  },
  {
    q: 'De onde vêm os valores dos alimentos?',
    a: 'Da TACO, a Tabela Brasileira de Composição de Alimentos da UNICAMP, com 591 alimentos. Você também pode cadastrar os seus.',
  },
  {
    q: 'Meus dados ficam seguros?',
    a: 'Cada conta só enxerga os próprios registros. A regra é aplicada no próprio banco de dados, não só na tela do app.',
  },
]

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="duvidas" className="mx-auto grid max-w-6xl scroll-mt-24 gap-12 px-5 py-24 md:grid-cols-[0.8fr_1.2fr] md:px-8 md:py-32">
      <SectionHead title="Perguntas frequentes" text="O que costuma aparecer antes de criar a conta." />
      <Reveal delay={120}>
        <ul className="m-0 flex list-none flex-col p-0">
          {ITEMS.map((item, i) => {
            const isOpen = open === i
            return (
              <li key={item.q} className="border-b border-line">
                <h3 className="m-0">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left text-lg font-semibold transition-colors hover:text-laurel-hi"
                  >
                    {item.q}
                    <span
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300',
                        isOpen ? 'rotate-45 border-laurel bg-laurel text-on-laurel' : 'border-line-strong text-muted',
                      )}
                    >
                      <IconPlus size={16} />
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-${i}`}
                  className={cn('grid transition-[grid-template-rows] duration-400 ease-out', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
                >
                  <div className="overflow-hidden">
                    <p className="m-0 max-w-[60ch] pb-6 leading-relaxed text-text-2">{item.a}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </Reveal>
    </section>
  )
}
