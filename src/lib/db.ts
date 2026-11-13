/** Resultado do supabase-js → dado ou erro lançado, para o TanStack Query tratar. */
export function unwrap<T = unknown>(result: { data: unknown; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message)
  return result.data as T
}
