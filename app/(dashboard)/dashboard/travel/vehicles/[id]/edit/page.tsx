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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, X } from "lucide-react"

export default function EditVehiclePage() {
  const router = useRouter()
  const params = useParams()
  const user = useAuthStore((state) => state.user)
  const travelData = useTravelStore((state) => state.travelData)
  const updateVehicle = useTravelStore((state) => state.updateVehicle)
  const addDriver = useTravelStore((state) => state.addDriver)
  const updateDriver = useTravelStore((state) => state.updateDriver)

  const [formData, setFormData] = useState({
    type: "car",
    licensePlate: "",
    capacity: "4",
    status: "active",
    description: "",
    driverId: "",
    registrationExpiry: "",
    lastMaintenanceDate: "",
    vehicleImage: "",
    driverName: "",
    driverLicenseNumber: "",
    driverPhone: "",
    driverEmail: "",
    driverLicenseExpiry: "",
    driverImage: "",
  })
  const [vehicleImagePreview, setVehicleImagePreview] = useState<string | null>(null)
  const [driverImagePreview, setDriverImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const vehicle = travelData.vehicles.find((v) => v.id === params.id)
    if (vehicle) {
      setFormData({
        type: vehicle.type,
        licensePlate: vehicle.licensePlate,
        capacity: vehicle.capacity.toString(),
        status: vehicle.status,
        description: vehicle.description,
        driverId: vehicle.driverId || "",
        registrationExpiry: vehicle.registrationExpiry || "",
        lastMaintenanceDate: vehicle.lastMaintenanceDate || "",
        vehicleImage: vehicle.image || "",
        driverName: "",
        driverLicenseNumber: "",
        driverPhone: "",
        driverEmail: "",
        driverLicenseExpiry: "",
        driverImage: "",
      })

      if (vehicle.image) {
        setVehicleImagePreview(vehicle.image)
      }

      if (vehicle.driverId) {
        const driver = travelData.drivers.find((d) => d.id === vehicle.driverId)
        if (driver) {
          setFormData((prev) => ({
            ...prev,
            driverName: driver.name,
            driverLicenseNumber: driver.licenseNumber,
            driverPhone: driver.phone,
            driverEmail: driver.email,
            driverLicenseExpiry: driver.licenseExpiry,
            driverImage: driver.image || "",
          }))
          if (driver.image) {
            setDriverImagePreview(driver.image)
          }
        }
      }

      setLoading(false)
    }
  }, [params.id, travelData.vehicles, travelData.drivers])

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

  const handleVehicleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setVehicleImagePreview(reader.result as string)
        setFormData({ ...formData, vehicleImage: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDriverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setDriverImagePreview(reader.result as string)
        setFormData({ ...formData, driverImage: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveVehicleImage = () => {
    setVehicleImagePreview(null)
    setFormData({ ...formData, vehicleImage: "" })
  }

  const handleRemoveDriverImage = () => {
    setDriverImagePreview(null)
    setFormData({ ...formData, driverImage: "" })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let driverId = formData.driverId
    if (formData.driverName) {
      if (driverId) {
        // Update existing driver
        updateDriver(driverId, {
          name: formData.driverName,
          licenseNumber: formData.driverLicenseNumber,
          phone: formData.driverPhone,
          email: formData.driverEmail,
          licenseExpiry: formData.driverLicenseExpiry,
          image: formData.driverImage || undefined,
        })
      } else {
        // Create new driver
        const newDriver = {
          id: `driver-${Date.now()}`,
          name: formData.driverName,
          licenseNumber: formData.driverLicenseNumber,
          phone: formData.driverPhone,
          email: formData.driverEmail,
          licenseExpiry: formData.driverLicenseExpiry,
          image: formData.driverImage || undefined,
        }
        addDriver(newDriver)
        driverId = newDriver.id
      }
    } else {
      driverId = undefined
    }

    const updates = {
      type: formData.type,
      licensePlate: formData.licensePlate,
      capacity: Number(formData.capacity),
      status: formData.status,
      description: formData.description,
      driverId,
      image: formData.vehicleImage || undefined,
      registrationExpiry: formData.registrationExpiry || undefined,
      lastMaintenanceDate: formData.lastMaintenanceDate || undefined,
    }
    updateVehicle(params.id as string, updates as any)
    router.push("/dashboard/travel")
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/dashboard/travel">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-6">Edit Vehicle</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Vehicle Section */}
            <div className="border-b pb-8">
              <h2 className="text-2xl font-semibold mb-6">Vehicle Details</h2>

              {/* Vehicle Image Upload */}
              <div className="border-2 border-dashed rounded-lg p-6 mb-6">
                <Label className="text-base font-semibold mb-4 block">Vehicle Image</Label>
                {vehicleImagePreview ? (
                  <div className="space-y-3">
                    <div className="relative w-48 h-48">
                      <img
                        src={vehicleImagePreview || "/placeholder.svg"}
                        alt="Vehicle"
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveVehicleImage}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Click to upload vehicle image</span>
                    <input type="file" accept="image/*" onChange={handleVehicleImageChange} className="hidden" />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Vehicle Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bus">Bus</SelectItem>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="licensePlate">License Plate</Label>
                  <Input
                    id="licensePlate"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                    placeholder="e.g., AB-1234"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
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
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="registrationExpiry">Registration Expiry</Label>
                  <Input
                    id="registrationExpiry"
                    type="date"
                    value={formData.registrationExpiry}
                    onChange={(e) => setFormData({ ...formData, registrationExpiry: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="lastMaintenanceDate">Last Maintenance Date</Label>
                  <Input
                    id="lastMaintenanceDate"
                    type="date"
                    value={formData.lastMaintenanceDate}
                    onChange={(e) => setFormData({ ...formData, lastMaintenanceDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this vehicle"
                  rows={3}
                  required
                />
              </div>
            </div>

            {/* Driver Section */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">Driver Details (Optional)</h2>

              {/* Driver Image Upload */}
              <div className="border-2 border-dashed rounded-lg p-6 mb-6">
                <Label className="text-base font-semibold mb-4 block">Driver Image</Label>
                {driverImagePreview ? (
                  <div className="space-y-3">
                    <div className="relative w-48 h-48">
                      <img
                        src={driverImagePreview || "/placeholder.svg"}
                        alt="Driver"
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveDriverImage}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Click to upload driver image</span>
                    <input type="file" accept="image/*" onChange={handleDriverImageChange} className="hidden" />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="driverName">Driver Name</Label>
                  <Input
                    id="driverName"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    placeholder="Enter driver name"
                  />
                </div>

                <div>
                  <Label htmlFor="driverLicenseNumber">License Number</Label>
                  <Input
                    id="driverLicenseNumber"
                    value={formData.driverLicenseNumber}
                    onChange={(e) => setFormData({ ...formData, driverLicenseNumber: e.target.value })}
                    placeholder="Enter license number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="driverPhone">Phone</Label>
                  <Input
                    id="driverPhone"
                    value={formData.driverPhone}
                    onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="driverEmail">Email</Label>
                  <Input
                    id="driverEmail"
                    type="email"
                    value={formData.driverEmail}
                    onChange={(e) => setFormData({ ...formData, driverEmail: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="driverLicenseExpiry">License Expiry Date</Label>
                <Input
                  id="driverLicenseExpiry"
                  type="date"
                  value={formData.driverLicenseExpiry}
                  onChange={(e) => setFormData({ ...formData, driverLicenseExpiry: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Link href="/dashboard/travel">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit">Update Vehicle</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
