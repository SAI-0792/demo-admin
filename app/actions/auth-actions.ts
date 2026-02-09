"use server"

import { signOut, signIn } from "@/auth"
import { AuthError } from "next-auth"

export async function logoutAction() {
  await signOut({ redirectTo: "/login" })
}

export async function loginAction(credentials: any) {
  try {
    await signIn("credentials", {
      ...credentials,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" }
        default:
          return { error: "Something went wrong" }
      }
    }
    throw error // Rethrow redirect error
  }
}
