"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuthStore, useTravelStore } from "@/core/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400",
  maintenance: "bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400",
  inactive: "bg-muted border-border text-muted-foreground",
}

const VEHICLE_TYPES: Record<string, string> = {
  bus: "Bus",
  car: "Car",
  van: "Van",
  truck: "Truck",
}

export default function TravelPage() {
  const user = useAuthStore((state) => state.user)
  const travelData = useTravelStore((state) => state.travelData)
  const deleteVehicle = useTravelStore((state) => state.deleteVehicle)
  const deleteContact = useTravelStore((state) => state.deleteContact)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteType, setDeleteType] = useState<"vehicle" | "contact">("vehicle")

  if (!user || !user.modules.includes("travel")) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Access denied</p>
      </div>
    )
  }

  const currentTravel = user.outlets.find((o) => o.type === "travel" && o.id === user.currentOutletId)

  const handleDeleteClick = (id: string, type: "vehicle" | "contact") => {
    setDeleteId(id)
    setDeleteType(type)
    setDeleteOpen(true)
  }

  const confirmDelete = () => {
    if (deleteId) {
      if (deleteType === "vehicle") {
        deleteVehicle(deleteId)
      } else {
        deleteContact(deleteId)
      }
      setDeleteId(null)
    }
    setDeleteOpen(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Travel Agency Management</h1>
        <p className="text-muted-foreground">
          Manage your agency: <span className="font-medium">{currentTravel?.name}</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Active Vehicles</p>
          <p className="text-3xl font-bold text-primary">
            {travelData.vehicles.filter((v) => v.status === "active").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Vehicles</p>
          <p className="text-3xl font-bold text-primary">{travelData.vehicles.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Contacts</p>
          <p className="text-3xl font-bold text-primary">{travelData.contacts.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Monthly Bookings</p>
          <p className="text-3xl font-bold text-primary">24</p>
        </Card>
      </div>

      <Tabs defaultValue="vehicles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles">
          <Card className="overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Vehicles</h2>
                <Link href="/dashboard/travel/vehicles/create">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Vehicle
                  </Button>
                </Link>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary">
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">License Plate</TableHead>
                      <TableHead className="font-semibold">Capacity</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Description</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {travelData.vehicles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No vehicles found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      travelData.vehicles.map((vehicle) => (
                        <TableRow key={vehicle.id}>
                          <TableCell className="font-medium">{VEHICLE_TYPES[vehicle.type]}</TableCell>
                          <TableCell>{vehicle.licensePlate}</TableCell>
                          <TableCell>{vehicle.capacity} seats</TableCell>
                          <TableCell>
                            <Badge className={`${STATUS_COLORS[vehicle.status]} border`}>
                              {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{vehicle.description}</TableCell>
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
                                onClick={() => handleDeleteClick(vehicle.id, "vehicle")}
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
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <Card className="overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Contacts</h2>
                <Link href="/dashboard/travel/contacts/create">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Contact
                  </Button>
                </Link>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Phone</TableHead>
                      <TableHead className="font-semibold">Address</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {travelData.contacts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No contacts found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      travelData.contacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell className="font-medium">{contact.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                              {contact.email}
                            </a>
                          </TableCell>
                          <TableCell>
                            <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                              {contact.phone}
                            </a>
                          </TableCell>
                          <TableCell className="text-sm">{contact.address}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/dashboard/travel/contacts/${contact.id}/edit`}>
                                <Button variant="ghost" size="sm">
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteClick(contact.id, "contact")}
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
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete {deleteType === "vehicle" ? "Vehicle" : "Contact"}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this {deleteType === "vehicle" ? "vehicle" : "contact"}? This action cannot
            be undone.
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
