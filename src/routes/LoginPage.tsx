import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router'
import { Logo, Meander } from '@/components/brand'
import { IconGoogle } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { ErrorNote, Field, Input } from '@/components/ui/form'
import { useAuth } from '@/features/auth/context'
import { supabase } from '@/lib/supabase'

type Mode = 'signin' | 'signup'

/** O botão só aparece depois que o provider Google for ativado no painel do Supabase. */
const GOOGLE_ENABLED = import.meta.env.VITE_AUTH_GOOGLE_ENABLED === 'true'

const ERRORS: Record<string, string> = {
  'Invalid login credentials': 'E-mail ou senha incorretos.',
  'User already registered': 'Já existe uma conta com esse e-mail.',
  'Email not confirmed': 'Confirme seu e-mail pelo link que enviamos antes de entrar.',
}

export function LoginPage() {
  const { session } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  if (session) return <Navigate to="/" replace />

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setNotice(null)
    const result =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } })
    setBusy(false)
    if (result.error) {
      setError(ERRORS[result.error.message] ?? result.error.message)
      return
    }
    if (mode === 'signup' && !result.data.session) {
      setNotice('Conta criada. Enviamos um link de confirmação para o seu e-mail.')
    }
  }

  async function google() {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) setError(error.message)
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-8 px-5 py-12">
      <div className="flex flex-col gap-5">
        <Logo />
        <Meander />
        <div>
          <h1 className="m-0 font-display text-[34px] leading-tight font-semibold">
            {mode === 'signin' ? 'Bem-vindo de volta' : 'Comece sua areté'}
          </h1>
          <p className="mt-2 mb-0 text-[15px] text-text-2">Progressão de carga, cardio e alimentação num lugar só.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {GOOGLE_ENABLED && (
          <>
            <Button variant="outline" onClick={google} className="w-full">
              <IconGoogle />
              Continuar com Google
            </Button>

            <div className="flex items-center gap-3 text-xs text-faint" aria-hidden="true">
              <span className="h-px flex-1 bg-line" />
              ou com e-mail
              <span className="h-px flex-1 bg-line" />
            </div>
          </>
        )}

        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="E-mail">
            {(p) => (
              <Input {...p} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            )}
          </Field>
          <Field label="Senha" hint={mode === 'signup' ? 'Mínimo de 6 caracteres.' : undefined}>
            {(p) => (
              <Input
                {...p}
                type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                minLength={6}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}
          </Field>
          <ErrorNote error={error} />
          {notice && (
            <p role="status" className="m-0 rounded-xl border border-bronze-line bg-bronze-soft px-4 py-3 text-sm text-bronze">
              {notice}
            </p>
          )}
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? 'Aguarde…' : mode === 'signin' ? 'Entrar' : 'Criar conta'}
          </Button>
        </form>

        <p className="m-0 text-center text-sm text-muted">
          {mode === 'signin' ? 'Ainda não tem conta?' : 'Já tem conta?'}{' '}
          <Button
            variant="link"
            size="sm"
            className="h-auto"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError(null)
              setNotice(null)
            }}
          >
            {mode === 'signin' ? 'Criar conta' : 'Entrar'}
          </Button>
        </p>
      </div>
    </main>
  )
}
