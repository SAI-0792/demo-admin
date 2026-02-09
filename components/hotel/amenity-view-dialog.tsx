"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Amenity } from "@/core/lib/store"
import { Check, X, Trash2 } from "lucide-react"

const ICONS = ["Wifi", "Wind", "Tv", "Wine2", "Dumbbell", "Waves", "Coffee", "Users", "Utensils", "Zap"]

interface AmenityViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  amenity: Amenity | null
  onSave: (data: Amenity) => void
  onDelete?: (id: string) => void
}

export function AmenityViewDialog({ open, onOpenChange, amenity, onSave, onDelete }: AmenityViewDialogProps) {
  const [editingField, setEditingField] = useState<string | null>(null)
  const [formData, setFormData] = useState<Amenity | null>(amenity)

  useEffect(() => {
    setFormData(amenity)
    setEditingField(null)
  }, [amenity, open])

  if (!formData) return null

  const handleFieldDoubleClick = (fieldName: string) => {
    setEditingField(fieldName)
  }

  const handleSave = () => {
    if (formData) {
      onSave(formData)
      setEditingField(null)
    }
  }

  const handleDiscard = () => {
    setFormData(amenity)
    setEditingField(null)
  }

  const handleDelete = () => {
    if (formData && onDelete) {
      onDelete(formData.id)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Amenity Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Name Field */}
          <div
            onDoubleClick={() => handleFieldDoubleClick("name")}
            className={`cursor-pointer transition-all ${
              editingField === "name"
                ? "bg-muted p-4 rounded-lg border-2 border-primary"
                : "p-4 rounded-lg hover:bg-muted/50 border-2 border-transparent"
            }`}
          >
            <Label className="text-xs font-semibold text-muted-foreground mb-2 block">
              Amenity Name {editingField === "name" && <span className="text-primary">(editing)</span>}
            </Label>
            {editingField === "name" ? (
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., WiFi"
                autoFocus
                className="mt-2"
              />
            ) : (
              <p className="text-sm font-medium">{formData.name || "Not set"}</p>
            )}
          </div>

          {/* Icon Field */}
          <div
            onDoubleClick={() => handleFieldDoubleClick("icon")}
            className={`cursor-pointer transition-all ${
              editingField === "icon"
                ? "bg-muted p-4 rounded-lg border-2 border-primary"
                : "p-4 rounded-lg hover:bg-muted/50 border-2 border-transparent"
            }`}
          >
            <Label className="text-xs font-semibold text-muted-foreground mb-2 block">
              Icon {editingField === "icon" && <span className="text-primary">(editing)</span>}
            </Label>
            {editingField === "icon" ? (
              <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                <SelectTrigger className="mt-2">
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
            ) : (
              <p className="text-sm font-medium">{formData.icon || "Not set"}</p>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground italic">
          💡 Tip: Double-click on any field to edit it
        </div>

        <DialogFooter className="flex gap-2 justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleDelete}
            disabled={editingField !== null}
            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
          <div className="flex gap-2">
            {editingField ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDiscard}
                  className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="w-4 h-4" />
                  Discard
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="w-4 h-4" />
                  Save
                </Button>
              </>
            ) : (
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
