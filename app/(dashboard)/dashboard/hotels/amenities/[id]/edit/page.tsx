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

export default function EditAmenityPage() {
  const router = useRouter()
  const params = useParams()
  const user = useAuthStore((state) => state.user)
  const hotelData = useHotelStore((state) => state.hotelData)
  const updateAmenity = useHotelStore((state) => state.updateAmenity)

  const [formData, setFormData] = useState({ name: "", description: "" })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const amenity = hotelData.amenities.find((a) => a.id === params.id)
    if (amenity) {
      setFormData({ name: amenity.name, description: amenity.description })
      setLoading(false)
    }
  }, [params.id, hotelData.amenities])

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
    updateAmenity(params.id as string, formData)
    router.push("/dashboard/hotels/amenities")
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/dashboard/hotels/amenities">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-6">Edit Amenity</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Amenity Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Free WiFi"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this amenity"
                rows={5}
                required
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Link href="/dashboard/hotels/amenities">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit">Update Amenity</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
