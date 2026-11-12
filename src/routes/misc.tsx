import { Link } from 'react-router'
import { Logo, Meander } from '@/components/brand'
import { PageTitle } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/surface'

export function ComingSoonPage({ title, phase, children }: { title: string; phase: number; children: React.ReactNode }) {
  return (
    <>
      <PageTitle>{title}</PageTitle>
      <EmptyState title={`Chega na fase ${phase}`}>{children}</EmptyState>
    </>
  )
}

export function NotFoundPage() {
  return (
    <EmptyState
      title="Página não encontrada"
      action={
        <Button asChild variant="outline">
          <Link to="/" className="no-underline">
            Voltar ao início
          </Link>
        </Button>
      }
    />
  )
}

/** Mostrado quando o .env.local ainda não tem as chaves do Supabase. */
export function SetupPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-5 px-5 py-12">
      <Logo />
      <Meander />
      <h1 className="m-0 font-display text-3xl font-semibold">Falta conectar o Supabase</h1>
      <p className="m-0 text-[15px] text-text-2">
        Copie <code className="text-accent-hi">.env.example</code> para <code className="text-accent-hi">.env.local</code>, preencha a URL e a
        chave publicável do seu projeto e reinicie o <code>npm run dev</code>.
      </p>
    </main>
  )
}
