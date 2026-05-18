import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { LogoutButton } from "@/components/auth/LogoutButton"
import { SearchBar } from "@/components/feed/SearchBar"
import { SortTabs } from "@/components/feed/SortTabs"
import { CategoryFilter } from "@/components/feed/CategoryFilter"
import { IdeaCard } from "@/components/feed/IdeaCard"
import { EmptyState } from "@/components/feed/EmptyState"
import { FeedPagination } from "@/components/feed/FeedPagination"
import { SubmitIdeaButton } from "@/components/feed/SubmitIdeaButton"
import type { IdeaWithDetails } from "@/types/feed"

const PAGE_SIZE = 20

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }>
}) {
  const params = await searchParams
  const searchQuery = params.q?.trim() ?? ""
  const categoryFilter = params.category ?? ""
  const sort = params.sort === "new" ? "new" : "top"
  const page = Math.max(1, parseInt(params.page ?? "1", 10))
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createServerSupabaseClient()

  const [{ data: { user } }, { data: categories }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("categories").select("id, name").order("name"),
  ])

  // Build ideas query with filters
  let ideasQuery = supabase.from("ideas").select(
    `id, title, description, status, created_at, vote_count, comment_count,
     category:categories(id, name),
     profiles(display_name)`,
    { count: "exact" }
  )

  if (categoryFilter) {
    ideasQuery = ideasQuery.eq("category_id", categoryFilter)
  }
  if (searchQuery) {
    ideasQuery = ideasQuery.textSearch("search_vector", searchQuery, {
      type: "websearch",
      config: "german",
    })
  }

  if (sort === "top") {
    ideasQuery = ideasQuery
      .order("vote_count", { ascending: false })
      .order("created_at", { ascending: false })
  } else {
    ideasQuery = ideasQuery.order("created_at", { ascending: false })
  }

  ideasQuery = ideasQuery.range(offset, offset + PAGE_SIZE - 1)

  const { data: rawIdeas, count: totalCount } = await ideasQuery

  const ideas: IdeaWithDetails[] = (rawIdeas ?? []).map((idea: any) => ({
    id: idea.id,
    title: idea.title,
    description: idea.description ?? "",
    status: idea.status,
    created_at: idea.created_at,
    category: idea.category ?? null,
    profiles: idea.profiles ?? null,
    vote_count: idea.vote_count ?? 0,
    comment_count: idea.comment_count ?? 0,
  }))

  const totalPages = Math.max(1, Math.ceil((totalCount ?? 0) / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const hasFilters = !!(searchQuery || categoryFilter)

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <header className="bg-white border-b border-[#E2E6EA] sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#1A1F2E]">VoteBoard</h1>
          <div className="flex items-center gap-2">
            <SubmitIdeaButton user={user} categories={categories ?? []} />
            {user ? (
              <LogoutButton />
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="text-[#005CA9] hover:bg-[#E8F0F9]">
                  <Link href="/auth/login">Anmelden</Link>
                </Button>
                <Button asChild size="sm" className="bg-[#005CA9] hover:bg-[#004A8A] text-white rounded-lg">
                  <Link href="/auth/register">Registrieren</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar initialValue={searchQuery} />
          </div>
          <SortTabs currentSort={sort as "top" | "new"} />
        </div>

        <div className="mb-6">
          <CategoryFilter
            categories={categories ?? []}
            activeCategory={categoryFilter || null}
          />
        </div>

        {ideas.length === 0 ? (
          <EmptyState type={hasFilters ? "no-results" : "empty"} />
        ) : (
          <>
            <div className="grid gap-4">
              {ideas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
            <FeedPagination currentPage={safePage} totalPages={totalPages} />
          </>
        )}
      </main>
    </div>
  )
}
