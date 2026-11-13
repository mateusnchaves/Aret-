import { useState } from 'react'
import { IconCheck } from '@/components/icons'
import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import * as api from '@/lib/api'
import { todayISO } from '@/lib/dates'
import { hapticSuccess } from '@/lib/haptics'
import type { Workout } from '@/lib/types'
import { keys, useCheckins, useInvalidatingMutation } from '../data'

/**
 * "Treinei hoje" para uma ficha. Se já houver check-in dessa ficha hoje, vira "Desfazer".
 */
export function CheckinButton({
  workout,
  variant = 'primary',
  className,
  shimmer,
}: {
  workout: Workout
  variant?: ButtonProps['variant']
  className?: string
  /** Brilho passando no botão enquanto o treino do dia não foi marcado. */
  shimmer?: boolean
}) {
  const checkins = useCheckins()
  const [justDone, setJustDone] = useState(false)
  const today = todayISO()
  const todays = checkins.data?.find((c) => c.workout_id === workout.id && c.done_on === today)

  const add = useInvalidatingMutation(() => api.addCheckin(workout.id, today), [keys.checkins])
  const undo = useInvalidatingMutation((id: string) => api.deleteCheckin(id), [keys.checkins])
  const busy = add.isPending || undo.isPending

  if (todays) {
    return (
      <div className={`flex items-center justify-between gap-3 rounded-[14px] border border-laurel/40 bg-laurel-soft px-4 py-2 ${className ?? ''}`}>
        <span className="flex items-center gap-2 text-sm font-medium text-text-2" role="status">
          <span className="flex size-5 items-center justify-center rounded-full bg-laurel text-on-laurel">
            <IconCheck size={12} strokeWidth={3} />
          </span>
          {justDone ? 'Treino registrado' : 'Treinado hoje'}
        </span>
        <Button variant="link" size="sm" disabled={busy} onClick={() => undo.mutate(todays.id)}>
          Desfazer
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant={variant}
      className={cn(shimmer && 'shimmer', className)}
      disabled={busy}
      aria-label={`Marcar ${workout.name} como feito hoje`}
      onClick={() =>
        add.mutate(undefined, {
          onSuccess: () => {
            hapticSuccess()
            setJustDone(true)
          },
        })
      }
    >
      <IconCheck size={18} />
      Treinei hoje
    </Button>
  )
}
