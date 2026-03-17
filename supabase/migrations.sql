-- Run this in Supabase SQL Editor
-- Fixes the signup 500 error and adds the tables the app needs

-- 1. Trigger to auto-create profile on signup (fixes "Database error saving new user")
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. RLS policy on profiles (if not already set)
alter table profiles enable row level security;

drop policy if exists "Users manage own profile" on profiles;
create policy "Users manage own profile"
  on profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 3. Simple lifts table (flat structure matching the app UI)
create table if not exists lifts (
  id          uuid default gen_random_uuid() primary key,
  workout_id  uuid references workouts(id) on delete cascade not null,
  name        text not null,
  sets        int not null default 1,
  reps        text not null default '8-10',
  weight      numeric not null default 0,
  notes       text default '',
  created_at  timestamptz default now()
);

alter table lifts enable row level security;

drop policy if exists "Users manage own lifts" on lifts;
create policy "Users manage own lifts"
  on lifts for all
  using (
    exists (select 1 from workouts w where w.id = workout_id and w.user_id = auth.uid())
  )
  with check (
    exists (select 1 from workouts w where w.id = workout_id and w.user_id = auth.uid())
  );

-- 4. Lift history table (for progress charts)
create table if not exists lift_history (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  lift_name   text not null,
  date        date not null,
  weight      numeric not null,
  unique (user_id, lift_name, date)
);

alter table lift_history enable row level security;

drop policy if exists "Users manage own lift history" on lift_history;
create policy "Users manage own lift history"
  on lift_history for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. Indexes
create index if not exists idx_workouts_user_date on workouts(user_id, date desc);
create index if not exists idx_lifts_workout on lifts(workout_id);
create index if not exists idx_lift_history_user on lift_history(user_id, lift_name, date);
