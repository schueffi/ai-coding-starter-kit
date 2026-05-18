"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, MessageSquare } from "lucide-react"
import { IdeaDetailOverlay } from "./IdeaDetailOverlay"
import type { IdeaWithDetails } from "@/types/feed"

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function truncate(text: string, max = 150) {
  if (!text) return ""
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text
}

export function IdeaCard({ idea }: { idea: IdeaWithDetails }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Card
        onClick={() => setOpen(true)}
        className="bg-white border border-[#E2E6EA] rounded-xl shadow-sm cursor-pointer hover:shadow-md hover:border-[#005CA9]/40 transition-all duration-150"
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              {idea.category && (
                <Badge className="bg-[#E8F0F9] text-[#005CA9] hover:bg-[#E8F0F9] text-xs font-medium mb-2">
                  {idea.category.name}
                </Badge>
              )}
              <h3 className="font-semibold text-[#1A1F2E] text-base leading-snug mb-1">
                {idea.title}
              </h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                {truncate(idea.description ?? "")}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E2E6EA]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-sm text-[#6B7280]">
                <ThumbsUp className="w-3.5 h-3.5" />
                {idea.vote_count}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-[#6B7280]">
                <MessageSquare className="w-3.5 h-3.5" />
                {idea.comment_count}
              </span>
            </div>
            <p className="text-xs text-[#6B7280]">
              {idea.profiles?.display_name ?? "Unbekannt"} · {formatDate(idea.created_at)}
            </p>
          </div>
        </CardContent>
      </Card>

      <IdeaDetailOverlay idea={idea} open={open} onClose={() => setOpen(false)} />
    </>
  )
}
