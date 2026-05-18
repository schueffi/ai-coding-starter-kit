"use client"

import { useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

export function SearchBar({ initialValue = "" }: { initialValue?: string }) {
  const [query, setQuery] = useState(initialValue)
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  function navigate(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("q", value)
    } else {
      params.delete("q")
    }
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    navigate(query)
  }

  function handleClear() {
    setQuery("")
    navigate("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ideen suchen..."
          className="border-[#E2E6EA] pr-8"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1F2E]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <Button type="submit" className="bg-[#005CA9] hover:bg-[#004A8A] text-white rounded-lg">
        <Search className="w-4 h-4" />
      </Button>
    </form>
  )
}
