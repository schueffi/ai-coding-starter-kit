"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"

type SortOption = "top" | "new"

export function SortTabs({ currentSort }: { currentSort: SortOption }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  function handleSort(sort: SortOption) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", sort)
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex gap-1 bg-[#F7F8FA] border border-[#E2E6EA] rounded-lg p-1 shrink-0">
      {(["top", "new"] as SortOption[]).map((sort) => (
        <button
          key={sort}
          onClick={() => handleSort(sort)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            currentSort === sort
              ? "bg-white shadow-sm text-[#005CA9]"
              : "text-[#6B7280] hover:text-[#1A1F2E]"
          }`}
        >
          {sort === "top" ? "Top" : "Neu"}
        </button>
      ))}
    </div>
  )
}
