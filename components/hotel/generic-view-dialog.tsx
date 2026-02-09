"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, X, Trash2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

export interface ViewDialogField {
  name: string
  label: string
  type: "text" | "textarea" | "select" | "number"
  required?: boolean
  options?: { label: string; value: string }[]
}

interface GenericViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: Record<string, any> | null
  fields: ViewDialogField[]
  title?: string
  onSave: (data: Record<string, any>) => void
  onDelete?: (id: string) => void
}

export function GenericViewDialog({
  open,
  onOpenChange,
  data,
  fields,
  title = "Details",
  onSave,
  onDelete,
}: GenericViewDialogProps) {
  const [editingField, setEditingField] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, any> | null>(data)

  useEffect(() => {
    setFormData(data)
    setEditingField(null)
  }, [data, open])

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
    setFormData(data)
    setEditingField(null)
  }

  const handleDelete = () => {
    if (formData && onDelete) {
      onDelete(formData.id)
      onOpenChange(false)
    }
  }

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData({ ...formData, [fieldName]: value })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {fields.map((field) => {
            const fieldValue = formData[field.name]
            const isEditing = editingField === field.name

            return (
              <div
                key={field.name}
                onDoubleClick={() => handleFieldDoubleClick(field.name)}
                className={`cursor-pointer transition-all ${
                  isEditing
                    ? "bg-muted p-4 rounded-lg border-2 border-primary"
                    : "p-4 rounded-lg hover:bg-muted/50 border-2 border-transparent"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Label className="text-xs font-semibold text-muted-foreground mb-2 block">
                      {field.label} {isEditing && <span className="text-primary">(editing)</span>}
                    </Label>
                    {isEditing ? (
                      <div className="mt-2">
                        {field.type === "text" && (
                          <Input
                            value={fieldValue || ""}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            placeholder={field.label}
                            autoFocus
                          />
                        )}
                        {field.type === "number" && (
                          <Input
                            type="number"
                            value={fieldValue || ""}
                            onChange={(e) => handleFieldChange(field.name, parseFloat(e.target.value) || 0)}
                            placeholder={field.label}
                            autoFocus
                          />
                        )}
                        {field.type === "textarea" && (
                          <Textarea
                            value={fieldValue || ""}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            placeholder={field.label}
                            autoFocus
                            className="resize-none"
                          />
                        )}
                        {field.type === "select" && field.options && (
                          <Select value={fieldValue || ""} onValueChange={(value) => handleFieldChange(field.name, value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm font-medium break-words">
                        {fieldValue || <span className="text-muted-foreground italic">Not set</span>}
                      </p>
                    )}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2 pt-8">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleDiscard}
                        size="sm"
                        className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        onClick={handleSave}
                        size="sm"
                        className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-xs text-muted-foreground italic">
          💡 Tip: Double-click on any field to edit it
        </div>

        <DialogFooter className="flex gap-2 justify-between">
          {onDelete && (
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
          )}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
