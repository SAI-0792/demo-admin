import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/core/lib/store"

interface AuthStore {
  user: User | null
  isLoading: boolean
  logout: () => void
  setCurrentOutlet: (outletId: string) => void
  setUser: (user: User) => void
  refetchUser: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,

      logout: () => {
        set({ user: null })
      },

      setCurrentOutlet: (outletId: string) => {
        set((state) => ({
          user: state.user ? { ...state.user, currentOutletId: outletId } : null,
        }))
      },

      setUser: (user: User) => {
        set({ user })
      },

      refetchUser: async () => {
        try {
          // We dynamically import to avoid potential circular dependencies during initialization
          const { default: authApi } = await import("@/core/service/auth/auth")
          
          // Fetch profile and outlets in parallel
          const [profile, outletResponse] = await Promise.all([
            authApi.getProfile(),
            authApi.getOutlet()
          ])
          if (profile) {
            // Map API outlets to internal Outlet interface
            const outlets = outletResponse?.data?.map(item => ({
              id: item.outlet_id || "",
              name: item.business_name || "",
              type: "restaurant", // Default type as API doesn't provide it yet
              userRoleId: item.user_role_id
            })).filter(o => o.id) || [] // Filter out null IDs if any

            set((state) => ({
              user: {
                ...state.user,
                id: profile.id,
                name: profile.fullname,
                email: profile.email || "",
                phone: profile.phone || "",
                outlets: outlets,
                // Preserve existing fields if not provided by API
                modules: state.user?.modules || [],
                avatar: state.user?.avatar,
                currentOutletId: state.user?.currentOutletId || outlets[0]?.id
              } as User
            }))
          }
        } catch (error) {
          console.error("Failed to refetch user", error)
        }
      },
    }),
    {
      name: "auth-store",
    },
  ),
)
