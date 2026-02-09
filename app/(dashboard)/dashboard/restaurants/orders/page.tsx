"use client"

import { useState } from "react"
import { useAuthStore, useRestaurantStore } from "@/core/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit2, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"

export default function OrdersPage() {
  const user = useAuthStore((state) => state.user)
  const { restaurantData, deleteOrder } = useRestaurantStore()
  const [orders] = useState(restaurantData.orders)

  if (!user || !user.modules.includes("restaurant")) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Access denied</p>
      </div>
    )
  }

  const getItemNames = (itemIds: { itemId: string; quantity: number }[]) => {
    return itemIds
      .map((item) => {
        const menuItem = restaurantData.menuItems.find((mi) => mi.id === item.itemId)
        return menuItem ? `${menuItem.name} x${item.quantity}` : `Item x${item.quantity}`
      })
      .join(", ")
  }

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      preparing: "bg-blue-100 text-blue-800 border-blue-200",
      ready: "bg-green-100 text-green-800 border-green-200",
      delivered: "bg-slate-100 text-slate-800 border-slate-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    }
    return statusColors[status] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">Manage restaurant orders</p>
        </div>
        <Link href="/dashboard/restaurants/orders/create">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Order
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-3xl font-bold text-primary">{orders.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{orders.filter((o) => o.status === "pending").length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Ready</p>
          <p className="text-3xl font-bold text-green-600">{orders.filter((o) => o.status === "ready").length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-3xl font-bold text-primary">
            ₹{orders.reduce((sum, o) => sum + o.totalPrice, 0).toFixed(2)}
          </p>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {getItemNames(order.items)}
                  </TableCell>
                  <TableCell className="font-medium">₹{order.totalPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{order.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/restaurants/orders/${order.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/dashboard/restaurants/orders/${order.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogTitle>Delete Order</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this order? This action cannot be undone.
                          </AlertDialogDescription>
                          <div className="flex gap-3 justify-end">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteOrder(order.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
