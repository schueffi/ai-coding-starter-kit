export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[#1A1F2E]">VoteBoard</h1>
        <p className="text-sm text-[#6B7280] mt-1">Product Feedback Board</p>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
