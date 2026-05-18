import { LogoutButton } from "@/components/auth/LogoutButton"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#E2E6EA]">
        <h1 className="text-xl font-bold text-[#1A1F2E]">VoteBoard</h1>
        <LogoutButton />
      </header>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#6B7280]">Die Idea-Feed-Seite wird mit PROJ-3 gebaut.</p>
        </div>
      </div>
    </main>
  )
}
