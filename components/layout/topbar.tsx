"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/core/lib/store"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, LogOut, User, Building2 } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { logoutAction } from "@/app/actions/auth-actions"

export function Topbar() {
  const user = useAuthStore((state) => state.user)
  const setCurrentOutlet = useAuthStore((state) => state.setCurrentOutlet)
  const logout = useAuthStore((state) => state.logout)
  // const router = useRouter() // Not needed if server action redirects

  if (!user) return null

  const currentOutlet = user.outlets?.find((o) => o.id === user.currentOutletId)

  const handleLogout = async () => {
    logout() // Clear local store immediately
    await logoutAction()
  }

  return (
    /* Modern topbar with glass effect and gradient */
    <div className="h-16 border-b border-border/30 bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8 lg:ml-72 shadow-lg shadow-black/20">
      {/* Left side - Outlet Selector */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/40 border border-border/30">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <Select value={user.currentOutletId || ""} onValueChange={setCurrentOutlet}>
            <SelectTrigger className="w-56 border-0 bg-transparent focus:ring-0 text-foreground">
              <SelectValue placeholder="Select outlet" />
            </SelectTrigger>
            <SelectContent className="border-border/30 bg-card/95 backdrop-blur-xl">
              {user.outlets?.filter(o => o.id).map((outlet) => (
                <SelectItem key={outlet.id} value={outlet.id} className="cursor-pointer hover:bg-secondary/40">
                  {outlet.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Right side - Theme Toggle and User Menu */}
      <div className="flex items-center gap-4">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/40 transition-all duration-300 border border-transparent hover:border-border/30">
              <Avatar className="w-9 h-9 border border-primary/30">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary/40 to-primary/20 text-primary-foreground">
                  {user.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 border-border/30 bg-card/95 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/20" />
            <DropdownMenuItem onClick={handleLogout} className="text-red-400 cursor-pointer hover:bg-red-500/10">
              <LogOut className="w-4 h-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
