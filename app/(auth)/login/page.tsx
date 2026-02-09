"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { loginAction } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { FormInput, FormPassword } from "@/components/form"
import { Mail, Lock } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setError("")
    setIsLoading(true)
    try {
      const result = await loginAction(data)

      if (result?.error) {
        setError(result.error)
      } else {
        // Successful login usually redirects via server action
      }
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 animate-in fade-in duration-500">
      <Card className="w-full max-w-md shadow-xl animate-in slide-in-from-bottom-4 duration-500">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-foreground">Vendor Admin</h1>
          <p className="text-center text-muted-foreground mb-8">Manage your hotels, restaurants & travel agencies</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormInput
                control={form.control}
                name="email"
                label="Email"
                placeholder="admin@example.com"
                disabled={isLoading}
                startIcon={<Mail className="h-4 w-4" />}
              />

              <FormPassword
                control={form.control}
                name="password"
                label="Password"
                placeholder="password"
                disabled={isLoading}
                startIcon={<Lock className="h-4 w-4" />}
              />

              {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm animate-in shake duration-300">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full transition-all duration-200 hover:shadow-lg"
                size="lg"
              >
                {isLoading ? "Logging in..." : "Sign In"}
              </Button>
            </form>
          </Form>

         
        </div>
      </Card>
    </div>
  )
}
