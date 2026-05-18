export type Category = {
  id: string
  name: string
}

export type IdeaWithDetails = {
  id: string
  title: string
  description: string
  status: string
  created_at: string
  category: Category | null
  profiles: { display_name: string | null } | null
  vote_count: number
  comment_count: number
}
