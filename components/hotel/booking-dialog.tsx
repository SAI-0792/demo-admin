"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Booking, Room, HotelCategory } from "@/core/lib/store"

interface BookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Booking) => void
  initialData?: Booking
  rooms: Room[]
  categories: HotelCategory[]
}

export function BookingDialog({ open, onOpenChange, onSubmit, initialData, rooms, categories }: BookingDialogProps) {
  const [formData, setFormData] = useState<Booking>(
    initialData || {
      id: Math.random().toString(36).substr(2, 9),
      roomId: "",
      guestName: "",
      email: "",
      phone: "",
      checkIn: "",
      checkOut: "",
      totalPrice: 0,
      status: "pending",
    },
  )

  const selectedRoom = rooms.find((r) => r.id === formData.roomId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      id: Math.random().toString(36).substr(2, 9),
      roomId: "",
      guestName: "",
      email: "",
      phone: "",
      checkIn: "",
      checkOut: "",
      totalPrice: 0,
      status: "pending",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Booking" : "Add New Booking"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="room">Select Room</Label>
            <Select value={formData.roomId} onValueChange={(value) => setFormData({ ...formData, roomId: value })}>
              <SelectTrigger id="room">
                <SelectValue placeholder="Select a room" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => {
                  const category = categories.find((c) => c.id === room.categoryId)
                  return (
                    <SelectItem key={room.id} value={room.id}>
                      {`Room ${room.name} (${category?.name}) - $${room.price}/night`}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guestName">Guest Name</Label>
              <Input
                id="guestName"
                value={formData.guestName}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="checkIn">Check-in Date</Label>
              <Input
                id="checkIn"
                type="date"
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="checkOut">Check-out Date</Label>
              <Input
                id="checkOut"
                type="date"
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="totalPrice">Total Price ($)</Label>
            <Input
              id="totalPrice"
              type="number"
              value={formData.totalPrice}
              onChange={(e) => setFormData({ ...formData, totalPrice: Number(e.target.value) })}
              required
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="checked-in">Checked-in</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{initialData ? "Update" : "Add"} Booking</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
