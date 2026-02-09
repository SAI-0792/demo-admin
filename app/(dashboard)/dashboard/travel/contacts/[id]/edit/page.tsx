"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useAuthStore, useTravelStore } from "@/core/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, X } from "lucide-react"

export default function EditContactPage() {
  const router = useRouter()
  const params = useParams()
  const user = useAuthStore((state) => state.user)
  const { travelData, updateContact } = useTravelStore((state) => ({
    travelData: state.travelData,
    updateContact: state.updateContact,
  }))

  const [formData, setFormData] = useState({
    name: "",
    type: "client" as const,
    email: "",
    phone: "",
    address: "",
    vehicleIds: [] as string[],
    image: "",
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const contact = travelData.contacts.find((c) => c.id === params.id)
    if (contact) {
      setFormData({
        name: contact.name,
        type: contact.type,
        email: contact.email,
        phone: contact.phone,
        address: contact.address,
        vehicleIds: contact.vehicleIds || [],
        image: contact.image || "",
      })
      if (contact.image) {
        setImagePreview(contact.image)
      }
      setLoading(false)
    }
  }, [params.id, travelData.contacts])

  if (!user || !user.modules.includes("travel")) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Access denied</p>
      </div>
    )
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        setFormData({ ...formData, image: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    setFormData({ ...formData, image: "" })
  }

  const handleVehicleSelect = (vehicleId: string) => {
    setFormData((prev) => ({
      ...prev,
      vehicleIds: prev.vehicleIds.includes(vehicleId)
        ? prev.vehicleIds.filter((id) => id !== vehicleId)
        : [...prev.vehicleIds, vehicleId],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updates = {
      name: formData.name,
      type: formData.type,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      vehicleIds: formData.vehicleIds.length > 0 ? formData.vehicleIds : undefined,
      image: formData.image || undefined,
    }
    updateContact(params.id as string, updates as any)
    router.push("/dashboard/travel/contacts")
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/dashboard/travel/contacts">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-6">Edit Contact</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Image Upload */}
            <div className="border-2 border-dashed rounded-lg p-6">
              <Label className="text-base font-semibold mb-4 block">Contact Image</Label>
              {imagePreview ? (
                <div className="space-y-3">
                  <div className="relative w-32 h-32">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Contact"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <Button type="button" variant="destructive" size="sm" onClick={handleRemoveImage} className="gap-2">
                    <X className="w-4 h-4" />
                    Remove Image
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Click to upload contact image</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>

            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., John Doe"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="driver">Driver</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1234567890"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g., 123 Main Street"
                required
              />
            </div>

            <div>
              <Label className="mb-3 block">Associated Vehicles</Label>
              <div className="space-y-2 border rounded-lg p-4 max-h-48 overflow-y-auto">
                {travelData.vehicles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No vehicles available</p>
                ) : (
                  travelData.vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={vehicle.id}
                        checked={formData.vehicleIds.includes(vehicle.id)}
                        onChange={() => handleVehicleSelect(vehicle.id)}
                        className="rounded"
                      />
                      <label htmlFor={vehicle.id} className="text-sm cursor-pointer">
                        {vehicle.licensePlate} ({vehicle.type})
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Link href="/dashboard/travel/contacts">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit">Update Contact</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
