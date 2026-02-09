"use client"

import { SessionProvider } from "next-auth/react"
import UserContextProvider from "@/components/user-provider"

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <UserContextProvider>
        {children}
      </UserContextProvider>
    </SessionProvider>
  )
}
