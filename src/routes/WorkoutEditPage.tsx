import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { IconArchive, IconMoveDown, IconMoveUp, IconPlus, IconTrash } from '@/components/icons'
import { SubHeader } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { ErrorNote, Field, Input, Select } from '@/components/ui/form'
import { Card, EmptyState, Eyebrow, Sheet, Spinner } from '@/components/ui/surface'
import { keys, useExercises, useInvalidatingMutation, useWorkouts } from '@/features/data'
import * as api from '@/lib/api'
import { nowTimestamp } from '@/lib/dates'
import { MUSCLE_GROUPS, type Exercise, type MuscleGroup, type Workout } from '@/lib/types'

export function WorkoutEditPage() {
  const { id } = useParams()
  const workouts = useWorkouts()

  if (workouts.isPending) return <Spinner />
  if (workouts.error) return <ErrorNote error={workouts.error} />

  const workout = id ? workouts.data.find((w) => w.id === id) : undefined
  if (id && !workout) return <EmptyState title="Ficha não encontrada" />

  return <WorkoutEditor key={workout?.id ?? 'new'} workout={workout} nextPosition={workouts.data.length} />
}

function WorkoutEditor({ workout, nextPosition }: { workout: Workout | undefined; nextPosition: number }) {
  const navigate = useNavigate()
  const [name, setName] = useState(workout?.name ?? '')
  const [focus, setFocus] = useState(workout?.focus ?? '')
  const [picking, setPicking] = useState(false)

  const save = useInvalidatingMutation(async () => {
    if (workout) {
      await api.updateWorkout(workout.id, { name: name.trim(), focus: focus.trim() || null })
      return workout.id
    }
    const created = await api.createWorkout({ name, focus, position: nextPosition })
    return created.id
  }, [keys.workouts])

  const archive = useInvalidatingMutation(
    (archived: boolean) => api.updateWorkout(workout!.id, { archived_at: archived ? nowTimestamp() : null }),
    [keys.workouts],
  )

  const dirty = !workout || name.trim() !== workout.name || (focus.trim() || null) !== workout.focus

  function submit(e: FormEvent) {
    e.preventDefault()
    save.mutate(undefined, {
      onSuccess: (savedId) => {
        if (!workout) navigate(`/treino/fichas/${savedId}`, { replace: true })
      },
    })
  }

  return (
    <>
      <SubHeader back="/treino" context={workout ? 'Editar ficha' : 'Nova ficha'} />

      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Nome" hint="Ex.: Treino A">
          {(p) => <Input {...p} required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />}
        </Field>
        <Field label="Foco" hint="Opcional · ex.: Peito e tríceps">
          {(p) => <Input {...p} maxLength={80} value={focus} onChange={(e) => setFocus(e.target.value)} />}
        </Field>
        <ErrorNote error={save.error} />
        {dirty && (
          <Button type="submit" disabled={save.isPending || !name.trim()}>
            {save.isPending ? 'Salvando…' : workout ? 'Salvar alterações' : 'Criar ficha'}
          </Button>
        )}
      </form>

      {workout && (
        <>
          <ExerciseList workout={workout} onAdd={() => setPicking(true)} />
          <ExercisePicker workout={workout} open={picking} onClose={() => setPicking(false)} />

          <div className="mt-10 flex flex-col gap-2">
            <ErrorNote error={archive.error} />
            <Button
              variant={workout.archived_at ? 'outline' : 'danger'}
              disabled={archive.isPending}
              onClick={() =>
                archive.mutate(!workout.archived_at, {
                  onSuccess: () => {
                    if (!workout.archived_at) navigate('/treino')
                  },
                })
              }
            >
              <IconArchive size={18} />
              {workout.archived_at ? 'Reativar ficha' : 'Arquivar ficha'}
            </Button>
            {!workout.archived_at && (
              <p className="m-0 text-center text-xs text-muted">O histórico de carga dos exercícios é mantido.</p>
            )}
          </div>
        </>
      )}
    </>
  )
}

