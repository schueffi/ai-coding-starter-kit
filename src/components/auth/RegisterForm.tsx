"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

const schema = z
  .object({
    email: z.string().email("Bitte eine gültige E-Mail-Adresse eingeben"),
    displayName: z
      .string()
      .min(1, "Anzeigename ist erforderlich")
      .max(50, "Anzeigename darf maximal 50 Zeichen haben"),
    password: z
      .string()
      .min(8, "Passwort muss mindestens 8 Zeichen lang sein")
      .max(64, "Passwort darf maximal 64 Zeichen lang sein"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwörter stimmen nicht überein",
    path: ["confirmPassword"],
  })

type FormValues = z.infer<typeof schema>

export function RegisterForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", displayName: "", password: "", confirmPassword: "" },
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { display_name: values.displayName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        if (error.message.includes("already registered") || error.message.includes("already been registered")) {
          form.setError("email", {
            message: "Diese E-Mail-Adresse ist bereits registriert.",
          })
        } else {
          form.setError("root", { message: error.message })
        }
        return
      }

      router.push("/auth/verify-email")
    } catch {
      toast.error("Netzwerkfehler. Bitte erneut versuchen.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-[#E2E6EA] shadow-sm rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-[#1A1F2E]">Konto erstellen</CardTitle>
        <CardDescription className="text-[#6B7280]">
          Registriere dich, um Ideen einzureichen und abzustimmen
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
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#1A1F2E] font-medium">Anzeigename</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Dein Name"
                      autoComplete="name"
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
                  <FormLabel className="text-[#1A1F2E] font-medium">Passwort</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Mindestens 8 Zeichen"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#1A1F2E] font-medium">Passwort bestätigen</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Passwort wiederholen"
                      autoComplete="new-password"
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
              {loading ? "Konto wird erstellt..." : "Konto erstellen"}
            </Button>
          </form>
        </Form>

        <p className="text-sm text-center text-[#6B7280] mt-6">
          Bereits ein Konto?{" "}
          <Link href="/auth/login" className="text-[#005CA9] hover:text-[#004A8A] hover:underline font-medium">
            Anmelden
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
