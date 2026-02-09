"use client"

import {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"

import { useState } from "react"
import Link from "next/link"
import { useAuthStore, useHotelStore } from "@/core/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit2, Trash2, Mail, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-muted border-border text-muted-foreground",
  confirmed: "bg-primary/10 border-primary/30 text-primary",
  "checked-in": "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400",
  completed: "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-400",
  cancelled: "bg-destructive/10 border-destructive/30 text-destructive",
}

export default function BookingsPage() {
  const user = useAuthStore((state) => state.user)
  const hotelData = useHotelStore((state) => state.hotelData)
  const deleteBooking = useHotelStore((state) => state.deleteBooking)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  if (!user || !user.modules.includes("hotel")) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Access denied</p>
      </div>
    )
  }

  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
    setDeleteOpen(true)
  }

  const confirmDelete = () => {
    if (deleteId) {
      deleteBooking(deleteId)
      setDeleteId(null)
    }
    setDeleteOpen(false)
  }

  const getRoomNumber = (roomId: string) => {
    return hotelData.rooms.find((r) => r.id === roomId)?.name || "Unknown"
  }

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(days, 0)
  }

  const confirmedBookings = hotelData.bookings.filter((b) => ["confirmed", "checked-in"].includes(b.status)).length
  const totalRevenue = hotelData.bookings
    .filter((b) => ["confirmed", "checked-in", "completed"].includes(b.status))
    .reduce((sum, b) => sum + b.totalPrice, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bookings</h1>
          <p className="text-muted-foreground">Manage hotel room bookings</p>
        </div>
        <Link href="/dashboard/hotels/bookings/create">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Booking
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Bookings</p>
          <p className="text-3xl font-bold text-primary">{hotelData.bookings.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-3xl font-bold text-primary">{confirmedBookings}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-3xl font-bold text-primary">₹{totalRevenue}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-3xl font-bold text-primary">
            {hotelData.bookings.filter((b) => b.status === "pending").length}
          </p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary">
                <TableHead className="font-semibold">Guest</TableHead>
                <TableHead className="font-semibold">Room</TableHead>
                <TableHead className="font-semibold">Check-in</TableHead>
                <TableHead className="font-semibold">Check-out</TableHead>
                <TableHead className="font-semibold">Nights</TableHead>
                <TableHead className="font-semibold">Total Price</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotelData.bookings.length === 0 ? (
                <TableRow key="no-bookings">
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No bookings found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                hotelData.bookings.map((booking, index) => (
                  <TableRow key={booking.id || index}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{booking.guestName}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <a href={`mailto:${booking.email}`} className="flex items-center gap-1 hover:text-foreground">
                            <Mail className="w-3 h-3" />
                            {booking.email}
                          </a>
                          <a href={`tel:${booking.phone}`} className="flex items-center gap-1 hover:text-foreground">
                            <Phone className="w-3 h-3" />
                            {booking.phone}
                          </a>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">Room {getRoomNumber(booking.roomId)}</TableCell>
                    <TableCell>{new Date(booking.checkIn).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(booking.checkOut).toLocaleDateString()}</TableCell>
                    <TableCell>{calculateNights(booking.checkIn, booking.checkOut)}</TableCell>
                    <TableCell className="font-semibold">₹{booking.totalPrice}</TableCell>
                    <TableCell>
                      <Badge className={`${STATUS_COLORS[booking.status]} border`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/hotels/bookings/${booking.id}/edit`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(booking.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogPortal>
          <AlertDialogOverlay />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Booking</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              Are you sure you want to delete this booking? This action cannot be undone.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <div className="flex gap-2 justify-end">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </div>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    </div>
  )
}
