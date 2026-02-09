import { MOCK_USERS } from "@/core/lib/api"

export async function GET() {
    // In a real app, we would decode the session token here.
    // For this mock, we'll return the superstar user.
    const user = MOCK_USERS["superstar@mistnove.com"].user

    return Response.json({
        id: user.id,
        fullname: user.name,
        email: user.email,
        phone: null,
        app_version: "1.0.0"
    })
}
