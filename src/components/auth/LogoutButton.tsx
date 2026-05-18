"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export function LogoutButton() {
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await supabase.auth.signOut()
    window.location.href = "/auth/login"
  }

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      disabled={loading}
      className="border-[#E2E6EA] text-[#1A1F2E] hover:bg-[#F7F8FA]"
    >
      {loading ? "Abmelden..." : "Abmelden"}
    </Button>
  )
}
