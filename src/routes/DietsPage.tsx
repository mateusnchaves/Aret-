import { useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { IconChevronRight, IconPlus, IconTrash } from '@/components/icons'
import { SubHeader } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { ErrorNote, Input } from '@/components/ui/form'
import { EmptyState, Eyebrow, Sheet, Spinner } from '@/components/ui/surface'
import { useInvalidatingMutation } from '@/features/data'
import { nkeys, useCombos, useDiets, useFoods } from '@/features/nutrition/data'
import { FoodForm } from '@/features/nutrition/FoodForm'
import * as api from '@/lib/api-nutrition'
import { cn } from '@/lib/cn'
import { formatInt } from '@/lib/format'
import { macrosForGrams, sumMacros } from '@/lib/nutrition'
import type { Diet, Food } from '@/lib/types'

/** Dietas modelo, combos salvos e alimentos próprios. */
export function DietsPage() {
  const diets = useDiets()
  const foods = useFoods()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [editingFood, setEditingFood] = useState<Food | 'new' | null>(null)

  const create = useInvalidatingMutation(
    async () => api.createDiet(name, (diets.data?.length ?? 0) === 0),
    [nkeys.diets],
  )

  function submit(e: FormEvent) {
    e.preventDefault()
    create.mutate(undefined, { onSuccess: (id) => navigate(`/alimentacao/dietas/${id}`) })
  }

  if (diets.isPending || foods.isPending) return <Spinner />
  if (diets.error) return <ErrorNote error={diets.error} />

  const kcalOf = (d: Diet) =>
    sumMacros(
      d.diet_items.flatMap((i) => {
        const f = foods.byId.get(i.food_id)
        return f ? [macrosForGrams(f, i.grams)] : []
      }),
    ).kcal

  const customFoods = (foods.data ?? []).filter((f) => f.user_id !== null)

  return (
    <>
      <SubHeader back="/alimentacao" context="Dietas e alimentos" />
      <h1 className="m-0 mb-4 font-display text-[28px] font-semibold">Dietas</h1>

      {(diets.data ?? []).length === 0 ? (
        <EmptyState title="Nenhuma dieta ainda">
          Monte sua dieta (a da nutricionista ou a sua) refeição por refeição. Depois é só tocar em “Comi o almoço da dieta”.
        </EmptyState>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {diets.data!.map((d) => (
            <li key={d.id}>
              <Link
                to={`/alimentacao/dietas/${d.id}`}
                className={cn(
                  'flex min-h-16 items-center justify-between gap-3 rounded-[20px] border bg-surface px-4.5 text-text no-underline',
                  d.is_active ? 'border-accent' : 'border-line',
                )}
              >
                <span className="flex flex-col">
                  <span className="flex items-center gap-2">
                    <span className="text-[15px] font-medium">{d.name}</span>
                    {d.is_active && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent-hi">Ativa</span>}
                  </span>
                  <span className="text-xs text-muted tabular">
                    {d.diet_items.length} itens · {formatInt(kcalOf(d))} kcal
                  </span>
                </span>
                <IconChevronRight size={18} className="text-faint" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="mt-3 flex gap-2">
        <Input aria-label="Nome da nova dieta" placeholder="Nova dieta (ex.: Dia de treino)" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
        <Button type="submit" disabled={!name.trim() || create.isPending}>
          <IconPlus size={18} />
          Criar
        </Button>
      </form>
      <ErrorNote error={create.error} />

      <CombosSection />

      <section className="mt-8">
        <div className="mb-1 flex items-center justify-between">
          <Eyebrow>Meus alimentos</Eyebrow>
          <Button variant="link" size="sm" onClick={() => setEditingFood('new')}>
            <IconPlus size={16} />
            Novo
          </Button>
        </div>
        {customFoods.length === 0 ? (
          <p className="m-0 text-sm text-muted">Cadastre o que não está na TACO, como whey ou pão de forma, com os valores do rótulo.</p>
        ) : (
          <ul className="m-0 list-none divide-y divide-line p-0">
            {customFoods.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => setEditingFood(f)}
                  className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent px-0 text-left text-text"
                >
                  <span className="text-[15px]">{f.name}</span>
                  <span className="text-xs text-muted tabular">{formatInt(f.kcal)} kcal / 100 g</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-8 mb-0 text-xs text-faint">
        Valores nutricionais da TACO: NEPA–UNICAMP, Tabela Brasileira de Composição de Alimentos, 4ª ed., 2011.
      </p>

      <Sheet open={editingFood !== null} onClose={() => setEditingFood(null)} title={editingFood === 'new' ? 'Novo alimento' : 'Editar alimento'}>
        {editingFood !== null && (
          <FoodForm
            key={editingFood === 'new' ? 'new' : editingFood.id}
            editing={editingFood === 'new' ? undefined : editingFood}
            onSaved={() => setEditingFood(null)}
            onDeleted={() => setEditingFood(null)}
          />
        )}
      </Sheet>
    </>
  )
}

function CombosSection() {
  const combos = useCombos()
  const foods = useFoods()
  const queryClient = useQueryClient()
  const [error, setError] = useState<unknown>(null)

  if (!combos.data?.length) return null
  return (
    <section className="mt-8">
      <Eyebrow>Combos</Eyebrow>
      <ErrorNote error={error} />
      <ul className="m-0 list-none divide-y divide-line p-0">
        {combos.data.map((c) => (
          <li key={c.id} className="flex min-h-13 items-center justify-between gap-2">
            <span className="flex min-w-0 flex-col">
              <span className="text-[15px]">{c.name}</span>
              <span className="truncate text-xs text-muted">
                {c.combo_items.map((i) => foods.byId.get(i.food_id)?.name.split(',')[0] ?? '…').join(' · ')}
              </span>
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Apagar combo ${c.name}`}
              onClick={async () => {
                if (!window.confirm(`Apagar o combo “${c.name}”?`)) return
                setError(null)
                try {
                  await api.deleteCombo(c.id)
                  await queryClient.invalidateQueries({ queryKey: nkeys.combos })
                } catch (e) {
                  setError(e)
                }
              }}
            >
              <IconTrash size={16} />
            </Button>
          </li>
        ))}
      </ul>
      <p className="m-0 mt-1 text-xs text-muted">Crie combos no diário: “Salvar como combo” numa refeição com 2+ itens.</p>
    </section>
  )
}
