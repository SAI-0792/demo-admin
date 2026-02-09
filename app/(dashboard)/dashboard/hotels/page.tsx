"use client"

import { useState } from "react"
import { useAuthStore } from "@/core/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit2, Trash2 } from "lucide-react"

// Mock hotel categories data
const MOCK_CATEGORIES = [
  { id: "1", name: "Deluxe", description: "Premium room category" },
  { id: "2", name: "Standard", description: "Standard room category" },
  { id: "3", name: "Suite", description: "Luxury suite category" },
]

export default function HotelsPage() {
  const user = useAuthStore((state) => state.user)
  const [categories] = useState(MOCK_CATEGORIES)

  if (!user || !user.modules.includes("hotel")) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Access denied</p>
      </div>
    )
  }

  const currentHotel = user.outlets.find((o) => o.type === "hotel" && o.id === user.currentOutletId)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Hotels Management</h1>
        <p className="text-muted-foreground">
          Manage your hotel: <span className="font-medium">{currentHotel?.name}</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Categories</p>
          <p className="text-3xl font-bold text-primary">{categories.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Amenities</p>
          <p className="text-3xl font-bold text-primary">12</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Rooms</p>
          <p className="text-3xl font-bold text-primary">48</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Active Bookings</p>
          <p className="text-3xl font-bold text-primary">8</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Room Categories</h2>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
