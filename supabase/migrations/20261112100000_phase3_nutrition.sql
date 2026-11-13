-- Areté · Fase 3: alimentação.
-- Alimentos (TACO + próprios), medidas caseiras, refeições, dietas modelo, diário, favoritos e combos.
-- Valores nutricionais sempre por 100 g. O diário grava um retrato dos macros no momento do registro.

-- ───────────── Metas manuais no perfil (null = usar o cálculo) ─────────────
alter table public.profiles
  add column kcal_target integer check (kcal_target between 500 and 10000),
  add column protein_target_g integer check (protein_target_g between 0 and 1000),
  add column carbs_target_g integer check (carbs_target_g between 0 and 2000),
  add column fat_target_g integer check (fat_target_g between 0 and 1000);

-- ───────────── Alimentos ─────────────
create table public.food_categories (
  id smallint primary key,
  name text not null
);

alter table public.food_categories enable row level security;
create policy "food_categories: read" on public.food_categories for select to authenticated using (true);

-- user_id nulo = tabela TACO, visível para todos e somente leitura.
create table public.foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users (id) on delete cascade,
  taco_id smallint unique,
  category_id smallint references public.food_categories (id),
  name text not null check (length(trim(name)) between 1 and 120),
  kcal numeric(7, 2) not null check (kcal between 0 and 1000),
  protein_g numeric(6, 2) not null default 0 check (protein_g between 0 and 100),
  carbs_g numeric(6, 2) not null default 0 check (carbs_g between 0 and 100),
  fat_g numeric(6, 2) not null default 0 check (fat_g between 0 and 100),
  fiber_g numeric(6, 2) check (fiber_g between 0 and 100),
  created_at timestamptz not null default now()
);

create unique index foods_unique_name on public.foods
  (coalesce(user_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(name));
alter table public.foods enable row level security;

create policy "foods: read taco and own" on public.foods
  for select to authenticated using (user_id is null or user_id = (select auth.uid()));
create policy "foods: insert own" on public.foods
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "foods: update own" on public.foods
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "foods: delete own" on public.foods
  for delete to authenticated using (user_id = (select auth.uid()));

-- Medidas caseiras: "1 unidade = 50 g". Sempre do usuário (vale para alimentos da TACO também).
create table public.food_portions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  food_id uuid not null references public.foods (id) on delete cascade,
  label text not null check (length(trim(label)) between 1 and 40),
  grams numeric(7, 2) not null check (grams > 0 and grams <= 5000),
  created_at timestamptz not null default now()
);

create unique index food_portions_unique on public.food_portions (user_id, food_id, lower(label));
alter table public.food_portions enable row level security;
create policy "food_portions: own rows" on public.food_portions
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create table public.food_favorites (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  food_id uuid not null references public.foods (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, food_id)
);

alter table public.food_favorites enable row level security;
create policy "food_favorites: own rows" on public.food_favorites
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- ───────────── Refeições do dia (compartilhadas entre dieta e diário) ─────────────
-- Remover uma refeição só a arquiva: o diário antigo continua apontando para ela.
create table public.meal_slots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 40),
  position integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create index meal_slots_user on public.meal_slots (user_id, position);
alter table public.meal_slots enable row level security;
create policy "meal_slots: own rows" on public.meal_slots
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create function public.create_default_meal_slots(target uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.meal_slots (user_id, name, position)
  select target, s.name, s.position
  from (values ('Café da manhã', 0), ('Lanche da manhã', 1), ('Almoço', 2),
               ('Lanche da tarde', 3), ('Jantar', 4), ('Ceia', 5)) as s(name, position)
  where not exists (select 1 from public.meal_slots m where m.user_id = target);
$$;

revoke all on function public.create_default_meal_slots(uuid) from public, anon, authenticated;

-- Contas novas já nascem com as refeições padrão…
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'));
  perform public.create_default_meal_slots(new.id);
  return new;
end;
$$;

-- …e as contas existentes ganham as mesmas agora.
select public.create_default_meal_slots(id) from auth.users;

-- ───────────── Dietas modelo ─────────────
create table public.diets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 60),
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index diets_one_active on public.diets (user_id) where is_active;
alter table public.diets enable row level security;
create policy "diets: own rows" on public.diets
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create table public.diet_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  diet_id uuid not null references public.diets (id) on delete cascade,
  meal_slot_id uuid not null references public.meal_slots (id) on delete cascade,
  food_id uuid not null references public.foods (id) on delete cascade,
  grams numeric(7, 2) not null check (grams > 0 and grams <= 5000),
  portion_label text check (length(portion_label) <= 40),
  portion_qty numeric(6, 2) check (portion_qty > 0),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index diet_items_diet on public.diet_items (diet_id, meal_slot_id, position);
alter table public.diet_items enable row level security;
create policy "diet_items: own rows" on public.diet_items
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.diets d where d.id = diet_id and d.user_id = (select auth.uid()))
  );

-- Ativar uma dieta desativa as outras, numa única transação.
create function public.set_active_diet(target uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.diets set is_active = false where user_id = auth.uid() and is_active and id <> target;
  update public.diets set is_active = true where user_id = auth.uid() and id = target;
end;
$$;

grant execute on function public.set_active_diet(uuid) to authenticated;

-- ───────────── Diário ─────────────
create table public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  eaten_on date not null default current_date,
  meal_slot_id uuid not null references public.meal_slots (id),
  food_id uuid references public.foods (id) on delete set null,
  food_name text not null check (length(food_name) between 1 and 120),
  grams numeric(7, 2) not null check (grams > 0 and grams <= 5000),
  portion_label text check (length(portion_label) <= 40),
  portion_qty numeric(6, 2) check (portion_qty > 0),
  kcal numeric(7, 1) not null check (kcal >= 0),
  protein_g numeric(6, 1) not null check (protein_g >= 0),
  carbs_g numeric(6, 1) not null check (carbs_g >= 0),
  fat_g numeric(6, 1) not null check (fat_g >= 0),
  -- preenchido quando veio do "Comi o Almoço da dieta"
  from_diet_id uuid references public.diets (id) on delete set null,
  created_at timestamptz not null default now()
);

create index diary_entries_user_date on public.diary_entries (user_id, eaten_on, meal_slot_id);
create index diary_entries_user_recent on public.diary_entries (user_id, created_at desc);
alter table public.diary_entries enable row level security;
create policy "diary_entries: own rows" on public.diary_entries
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.meal_slots m where m.id = meal_slot_id and m.user_id = (select auth.uid()))
  );

-- ───────────── Combos salvos ("Meu pré-treino") ─────────────
create table public.combos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 60),
  created_at timestamptz not null default now()
);

alter table public.combos enable row level security;
create policy "combos: own rows" on public.combos
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create table public.combo_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  combo_id uuid not null references public.combos (id) on delete cascade,
  food_id uuid not null references public.foods (id) on delete cascade,
  grams numeric(7, 2) not null check (grams > 0 and grams <= 5000),
  portion_label text check (length(portion_label) <= 40),
  portion_qty numeric(6, 2) check (portion_qty > 0),
  position integer not null default 0
);

alter table public.combo_items enable row level security;
create policy "combo_items: own rows" on public.combo_items
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.combos c where c.id = combo_id and c.user_id = (select auth.uid()))
  );
