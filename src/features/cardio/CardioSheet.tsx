import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { ErrorNote, Field, Input, Segmented } from '@/components/ui/form'
import { Sheet } from '@/components/ui/surface'
import * as api from '@/lib/api'
import { CARDIO_KINDS, estimateKcal, INTENSITIES, MET, type CardioKind, type Intensity } from '@/lib/cardio'
import { cn } from '@/lib/cn'
import { todayISO } from '@/lib/dates'
import { formatInt, formatKg, parseDecimal } from '@/lib/format'
import { hapticSuccess } from '@/lib/haptics'
import type { CardioSession } from '@/lib/types'
import { keys, useCurrentWeight, useInvalidatingMutation } from '../data'

export function CardioSheet({
  open,
  onClose,
  editing,
}: {
  open: boolean
  onClose: () => void
  editing?: CardioSession
}) {
  return (
    <Sheet open={open} onClose={onClose} title={editing ? 'Editar cardio' : 'Registrar cardio'}>
      <CardioForm key={editing?.id ?? 'new'} editing={editing} onDone={onClose} />
    </Sheet>
  )
}

function CardioForm({ editing, onDone }: { editing?: CardioSession; onDone: () => void }) {
  const weightKg = useCurrentWeight()
  const [kind, setKind] = useState<CardioKind>(editing?.kind ?? 'treadmill')
  const [intensity, setIntensity] = useState<Intensity>(editing?.intensity ?? 'moderate')
  const [duration, setDuration] = useState(editing ? String(editing.duration_min) : '30')
  const [distance, setDistance] = useState(editing?.distance_km != null ? formatKg(editing.distance_km) : '')
  const [date, setDate] = useState(editing?.done_on ?? todayISO())
  const [manual, setManual] = useState(editing?.kcal_manual ?? false)
  const [manualKcal, setManualKcal] = useState(editing?.kcal_manual ? String(editing.kcal) : '')

  const minutes = Number.parseInt(duration, 10)
  const validMinutes = minutes >= 1 && minutes <= 600
  const distanceKm = distance.trim() ? parseDecimal(distance) : null
  const validDistance = !distance.trim() || (distanceKm !== null && distanceKm > 0 && distanceKm <= 500)

  const estimated = weightKg && validMinutes ? estimateKcal({ kind, intensity, weightKg, minutes }) : null
  const typedKcal = Number.parseInt(manualKcal, 10)
  const kcal = manual ? (typedKcal >= 0 && typedKcal <= 10000 ? typedKcal : null) : estimated
  const valid = validMinutes && validDistance && kcal !== null && Boolean(date)

  const save = useInvalidatingMutation(async () => {
    if (kcal === null) return
    const input: api.CardioInput = {
      done_on: date,
      kind,
      intensity,
      duration_min: minutes,
      distance_km: distanceKm,
      kcal,
      kcal_manual: manual,
      note: editing?.note ?? null,
    }
    if (editing) await api.updateCardioSession(editing.id, input)
    else await api.addCardioSession(input)
  }, [keys.cardio])

  const remove = useInvalidatingMutation(() => api.deleteCardioSession(editing!.id), [keys.cardio])

  function submit(e: FormEvent) {
    e.preventDefault()
    save.mutate(undefined, {
      onSuccess: () => {
        hapticSuccess()
        onDone()
      },
    })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
        <legend className="mb-1.5 p-0 text-sm font-medium text-text-2">Tipo</legend>
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(CARDIO_KINDS) as CardioKind[]).map((k) => (
            <label
              key={k}
              className={cn(
                'flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-1 text-center text-[13px] font-medium transition-colors',
                'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent',
                kind === k ? 'border-accent bg-accent-soft text-accent-hi' : 'border-line-strong bg-surface hover:bg-surface-2',
              )}
            >
              <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="sr-only" />
              {CARDIO_KINDS[k]}
            </label>
          ))}
        </div>
      </fieldset>

      <Segmented
        name="intensity"
        legend="Intensidade"
        columns={3}
        value={intensity}
        onChange={setIntensity}
        options={(Object.keys(INTENSITIES) as Intensity[]).map((value) => ({ value, ...INTENSITIES[value] }))}
      />

      <div className="grid grid-cols-2 gap-3">
        <Field label="Duração (min)" error={duration && !validMinutes ? 'Entre 1 e 600.' : null}>
          {(p) => (
            <Input {...p} type="number" inputMode="numeric" min={1} max={600} required value={duration} onChange={(e) => setDuration(e.target.value)} data-autofocus />
          )}
        </Field>
        <Field label="Distância (km)" hint="Opcional" error={validDistance ? null : 'Ex.: 3,5'}>
          {(p) => <Input {...p} inputMode="decimal" placeholder="—" value={distance} onChange={(e) => setDistance(e.target.value)} />}
        </Field>
      </div>

      <Field label="Data">
        {(p) => <Input {...p} type="date" max={todayISO()} required value={date} onChange={(e) => setDate(e.target.value)} />}
      </Field>

      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-2 p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-text-2">Calorias</span>
          <Button
            variant="link"
            size="sm"
            className="h-auto"
            onClick={() => {
              if (!manual && estimated !== null) setManualKcal(String(estimated))
              setManual(!manual)
            }}
          >
            {manual ? 'Usar estimativa' : 'Ajustar'}
          </Button>
        </div>
        {manual ? (
          <Input
            aria-label="Calorias (kcal)"
            type="number"
            inputMode="numeric"
            min={0}
            max={10000}
            value={manualKcal}
            onChange={(e) => setManualKcal(e.target.value)}
            className="font-display text-2xl font-semibold tabular"
          />
        ) : (
          <p className="m-0 font-display text-3xl font-semibold tabular" aria-live="polite">
            {estimated !== null ? formatInt(estimated) : '—'} <span className="font-sans text-sm font-normal text-muted">kcal</span>
          </p>
        )}
        <p className="m-0 text-xs text-muted">
          {manual
            ? 'Valor da esteira ou do relógio.'
            : weightKg
              ? `${formatKg(MET[kind][intensity])} MET × ${formatKg(weightKg)} kg × tempo. É uma estimativa.`
              : 'Registre seu peso no Perfil para estimar.'}
        </p>
      </div>

      <ErrorNote error={save.error ?? remove.error} />

      <Button type="submit" size="lg" disabled={!valid || save.isPending}>
        {save.isPending ? 'Salvando…' : editing ? 'Salvar' : 'Registrar'}
      </Button>

      {editing && (
        <Button
          variant="danger"
          disabled={remove.isPending}
          onClick={() => {
            if (window.confirm('Apagar este cardio?')) remove.mutate(undefined, { onSuccess: onDone })
          }}
        >
          Apagar
        </Button>
      )}
    </form>
  )
}
