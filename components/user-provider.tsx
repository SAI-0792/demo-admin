"use client"

import React, { createContext, useContext, useEffect, useLayoutEffect } from "react"
import { signOut, useSession } from "next-auth/react"
import { useAuthStore } from "@/core/lib/store"
import { useOutletStore } from "@/core/store/use-outlet-store"
import { axiosInstance } from "@/core/service/api"

interface UserContextType {
  accessToken: string
}

const UserContext = createContext<UserContextType>({
  accessToken: "",
})

export const useUser = () => useContext(UserContext)

export default function UserContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const { setUser, logout, refetchUser } = useAuthStore()
  const { fetchOutlets } = useOutletStore()

  // Extract access token from session
  const accessToken = (session?.user as any)?.accessToken || ""

  // Setup Axios Interceptors
  useLayoutEffect(() => {
    // Request Interceptor: Attach Token
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response Interceptor: Handle 401
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error?.response?.status === 401) {
          // If we get a 401, it means the token is invalid/expired
          // We should sign out the user
          await signOut({ redirect: false })
          logout()
          window.location.href = "/login"
        }
        return Promise.reject(error)
      }
    )

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor)
      axiosInstance.interceptors.response.eject(responseInterceptor)
    }
  }, [accessToken, logout])

  // Sync Session with Store
  const prevTokenRef = React.useRef<string>("")

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Always sync user object if it changes
      setUser(session.user as any)

      // Only refetch data if token has actually changed
      const currentToken = (session.user as any)?.accessToken || ""
      if (currentToken && currentToken !== prevTokenRef.current) {
        prevTokenRef.current = currentToken
        refetchUser()
        fetchOutlets()
      }
    } else if (status === "unauthenticated") {
      prevTokenRef.current = ""
      logout()
    }
  }, [session, status, setUser, logout, refetchUser, fetchOutlets])

  return (
    <UserContext.Provider value={{ accessToken }}>
      {children}
    </UserContext.Provider>
  )
}
