-- HabitTracker Supabase Schema - PHASE 2: Enable RLS & Policies (RUN AFTER PHASE 1)

-- Enable Row Level Security (RLS)
alter table users enable row level security;
alter table habits enable row level security;
alter table streaks enable row level security;
alter table habit_logs enable row level security;
alter table xp_logs enable row level security;
alter table badges enable row level security;
alter table user_stats enable row level security;

-- RLS Policies for users table
drop policy if exists "Users can view their own profile" on users;
drop policy if exists "Users can update their own profile" on users;

create policy "Users can view their own profile" on users
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on users
  for update using (auth.uid() = id);

-- RLS Policies for habits table
drop policy if exists "Users can view their own habits" on habits;
drop policy if exists "Users can create habits" on habits;
drop policy if exists "Users can update their own habits" on habits;
drop policy if exists "Users can delete their own habits" on habits;

create policy "Users can view their own habits" on habits
  for select using (auth.uid() = user_id);

create policy "Users can create habits" on habits
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own habits" on habits
  for update using (auth.uid() = user_id);

create policy "Users can delete their own habits" on habits
  for delete using (auth.uid() = user_id);

-- RLS Policies for streaks table
drop policy if exists "Users can view their own streaks" on streaks;

create policy "Users can view their own streaks" on streaks
  for select using (
    exists (
      select 1 from habits
      where habits.id = streaks.habit_id
      and habits.user_id = auth.uid()
    )
  );

-- RLS Policies for habit_logs table
drop policy if exists "Users can view their own logs" on habit_logs;
drop policy if exists "Users can create logs" on habit_logs;
drop policy if exists "Users can update their own logs" on habit_logs;

create policy "Users can view their own logs" on habit_logs
  for select using (auth.uid() = user_id);

create policy "Users can create logs" on habit_logs
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own logs" on habit_logs
  for update using (auth.uid() = user_id);

-- RLS Policies for xp_logs table
drop policy if exists "Users can view their own xp logs" on xp_logs;

create policy "Users can view their own xp logs" on xp_logs
  for select using (auth.uid() = user_id);

-- RLS Policies for badges table
drop policy if exists "Users can view their own badges" on badges;

create policy "Users can view their own badges" on badges
  for select using (auth.uid() = user_id);

-- RLS Policies for user_stats table
drop policy if exists "Users can view their own stats" on user_stats;
drop policy if exists "Users can update their own stats" on user_stats;

create policy "Users can view their own stats" on user_stats
  for select using (auth.uid() = user_id);

create policy "Users can update their own stats" on user_stats
  for update using (auth.uid() = user_id);
