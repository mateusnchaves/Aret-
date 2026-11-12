import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { ErrorNote, Field, Input, Select } from '@/components/ui/form'
import { Sheet } from '@/components/ui/surface'
import * as api from '@/lib/api'
import { plural } from '@/lib/format'
import { MUSCLE_GROUPS, type Exercise, type MuscleGroup } from '@/lib/types'
import { keys, useInvalidatingMutation } from '../data'

/** Renomear, trocar o grupo ou apagar um exercício criado pelo usuário. */
export function ExerciseSheet({
  open,
  onClose,
  exercise,
  entryCount,
}: {
  open: boolean
  onClose: () => void
  exercise: Exercise
  entryCount: number
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Editar exercício">
      <ExerciseForm exercise={exercise} entryCount={entryCount} onDone={onClose} />
    </Sheet>
  )
}

function ExerciseForm({ exercise, entryCount, onDone }: { exercise: Exercise; entryCount: number; onDone: () => void }) {
  const navigate = useNavigate()
  const [name, setName] = useState(exercise.name)
  const [group, setGroup] = useState<MuscleGroup>(exercise.muscle_group)

  const save = useInvalidatingMutation(() => api.updateExercise(exercise.id, { name, muscle_group: group }), [keys.exercises])
  // Navega antes de invalidar: o refetch desmonta esta tela e callbacks do mutate() não rodariam.
  const remove = useInvalidatingMutation(async () => {
    await api.deleteExercise(exercise.id)
    navigate('/treino', { replace: true })
  }, [
    keys.exercises,
    keys.workouts,
    keys.loadEntries,
  ])

  const unchanged = name.trim() === exercise.name && group === exercise.muscle_group

  function submit(e: FormEvent) {
    e.preventDefault()
    save.mutate(undefined, { onSuccess: onDone })
  }

  function confirmDelete() {
    const history = entryCount > 0 ? ` e ${plural(entryCount, 'registro', 'registros')} de carga` : ''
    if (!window.confirm(`Apagar “${exercise.name}”${history}? Ele também sai de todas as fichas. Não dá para desfazer.`)) return
    remove.mutate()
  }

  const error = save.error ?? remove.error
  const duplicate = error instanceof Error && error.message.includes('exercises_unique_name')

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Nome" error={duplicate ? 'Você já tem um exercício com esse nome.' : null}>
        {(p) => <Input {...p} required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} data-autofocus />}
      </Field>
      <Field label="Grupo muscular">
        {(p) => (
          <Select {...p} value={group} onChange={(e) => setGroup(e.target.value as MuscleGroup)}>
            {(Object.keys(MUSCLE_GROUPS) as MuscleGroup[]).map((g) => (
              <option key={g} value={g}>
                {MUSCLE_GROUPS[g]}
              </option>
            ))}
          </Select>
        )}
      </Field>
      {!duplicate && <ErrorNote error={error} />}
      <Button type="submit" size="lg" disabled={unchanged || !name.trim() || save.isPending}>
        {save.isPending ? 'Salvando…' : 'Salvar'}
      </Button>
      <Button variant="danger" disabled={remove.isPending} onClick={confirmDelete}>
        {remove.isPending ? 'Apagando…' : 'Apagar exercício'}
      </Button>
    </form>
  )
}
