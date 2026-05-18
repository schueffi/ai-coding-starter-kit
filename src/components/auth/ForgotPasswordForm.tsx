"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

const schema = z.object({
  email: z.string().email("Bitte eine gültige E-Mail-Adresse eingeben"),
})

type FormValues = z.infer<typeof schema>

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    try {
      await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      })
      setSubmitted(true)
    } catch {
      toast.error("Netzwerkfehler. Bitte erneut versuchen.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <Card className="border-[#E2E6EA] shadow-sm rounded-xl">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-12 h-12 bg-[#E8F0F9] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-[#005CA9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[#1A1F2E] mb-2">E-Mail gesendet</h2>
          <p className="text-sm text-[#6B7280] mb-6">
            Falls ein Konto mit dieser E-Mail existiert, haben wir einen Reset-Link gesendet. Bitte prüfe dein Postfach.
          </p>
          <Link href="/auth/login" className="text-sm text-[#005CA9] hover:underline font-medium">
            Zurück zur Anmeldung
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-[#E2E6EA] shadow-sm rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-[#1A1F2E]">Passwort zurücksetzen</CardTitle>
        <CardDescription className="text-[#6B7280]">
          Gib deine E-Mail-Adresse ein, um einen Reset-Link zu erhalten
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#1A1F2E] font-medium">E-Mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@beispiel.de"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#005CA9] hover:bg-[#004A8A] text-white font-medium rounded-lg"
            >
              {loading ? "Senden..." : "Reset-Link senden"}
            </Button>
          </form>
        </Form>

        <p className="text-sm text-center text-[#6B7280] mt-6">
          <Link href="/auth/login" className="text-[#005CA9] hover:text-[#004A8A] hover:underline font-medium">
            Zurück zur Anmeldung
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
