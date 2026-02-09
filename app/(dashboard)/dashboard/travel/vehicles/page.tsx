"use client"

import Link from "next/link"
import { useAuthStore, useTravelStore } from "@/core/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { useState, useMemo } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  maintenance: "bg-yellow-100 text-yellow-800",
  inactive: "bg-gray-100 text-gray-800",
}

const VEHICLE_TYPES: Record<string, string> = {
  bus: "Bus",
  car: "Car",
  van: "Van",
  truck: "Truck",
}

const selectTravelData = (state: any) => state.travelData
const selectDeleteVehicle = (state: any) => state.deleteVehicle

export default function VehiclesPage() {
  const user = useAuthStore((state) => state.user)
  const travelData = useTravelStore(selectTravelData)
  const deleteVehicle = useTravelStore(selectDeleteVehicle)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const driverMap = useMemo(() => {
    return new Map(travelData.drivers.map((d) => [d.id, d.name]))
  }, [travelData.drivers])

  const getDriverName = (driverId?: string) => {
    if (!driverId) return "Unassigned"
    return driverMap.get(driverId) || "Unknown"
  }

  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
    setDeleteOpen(true)
  }

  const confirmDelete = () => {
    if (deleteId) {
      deleteVehicle(deleteId)
      setDeleteId(null)
    }
    setDeleteOpen(false)
  }

  if (!user || !user.modules.includes("travel")) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Access denied</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Vehicles</h1>
        <Link href="/dashboard/travel/vehicles/create">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Vehicle
          </Button>
        </Link>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary">
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">License Plate</TableHead>
                <TableHead className="font-semibold">Driver</TableHead>
                <TableHead className="font-semibold">Capacity</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Reg. Expiry</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {travelData.vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No vehicles found.
                  </TableCell>
                </TableRow>
              ) : (
                travelData.vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{VEHICLE_TYPES[vehicle.type]}</TableCell>
                    <TableCell>{vehicle.licensePlate}</TableCell>
                    <TableCell>{getDriverName(vehicle.driverId)}</TableCell>
                    <TableCell>{vehicle.capacity} seats</TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[vehicle.status]}>
                        {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{vehicle.registrationExpiry || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/travel/vehicles/${vehicle.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(vehicle.id)}
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
        <AlertDialogContent>
          <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this vehicle? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
