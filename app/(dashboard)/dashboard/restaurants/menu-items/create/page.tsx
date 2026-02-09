"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthStore, useRestaurantStore } from "@/core/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { MultiSelect } from "@/components/ui/multi-select"
import { DietarySelector, DietaryType } from "@/components/ui/dietary-selector"
import { ImageUpload, ImageFile } from "@/components/ui/image-upload"

export default function CreateMenuItemPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const restaurantData = useRestaurantStore((state) => state.restaurantData)
  const addMenuItem = useRestaurantStore((state) => state.addMenuItem)

  const [formData, setFormData] = useState({
    categoryIds: [] as string[],
    name: "",
    sku: "",
    description: "",
    price: "",
    discountPrice: "",
    dietaryType: "VEG" as DietaryType,
    isAvailable: true,
    images: [] as ImageFile[],
    hasVariants: false,
    variants: [] as any[]
  })

  // Variant State
  const [newVariant, setNewVariant] = useState({
    name: "",
    price: "",
    stockCount: "0"
  })

  const handleAddVariant = () => {
    if (!newVariant.name || !newVariant.price) return
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, {
        name: newVariant.name,
        price: Number(newVariant.price),
        stockCount: Number(newVariant.stockCount),
        isActive: true
      }]
    }))
    setNewVariant({ name: "", price: "", stockCount: "0" })
  }

  const handleRemoveVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }))
  }

  if (!user || (!user.modules?.includes("restaurant") && false)) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Access denied</p>
      </div>
    )
  }

  const categoryOptions = restaurantData.categories.map(cat => ({
    label: cat.name,
    value: cat.id
  }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const menuItemData = {
      id: `ritem-${Date.now()}`,
      // Legacy support (optional, can pick first category)
      subCategoryId: "",
      categoryIds: formData.categoryIds,
      name: formData.name,
      description: formData.description,
      dietaryType: formData.dietaryType,
      price: Number(formData.price),
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
      isAvailable: formData.isAvailable,
      images: formData.images.map(img => ({
        id: img.id,
        url: img.url,
        sequence: img.sequence,
        isPrimary: img.isPrimary
      })),
      primaryImageId: formData.images.find(img => img.isPrimary)?.id || formData.images[0]?.id,
      hasVariants: formData.hasVariants,
      variants: formData.hasVariants ? formData.variants : []
    }

    addMenuItem(menuItemData as any)
    router.push("/dashboard/restaurants/menu-items")
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/dashboard/restaurants/menu-items">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-6">Create Menu Item</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Grilled Salmon"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>SKU / Code</Label>
                <Input
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g., SAL-001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categories *</Label>
              <MultiSelect
                options={categoryOptions}
                selected={formData.categoryIds}
                onChange={(selected) => setFormData({ ...formData, categoryIds: selected })}
                placeholder="Select categories..."
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this menu item"
                rows={4}
                required
              />
            </div>

            {/* Pricing & Dietary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Base Price *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Discount Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.discountPrice}
                  onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label>Dietary Preference</Label>
                <DietarySelector
                  value={formData.dietaryType}
                  onChange={(val) => setFormData({ ...formData, dietaryType: val })}
                />
              </div>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="isAvailable"
                checked={formData.isAvailable}
                onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked as boolean })}
              />
              <Label htmlFor="isAvailable" className="cursor-pointer">
                Available for ordering
              </Label>
            </div>

            {/* Images */}
            <div className="space-y-2">
              <Label>Images (Drag to reorder, star to set cover)</Label>
              <ImageUpload
                value={formData.images}
                onChange={(imgs) => setFormData({ ...formData, images: imgs })}
              />
            </div>

            {/* Variants Section */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="hasVariants"
                    checked={formData.hasVariants}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasVariants: checked as boolean })}
                  />
                  <Label htmlFor="hasVariants" className="font-semibold">This item has variants</Label>
                </div>
              </div>

              {formData.hasVariants && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-7 gap-2 items-end">
                    <div className="col-span-3">
                      <Label className="text-xs">Variant Name</Label>
                      <Input
                        placeholder="e.g. Small, Large"
                        value={newVariant.name}
                        onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Price</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={newVariant.price}
                        onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })}
                      />
                    </div>
                    <div className="col-span-1">
                      <Label className="text-xs">Stock</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newVariant.stockCount}
                        onChange={(e) => setNewVariant({ ...newVariant, stockCount: e.target.value })}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button type="button" onClick={handleAddVariant} disabled={!newVariant.name || !newVariant.price} className="w-full">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {formData.variants.length > 0 && (
                    <div className="space-y-2">
                      {formData.variants.map((variant, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                          <div className="grid grid-cols-3 gap-4 flex-1">
                            <span className="font-medium">{variant.name}</span>
                            <span>₹{variant.price.toFixed(2)}</span>
                            <span>{variant.stockCount} in stock</span>
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveVariant(idx)} className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Link href="/dashboard/restaurants/menu-items">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit">Create Menu Item</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
