import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Lightbulb, SearchX } from "lucide-react"

export function EmptyState({ type }: { type: "empty" | "no-results" }) {
  if (type === "empty") {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-[#E8F0F9] rounded-full flex items-center justify-center mx-auto mb-4">
          <Lightbulb className="w-8 h-8 text-[#005CA9]" />
        </div>
        <h3 className="text-lg font-semibold text-[#1A1F2E] mb-2">Noch keine Ideen</h3>
        <p className="text-[#6B7280] mb-6">Sei der Erste und reiche deine Idee ein!</p>
        <Button asChild className="bg-[#005CA9] hover:bg-[#004A8A] text-white rounded-lg">
          <Link href="/auth/register">Jetzt registrieren</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 bg-[#F7F8FA] border border-[#E2E6EA] rounded-full flex items-center justify-center mx-auto mb-4">
        <SearchX className="w-8 h-8 text-[#6B7280]" />
      </div>
      <h3 className="text-lg font-semibold text-[#1A1F2E] mb-2">Keine Ideen gefunden</h3>
      <p className="text-[#6B7280]">Passe deine Suche oder den Filter an.</p>
    </div>
  )
}
