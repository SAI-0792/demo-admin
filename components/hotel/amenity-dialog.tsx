"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Amenity } from "@/core/lib/store"

const ICONS = ["Wifi", "Wind", "Tv", "Wine2", "Dumbbell", "Waves", "Coffee", "Users", "Utensils", "Zap"]

interface AmenityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Amenity) => void
  initialData?: Amenity
}

export function AmenityDialog({ open, onOpenChange, onSubmit, initialData }: AmenityDialogProps) {
  const [formData, setFormData] = useState<Amenity>(
    initialData || {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      icon: "Wifi",
    },
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      icon: "Wifi",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Amenity" : "Add New Amenity"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Amenity Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., WiFi"
              required
            />
          </div>
          <div>
            <Label htmlFor="icon">Icon</Label>
            <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
              <SelectTrigger id="icon">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ICONS.map((icon) => (
                  <SelectItem key={icon} value={icon}>
                    {icon}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{initialData ? "Update" : "Add"} Amenity</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
