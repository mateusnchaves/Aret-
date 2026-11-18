import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Link } from 'react-router'
import { CountUp, Logo, Meander } from '@/components/brand'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/context'
import { Grain, LaurelRain, LeafBurst, OlympusProgress } from '@/features/landing/Ambient'
import { Bento } from '@/features/landing/Bento'
import { MintSection } from '@/features/landing/Coin'
import { CrownSection } from '@/features/landing/Crown'
import { Demo } from '@/features/landing/Demo'
import { Faq } from '@/features/landing/Faq'
import { Gallery } from '@/features/landing/Gallery'
import { Hero } from '@/features/landing/Hero'
import { StatueSection } from '@/features/landing/Statue'
import { useInView } from '@/features/landing/hooks'
import { Aurora, Reveal } from '@/features/landing/parts'
import { cn } from '@/lib/cn'
import { formatInt } from '@/lib/format'

const REPO_URL = 'https://github.com/mateusnchaves/Aret-'

const NAV = [
  { href: '#demo', label: 'Demo' },
  { href: '#coroa', label: 'Coroa' },
  { href: '#recursos', label: 'Recursos' },
  { href: '#moeda', label: 'Sua moeda' },
  { href: '#duvidas', label: 'Dúvidas' },
]

/** Página pública: o que é o Areté, para quem chega pelo link. */
export function LandingPage() {
  const { session } = useAuth()
  const cta = session ? { to: '/', label: 'Abrir o app' } : { to: '/login?modo=cadastro', label: 'Criar conta grátis' }

  return (
    <div className="min-h-dvh overflow-x-clip bg-bg text-text">
      <Grain />
      <OlympusProgress />
      <LaurelRain />
      <Nav cta={cta} signedIn={!!session} />
      <main>
        <Hero cta={cta} />
        <Stats />
        <Demo />
        <CrownSection />
        <Bento />
        <Quote />
        <StatueSection />
        <Gallery />
        <MintSection />
        <Faq />
        <FinalCta cta={cta} />
      </main>
      <Footer />
    </div>
  )
}

function Nav({ cta, signedIn }: { cta: { to: string; label: string }; signedIn: boolean }) {
  const [scrolled, setScrolled] = useState(() => window.scrollY > 12)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300',
        scrolled ? 'border-b border-line/80 bg-bg/70 backdrop-blur-xl' : 'border-b border-transparent',
      )}
    >
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
        <a href="#" aria-label="Areté, voltar ao topo">
          <Logo size={34} />
        </a>
        <nav aria-label="Seções" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="rounded-full px-3.5 py-2 text-sm font-medium text-text-2 transition-colors hover:bg-surface-2 hover:text-text">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {!signedIn && (
            <Button asChild variant="ghost" size="sm" className="border border-line-strong sm:border-transparent">
              <Link to="/login">Entrar</Link>
            </Button>
          )}
          {/* No celular, o convite para criar conta fica na abertura; o menu mantém só o Entrar. */}
          <Button asChild size="sm" className={cn(!signedIn && 'hidden sm:inline-flex')}>
            <Link to={signedIn ? cta.to : '/login?modo=cadastro'}>{signedIn ? cta.label : 'Criar conta'}</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

const STATS = [
  { value: 53, label: 'exercícios no catálogo', className: 'text-laurel' },
  { value: 11, label: 'grupos musculares', className: 'text-text' },
  { value: 591, label: 'alimentos da tabela TACO', className: 'text-bronze' },
  { value: 0, label: 'séries para anotar', className: 'text-accent-hi' },
]