function ExerciseList({ workout, onAdd }: { workout: Workout; onAdd: () => void }) {
  const exercises = useExercises()
  const byId = useMemo(() => new Map((exercises.data ?? []).map((e) => [e.id, e])), [exercises.data])
  const remove = useInvalidatingMutation((id: string) => api.removeWorkoutExercise(id), [keys.workouts])
  const reorder = useInvalidatingMutation((ids: string[]) => api.reorderWorkoutExercises(ids), [keys.workouts])
  const items = workout.workout_exercises
  const busy = remove.isPending || reorder.isPending

  function move(index: number, delta: -1 | 1) {
    const ids = items.map((i) => i.id)
    const target = index + delta
    const a = ids[index]
    const b = ids[target]
    if (a === undefined || b === undefined) return
    ids[index] = b
    ids[target] = a
    reorder.mutate(ids)
  }

  return (
    <Card className="mt-6 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Eyebrow>Exercícios · {items.length}</Eyebrow>
        <Button variant="link" size="sm" onClick={onAdd}>
          <IconPlus size={16} />
          Adicionar
        </Button>
      </div>
      <ErrorNote error={remove.error ?? reorder.error} />
      {items.length === 0 ? (
        <p className="m-0 py-3 text-sm text-muted">Adicione os exercícios na ordem em que você faz.</p>
      ) : (
        <ol className="m-0 list-none divide-y divide-line p-0">
          {items.map((we, i) => {
            const ex = byId.get(we.exercise_id)
            return (
              <li key={we.id} className="flex min-h-13 items-center gap-1">
                <span className="w-6 text-sm text-faint tabular">{i + 1}</span>
                <Link to={`/treino/exercicios/${we.exercise_id}`} className="flex-1 truncate text-[15px] text-text no-underline hover:text-accent-hi">
                  {ex?.name ?? '…'}
                </Link>
                <Button variant="ghost" size="icon" aria-label="Subir" disabled={busy || i === 0} onClick={() => move(i, -1)}>
                  <IconMoveUp size={18} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Descer"
                  disabled={busy || i === items.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <IconMoveDown size={18} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remover ${ex?.name ?? 'exercício'}`}
                  disabled={busy}
                  onClick={() => remove.mutate(we.id)}
                >
                  <IconTrash size={18} />
                </Button>
              </li>
            )
          })}
        </ol>
      )}
    </Card>
  )
}

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

function ExercisePicker({ workout, open, onClose }: { workout: Workout; open: boolean; onClose: () => void }) {
  const exercises = useExercises()
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [group, setGroup] = useState<MuscleGroup>('peito')
  const inWorkout = new Set(workout.workout_exercises.map((we) => we.exercise_id))

  const add = useInvalidatingMutation(
    (exerciseId: string) => api.addWorkoutExercise(workout.id, exerciseId, workout.workout_exercises.length),
    [keys.workouts],
  )
  const create = useInvalidatingMutation(async () => {
    const ex = await api.createExercise(query, group)
    await api.addWorkoutExercise(workout.id, ex.id, workout.workout_exercises.length)
  }, [keys.workouts, keys.exercises])

  const q = normalize(query.trim())
  const grouped = useMemo(() => {
    const list = (exercises.data ?? []).filter((e) => !q || normalize(e.name).includes(q))
    const map = new Map<MuscleGroup, Exercise[]>()
    for (const e of list) map.set(e.muscle_group, [...(map.get(e.muscle_group) ?? []), e])
    return (Object.keys(MUSCLE_GROUPS) as MuscleGroup[]).flatMap((g) => {
      const items = map.get(g)
      return items ? [{ group: g, items }] : []
    })
  }, [exercises.data, q])

  const exactExists = (exercises.data ?? []).some((e) => normalize(e.name) === q)

  function close() {
    setQuery('')
    setCreating(false)
    onClose()
  }

  return (
    <Sheet open={open} onClose={close} title="Adicionar exercício">
      <Input
        type="search"
        aria-label="Buscar exercício"
        placeholder="Buscar ou criar…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        data-autofocus
      />
      <ErrorNote error={add.error ?? create.error} />

      {q && !exactExists && (
        <div className="flex flex-col gap-3 rounded-[14px] border border-dashed border-line-strong p-3">
          {creating ? (
            <>
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
              <Button disabled={create.isPending} onClick={() => create.mutate(undefined, { onSuccess: close })}>
                Criar “{query.trim()}”
              </Button>
            </>
          ) : (
            <Button variant="accentOutline" onClick={() => setCreating(true)}>
              <IconPlus size={18} />
              Criar exercício “{query.trim()}”
            </Button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {grouped.map(({ group: g, items }) => (
          <section key={g} className="flex flex-col">
            <Eyebrow className="mb-1">{MUSCLE_GROUPS[g]}</Eyebrow>
            {items.map((e) => {
              const already = inWorkout.has(e.id)
              return (
                <button
                  key={e.id}
                  type="button"
                  disabled={already || add.isPending}
                  onClick={() => add.mutate(e.id, { onSuccess: close })}
                  className="flex min-h-12 cursor-pointer items-center justify-between border-0 border-b border-solid border-line bg-transparent px-0 text-left text-[15px] text-text disabled:cursor-default disabled:text-faint"
                >
                  <span>{e.name}</span>
                  {already ? (
                    <span className="text-xs">na ficha</span>
                  ) : (
                    e.user_id && <span className="text-xs text-muted">seu</span>
                  )}
                </button>
              )
            })}
          </section>
        ))}
      </div>
    </Sheet>
  )
}
