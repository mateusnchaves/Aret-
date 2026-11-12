-- Areté · Fase 1: perfil, peso e treino.
-- Toda tabela de usuário tem RLS: cada pessoa só enxerga e altera as próprias linhas.

-- ───────────────────────── Perfil ─────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  birth_date date check (birth_date > date '1900-01-01'),
  sex text check (sex in ('male', 'female')),
  height_cm numeric(5, 1) check (height_cm between 80 and 260),
  activity_level text check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  goal text check (goal in ('cut', 'maintain', 'bulk')),
  stagnation_threshold smallint not null default 6 check (stagnation_threshold between 1 and 50),
  cardio_goal_unit text not null default 'minutes' check (cardio_goal_unit in ('minutes', 'kcal')),
  cardio_goal_value integer not null default 150 check (cardio_goal_value > 0),
  onboarded_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: own row" on public.profiles
  for all to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Cria o perfil vazio assim que a conta nasce (e-mail ou Google).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────────────────── Peso ─────────────────────────
create table public.weight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  measured_on date not null default current_date,
  weight_kg numeric(5, 2) not null check (weight_kg between 20 and 400),
  created_at timestamptz not null default now(),
  unique (user_id, measured_on)
);

create index weight_entries_user_date on public.weight_entries (user_id, measured_on desc);
alter table public.weight_entries enable row level security;

create policy "weight_entries: own rows" on public.weight_entries
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ───────────────────────── Exercícios ─────────────────────────
-- user_id nulo = catálogo inicial, visível para todos e somente leitura.
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 80),
  muscle_group text not null check (
    muscle_group in ('peito', 'costas', 'ombros', 'biceps', 'triceps', 'antebraco',
                     'quadriceps', 'posterior', 'gluteos', 'panturrilha', 'abdomen', 'corpo_todo')
  ),
  created_at timestamptz not null default now()
);

create unique index exercises_unique_name on public.exercises
  (coalesce(user_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(name));
alter table public.exercises enable row level security;

create policy "exercises: read catalog and own" on public.exercises
  for select to authenticated
  using (user_id is null or user_id = (select auth.uid()));

create policy "exercises: insert own" on public.exercises
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "exercises: update own" on public.exercises
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "exercises: delete own" on public.exercises
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ───────────────────────── Fichas ─────────────────────────
create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 60),
  focus text check (length(focus) <= 80),
  position integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create index workouts_user on public.workouts (user_id, position);
alter table public.workouts enable row level security;

create policy "workouts: own rows" on public.workouts
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  workout_id uuid not null references public.workouts (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  position integer not null default 0,
  unique (workout_id, exercise_id)
);

create index workout_exercises_workout on public.workout_exercises (workout_id, position);
alter table public.workout_exercises enable row level security;

create policy "workout_exercises: own rows" on public.workout_exercises
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = (select auth.uid()))
  );

-- ───────────────────────── Histórico de carga ─────────────────────────
-- Uma linha por mudança de carga OU de esquema séries×reps. Global por exercício.
create table public.load_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  recorded_on date not null default current_date,
  load_kg numeric(6, 2) not null check (load_kg >= 0 and load_kg <= 1000),
  sets smallint not null check (sets between 1 and 20),
  reps smallint not null check (reps between 1 and 100),
  created_at timestamptz not null default now()
);

create index load_entries_user_exercise
  on public.load_entries (user_id, exercise_id, recorded_on desc, created_at desc);
alter table public.load_entries enable row level security;

create policy "load_entries: own rows" on public.load_entries
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ───────────────────────── Check-ins ─────────────────────────
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  workout_id uuid not null references public.workouts (id) on delete cascade,
  done_on date not null default current_date,
  created_at timestamptz not null default now()
);

create index checkins_user_date on public.checkins (user_id, done_on desc, created_at desc);
alter table public.checkins enable row level security;

create policy "checkins: own rows" on public.checkins
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = (select auth.uid()))
  );

-- ───────────────────────── Excluir conta ─────────────────────────
-- Apaga o usuário de auth.users; o "on delete cascade" leva todos os dados junto.
create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
