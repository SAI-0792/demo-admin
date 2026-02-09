import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Outlet } from "@/core/service/auth/types"

interface OutletStore {
  outlets: Outlet[]
  currentOutlet: Outlet | null
  isLoading: boolean
  
  setOutlets: (outlets: Outlet[]) => void
  setCurrentOutlet: (outlet: Outlet | null) => void
  fetchOutlets: () => Promise<void>
}

export const useOutletStore = create<OutletStore>()(
  persist(
    (set, get) => ({
      outlets: [],
      currentOutlet: null,
      isLoading: false,

      setOutlets: (outlets: Outlet[]) => {
        set({ outlets })
        // If no current outlet is selected, select the first one
        if (!get().currentOutlet && outlets.length > 0) {
          set({ currentOutlet: outlets[0] })
        }
      },

      setCurrentOutlet: (outlet: Outlet | null) => {
        set({ currentOutlet: outlet })
      },

      fetchOutlets: async () => {
        set({ isLoading: true })
        try {
          const { default: authApi } = await import("@/core/service/auth/auth")
          const response = await authApi.getOutlet()
          
          if (response?.data) {
            const outlets = response.data.map(item => ({
              id: item.outlet_id || "",
              name: item.business_name || "Unnamed Outlet",
              type: "restaurant", // Default type
              userRoleId: item.user_role_id
            })).filter(o => o.id)

            set({ outlets })
            
            // Auto-select first outlet if none selected or current one is not in the new list
            const current = get().currentOutlet
            if (!current || !outlets.find(o => o.id === current.id)) {
              if (outlets.length > 0) {
                set({ currentOutlet: outlets[0] })
              } else {
                set({ currentOutlet: null })
              }
            }
          }
        } catch (error) {
          console.error("Failed to fetch outlets", error)
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: "outlet-store",
    },
  ),
)
