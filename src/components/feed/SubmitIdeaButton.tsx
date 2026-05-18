"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IdeaSubmitModal } from "./IdeaSubmitModal"

interface Category {
  id: string
  name: string
}

interface SubmitIdeaButtonProps {
  user: { id: string } | null
  categories: Category[]
}

export function SubmitIdeaButton({ user, categories }: SubmitIdeaButtonProps) {
  const [modalOpen, setModalOpen] = useState(false)

  if (!user) {
    return (
      <Button asChild size="sm" className="bg-[#005CA9] hover:bg-[#004A8A] text-white rounded-lg">
        <Link href="/auth/login">Idee einreichen</Link>
      </Button>
    )
  }

  return (
    <>
      <Button
        size="sm"
        onClick={() => setModalOpen(true)}
        className="bg-[#005CA9] hover:bg-[#004A8A] text-white rounded-lg"
      >
        Idee einreichen
      </Button>
      <IdeaSubmitModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        categories={categories}
      />
    </>
  )
}
