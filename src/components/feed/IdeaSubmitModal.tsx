"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

const schema = z.object({
  title: z.string().trim().min(1, "Bitte gib einen Titel ein.").max(120, "Maximal 120 Zeichen."),
  description: z.string().trim().min(1, "Bitte beschreibe deine Idee.").max(1000, "Maximal 1000 Zeichen."),
  category_id: z.string().min(1, "Bitte wähle eine Kategorie."),
})

type FormValues = z.infer<typeof schema>

interface Category {
  id: string
  name: string
}

interface IdeaSubmitModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
}

export function IdeaSubmitModal({ open, onOpenChange, categories }: IdeaSubmitModalProps) {
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", category_id: "" },
  })

  const titleValue = form.watch("title")
  const descriptionValue = form.watch("description")

  async function onSubmit(values: FormValues) {
    setSubmitError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSubmitError("Du musst angemeldet sein, um eine Idee einzureichen.")
      return
    }

    const { error } = await supabase.from("ideas").insert({
      title: values.title.trim(),
      description: values.description.trim(),
      category_id: values.category_id,
      user_id: user.id,
    })

    if (error) {
      setSubmitError("Die Idee konnte nicht eingereicht werden. Bitte versuche es erneut.")
      return
    }

    onOpenChange(false)
    toast.success("Idee erfolgreich eingereicht!")
    router.push("/?sort=new")
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      form.reset()
      setSubmitError(null)
    }
    onOpenChange(open)
  }

  const categoryLoadError = categories.length === 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="text-[#1A1F2E] text-lg font-semibold">
            Idee einreichen
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-2">

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#1A1F2E] font-medium">Titel</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      maxLength={120}
                      placeholder="Kurzer, prägnanter Titel…"
                      className="border-[#E2E6EA] focus-visible:ring-[#005CA9]"
                    />
                  </FormControl>
                  <div className="flex justify-between items-start">
                    <FormMessage />
                    <span className="text-xs text-[#6B7280] ml-auto shrink-0">
                      {titleValue.length} / 120
                    </span>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#1A1F2E] font-medium">Beschreibung</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      maxLength={1000}
                      placeholder="Beschreibe deine Idee ausführlicher…"
                      rows={5}
                      className="border-[#E2E6EA] focus-visible:ring-[#005CA9] resize-none"
                    />
                  </FormControl>
                  <div className="flex justify-between items-start">
                    <FormMessage />
                    <span className="text-xs text-[#6B7280] ml-auto shrink-0">
                      {descriptionValue.length} / 1000
                    </span>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#1A1F2E] font-medium">Kategorie</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={categoryLoadError}
                  >
                    <FormControl>
                      <SelectTrigger className="border-[#E2E6EA] focus:ring-[#005CA9]">
                        <SelectValue placeholder="Kategorie wählen…" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {categoryLoadError && (
                    <p className="text-sm text-red-600">
                      Kategorien konnten nicht geladen werden.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {submitError}
              </p>
            )}

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || categoryLoadError}
                className="bg-[#005CA9] hover:bg-[#004A8A] text-white rounded-lg"
              >
                {form.formState.isSubmitting ? "Wird eingereicht…" : "Idee einreichen"}
              </Button>
            </div>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