function Stats() {
  const [ref, inView] = useInView<HTMLDivElement>(0.5)
  return (
    <section aria-label="O Areté em números" className="border-y border-line bg-[linear-gradient(90deg,rgb(28_38_25/0.6),rgb(30_26_23/0.4),rgb(28_38_25/0.6))]">
      <div ref={ref} className="mx-auto grid max-w-6xl grid-cols-2 px-5 md:grid-cols-4 md:px-8">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className={cn(
              'flex flex-col gap-1 py-8 md:py-10',
              i % 2 === 1 && 'border-l border-line pl-6',
              i >= 2 && 'border-t border-line md:border-t-0',
              i === 2 && 'md:border-l md:pl-6',
              i > 0 && 'md:pl-8',
            )}
          >
            <span className={cn('font-display text-[44px] leading-none font-semibold tabular md:text-[56px]', s.className)}>
              {inView ? <CountUp value={s.value} format={(n) => formatInt(Math.round(n))} duration={1200} /> : '0'}
            </span>
            <span className="text-sm text-text-2">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function Quote() {
  return (
    <section className="relative isolate overflow-hidden border-y border-line">
      <Aurora intensity={0.55} />
      <figure className="m-0 mx-auto flex max-w-4xl flex-col items-center gap-7 px-5 py-24 text-center md:px-8 md:py-32">
        <Reveal className="w-40">
          <Meander />
        </Reveal>
        <Reveal delay={100}>
          <blockquote className="m-0 font-display text-[34px] leading-[1.15] italic md:text-[56px]">
            <span className="text-gradient-laurel">A excelência moral é fruto do hábito.</span>
          </blockquote>
        </Reveal>
        <Reveal delay={200} className="flex flex-col items-center gap-5">
          <figcaption className="text-sm text-muted">
            Aristóteles, <cite>Ética a Nicômaco</cite>, livro II
          </figcaption>
          <p className="m-0 max-w-[56ch] text-[17px] leading-relaxed text-text-2">
            <em className="font-display text-text">Areté</em> é a palavra grega para excelência. Para Aristóteles, ela não nasce
            pronta: se forma no que você repete. O app existe para tornar essa repetição visível.
          </p>
        </Reveal>
      </figure>
    </section>
  )
}

function FinalCta({ cta }: { cta: { to: string; label: string } }) {
  const coin = useRef<HTMLDivElement>(null)
  function tilt(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== 'mouse' || !coin.current) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    coin.current.style.transform = `rotateY(${x * 40}deg) rotateX(${y * -30}deg)`
  }
  function reset() {
    if (coin.current) coin.current.style.transform = ''
  }

  return (
    <section className="mx-auto max-w-6xl px-5 pb-24 md:px-8 md:pb-32">
      <Reveal>
        <div
          onPointerMove={tilt}
          onPointerLeave={reset}
          className="gold-edge marble relative isolate grid items-center gap-10 overflow-hidden rounded-[36px] border border-line bg-surface/60 px-6 py-14 md:grid-cols-[1.3fr_1fr] md:px-14 md:py-20"
        >
          <Aurora />
          <LeafBurst />
          <div className="relative flex flex-col items-start gap-6">
            <h2 className="m-0 max-w-[16ch] font-display text-[38px] leading-[1.05] font-semibold tracking-[-0.015em] md:text-[56px]">
              Sua evolução começa no próximo treino.
            </h2>
            <p className="m-0 max-w-[44ch] text-[17px] leading-relaxed text-text-2">
              Crie a conta, monte a primeira ficha e registre a carga de hoje. O resto o Areté acompanha com você.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="px-7">
                <Link to={cta.to}>{cta.label}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href={REPO_URL} target="_blank" rel="noreferrer">
                  Ver o código
                </a>
              </Button>
            </div>
          </div>
          <div className="relative mx-auto [perspective:900px]">
            <div ref={coin} className="transition-transform duration-300 ease-out" style={{ transformStyle: 'preserve-3d' }}>
              <div className="gold-sheen animate-[bob_7s_ease-in-out_infinite] rounded-full drop-shadow-[0_0_50px_rgba(216,180,90,0.45)]">
                <img
                  src="/icons/coin.svg"
                  alt="A moeda do Areté, uma tetradracma com um perfil laureado"
                  width={240}
                  height={240}
                  className="block w-[180px] md:w-[240px]"
                />
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <Logo size={32} />
        <div className="flex flex-col gap-1.5 text-sm text-muted md:items-end">
          <p className="m-0">
            Projeto pessoal e de código aberto.{' '}
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="text-text-2 underline-offset-4 hover:text-laurel hover:underline">
              Ver no GitHub
            </a>
          </p>
          <p className="m-0">Valores nutricionais da TACO (NEPA-UNICAMP).</p>
        </div>
      </div>
    </footer>
  )
}
