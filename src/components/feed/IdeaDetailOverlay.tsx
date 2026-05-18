"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, MessageSquare } from "lucide-react"
import type { IdeaWithDetails } from "@/types/feed"

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function IdeaDetailOverlay({
  idea,
  open,
  onClose,
}: {
  idea: IdeaWithDetails | null
  open: boolean
  onClose: () => void
}) {
  if (!idea) return null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          {idea.category && (
            <Badge className="w-fit bg-[#E8F0F9] text-[#005CA9] hover:bg-[#E8F0F9] text-xs font-medium mb-2">
              {idea.category.name}
            </Badge>
          )}
          <DialogTitle className="text-xl font-bold text-[#1A1F2E] text-left leading-snug">
            {idea.title}
          </DialogTitle>
        </DialogHeader>

        <p className="text-[#1A1F2E] leading-relaxed whitespace-pre-wrap mt-2">
          {idea.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-[#E2E6EA] mt-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-sm text-[#6B7280]">
              <ThumbsUp className="w-4 h-4" />
              {idea.vote_count}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-[#6B7280]">
              <MessageSquare className="w-4 h-4" />
              {idea.comment_count}
            </span>
          </div>
          <p className="text-sm text-[#6B7280]">
            {idea.profiles?.display_name ?? "Unbekannt"} · {formatDate(idea.created_at)}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
