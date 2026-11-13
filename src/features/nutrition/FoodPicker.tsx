import { useMemo, useState } from 'react'
import { IconBack, IconPlus } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { ErrorNote, Input } from '@/components/ui/form'
import { Eyebrow, Sheet, Spinner } from '@/components/ui/surface'
import * as api from '@/lib/api-nutrition'
import { cn } from '@/lib/cn'
import { formatInt } from '@/lib/format'
import { macrosForGrams, sumMacros } from '@/lib/nutrition'
import { matchesAll, normalize } from '@/lib/text'
import type { Amount, Combo, Food } from '@/lib/types'
import { useInvalidatingMutation } from '../data'
import { AmountForm } from './AmountForm'
import { useCombos, useFavorites, useFoods, useRecentFoodIds, nkeys } from './data'
import { FoodForm } from './FoodForm'

type Step = { mode: 'search' } | { mode: 'amount'; food: Food } | { mode: 'create'; name: string }

const MAX_RESULTS = 40

/**
 * Escolher um alimento (busca, favoritos, recentes) e a quantidade. Com `onPickCombo`, mostra também os combos.
 */
export function FoodPicker({
  open,
  onClose,
  title,
  submitLabel = 'Adicionar',
  onPick,
  onPickCombo,
}: {
  open: boolean
  onClose: () => void
  title: string
  submitLabel?: string
  onPick: (food: Food, amount: Amount) => Promise<void>
  onPickCombo?: (combo: Combo) => Promise<void>
}) {
  const [step, setStep] = useState<Step>({ mode: 'search' })
  const [query, setQuery] = useState('')

  function close() {
    setStep({ mode: 'search' })
    setQuery('')
    onClose()
  }

  return (
    <Sheet open={open} onClose={close} title={step.mode === 'create' ? 'Novo alimento' : title}>
      {step.mode !== 'search' && (
        <Button variant="link" size="sm" className="-mt-3 h-auto self-start" onClick={() => setStep({ mode: 'search' })}>
          <IconBack size={16} />
          Voltar à busca
        </Button>
      )}
      {step.mode === 'search' && (
        <SearchStep
          query={query}
          setQuery={setQuery}
          onSelect={(food) => setStep({ mode: 'amount', food })}
          onCreate={() => setStep({ mode: 'create', name: query.trim() })}
          onPickCombo={
            onPickCombo &&
            (async (c) => {
              await onPickCombo(c)
              close()
            })
          }
        />
      )}
      {step.mode === 'amount' && (
        <AmountForm
          key={step.food.id}
          food={step.food}
          submitLabel={submitLabel}
          onSubmit={async (a) => {
            await onPick(step.food, a)
            close()
          }}
        />
      )}
      {step.mode === 'create' && <FoodForm initialName={step.name} onSaved={(food) => setStep({ mode: 'amount', food })} />}
    </Sheet>
  )
}

