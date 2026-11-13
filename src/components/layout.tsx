import { Suspense, type ReactNode } from 'react'
import { Link, NavLink, Outlet } from 'react-router'
import { cn } from '@/lib/cn'
import { Spinner } from './ui/surface'
import { IconBack, IconDumbbell, IconFork, IconHome, IconPulse, IconUser } from './icons'

const NAV = [
  { to: '/', label: 'Início', icon: IconHome, end: true },
  { to: '/treino', label: 'Treino', icon: IconDumbbell, end: false },
  { to: '/cardio', label: 'Cardio', icon: IconPulse, end: false },
  { to: '/alimentacao', label: 'Alimentação', icon: IconFork, end: false },
  { to: '/perfil', label: 'Perfil', icon: IconUser, end: false },
]

/** Casca do app: conteúdo + barra de navegação inferior. */
export function AppShell() {
  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <main className="px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-32">
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </main>
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-nav pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <ul className="mx-auto m-0 grid max-w-md list-none grid-cols-5 p-0 px-2 pt-2">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] no-underline transition-colors',
                    isActive ? 'font-semibold text-accent' : 'font-medium text-muted hover:text-text-2',
                  )
                }
              >
                <Icon />
                {label}
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
      <Link
        to={back}
        aria-label="Voltar"
        className="-ml-2.5 flex size-11 items-center justify-center rounded-xl text-text hover:bg-surface-2"
      >
        <IconBack />
      </Link>
      {context && <span className="text-[13px] text-muted">{context}</span>}
      <div className="-mr-2.5 flex min-w-11 justify-end">{actions}</div>
    </header>
  )
}

export function PageTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <header className="mb-5 flex items-center justify-between gap-3">
      <h1 className="m-0 font-display text-[28px] leading-tight font-semibold">{children}</h1>
      {aside}
    </header>
  )
}
