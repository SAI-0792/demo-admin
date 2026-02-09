"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuthStore, useRestaurantStore } from "@/core/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditOrderPage() {
  const router = useRouter()
  const params = useParams()
  const user = useAuthStore((state) => state.user)
  const { restaurantData, updateOrder } = useRestaurantStore()

  const order = restaurantData.orders.find((o) => o.id === params.id)

  const [formData, setFormData] = useState({
    customerName: order?.customerName || "",
    status: order?.status || "pending",
  })

  if (!user || !user.modules.includes("restaurant")) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Access denied</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Order not found</p>
      </div>
    )
  }

  const getItemDetails = () => {
    return order.items.map((item) => {
      const menuItem = restaurantData.menuItems.find((m) => m.id === item.itemId)
      return {
        name: menuItem?.name || "Unknown",
        quantity: item.quantity,
        price: menuItem?.price || 0,
      }
    })
  }

  const handleSubmit = () => {
    updateOrder(order.id, {
      customerName: formData.customerName,
      status: formData.status as any,
    })
    router.push("/dashboard/restaurants/orders")
  }

  return (
    <div className="p-6 space-y-6">
      <Link href="/dashboard/restaurants/orders">
        <Button variant="ghost" className="gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit Order {order.orderNumber}</h1>
        <p className="text-muted-foreground">Update order details and status</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <div>
              <Label htmlFor="customerName" className="text-base font-semibold">
                Customer Name
              </Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="status" className="text-base font-semibold">
                Order Status
              </Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="space-y-2">
              {getItemDetails().map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-lg border bg-muted/30">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6 space-y-4 sticky top-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="text-lg font-bold">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created Date</p>
                <p className="text-lg font-bold">{order.createdAt}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-primary">₹{order.totalPrice.toFixed(2)}</p>
              </div>
            </div>

            <Button onClick={handleSubmit} className="w-full" size="lg">
              Update Order
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
