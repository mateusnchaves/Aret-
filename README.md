# Areté

> *Areté* (ἀρετή): a excelência alcançada pela prática constante.

**PT-BR** · [English](#english) · **App:** [aret-one.vercel.app](https://aret-one.vercel.app)

PWA pessoal para acompanhar **progressão de carga**, **cardio** e **alimentação**. Em vez de marcar cada série na academia, você só registra quando a carga muda, e o Areté mostra a evolução, há quanto tempo você está parado em cada carga e quais exercícios pedem atenção.

## Status

| Fase | Escopo | Status |
|---|---|---|
| 1 | Treino: fichas, histórico de carga, check-in, estagnação, progressão | ✅ |
| 2 | Cardio: registro, calorias por MET, meta semanal | ✅ |
| 3 | Alimentação: dietas, diário, macros com a tabela TACO | ⏳ |
| 4 | IA (Gemini): lançar refeição em texto livre, importar dieta | ⏳ |

Especificação completa em [`SPEC.md`](SPEC.md).

## Stack

React 19 · Vite · TypeScript · Tailwind CSS 4 · TanStack Query · React Router · Recharts · vite-plugin-pwa · Supabase (Postgres, RLS, Auth) · Vitest · oxlint · GitHub Actions

## Rodando localmente

Pré-requisitos: Node 24+ e um projeto no [Supabase](https://supabase.com) (o plano gratuito basta).

```bash
npm install
cp .env.example .env.local   # preencha a URL e a chave publicável
npm run dev
```

### Banco de dados

O schema e o catálogo inicial de exercícios estão versionados em [`supabase/migrations`](supabase/migrations). Para aplicar no seu projeto:

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push --remote
```

### Login com Google

No painel do Supabase: **Authentication → Sign In / Providers → Google**, com o Client ID e o Secret criados no Google Cloud Console. Em **Authentication → URL Configuration**, adicione `http://localhost:5173` e a URL de produção às Redirect URLs.

### Deploy (Vercel)

1. Importe o repositório na [Vercel](https://vercel.com/new). O `vercel.json` já define o build do Vite e as rotas da SPA.
2. Em **Environment Variables**, adicione `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` e, se usar Google, `VITE_AUTH_GOOGLE_ENABLED=true`.
3. No Supabase, em **Authentication → URL Configuration**, troque a **Site URL** pela URL da Vercel e mantenha `http://localhost:5173` nas Redirect URLs.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | typecheck + build de produção (com service worker) |
| `npm run check` | lint + typecheck + testes |
| `npm test` | testes das regras de cálculo (Vitest) |

## Decisões

- **Registro por mudança, não por série.** Cada linha de `load_entries` é uma mudança de carga ou de séries × reps. "Parado há X" conta a partir da última mudança.
- **Histórico global por exercício.** O supino tem um gráfico só, venha de qualquer ficha.
- **Estagnação.** Destaque após N check-ins (padrão 6) de fichas com o exercício sem mudança. Sem check-ins, a regra passa a ser 28 dias.
- **Online para gravar, cache para consultar.** O service worker guarda as leituras do Supabase (network-first), então dá para ver suas cargas sem sinal na academia.
- **RLS em tudo.** Cada usuário só lê e escreve as próprias linhas; o catálogo de exercícios (`user_id` nulo) é só leitura.

---

## English

Personal PWA to track **strength progression**, **cardio** and **nutrition**. Instead of logging every set, you only record when a load changes. Areté then shows your progress, how long you have been stuck at each load, and which exercises need attention.

**Stack:** React 19, Vite, TypeScript, Tailwind CSS 4, TanStack Query, React Router, Recharts, vite-plugin-pwa, Supabase (Postgres + RLS + Auth), Vitest, oxlint, GitHub Actions.

**Run locally:** `npm install`, copy `.env.example` to `.env.local` with your Supabase URL and publishable key, apply the migrations with `npx supabase db push --remote`, then `npm run dev`.

**Roadmap:** phase 1 (training) and phase 2 (cardio) done; phase 3 nutrition (Brazilian TACO food table), phase 4 AI meal logging with Gemini. Full spec (Portuguese) in [`SPEC.md`](SPEC.md).
