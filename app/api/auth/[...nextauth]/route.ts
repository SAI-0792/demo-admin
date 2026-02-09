import { handlers } from "@/auth"

import { NextRequest } from "next/server"

const { GET: AuthGET, POST } = handlers

export { POST }

export async function GET(req: NextRequest) {
  const response = await AuthGET(req)
  
  if (req.nextUrl.pathname.endsWith("/session")) {
    response.headers.set("Cache-Control", "private, max-age=120")
  }
  
  return response
}
