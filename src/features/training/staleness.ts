import { relativeDays } from '@/lib/dates'
import { plural } from '@/lib/format'
import type { ExerciseStatus } from '../data'

/** "há 18 dias · 5 treinos" */
export function stalenessText(status: ExerciseStatus, usesCheckins: boolean): string {
  const s = status.stagnation
  if (!s) return ''
  const days = relativeDays(s.days)
  return usesCheckins ? `${days} · ${plural(s.sessions, 'treino', 'treinos')}` : days
}
