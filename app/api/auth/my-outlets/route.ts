import { MOCK_USERS } from "@/core/lib/api"

export async function GET() {
    const user = MOCK_USERS["superstar@mistnove.com"].user

    // Return outlets in the expected format matching OutletResponse
    return Response.json({
        msg: "Success",
        data: user.outlets.map((outlet: any) => ({
            business_name: outlet.name,
            outlet_id: outlet.id,
            user_role_id: "admin" // Mock role
        })),
        pagination: { total: user.outlets.length },
        error: false,
        app_version: "1.0.0"
    })
}
