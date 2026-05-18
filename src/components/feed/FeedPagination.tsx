"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function FeedPagination({
  currentPage,
  totalPages,
}: {
  currentPage: number
  totalPages: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  function navigate(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(currentPage - 1)}
        disabled={currentPage <= 1}
        className="border-[#E2E6EA] text-[#1A1F2E] hover:bg-[#F7F8FA] rounded-lg"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Zurück
      </Button>
      <span className="text-sm text-[#6B7280]">
        Seite {currentPage} von {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="border-[#E2E6EA] text-[#1A1F2E] hover:bg-[#F7F8FA] rounded-lg"
      >
        Weiter
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  )
}
