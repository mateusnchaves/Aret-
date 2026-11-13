-- Areté · Visual 2.0: meta semanal de treinos, base da sequência de disciplina e da coroa da semana.
alter table public.profiles
  add column training_week_target smallint not null default 3 check (training_week_target between 1 and 14);
