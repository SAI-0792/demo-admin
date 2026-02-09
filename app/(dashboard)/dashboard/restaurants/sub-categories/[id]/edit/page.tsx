"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useAuthStore, useRestaurantStore } from "@/core/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, X } from "lucide-react"

export default function EditSubCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const user = useAuthStore((state) => state.user)
  const restaurantData = useRestaurantStore((state) => state.restaurantData)
  const updateSubCategory = useRestaurantStore((state) => state.updateSubCategory)

  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    description: "",
    image: undefined as string | undefined,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const subCat = restaurantData.subCategories.find((s) => s.id === params.id)
    if (subCat) {
      setFormData({
        categoryId: subCat.categoryId,
        name: subCat.name,
        description: subCat.description,
        image: subCat.image,
      })
      setLoading(false)
    }
  }, [params.id, restaurantData.subCategories])

  if (!user || !user.modules.includes("restaurant")) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Access denied</p>
      </div>
    )
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const url = event.target?.result as string
        setFormData((prev) => ({
          ...prev,
          image: url,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: undefined,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateSubCategory(params.id as string, {
      categoryId: formData.categoryId,
      name: formData.name,
      description: formData.description,
      image: formData.image,
    })
    router.push("/dashboard/restaurants/sub-categories")
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/dashboard/restaurants/sub-categories">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-6">Edit Sub Category</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="categoryId">Category</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {restaurantData.categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="name">Sub Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Hot Appetizers"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this sub category"
                rows={5}
                required
              />
            </div>

            <div>
              <Label>Sub Category Image</Label>
              <div className="mt-2 space-y-4">
                {!formData.image ? (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <p className="text-sm font-medium">Click to upload image</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                    </label>
                  </div>
                ) : (
                  <div className="relative group">
                    <img
                      src={formData.image || "/placeholder.svg"}
                      alt="Sub Category"
                      className="w-full h-48 object-cover rounded border border-border"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                      onClick={handleRemoveImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Link href="/dashboard/restaurants/sub-categories">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit">Update Sub Category</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
