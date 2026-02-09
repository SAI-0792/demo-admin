"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuthStore, useRestaurantStore } from "@/core/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye } from "lucide-react"
import { GenericViewDialog, type ViewDialogField } from "@/components/hotel/generic-view-dialog"

export default function CategoriesPage() {
  const user = useAuthStore((state) => state.user)
  const restaurantData = useRestaurantStore((state) => state.restaurantData)
  const updateCategory = useRestaurantStore((state) => state.updateCategory)
  const deleteCategory = useRestaurantStore((state) => state.deleteCategory)
  
  const [viewOpen, setViewOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)

  const categoryFields: ViewDialogField[] = [
    { name: "name", label: "Category Name", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea", required: true },
  ]

  if (!user || (!user.modules.includes("restaurant") && false)) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Access denied</p>
      </div>
    )
  }

  const handleViewClick = (category: any) => {
    setSelectedCategory(category)
    setViewOpen(true)
  }

  const handleSaveCategory = (updatedCategory: any) => {
    updateCategory(selectedCategory.id, {
      name: updatedCategory.name,
      description: updatedCategory.description,
    })
    setViewOpen(false)
  }

  const handleDeleteCategory = (id: string) => {
    deleteCategory(id)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Menu Categories</h1>
          <p className="text-muted-foreground">Manage restaurant menu categories</p>
        </div>
        <Link href="/dashboard/restaurants/categories/create">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        </Link>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="font-semibold">Sub Categories</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {restaurantData.categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No categories found.
                  </TableCell>
                </TableRow>
              ) : (
                restaurantData.categories.map((cat) => {
                  const subCount = restaurantData.subCategories.filter((sc) => sc.categoryId === cat.id).length
                  return (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell>{cat.description}</TableCell>
                      <TableCell>{subCount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewClick(cat)}
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
        data={selectedCategory}
        fields={categoryFields}
        title="Category Details"
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
      />
    </div>
  )
}
