-- Areté · Fase 2: sessões de cardio.
-- As calorias são gravadas no momento do registro (com o peso daquele dia),
-- para o histórico não mudar quando o peso mudar.

create table public.cardio_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  done_on date not null default current_date,
  kind text not null check (
    kind in ('treadmill', 'walk', 'run', 'bike', 'elliptical', 'stairs', 'swim', 'other')
  ),
  intensity text not null check (intensity in ('light', 'moderate', 'vigorous')),
  duration_min smallint not null check (duration_min between 1 and 600),
  distance_km numeric(6, 2) check (distance_km > 0 and distance_km <= 500),
  kcal integer not null check (kcal between 0 and 10000),
  -- true quando o usuário digitou as calorias (esteira, relógio) em vez do cálculo por MET
  kcal_manual boolean not null default false,
  note text check (length(note) <= 120),
  created_at timestamptz not null default now()
);

create index cardio_sessions_user_date on public.cardio_sessions (user_id, done_on desc, created_at desc);
alter table public.cardio_sessions enable row level security;

create policy "cardio_sessions: own rows" on public.cardio_sessions
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
