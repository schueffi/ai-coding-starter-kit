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
  password: z.string().min(1, "Passwort ist erforderlich"),
})

type FormValues = z.infer<typeof schema>

export function LoginForm() {
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          form.setError("root", {
            message: "Bitte bestätige zuerst deine E-Mail-Adresse.",
          })
        } else {
          form.setError("root", {
            message: "E-Mail oder Passwort ist falsch.",
          })
        }
        return
      }

      if (data.session) {
        window.location.href = "/"
      }
    } catch {
      toast.error("Netzwerkfehler. Bitte erneut versuchen.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-[#E2E6EA] shadow-sm rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-[#1A1F2E]">Anmelden</CardTitle>
        <CardDescription className="text-[#6B7280]">
          Melde dich mit deiner E-Mail-Adresse an
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-[#1A1F2E] font-medium">Passwort</FormLabel>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-[#005CA9] hover:text-[#004A8A] hover:underline"
                    >
                      Passwort vergessen?
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Dein Passwort"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {form.formState.errors.root.message}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#005CA9] hover:bg-[#004A8A] text-white font-medium rounded-lg"
            >
              {loading ? "Anmelden..." : "Anmelden"}
            </Button>
          </form>
        </Form>

        <p className="text-sm text-center text-[#6B7280] mt-6">
          Noch kein Konto?{" "}
          <Link href="/auth/register" className="text-[#005CA9] hover:text-[#004A8A] hover:underline font-medium">
            Registrieren
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
