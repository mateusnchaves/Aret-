import { useState, type FormEvent } from 'react'
import { IconMinus, IconPlus } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { ErrorNote, Field, Input } from '@/components/ui/form'
import { Sheet } from '@/components/ui/surface'
import * as api from '@/lib/api'
import { todayISO } from '@/lib/dates'
import { formatKg, parseDecimal } from '@/lib/format'
import { hapticSuccess } from '@/lib/haptics'
import { wouldBePr } from '@/lib/glory'
import { isChange } from '@/lib/training'
import type { LoadEntry } from '@/lib/types'
import { keys, useInvalidatingMutation } from '../data'

const STEP_KG = 2.5

/**
 * Registrar uma nova carga (mode "new") ou corrigir um registro do histórico (mode "edit").
 */
export function LoadSheet({
  open,
  onClose,
  exerciseId,
  current,
  editing,
  entries,
  onRecord,
}: {
  open: boolean
  onClose: () => void
  exerciseId: string
  current: LoadEntry | undefined
  editing?: LoadEntry
  /** Histórico do exercício, para saber se a carga nova é recorde. */
  entries: LoadEntry[]
  onRecord?: (info: { loadKg: number; previousKg: number; mark: number }) => void
}) {
  return (
    <Sheet open={open} onClose={onClose} title={editing ? 'Corrigir registro' : current ? 'Nova carga' : 'Carga inicial'}>
      <LoadForm
        key={editing?.id ?? 'new'}
        exerciseId={exerciseId}
        current={current}
        editing={editing}
        entries={entries}
        onRecord={onRecord}
        onDone={onClose}
      />
    </Sheet>
  )
}

function LoadForm({
  exerciseId,
  current,
  editing,
  entries,
  onRecord,
  onDone,
}: {
  exerciseId: string
  current: LoadEntry | undefined
  editing?: LoadEntry
  entries: LoadEntry[]
  onRecord?: (info: { loadKg: number; previousKg: number; mark: number }) => void
  onDone: () => void
}) {
  const base = editing ?? current
  const [load, setLoad] = useState(base ? formatKg(base.load_kg) : '')
  const [sets, setSets] = useState(String(base?.sets ?? 4))
  const [reps, setReps] = useState(String(base?.reps ?? 10))
  const [date, setDate] = useState(editing?.recorded_on ?? todayISO())

  const loadKg = parseDecimal(load)
  const setsN = Number.parseInt(sets, 10)
  const repsN = Number.parseInt(reps, 10)
  const validNumbers =
    loadKg !== null && loadKg <= 1000 && setsN >= 1 && setsN <= 20 && repsN >= 1 && repsN <= 100 && Boolean(date)
  const unchanged =
    !editing && validNumbers && !isChange(current, { load_kg: loadKg, sets: setsN, reps: repsN })

  const save = useInvalidatingMutation(async () => {
    if (loadKg === null) return
    const values = { recorded_on: date, load_kg: loadKg, sets: setsN, reps: repsN }
    if (editing) await api.updateLoadEntry(editing.id, values)
    else await api.addLoadEntry({ exercise_id: exerciseId, ...values })
  }, [keys.loadEntries])

  const remove = useInvalidatingMutation(() => api.deleteLoadEntry(editing!.id), [keys.loadEntries])

  function bump(delta: number) {
    const next = Math.max(0, (loadKg ?? 0) + delta)
    setLoad(formatKg(next))
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    const record = !editing && loadKg !== null && wouldBePr(entries, loadKg)
    const previousKg = Math.max(...entries.map((x) => x.load_kg))
    save.mutate(undefined, {
      onSuccess: () => {
        if (record && loadKg !== null) onRecord?.({ loadKg, previousKg, mark: entries.length + 1 })
        else hapticSuccess()
        onDone()
      },
    })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Carga (kg)" error={load && loadKg === null ? 'Use números, ex.: 42,5' : null}>
        {(p) => (
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="size-12" aria-label={`Menos ${formatKg(STEP_KG)} kg`} onClick={() => bump(-STEP_KG)}>
              <IconMinus size={18} />
            </Button>
            <Input
              {...p}
              inputMode="decimal"
              required
              value={load}
              onChange={(e) => setLoad(e.target.value)}
              className="text-center font-display text-2xl font-semibold tabular"
            />
            <Button variant="outline" size="icon" className="size-12" aria-label={`Mais ${formatKg(STEP_KG)} kg`} onClick={() => bump(STEP_KG)}>
              <IconPlus size={18} />
            </Button>
          </div>
        )}
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Séries">
          {(p) => <Input {...p} type="number" inputMode="numeric" min={1} max={20} required value={sets} onChange={(e) => setSets(e.target.value)} />}
        </Field>
        <Field label="Repetições">
          {(p) => <Input {...p} type="number" inputMode="numeric" min={1} max={100} required value={reps} onChange={(e) => setReps(e.target.value)} />}
        </Field>
      </div>

      <Field label="Data">
        {(p) => <Input {...p} type="date" max={todayISO()} required value={date} onChange={(e) => setDate(e.target.value)} />}
      </Field>

      {unchanged && <p className="m-0 text-sm text-muted">Igual à carga atual. Mude a carga, as séries ou as repetições.</p>}
      <ErrorNote error={save.error ?? remove.error} />

      <Button type="submit" size="lg" disabled={!validNumbers || unchanged || save.isPending}>
        {save.isPending ? 'Salvando…' : editing ? 'Salvar correção' : 'Registrar'}
      </Button>

      {editing && (
        <Button
          variant="danger"
          disabled={remove.isPending}
          onClick={() => {
            if (window.confirm('Apagar este registro do histórico?')) remove.mutate(undefined, { onSuccess: onDone })
          }}
        >
          Apagar registro
        </Button>
      )}
    </form>
  )
}
