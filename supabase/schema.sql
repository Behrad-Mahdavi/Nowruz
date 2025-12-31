-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Define Enums for Logic Consistency
create type gender_type as enum ('male', 'female');
create type somatotype_type as enum ('ectomorph', 'mesomorph', 'endomorph');
create type chronotype_type as enum ('lion', 'bear', 'wolf');
create type goal_type as enum ('weight_loss', 'muscle_gain', 'energy', 'health_detox');
create type stress_type as enum ('low', 'medium', 'high');

-- 3. Profiles Table (Public User Info)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  phone text unique not null,
  full_name text,
  city text default 'Mashhad',
  neighborhood text, -- e.g., 'VakilAbad', 'AhmadAbad'
  lead_score int default 0, -- Calculated for Sales Team
  created_at timestamptz default now()
);

-- 4. Assessments Table (The Quiz Data)
create table public.assessments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  gender gender_type not null,
  age int not null,
  height int not null, -- cm
  weight int not null, -- kg
  wrist_size int not null, -- cm (Crucial for Somatotype)
  wake_time time not null, -- (Crucial for Chronotype)
  sleep_time time,
  daily_activity text, -- 'sedentary', 'active'
  stress_level stress_type not null,
  main_goal goal_type not null,
  neighborhood text, -- Added missing column
  created_at timestamptz default now()
);

-- 5. Generated Plans Table (The Algorithm Output)
create table public.generated_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  
  -- Computed Biological Tags
  somatotype somatotype_type,
  chronotype chronotype_type,
  bmi_value numeric(4,1),
  bmi_status text, -- 'Underweight', 'Normal', 'Overweight'
  
  -- The Plan Content (JSON for Frontend Rendering)
  daily_protocol jsonb, 
  
  is_viewed boolean default false,
  created_at timestamptz default now()
);

-- 6. OTP Codes (Since we use Iranian SMS Provider)
create table public.otp_codes (
  id uuid default uuid_generate_v4() primary key,
  phone text not null,
  code text not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- 7. Indexes (Performance)
create index if not exists idx_generated_plans_user_id on public.generated_plans(user_id);
create index if not exists idx_profiles_lead_score on public.profiles(lead_score desc);

-- 8. Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.assessments enable row level security;
alter table public.generated_plans enable row level security;

-- Policy: Users can only see their own data
create policy "Public profiles are viewable by everyone" on profiles for select using ( true );
create policy "Users can insert their own profile" on profiles for insert with check ( auth.uid() = id );
create policy "Users can view own assessment" on assessments for select using ( auth.uid() = user_id );
create policy "Users can view own plan" on generated_plans for select using ( auth.uid() = user_id );
