#!/usr/bin/env node
/**
 * Gera a migration com a Tabela Brasileira de Composição de Alimentos (TACO, 4ª ed., NEPA/Unicamp, 2011)
 * a partir dos CSVs de https://github.com/raulfdm/taco-api/tree/main/references/csv
 *
 * Uso: node scripts/taco-to-sql.mjs <pasta-com-os-csv> > supabase/migrations/<timestamp>_taco_foods.sql
 *
 * Regras:
 * - valores por 100 g; campo vazio ou "Tr" (traço) vira 0
 * - alimentos sem kcal na TACO (ex.: sal) ficam de fora
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
if (!dir) {
  console.error('Uso: node scripts/taco-to-sql.mjs <pasta-com-os-csv>')
  process.exit(1)
}

/** CSV simples com aspas duplas (RFC 4180). */
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (c === '"') quoted = false
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else field += c
  }
  if (field !== '' || row.length) {
    row.push(field)
    rows.push(row)
  }
  const [header, ...data] = rows.filter((r) => r.some((v) => v !== ''))
  return data.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? '').trim()])))
}

const read = (name) => parseCsv(readFileSync(join(dir, `${name}.csv`), 'utf8'))
const num = (v) => {
  const n = Number.parseFloat(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}
const sql = (s) => `'${String(s).replace(/'/g, "''")}'`
const clean = (name) => name.replace(/\s+/g, ' ').replace(/\s+,/g, ',').trim()

const categories = read('categories')
const foods = read('food')
const nutrients = new Map(read('nutrients').map((n) => [n.foodId, n]))

const skipped = []
const values = []
for (const f of foods) {
  const n = nutrients.get(f.id)
  const kcal = n ? num(n.kcal) : null
  if (kcal === null) {
    skipped.push(clean(f.name))
    continue
  }
  const macro = (key) => Math.max(0, num(n[key]) ?? 0)
  const fiber = num(n.dietaryFiber)
  values.push(
    `  (null, ${Number(f.id)}, ${Number(f.categoryId)}, ${sql(clean(f.name))}, ${kcal}, ${macro('protein')}, ${macro('carbohydrates')}, ${macro('lipids')}, ${fiber === null ? 'null' : fiber})`,
  )
}

const out = [
  '-- Areté · Tabela TACO (4ª edição revisada e ampliada, NEPA/Unicamp, 2011).',
  '-- Fonte: NEPA – UNICAMP. Tabela brasileira de composição de alimentos. 4. ed. Campinas: NEPA-UNICAMP, 2011.',
  '-- Gerado por scripts/taco-to-sql.mjs a partir de github.com/raulfdm/taco-api (references/csv). Não edite à mão.',
  `-- ${values.length} alimentos; ${skipped.length} sem kcal na TACO ficaram de fora: ${skipped.join('; ')}.`,
  '',
  'insert into public.food_categories (id, name) values',
  categories.map((c) => `  (${Number(c.id)}, ${sql(clean(c.name))})`).join(',\n') + ';',
  '',
  'insert into public.foods (user_id, taco_id, category_id, name, kcal, protein_g, carbs_g, fat_g, fiber_g) values',
  values.join(',\n') + ';',
  '',
]
process.stdout.write(out.join('\n'))
console.error(`${values.length} alimentos, ${skipped.length} ignorados`)
