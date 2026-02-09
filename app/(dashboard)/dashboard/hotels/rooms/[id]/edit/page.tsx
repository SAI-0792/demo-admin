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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Upload, X } from "lucide-react"

export default function EditRoomPage() {
  const router = useRouter()
  const params = useParams()
  const user = useAuthStore((state) => state.user)
  const hotelData = useHotelStore((state) => state.hotelData)
  const updateRoom = useHotelStore((state) => state.updateRoom)

  const [formData, setFormData] = useState({
    roomNumber: "",
    categoryId: "",
    capacity: "2",
    pricePerNight: "",
    description: "",
    amenities: [] as string[],
    status: "available" as "available" | "occupied" | "maintenance",
    images: [] as { id: string; url: string }[],
    primaryImageId: undefined as string | undefined,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const room = hotelData.rooms.find((r) => r.id === params.id)
    if (room) {
      setFormData({
        roomNumber: room.name,
        categoryId: room.categoryId,
        capacity: room.capacity.toString(),
        pricePerNight: room.price.toString(),
        description: room.description || "",
        amenities: room.amenities,
        status: room.status,
        images: room.images || [],
        primaryImageId: room.primaryImageId,
      })
      setLoading(false)
    }
  }, [params.id, hotelData.rooms])

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          const url = event.target?.result as string
          const newImage = {
            id: `img-${Date.now()}-${Math.random()}`,
            url,
          }
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, newImage],
            primaryImageId: prev.primaryImageId || newImage.id,
          }))
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleRemoveImage = (imageId: string) => {
    setFormData((prev) => {
      const updatedImages = prev.images.filter((img) => img.id !== imageId)
      return {
        ...prev,
        images: updatedImages,
        primaryImageId: prev.primaryImageId === imageId ? updatedImages[0]?.id : prev.primaryImageId,
      }
    })
  }

  const handleSetPrimary = (imageId: string) => {
    setFormData((prev) => ({
      ...prev,
      primaryImageId: imageId,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const roomData = {
      name: formData.roomNumber,
      categoryId: formData.categoryId,
      capacity: Number(formData.capacity),
      price: Number(formData.pricePerNight),
      description: formData.description,
      amenities: formData.amenities,
      status: formData.status,
      images: formData.images,
      primaryImageId: formData.primaryImageId,
    }
    updateRoom(params.id as string, roomData as any)
    router.push("/dashboard/hotels/rooms")
  }

  const toggleAmenity = (amenityId: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.includes(amenityId)
        ? formData.amenities.filter((id) => id !== amenityId)
        : [...formData.amenities, amenityId],
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/dashboard/hotels/rooms">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-6">Edit Room</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="roomNumber">Room Number</Label>
                <Input
                  id="roomNumber"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  placeholder="e.g., 101"
                  required
                />
              </div>

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
                    {hotelData.categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  min="1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="price">Price Per Night</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.pricePerNight}
                  onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                  placeholder="e.g., 100"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this room"
                rows={5}
                required
              />
            </div>

            <div>
              <Label>Room Images</Label>
              <div className="mt-2 space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <p className="text-sm font-medium">Click to upload images</p>
                    <p className="text-xs text-muted-foreground">or drag and drop</p>
                  </label>
                </div>

                {/* Display uploaded images */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {formData.images.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.url || "/placeholder.svg"}
                          alt="Room"
                          className="w-full h-24 object-cover rounded border border-border"
                        />
                        <div className="absolute top-1 right-1 flex gap-1">
                          {formData.primaryImageId !== image.id && (
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              className="opacity-0 group-hover:opacity-100 h-6 text-xs"
                              onClick={() => handleSetPrimary(image.id)}
                            >
                              Primary
                            </Button>
                          )}
                          {formData.primaryImageId === image.id && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                              Primary
                            </span>
                          )}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                          onClick={() => handleRemoveImage(image.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>Amenities</Label>
              <div className="space-y-2 mt-2">
                {hotelData.amenities.map((amenity) => (
                  <div key={amenity.id} className="flex items-center gap-2">
                    <Checkbox
                      id={amenity.id}
                      checked={formData.amenities.includes(amenity.id)}
                      onCheckedChange={() => toggleAmenity(amenity.id)}
                    />
                    <Label htmlFor={amenity.id} className="cursor-pointer">
                      {amenity.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Link href="/dashboard/hotels/rooms">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit">Update Room</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
