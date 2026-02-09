import { loginUser } from "@/core/lib/api"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json({ error: "Email and password required" }, { status: 400 })
    }

    const user = await loginUser(email, password)
    return Response.json({
      user,
      token: "mock-access-token",
      refresh: "mock-refresh-token",
      app_version: "1.0.0"
    })
  } catch (error: any) {
    return Response.json({ error: error.message || "Authentication failed" }, { status: 401 })
  }
}
