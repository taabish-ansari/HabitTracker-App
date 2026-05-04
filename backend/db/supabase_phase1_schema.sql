-- HabitTracker Supabase Schema - PHASE 1: Tables & Functions (NO RLS)

-- Users table (managed by Supabase Auth, so we create a linked table)
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  username text unique not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Habits table
create table if not exists habits (
  id bigserial primary key,
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  category text,
  difficulty_weight integer default 1,
  color text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, name)
);

-- Streaks table
create table if not exists streaks (
  id bigserial primary key,
  habit_id bigint not null references habits(id) on delete cascade,
  current_streak integer default 0,
  best_streak integer default 0,
  last_completed_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Habit logs table
create table if not exists habit_logs (
  id bigserial primary key,
  habit_id bigint not null references habits(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  date date not null,
  completed boolean default false,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(habit_id, date)
);

-- XP logs table
create table if not exists xp_logs (
  id bigserial primary key,
  user_id uuid not null references users(id) on delete cascade,
  habit_id bigint references habits(id) on delete set null,
  xp_earned integer not null,
  reason text,
  created_at timestamp with time zone default now()
);

-- Badges table
create table if not exists badges (
  id bigserial primary key,
  user_id uuid not null references users(id) on delete cascade,
  badge_name text not null,
  description text,
  earned_at timestamp with time zone default now()
);

-- User stats table
create table if not exists user_stats (
  id bigserial primary key,
  user_id uuid not null unique references users(id) on delete cascade,
  total_xp integer default 0,
  level integer default 1,
  total_completed integer default 0,
  total_habits integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Table to store verification codes sent to users
create table if not exists email_verifications (
  id bigserial primary key,
  user_id uuid not null references users(id) on delete cascade,
  code_hash text not null,
  expires_at timestamp with time zone not null,
  used boolean default false,
  created_at timestamp with time zone default now()
);

-- Simple table to record that a user completed verification
create table if not exists verified_users (
  user_id uuid primary key references users(id) on delete cascade,
  verified boolean default true,
  verified_at timestamp with time zone default now()
);

-- Indexes for performance
create index if not exists idx_habits_user_id on habits(user_id);
create index if not exists idx_habit_logs_user_id on habit_logs(user_id);
create index if not exists idx_habit_logs_habit_id on habit_logs(habit_id);
create index if not exists idx_habit_logs_date on habit_logs(date);
create index if not exists idx_xp_logs_user_id on xp_logs(user_id);
create index if not exists idx_badges_user_id on badges(user_id);

-- Function to create user_stats on user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, username)
  values (new.id, new.email, new.raw_user_meta_data->>'username')
  on conflict (id) do nothing;

  insert into public.user_stats (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Trigger to call the function when a new user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
