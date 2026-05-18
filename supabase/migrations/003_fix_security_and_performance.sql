-- VoteBoard: Security and performance fixes (QA BUG-1, BUG-2, BUG-3)

-- BUG-1: Revoke EXECUTE on SECURITY DEFINER functions from PUBLIC
-- (anon and authenticated roles inherit from PUBLIC by default)
revoke execute on function public.is_admin() from public;
revoke execute on function public.is_super_admin() from public;
revoke execute on function public.handle_new_user() from public;

-- BUG-2: Fix mutable search_path on handle_updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- BUG-3: Replace bare auth.uid() with (select auth.uid()) in RLS policies
-- Prevents per-row re-evaluation of auth functions at scale

drop policy "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using ((select auth.uid()) = id);

drop policy "ideas_insert_auth" on public.ideas;
create policy "ideas_insert_auth" on public.ideas
  for insert with check ((select auth.uid()) = user_id);

drop policy "ideas_update_own_or_admin" on public.ideas;
create policy "ideas_update_own_or_admin" on public.ideas
  for update using ((select auth.uid()) = user_id or public.is_admin());

drop policy "votes_insert_own" on public.votes;
create policy "votes_insert_own" on public.votes
  for insert with check ((select auth.uid()) = user_id);

drop policy "votes_delete_own" on public.votes;
create policy "votes_delete_own" on public.votes
  for delete using ((select auth.uid()) = user_id);

drop policy "comments_insert_auth" on public.comments;
create policy "comments_insert_auth" on public.comments
  for insert with check ((select auth.uid()) = user_id);

drop policy "comments_delete_own_or_admin" on public.comments;
create policy "comments_delete_own_or_admin" on public.comments
  for delete using ((select auth.uid()) = user_id or public.is_admin());