function SearchStep({
  query,
  setQuery,
  onSelect,
  onCreate,
  onPickCombo,
}: {
  query: string
  setQuery: (q: string) => void
  onSelect: (food: Food) => void
  onCreate: () => void
  onPickCombo?: (combo: Combo) => Promise<void>
}) {
  const foods = useFoods()
  const favorites = useFavorites()
  const recents = useRecentFoodIds()
  const combos = useCombos()
  const [comboBusy, setComboBusy] = useState<string | null>(null)
  const [comboError, setComboError] = useState<unknown>(null)

  const q = query.trim()
  const results = useMemo(() => {
    if (!q || !foods.data) return []
    const nq = normalize(q)
    return foods.data
      .filter((f) => matchesAll(f.name, q))
      // Primeiro os seus, depois quem começa com a busca, depois nomes mais curtos (mais genéricos).
      .sort(
        (a, b) =>
          Number(b.user_id !== null) - Number(a.user_id !== null) ||
          Number(normalize(b.name).startsWith(nq)) - Number(normalize(a.name).startsWith(nq)) ||
          a.name.length - b.name.length,
      )
      .slice(0, MAX_RESULTS)
  }, [foods.data, q])

  const pick = (ids: readonly string[]) => ids.map((id) => foods.byId.get(id)).filter((f): f is Food => Boolean(f))
  const favoriteFoods = pick([...favorites.set]).sort((a, b) => a.name.localeCompare(b.name))
  const recentFoods = pick(recents.data ?? []).filter((f) => !favorites.set.has(f.id))
  const exact = (foods.data ?? []).some((f) => normalize(f.name) === normalize(q))

  return (
    <>
      <Input
        type="search"
        aria-label="Buscar alimento"
        placeholder="Buscar na TACO ou nos seus…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        data-autofocus
      />

      {foods.isPending ? (
        <Spinner />
      ) : q ? (
        <div className="flex flex-col">
          {results.length === 0 && <p className="m-0 py-4 text-center text-sm text-muted">Nada encontrado para “{q}”.</p>}
          <FoodList foods={results} favorites={favorites.set} onSelect={onSelect} />
          {!exact && (
            <Button variant="accentOutline" className="mt-3" onClick={onCreate}>
              <IconPlus size={18} />
              Criar “{q}”
            </Button>
          )}
          {results.length === MAX_RESULTS && <p className="m-0 mt-2 text-center text-xs text-muted">Refine a busca para ver mais.</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {onPickCombo && (combos.data?.length ?? 0) > 0 && (
            <section>
              <Eyebrow>Combos</Eyebrow>
              <ErrorNote error={comboError} />
              <ul className="m-0 list-none divide-y divide-line p-0">
                {combos.data!.map((c) => {
                  const kcal = sumMacros(
                    c.combo_items.flatMap((i) => {
                      const f = foods.byId.get(i.food_id)
                      return f ? [macrosForGrams(f, i.grams)] : []
                    }),
                  ).kcal
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        disabled={comboBusy !== null}
                        onClick={async () => {
                          setComboBusy(c.id)
                          setComboError(null)
                          try {
                            await onPickCombo(c)
                          } catch (e) {
                            setComboError(e)
                            setComboBusy(null)
                          }
                        }}
                        className="flex min-h-13 w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent px-0 text-left text-text disabled:opacity-60"
                      >
                        <span className="flex flex-col">
                          <span className="text-[15px] font-medium">{c.name}</span>
                          <span className="text-xs text-muted">{c.combo_items.length} itens · um toque adiciona tudo</span>
                        </span>
                        <span className="text-sm text-text-2 tabular">{comboBusy === c.id ? '…' : `${formatInt(kcal)} kcal`}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
          {favoriteFoods.length > 0 && (
            <section>
              <Eyebrow>Favoritos</Eyebrow>
              <FoodList foods={favoriteFoods} favorites={favorites.set} onSelect={onSelect} />
            </section>
          )}
          {recentFoods.length > 0 && (
            <section>
              <Eyebrow>Recentes</Eyebrow>
              <FoodList foods={recentFoods} favorites={favorites.set} onSelect={onSelect} />
            </section>
          )}
          {favoriteFoods.length === 0 && recentFoods.length === 0 && (
            <p className="m-0 py-4 text-center text-sm text-muted">
              Busque pelo nome: “arroz”, “frango grelhado”, “banana prata”…
              <br />
              São {formatInt(foods.data?.length ?? 0)} alimentos da TACO e os seus.
            </p>
          )}
        </div>
      )}
    </>
  )
}

function FoodList({ foods, favorites, onSelect }: { foods: Food[]; favorites: Set<string>; onSelect: (f: Food) => void }) {
  const toggle = useInvalidatingMutation((v: { id: string; on: boolean }) => api.setFavorite(v.id, v.on), [nkeys.favorites])
  return (
    <ul className="m-0 list-none divide-y divide-line p-0">
      {foods.map((f) => {
        const fav = favorites.has(f.id)
        return (
          <li key={f.id} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSelect(f)}
              className="flex min-h-13 min-w-0 flex-1 cursor-pointer flex-col justify-center border-0 bg-transparent py-2 pr-1 pl-0 text-left text-text"
            >
              <span className="text-[15px] leading-snug">{f.name}</span>
              <span className="text-xs text-muted tabular">
                {formatInt(f.kcal)} kcal / 100 g{f.user_id ? ' · seu' : ''}
              </span>
            </button>
            <button
              type="button"
              aria-label={fav ? `Tirar ${f.name} dos favoritos` : `Favoritar ${f.name}`}
              aria-pressed={fav}
              disabled={toggle.isPending}
              onClick={() => toggle.mutate({ id: f.id, on: !fav })}
              className={cn(
                'flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border-0 bg-transparent hover:bg-surface-2',
                fav ? 'text-bronze' : 'text-faint',
              )}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1.1 6.3L12 17.4l-5.6 3 1.1-6.3L3 9.7l6.2-.9z" />
              </svg>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
