import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export default function VerifyEmailPage() {
  return (
    <Card className="border-[#E2E6EA] shadow-sm rounded-xl">
      <CardContent className="pt-8 pb-8 text-center">
        <div className="w-14 h-14 bg-[#E8F0F9] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-[#005CA9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#1A1F2E] mb-2">Bitte E-Mail bestätigen</h2>
        <p className="text-sm text-[#6B7280] mb-2 max-w-sm mx-auto">
          Wir haben dir einen Bestätigungslink zugesendet. Klicke auf den Link in der E-Mail, um dein Konto zu aktivieren.
        </p>
        <p className="text-xs text-[#6B7280] mb-6">
          Keine E-Mail erhalten? Prüfe deinen Spam-Ordner.
        </p>
        <Link
          href="/auth/login"
          className="text-sm text-[#005CA9] hover:text-[#004A8A] hover:underline font-medium"
        >
          Zurück zur Anmeldung
        </Link>
      </CardContent>
    </Card>
  )
}
