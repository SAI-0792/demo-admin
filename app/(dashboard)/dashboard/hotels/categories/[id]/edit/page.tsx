"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useAuthStore, useHotelStore } from "@/core/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const user = useAuthStore((state) => state.user)
  const hotelData = useHotelStore((state) => state.hotelData)
  const updateCategory = useHotelStore((state) => state.updateCategory)

  const [formData, setFormData] = useState({ name: "", description: "" })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const category = hotelData.categories.find((c) => c.id === params.id)
    if (category) {
      setFormData({ name: category.name, description: category.description })
      setLoading(false)
    }
  }, [params.id, hotelData.categories])

  if (!user || !user.modules.includes("hotel")) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Access denied</p>
      </div>
    )
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateCategory(params.id as string, formData)
    router.push("/dashboard/hotels/categories")
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/dashboard/hotels/categories">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-6">Edit Room Category</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Deluxe Room"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this category"
                rows={5}
                required
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Link href="/dashboard/hotels/categories">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit">Update Category</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
