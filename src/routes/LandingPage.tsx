import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Logo, Medal, PersonalRecordBadge } from '@/components/brand'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/context'
import { cn } from '@/lib/cn'
import { formatKg } from '@/lib/format'
import { toRoman } from '@/lib/glory'

const REPO_URL = 'https://github.com/mateusnchaves/Aret-'

/** Página pública: o que é o Areté, para quem chega pelo link. */
export function LandingPage() {
  const { session } = useAuth()
  const cta = session ? { to: '/', label: 'Abrir o app' } : { to: '/login?modo=cadastro', label: 'Criar conta' }

  return (
    <div className="min-h-dvh overflow-x-clip bg-bg text-text">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 pt-6 md:px-8">
        <Logo size={38} />
        {!session && (
          <Button asChild variant="outline" size="sm">
            <Link to="/login">Entrar</Link>
          </Button>
        )}
      </header>

      <main>
        {/* Abertura: a ideia central e a escada para experimentar. */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-10 pb-20 md:grid-cols-[1.05fr_1fr] md:gap-16 md:px-8 md:pt-24 md:pb-28">
          <div className="flex flex-col gap-6">
            <h1 className="m-0 max-w-[13ch] font-display text-[44px] leading-[1.02] font-semibold tracking-[-0.015em] md:text-[68px]">
              Registre só quando a carga sobe.
            </h1>
            <p className="m-0 max-w-[46ch] text-[17px] leading-relaxed text-text-2 md:text-lg">
              O Areté guarda a história de cada exercício, avisa quando você parou de evoluir e faz de cada recorde um
              momento. Cardio e alimentação entram junto e fecham a semana.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button asChild size="lg">
                <Link to={cta.to}>{cta.label}</Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <a href="#como-funciona">Ver as telas</a>
              </Button>
            </div>
            <p className="m-0 text-sm text-muted">Gratuito. Instala como app no celular e no computador.</p>
          </div>

          <Krepis />
        </section>

        <section id="como-funciona" className="mx-auto flex max-w-6xl scroll-mt-8 flex-col gap-24 px-5 pb-28 md:gap-32 md:px-8">
          <Feature
            image="/landing/progressao.jpg"
            alt="Tela de progressão do supino reto: 60 kg, medalha de recorde, gráfico em degraus e marcos em numerais romanos"
            title="Cada exercício tem a sua escada"
          >
            Um gráfico por exercício, venha de qualquer ficha. Você vê o ganho total, há quanto tempo está na carga atual
            e cada marco numerado. Depois de seis treinos sem evolução, o exercício aparece como o que pede atenção.
          </Feature>

          <Feature
            image="/landing/recorde.jpg"
            alt="Tela de novo recorde: medalha dourada de 60 kg cercada por uma coroa de louros"
            title="Recorde não passa em branco"
            flip
          >
            Ao superar a sua melhor carga, a coroa de louros se forma em volta da medalha e o celular vibra. A medalha vai
            para o Panteão, onde fica a maior carga de cada exercício.
          </Feature>

          <Feature
            image="/landing/inicio.jpg"
            alt="Tela inicial: treino do dia, coroa da semana com os ramos de treino, cardio e alimentação, e a grade de disciplina"
            title="Três ramos fecham a coroa"
          >
            Treino, cardio e alimentação. Bata as três metas da semana e a coroa fica dourada. A sequência de semanas e a
            grade de constância mostram se o hábito está se formando.
          </Feature>

          <Feature
            image="/landing/alimentacao.jpg"
            alt="Diário de alimentação: anel de calorias com louros e colunas de proteína, carboidrato e gordura"
            title="A dieta da nutricionista, num toque"
            flip
          >
            Monte a dieta, marque a refeição como feita e veja calorias e macros enchendo ao longo do dia. São 591
            alimentos da tabela TACO, além dos que você cadastrar.
          </Feature>
        </section>

        <section className="border-y border-line bg-surface/40">
          <figure className="mx-auto m-0 flex max-w-4xl flex-col gap-6 px-5 py-20 md:px-8 md:py-28">
            <blockquote className="m-0 font-display text-[30px] leading-[1.2] italic md:text-[46px]">
              <span aria-hidden="true" className="inscription float-left mt-1 mr-3 text-[64px] leading-[0.8] font-bold text-bronze not-italic md:text-[92px]">
                A
              </span>
              <span className="sr-only">A</span> excelência moral é fruto do hábito.
            </blockquote>
            <figcaption className="text-sm text-muted">
              Aristóteles, <cite>Ética a Nicômaco</cite>, livro II
            </figcaption>
            <p className="m-0 max-w-[58ch] text-[17px] leading-relaxed text-text-2">
              <em className="font-display">Areté</em> é a palavra grega para excelência. Para Aristóteles, ela não nasce
              pronta: se forma no que você repete. O app existe para tornar essa repetição visível.
            </p>
          </figure>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-28">
          <h2 className="m-0 font-display text-[32px] font-semibold md:text-[40px]">Feito para a academia</h2>
          <dl className="m-0 mt-10 grid gap-x-14 md:grid-cols-2">
            <Fact term="Instala como app">No celular e no computador, com ícone próprio e sem a barra do navegador.</Fact>
            <Fact term="Consulta sem sinal">As últimas cargas ficam guardadas para quando a academia não tem internet.</Fact>
            <Fact term="Seus dados são só seus">Cada conta enxerga apenas os próprios registros, com a regra aplicada no banco.</Fact>
            <Fact term="Código aberto">
              O projeto inteiro está no{' '}
              <a href={REPO_URL} target="_blank" rel="noreferrer" className="text-accent-hi underline-offset-4 hover:underline">
                GitHub
              </a>
              , com as decisões explicadas no README.
            </Fact>
          </dl>
        </section>

        <section className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 pb-24 md:px-8 md:pb-32">
          <h2 className="m-0 max-w-[16ch] font-display text-[36px] leading-[1.08] font-semibold md:text-[52px]">
            Comece pela carga de hoje.
          </h2>
          <Button asChild size="lg">
            <Link to={cta.to}>{cta.label}</Link>
          </Button>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-8">
          <p className="m-0">
            Projeto pessoal e de código aberto.{' '}
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="text-text-2 underline-offset-4 hover:underline">
              Ver no GitHub
            </a>
          </p>
          <p className="m-0">Valores nutricionais da TACO (NEPA-UNICAMP).</p>
        </div>
      </footer>
    </div>
  )
}

interface Step {
  mark: number
  load: number
}

const FIRST_LOAD = 40
const START: Step[] = [40, 42.5, 45, 47.5, 50].map((load, i) => ({ mark: i + 1, load }))
const VISIBLE = 7
const CEILING = 300

/**
 * A escada (krepis, a base em degraus de um templo grego) é o gráfico de progressão do app:
 * cada degrau é uma mudança de carga. Tocar em "Registrar" talha um degrau novo.
 */
function Krepis() {
  const [steps, setSteps] = useState(START)
  const [climbed, setClimbed] = useState(false)
  const top = steps[steps.length - 1] ?? START[0]!
  const loads = steps.map((s) => s.load)
  const min = Math.min(...loads)
  const max = Math.max(...loads)
  const atCeiling = top.load >= CEILING

  function climb() {
    if (atCeiling) return
    setClimbed(true)
    setSteps((prev) => {
      const last = prev[prev.length - 1]!
      const next = [...prev, { mark: last.mark + 1, load: last.load + 2.5 }]
      return next.length > VISIBLE ? next.slice(1) : next
    })
  }

  function restart() {
    setSteps(START)
    setClimbed(false)
  }

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-10 -z-0 bg-[radial-gradient(55%_50%_at_60%_40%,rgba(216,180,90,0.16),transparent_70%)]"
      />
      <div className="gold-edge relative flex flex-col gap-6 rounded-[28px] border border-line bg-surface p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:p-7">
        <div className="flex items-center gap-4">
          <div key={top.mark} className="animate-[laurel-in_520ms_cubic-bezier(0.2,0.9,0.3,1.2)_both]">
            <Medal size={78}>
              <span className="font-display text-[23px] leading-none font-semibold tabular">{formatKg(top.load)}</span>
              <span className="text-[10px] font-bold tracking-[0.15em]">KG</span>
            </Medal>
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className="m-0 font-display text-xl font-semibold">Supino reto</p>
            <p className="m-0 text-sm text-muted">
              Marco {toRoman(top.mark)}, +{formatKg(top.load - FIRST_LOAD)} kg desde o primeiro
            </p>
            {climbed && <PersonalRecordBadge key={top.mark} />}
          </div>
        </div>

        <div className="flex h-52 items-end md:h-60" role="img" aria-label={`Escada de cargas: ${loads.map(formatKg).join(', ')} kg`}>
          {steps.map((s, i) => {
            const isTop = i === steps.length - 1
            const height = 22 + ((s.load - min) / Math.max(max - min, 1)) * 78
            return (
              <div
                key={s.mark}
                className="flex h-full flex-1 flex-col justify-end"
                style={{ animation: `rise 520ms cubic-bezier(0.2,0.8,0.2,1) ${climbed ? 0 : 120 + i * 90}ms both` }}
              >
                <span className={cn('mb-1.5 text-center text-[11px] tabular', isTop ? 'font-semibold text-bronze' : 'text-faint')}>
                  {formatKg(s.load)}
                </span>
                <div
                  className={cn(
                    'border-t border-l transition-[height] duration-500 ease-out',
                    i === 0 && 'border-l-0',
                    isTop
                      ? 'border-t-bronze border-l-line bg-[linear-gradient(180deg,var(--color-bronze-soft),var(--color-surface-2))] shadow-[0_-10px_30px_rgba(216,180,90,0.18)]'
                      : 'fluted border-t-line-strong border-l-line bg-surface-2',
                  )}
                  style={{ height: `${height}%` }}
                >
                  <span className={cn('inscription block pt-2 text-center text-[11px]', isTop ? 'text-bronze' : 'text-faint')}>
                    {toRoman(s.mark)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="m-0 max-w-[30ch] text-sm text-muted">Cada degrau é uma mudança de carga. Experimente subir um.</p>
          <div className="flex items-center gap-1">
            {climbed && (
              <Button variant="ghost" size="sm" onClick={restart}>
                Recomeçar
              </Button>
            )}
            <Button variant="accentOutline" size="sm" onClick={climb} disabled={atCeiling}>
              Registrar +2,5 kg
            </Button>
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          {climbed ? `Novo recorde: ${formatKg(top.load)} kg, marco ${top.mark}.` : ''}
        </p>
      </div>
    </div>
  )
}

function Feature({
  image,
  alt,
  title,
  flip,
  children,
}: {
  image: string
  alt: string
  title: string
  flip?: boolean
  children: ReactNode
}) {
  return (
    <article className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
      <figure className={cn('m-0 flex justify-center', flip && 'md:order-last')}>
        <img
          src={image}
          alt={alt}
          width={469}
          height={1015}
          loading="lazy"
          className="w-[250px] rounded-[30px] border border-line-strong shadow-[0_24px_60px_rgba(0,0,0,0.5)] md:w-[280px]"
        />
      </figure>
      <div className="flex flex-col gap-4">
        <h2 className="m-0 max-w-[18ch] font-display text-[30px] leading-[1.1] font-semibold md:text-[40px]">{title}</h2>
        <p className="m-0 max-w-[46ch] text-[17px] leading-relaxed text-text-2">{children}</p>
      </div>
    </article>
  )
}

function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="border-t border-line pt-5 pb-8">
      <dt className="text-lg font-semibold">{term}</dt>
      <dd className="m-0 mt-2 max-w-[44ch] leading-relaxed text-text-2">{children}</dd>
    </div>
  )
}
