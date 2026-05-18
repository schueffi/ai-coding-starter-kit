"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

const schema = z
  .object({
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

export function ResetPasswordForm() {
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      })

      if (error) {
        if (error.message.includes("expired") || error.message.includes("invalid")) {
          form.setError("root", {
            message: "Der Reset-Link ist abgelaufen. Bitte fordere einen neuen an.",
          })
        } else {
          form.setError("root", { message: error.message })
        }
        return
      }

      toast.success("Passwort erfolgreich geändert!")
      window.location.href = "/"
    } catch {
      toast.error("Netzwerkfehler. Bitte erneut versuchen.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-[#E2E6EA] shadow-sm rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-[#1A1F2E]">Neues Passwort setzen</CardTitle>
        <CardDescription className="text-[#6B7280]">
          Wähle ein neues Passwort für dein Konto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#1A1F2E] font-medium">Neues Passwort</FormLabel>
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
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <p>{form.formState.errors.root.message}</p>
                {form.formState.errors.root.message?.includes("abgelaufen") && (
                  <a
                    href="/auth/forgot-password"
                    className="text-[#005CA9] hover:underline font-medium block mt-1"
                  >
                    Neuen Reset-Link anfordern
                  </a>
                )}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#005CA9] hover:bg-[#004A8A] text-white font-medium rounded-lg"
            >
              {loading ? "Speichern..." : "Passwort speichern"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
