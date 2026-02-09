"use client"

import type React from "react"

import { useAuthStore } from "@/core/lib/store"
import { Card } from "@/components/ui/card"
import { Building2, UtensilsCrossed, Car, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  if (!user) return null

  const moduleIcons: Record<string, React.ReactNode> = {
    hotel: <Building2 className="w-8 h-8" />,
    restaurant: <UtensilsCrossed className="w-8 h-8" />,
    travel: <Car className="w-8 h-8" />,
  }

  const moduleLabels: Record<string, string> = {
    hotel: "Hotels",
    restaurant: "Restaurants",
    travel: "Travel Agencies",
  }

  const moduleHrefs: Record<string, string> = {
    hotel: "/dashboard/hotels",
    restaurant: "/dashboard/restaurants",
    travel: "/dashboard/travel",
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
          Welcome back, {user.name}
        </h1>
        <p className="text-lg text-muted-foreground">Manage and monitor all your business operations</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {user.modules?.map((module) => (
          <Link key={module} href={moduleHrefs[module]}>
            <Card className="p-6 h-full backdrop-blur-sm border-border/30 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer group">
              <div className="flex flex-col gap-4 h-full">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-300">
                    <div className="text-primary group-hover:scale-110 transition-transform duration-300">
                      {moduleIcons[module]}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">{moduleLabels[module]}</h3>
                  <p className="text-sm text-muted-foreground">
                    {user.outlets?.filter((o) => o.type === module).length || 0} outlet
                    {(user.outlets?.filter((o) => o.type === module).length || 0) !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div>
        <Card className="p-8 backdrop-blur-sm border-border/30">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Your Outlets</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {user.outlets?.filter(o => o.id).map((outlet) => (
              <div
                key={outlet.id}
                className="p-6 rounded-lg bg-gradient-to-br from-secondary/30 to-secondary/10 border border-border/30 hover:border-primary/30 transition-all duration-300 group cursor-default"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
                      {outlet.name}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize mt-1">{outlet.type}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-primary/60" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
