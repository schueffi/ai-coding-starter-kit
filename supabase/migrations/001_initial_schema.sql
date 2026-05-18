-- VoteBoard: Initial Schema
-- Tables: profiles, admin_roles, categories, ideas, votes, comments
-- Includes: RLS policies, indexes, triggers

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "profiles_select_all" on public.profiles
  for select using (true);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ============================================================
-- ADMIN ROLES (before helper functions, so functions can reference it)
-- ============================================================
create table public.admin_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('super_admin', 'moderator')),
  created_at timestamptz default now() not null
);

alter table public.admin_roles enable row level security;

-- ============================================================
-- ADMIN HELPER FUNCTIONS (security definer to avoid RLS recursion)
-- ============================================================
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  return exists (
    select 1 from public.admin_roles where user_id = auth.uid()
  );
end;
$$;

create or replace function public.is_super_admin()
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  return exists (
    select 1 from public.admin_roles where user_id = auth.uid() and role = 'super_admin'
  );
end;
$$;

-- RLS policies for admin_roles
create policy "admin_roles_select_admins" on public.admin_roles
  for select using (public.is_admin());

create policy "admin_roles_insert_super" on public.admin_roles
  for insert with check (public.is_super_admin());

create policy "admin_roles_update_super" on public.admin_roles
  for update using (public.is_super_admin());

create policy "admin_roles_delete_super" on public.admin_roles
  for delete using (public.is_super_admin());

-- ============================================================
-- CATEGORIES
-- ============================================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now() not null
);

alter table public.categories enable row level security;

create policy "categories_select_all" on public.categories
  for select using (true);

create policy "categories_insert_admin" on public.categories
  for insert with check (public.is_admin());

create policy "categories_update_admin" on public.categories
  for update using (public.is_admin());

create policy "categories_delete_admin" on public.categories
  for delete using (public.is_admin());

-- ============================================================
-- IDEAS
-- ============================================================
create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) <= 120),
  description text check (char_length(description) <= 1000),
  category_id uuid references public.categories(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'planned', 'implemented', 'rejected')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.ideas enable row level security;

create policy "ideas_select_all" on public.ideas
  for select using (true);

create policy "ideas_insert_auth" on public.ideas
  for insert with check (auth.uid() = user_id);

create policy "ideas_update_own_or_admin" on public.ideas
  for update using (auth.uid() = user_id or public.is_admin());

create policy "ideas_delete_admin" on public.ideas
  for delete using (public.is_admin());

create index idx_ideas_user_id on public.ideas(user_id);
create index idx_ideas_status on public.ideas(status);
create index idx_ideas_category_id on public.ideas(category_id);
create index idx_ideas_created_at on public.ideas(created_at desc);

-- ============================================================
-- VOTES
-- ============================================================
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  idea_id uuid not null references public.ideas(id) on delete cascade,
  created_at timestamptz default now() not null,
  unique(user_id, idea_id)
);

alter table public.votes enable row level security;

create policy "votes_select_all" on public.votes
  for select using (true);

create policy "votes_insert_own" on public.votes
  for insert with check (auth.uid() = user_id);

create policy "votes_delete_own" on public.votes
  for delete using (auth.uid() = user_id);

create index idx_votes_idea_id on public.votes(idea_id);
create index idx_votes_user_id on public.votes(user_id);

-- ============================================================
-- COMMENTS
-- ============================================================
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  idea_id uuid not null references public.ideas(id) on delete cascade,
  content text not null check (char_length(content) <= 500),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.comments enable row level security;

create policy "comments_select_all" on public.comments
  for select using (true);

create policy "comments_insert_auth" on public.comments
  for insert with check (auth.uid() = user_id);

create policy "comments_delete_own_or_admin" on public.comments
  for delete using (auth.uid() = user_id or public.is_admin());

create index idx_comments_idea_id on public.comments(idea_id);
create index idx_comments_user_id on public.comments(user_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger ideas_updated_at
  before update on public.ideas
  for each row execute procedure public.handle_updated_at();

create trigger comments_updated_at
  before update on public.comments
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
