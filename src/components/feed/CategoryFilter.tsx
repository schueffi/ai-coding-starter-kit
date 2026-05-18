"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import type { Category } from "@/types/feed"

export function CategoryFilter({
  categories,
  activeCategory,
}: {
  categories: Category[]
  activeCategory: string | null
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  function handleCategory(categoryId: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (categoryId) {
      params.set("category", categoryId)
    } else {
      params.delete("category")
    }
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  const baseClass =
    "px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
  const activeClass = "bg-[#005CA9] text-white"
  const inactiveClass =
    "bg-[#F7F8FA] text-[#6B7280] hover:bg-[#E8F0F9] hover:text-[#005CA9] border border-[#E2E6EA]"

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => handleCategory(null)}
        className={`${baseClass} ${!activeCategory ? activeClass : inactiveClass}`}
      >
        Alle
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleCategory(cat.id)}
          className={`${baseClass} ${activeCategory === cat.id ? activeClass : inactiveClass}`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
