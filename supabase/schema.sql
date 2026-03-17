-- ezLog Database Schema
-- Run this in the Supabase SQL editor

-- Enable RLS on all tables
-- Workouts
create table if not exists workouts (
  id          bigint generated always as identity primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  date        date not null,
  start_time  time,
  end_time    time,
  mirror_pic  text,
  created_at  timestamptz default now()
);

alter table workouts enable row level security;

create policy "Users manage own workouts"
  on workouts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Workout muscle groups
create table if not exists workout_muscle_groups (
  id          bigint generated always as identity primary key,
  workout_id  bigint references workouts(id) on delete cascade not null,
  name        text not null,
  sets        int not null default 0
);

alter table workout_muscle_groups enable row level security;

create policy "Users manage own muscle groups"
  on workout_muscle_groups for all
  using (
    exists (
      select 1 from workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  );

-- Lifts
create table if not exists lifts (
  id          bigint generated always as identity primary key,
  workout_id  bigint references workouts(id) on delete cascade not null,
  name        text not null,
  sets        int not null default 1,
  reps        text not null default '8-10',
  weight      numeric not null default 0,
  notes       text default '',
  created_at  timestamptz default now()
);

alter table lifts enable row level security;

create policy "Users manage own lifts"
  on lifts for all
  using (
    exists (
      select 1 from workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  );

-- Lift history (for progress tracking / charts)
create table if not exists lift_history (
  id          bigint generated always as identity primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  lift_name   text not null,
  date        date not null,
  weight      numeric not null,
  unique (user_id, lift_name, date)
);

alter table lift_history enable row level security;

create policy "Users manage own lift history"
  on lift_history for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Indexes for performance
create index if not exists idx_workouts_user_date on workouts(user_id, date desc);
create index if not exists idx_lifts_workout on lifts(workout_id);
create index if not exists idx_lift_history_user_name on lift_history(user_id, lift_name, date);
