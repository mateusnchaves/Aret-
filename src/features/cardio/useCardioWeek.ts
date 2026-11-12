import { useMemo } from 'react'
import { goalProgress, summarizeWeek, weekStart } from '@/lib/cardio'
import { todayISO } from '@/lib/dates'
import { useCardioSessions, useProfile } from '../data'

/** Resumo da semana atual (segunda a domingo) contra a meta do perfil. */
export function useCardioWeek() {
  const sessions = useCardioSessions()
  const profile = useProfile()

  const data = useMemo(() => {
    if (!sessions.data || !profile.data) return undefined
    const today = todayISO()
    const summary = summarizeWeek(sessions.data, weekStart(today))
    const unit = profile.data.cardio_goal_unit
    const goal = profile.data.cardio_goal_value
    return { today, summary, unit, ...goalProgress(summary, unit, goal) }
  }, [sessions.data, profile.data])

  return {
    data,
    sessions: sessions.data ?? [],
    isPending: sessions.isPending || profile.isPending,
    error: sessions.error ?? profile.error,
  }
}
