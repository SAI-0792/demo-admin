import { auth } from "@/auth"

/**
 * Get the current user's access token from the session
 * Use this in server components or API routes
 */
export async function getAccessToken(): Promise<string | null> {
  const session = await auth()
  return (session?.user as any)?.accessToken || null
}

/**
 * Get the current user's refresh token from the session
 * Use this in server components or API routes
 */
export async function getRefreshToken(): Promise<string | null> {
  const session = await auth()
  return (session?.user as any)?.refreshToken || null
}

/**
 * Get authorization headers for API requests
 * Use this in server components or API routes
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken()
  if (!token) {
    return {}
  }
  return {
    Authorization: `Bearer ${token}`,
  }
}
