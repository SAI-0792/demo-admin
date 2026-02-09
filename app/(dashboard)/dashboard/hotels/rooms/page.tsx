"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import Link from "next/link";
import { useAuthStore, useHotelStore } from "@/core/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  occupied: "bg-blue-100 text-blue-800",
  maintenance: "bg-yellow-100 text-yellow-800",
};

export default function RoomsPage() {
  const user = useAuthStore((state) => state.user);
  const hotelData = useHotelStore((state) => state.hotelData);
  const deleteRoom = useHotelStore((state) => state.deleteRoom);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!user || !user.modules.includes("hotel")) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Access denied</p>
      </div>
    );
  }

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteRoom(deleteId);
      setDeleteId(null);
    }
    setDeleteOpen(false);
  };

  const getCategoryName = (categoryId: string) => {
    return (
      hotelData.categories.find((c) => c.id === categoryId)?.name || "Unknown"
    );
  };

  const getAmenityNames = (amenityIds: string[]) => {
    return amenityIds
      .map((id) => hotelData.amenities.find((a) => a.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rooms</h1>
          <p className="text-muted-foreground">
            Manage hotel rooms and their details
          </p>
        </div>
        <Link href="/dashboard/hotels/rooms/create">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Room
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Rooms</p>
          <p className="text-3xl font-bold text-primary">
            {hotelData.rooms.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Available</p>
          <p className="text-3xl font-bold text-green-600">
            {hotelData.rooms.filter((r) => r.status === "available").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Occupied</p>
          <p className="text-3xl font-bold text-blue-600">
            {hotelData.rooms.filter((r) => r.status === "occupied").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Maintenance</p>
          <p className="text-3xl font-bold text-yellow-600">
            {hotelData.rooms.filter((r) => r.status === "maintenance").length}
          </p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary">
                <TableHead className="font-semibold">Image</TableHead>
                <TableHead className="font-semibold">Room #</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Price/Night</TableHead>
                <TableHead className="font-semibold">Capacity</TableHead>
                <TableHead className="font-semibold">Amenities</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotelData.rooms.length === 0 ? (
                <TableRow key="no-rooms">
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground py-8"
                  >
                    No rooms found. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                hotelData.rooms.map((room, index) => (
                  <TableRow key={room.id || index}>
                    <TableCell>
                      {room.images &&
                        room.images.length > 0 &&
                        room.primaryImageId ? (
                        <img
                          src={
                            room.images.find(
                              (img) => img.id === room.primaryImageId
                            )?.url || "/placeholder.svg"
                          }
                          alt={room.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{room.name}</TableCell>
                    <TableCell>{getCategoryName(room.categoryId)}</TableCell>
                    <TableCell>₹{room.price}</TableCell>
                    <TableCell>{room.capacity} guests</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {getAmenityNames(room.amenities) || "None"}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[room.status]}>
                        {room.status.charAt(0).toUpperCase() +
                          room.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/hotels/rooms/${room.id}/edit`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(room.id)}
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
          <AlertDialogTitle>Delete Room</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this room? This action cannot be
            undone.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
