"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuthStore, useRestaurantStore } from "@/core/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Leaf, Beef } from "lucide-react"
import { GenericViewDialog, type ViewDialogField } from "@/components/hotel/generic-view-dialog"

export default function MenuItemsPage() {
  const user = useAuthStore((state) => state.user)
  const restaurantData = useRestaurantStore((state) => state.restaurantData)
  const updateMenuItem = useRestaurantStore((state) => state.updateMenuItem)
  const deleteMenuItem = useRestaurantStore((state) => state.deleteMenuItem)

  const [viewOpen, setViewOpen] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null)

  const menuItemFields: ViewDialogField[] = [
    { name: "name", label: "Item Name", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "price", label: "Price", type: "number", required: true },
    {
      name: "dietaryType", label: "Dietary Type", type: "select", options: [
        { label: "Vegetarian", value: "VEG" },
        { label: "Non-Vegetarian", value: "NON_VEG" },
        { label: "Vegan", value: "VEGAN" },
      ]
    },
    {
      name: "isAvailable", label: "Availability", type: "select", options: [
        { label: "Available", value: "true" },
        { label: "Unavailable", value: "false" },
      ]
    },
  ]

  if (!user || (!user.modules?.includes("restaurant") && false)) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Access denied</p>
      </div>
    )
  }

  const handleViewClick = (item: any) => {
    setSelectedMenuItem(item)
    setViewOpen(true)
  }

  const handleSaveMenuItem = (updatedItem: any) => {
    const dataToSave: any = {
      name: updatedItem.name,
      description: updatedItem.description,
      price: updatedItem.price,
      dietaryType: updatedItem.dietaryType,
      isAvailable: updatedItem.isAvailable === "true" || updatedItem.isAvailable === true,
    }
    updateMenuItem(selectedMenuItem.id, dataToSave)
    setViewOpen(false)
  }

  const handleDeleteMenuItem = (id: string) => {
    deleteMenuItem(id)
  }

  const getCategoryNames = (item: any) => {
    // Support both legacy subCategoryId and new categoryIds
    const names = []

    if (item.categoryIds && item.categoryIds.length > 0) {
      item.categoryIds.forEach((catId: string) => {
        const cat = restaurantData.categories.find(c => c.id === catId)
        if (cat) names.push(cat.name)
      })
    }

    // Legacy fallback
    if (names.length === 0 && item.subCategoryId) {
      const sub = restaurantData.subCategories.find(s => s.id === item.subCategoryId)
      if (sub) {
        const cat = restaurantData.categories.find(c => c.id === sub.categoryId)
        names.push(cat ? cat.name : "Unknown")
      }
    }

    return names
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Menu Items</h1>
          <p className="text-muted-foreground">Manage restaurant menu items</p>
        </div>
        <Link href="/dashboard/restaurants/menu-items/create">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Menu Item
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Items</p>
          <p className="text-3xl font-bold text-primary">{restaurantData.menuItems.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Available</p>
          <p className="text-3xl font-bold text-primary">
            {restaurantData.menuItems.filter((m) => m.isAvailable).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Unavailable</p>
          <p className="text-3xl font-bold text-primary">
            {restaurantData.menuItems.filter((m) => !m.isAvailable).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Avg Price</p>
          <p className="text-3xl font-bold text-primary">
            ₹
            {(
              restaurantData.menuItems.reduce((sum, m) => sum + m.price, 0) / restaurantData.menuItems.length || 0
            ).toFixed(2)}
          </p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary">
                <TableHead className="font-semibold w-[80px]">Image</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Categories</TableHead>
                <TableHead className="font-semibold">Dietary</TableHead>
                <TableHead className="font-semibold">Price</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {restaurantData.menuItems.length === 0 ? (
                <TableRow key="no-items">
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No menu items found. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                restaurantData.menuItems.map((item, index) => {
                  const primaryImage = item.images.find((img) => img.isPrimary || img.id === item.primaryImageId) || item.images[0]
                  const categories = getCategoryNames(item)

                  return (
                    <TableRow key={item.id || index}>
                      <TableCell>
                        {primaryImage ? (
                          <div className="relative w-12 h-12 rounded overflow-hidden border">
                            <img
                              src={primaryImage.url || "/placeholder.svg"}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded border" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>{item.name}</div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">{item.description}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {categories.length > 0 ? (
                            categories.map((cat, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{cat}</Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs">Uncategorized</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.dietaryType === 'VEG' && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 gap-1">
                            <Leaf className="w-3 h-3 fill-green-500 text-green-500" /> Veg
                          </Badge>
                        )}
                        {item.dietaryType === 'NON_VEG' && (
                          <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200 gap-1">
                            <Beef className="w-3 h-3 text-red-500" /> Non-Veg
                          </Badge>
                        )}
                        {item.dietaryType === 'VEGAN' && (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 gap-1">
                            <Leaf className="w-3 h-3 fill-emerald-500 text-emerald-500" /> Vegan
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">₹{item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${item.isAvailable
                            ? "bg-green-500/20 text-green-700 dark:text-green-400"
                            : "bg-red-500/20 text-red-700 dark:text-red-400"
                            }`}
                        >
                          {item.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewClick(item)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <GenericViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        data={selectedMenuItem}
        fields={menuItemFields}
        title="Menu Item Details"
        onSave={handleSaveMenuItem}
        onDelete={handleDeleteMenuItem}
      />
    </div>
  )
}
