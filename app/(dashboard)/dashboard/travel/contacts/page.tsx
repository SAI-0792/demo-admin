"use client"

import Link from "next/link"
import { useAuthStore, useTravelStore } from "@/core/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"

const selectTravelData = (state: any) => state.travelData
const selectDeleteContact = (state: any) => state.deleteContact

export default function ContactsPage() {
  const user = useAuthStore((state) => state.user)
  const travelData = useTravelStore(selectTravelData)
  const deleteContact = useTravelStore(selectDeleteContact)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  if (!user || !user.modules.includes("travel")) {
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
      deleteContact(deleteId)
      setDeleteId(null)
    }
    setDeleteOpen(false)
  }

  const getVehicleNames = (vehicleIds?: string[]) => {
    if (!vehicleIds || vehicleIds.length === 0) return "None"
    return vehicleIds
      .map((id) => {
        const vehicle = travelData.vehicles.find((v) => v.id === id)
        return vehicle?.licensePlate
      })
      .join(", ")
  }

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case "driver":
        return "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400"
      case "client":
        return "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400"
      case "partner":
        return "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-400"
      default:
        return "bg-muted border-border text-muted-foreground"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Contacts</h1>
        <Link href="/dashboard/travel/contacts/create">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Contact
          </Button>
        </Link>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Phone</TableHead>
                <TableHead className="font-semibold">Associated Vehicles</TableHead>
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
                      <Badge className={`${getContactTypeColor(contact.type)} border`}>
                        {contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <a href={`mailto:${contact.email}`} className="text-primary hover:underline text-sm">
                        {contact.email}
                      </a>
                    </TableCell>
                    <TableCell>
                      <a href={`tel:${contact.phone}`} className="text-primary hover:underline text-sm">
                        {contact.phone}
                      </a>
                    </TableCell>
                    <TableCell className="text-sm">{getVehicleNames(contact.vehicleIds)}</TableCell>
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
                          onClick={() => handleDeleteClick(contact.id)}
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
          <AlertDialogTitle>Delete Contact</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this contact? This action cannot be undone.
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
