"use client";

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
import { Plus, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GenericViewDialog, type ViewDialogField } from "@/components/hotel/generic-view-dialog";

export default function AmenitiesPage() {
  const user = useAuthStore((state) => state.user);
  const hotelData = useHotelStore((state) => state.hotelData);
  const updateAmenity = useHotelStore((state) => state.updateAmenity);
  const deleteAmenity = useHotelStore((state) => state.deleteAmenity);

  const [viewOpen, setViewOpen] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState<any>(null);

  const amenityFields: ViewDialogField[] = [
    { name: "name", label: "Amenity Name", type: "text", required: true },
    { name: "icon", label: "Icon", type: "select", options: [
      { label: "Wifi", value: "Wifi" },
      { label: "Wind", value: "Wind" },
      { label: "Tv", value: "Tv" },
      { label: "Wine2", value: "Wine2" },
      { label: "Dumbbell", value: "Dumbbell" },
      { label: "Waves", value: "Waves" },
      { label: "Coffee", value: "Coffee" },
      { label: "Users", value: "Users" },
      { label: "Utensils", value: "Utensils" },
      { label: "Zap", value: "Zap" },
    ]},
  ];

  if (!user || (!user.modules?.includes("hotel") && false)) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Access denied</p>
      </div>
    );
  }

  const handleViewClick = (amenity: any) => {
    setSelectedAmenity(amenity);
    setViewOpen(true);
  };

  const handleSaveAmenity = (updatedAmenity: any) => {
    updateAmenity(selectedAmenity.id, {
      name: updatedAmenity.name,
      icon: updatedAmenity.icon,
    });
    setViewOpen(false);
  };

  const handleDeleteAmenity = (id: string) => {
    deleteAmenity(id);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Amenities</h1>
          <p className="text-muted-foreground">
            Manage hotel amenities that can be added to rooms
          </p>
        </div>
        <Link href="/dashboard/hotels/amenities/create">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Amenity
          </Button>
        </Link>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Icon</TableHead>
              <TableHead className="font-semibold">Used in Rooms</TableHead>
              <TableHead className="font-semibold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hotelData.amenities.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground py-8"
                >
                  No amenities found. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              hotelData.amenities.map((amenity) => {
                const usedInRooms = hotelData.rooms.filter((r) =>
                  r.amenities.includes(amenity.id)
                ).length;
                return (
                  <TableRow key={amenity.id}>
                    <TableCell className="font-medium">
                      {amenity.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{amenity.icon}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{usedInRooms} rooms</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleViewClick(amenity)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <GenericViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        data={selectedAmenity}
        fields={amenityFields}
        title="Amenity Details"
        onSave={handleSaveAmenity}
        onDelete={handleDeleteAmenity}
      />
    </div>
  );
}
