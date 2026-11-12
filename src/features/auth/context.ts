import type { Session } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'

export interface AuthState {
  session: Session | null
  loading: boolean
}

export const AuthContext = createContext<AuthState>({ session: null, loading: true })

export function useAuth() {
  return useContext(AuthContext)
}

/** Para telas atrás do RequireAuth, onde a sessão sempre existe. */
export function useUserId(): string {
  const { session } = useAuth()
  if (!session) throw new Error('useUserId fora de uma rota autenticada')
  return session.user.id
}
