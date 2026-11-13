import { Suspense, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { cn } from '@/lib/cn'
import { IconAmphora, IconBack, IconBust, IconDumbbell, IconTemple, IconTorch } from './icons'
import { Spinner } from './ui/surface'

const NAV = [
  { to: '/', label: 'Início', icon: IconTemple, end: true },
  { to: '/treino', label: 'Treino', icon: IconDumbbell, end: false },
  { to: '/cardio', label: 'Cardio', icon: IconTorch, end: false },
  { to: '/alimentacao', label: 'Alimentação', icon: IconAmphora, end: false },
  { to: '/perfil', label: 'Perfil', icon: IconBust, end: false },
]

/** Brilho ambiente no topo: cada área tem o seu tom, sem mudar a paleta. */
function ambientFor(path: string): string {
  if (path.startsWith('/treino')) return 'radial-gradient(90% 40% at 75% -6%, rgba(216,180,90,0.16), transparent 70%)'
  if (path.startsWith('/cardio')) return 'radial-gradient(90% 40% at 25% -6%, rgba(229,137,93,0.16), transparent 70%)'
  if (path.startsWith('/alimentacao')) return 'radial-gradient(90% 40% at 30% -6%, rgba(140,192,132,0.11), transparent 70%)'
  if (path.startsWith('/perfil')) return 'radial-gradient(90% 40% at 50% -6%, rgba(242,237,228,0.06), transparent 70%)'
  return 'radial-gradient(110% 45% at 50% -10%, rgba(217,119,74,0.17), transparent 70%)'
}

/** Casca do app: conteúdo + navegação flutuante. */
export function AppShell() {
  const { pathname } = useLocation()
  return (
    <div className="relative mx-auto min-h-dvh max-w-md">
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 h-[60vh] transition-[background] duration-700" style={{ background: ambientFor(pathname) }} />
      {/* A key força a cascata de entrada a cada troca de tela. */}
      <main key={pathname} className="cascade relative px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-36">
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </main>
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-3 bottom-[max(0.875rem,env(safe-area-inset-bottom))] z-10 mx-auto max-w-[calc(28rem-1.5rem)] rounded-[22px] border border-line-strong bg-nav/95 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md"
      >
        <ul className="m-0 grid h-[66px] list-none grid-cols-5 items-center p-0 px-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-12 flex-col items-center justify-center gap-[3px] text-[10.5px] no-underline transition-colors',
                    isActive ? 'font-semibold text-accent-hi' : 'font-medium text-muted hover:text-text-2',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon />
                    {label}
                    <span className={cn('size-1 rounded-full transition-colors', isActive ? 'bg-accent-hi' : 'bg-transparent')} aria-hidden="true" />
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

/** Cabeçalho de tela interna, com botão de voltar. */
export function SubHeader({ back, context, actions }: { back: string; context?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="-mt-4 mb-4 flex items-center justify-between">
      <Link to={back} aria-label="Voltar" className="-ml-2.5 flex size-11 items-center justify-center rounded-xl text-text hover:bg-surface-2">
        <IconBack />
      </Link>
      {context && <span className="eyebrow">{context}</span>}
      <div className="-mr-2.5 flex min-w-11 justify-end">{actions}</div>
    </header>
  )
}

export function PageTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <header className="mb-5 flex items-center justify-between gap-3">
      <h1 className="inscription m-0 text-[24px] leading-tight font-bold tracking-[0.1em] uppercase">{children}</h1>
      {aside}
    </header>
  )
}

/** Barra de ação fixa acima da navegação flutuante. */
export function FloatingAction({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="h-16" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-[calc(max(0.875rem,env(safe-area-inset-bottom))+80px)] z-10 mx-auto max-w-md px-5">{children}</div>
    </>
  )
}
