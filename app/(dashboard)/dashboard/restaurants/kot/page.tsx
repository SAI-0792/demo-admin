"use client"

import { useState } from "react"
import { useAuthStore, useRestaurantStore } from "@/core/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, AlertCircle, Printer } from "lucide-react"

export default function KOTPage() {
  const user = useAuthStore((state) => state.user)
  const { restaurantData, updateOrder } = useRestaurantStore()
  const [orders] = useState(restaurantData.orders.filter((o) => o.status !== "cancelled" && o.status !== "delivered"))

  if (!user || !user.modules.includes("restaurant")) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Access denied</p>
      </div>
    )
  }

  const getOrderItems = (itemIds: { itemId: string; quantity: number }[]) => {
    return itemIds.map((item) => {
      const menuItem = restaurantData.menuItems.find((mi) => mi.id === item.itemId)
      return {
        name: menuItem?.name || "Unknown Item",
        quantity: item.quantity,
        description: menuItem?.description || "",
      }
    })
  }

  const handleStatusChange = (orderId: string, currentStatus: string) => {
    const statusFlow: Record<string, string> = {
      pending: "preparing",
      preparing: "ready",
      ready: "delivered",
    }
    const newStatus = statusFlow[currentStatus]
    if (newStatus) {
      updateOrder(orderId, { status: newStatus as any })
    }
  }

  const pendingOrders = orders.filter((o) => o.status === "pending")
  const preparingOrders = orders.filter((o) => o.status === "preparing")
  const readyOrders = orders.filter((o) => o.status === "ready")

  const KOTCard = ({ order }: { order: any }) => (
    <Card className="p-4 border-2 border-border/50 hover:border-primary/50 transition-colors">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Order #{order.orderNumber}</p>
            <p className="text-lg font-bold">{order.customerName}</p>
          </div>
          <Button size="sm" variant="ghost" className="gap-1" onClick={() => window.print()} title="Print KOT">
            <Printer className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2 bg-muted/30 p-3 rounded-lg">
          {getOrderItems(order.items).map((item, idx) => (
            <div key={idx} className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-semibold text-sm">{item.name}</p>
                {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
              </div>
              <Badge variant="secondary" className="ml-2">
                x{item.quantity}
              </Badge>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            onClick={() => handleStatusChange(order.id, order.status)}
            className="flex-1 gap-2"
            variant={order.status === "pending" ? "default" : order.status === "preparing" ? "default" : "outline"}
          >
            {order.status === "pending" && <Clock className="w-4 h-4" />}
            {order.status === "pending" && "Start Cooking"}
            {order.status === "preparing" && <Clock className="w-4 h-4" />}
            {order.status === "preparing" && "Mark Ready"}
            {order.status === "ready" && <CheckCircle2 className="w-4 h-4" />}
            {order.status === "ready" && "Served"}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">Created: {order.createdAt}</div>
      </div>
    </Card>
  )

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <AlertCircle className="w-8 h-8 text-amber-500" />
          Kitchen Order Ticket (KOT)
        </h1>
        <p className="text-muted-foreground">Manage kitchen orders and track preparation status</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4 border-2 border-yellow-200/50 bg-yellow-50/30">
          <p className="text-sm text-muted-foreground">Pending Orders</p>
          <p className="text-3xl font-bold text-yellow-600">{pendingOrders.length}</p>
        </Card>
        <Card className="p-4 border-2 border-blue-200/50 bg-blue-50/30">
          <p className="text-sm text-muted-foreground">Preparing</p>
          <p className="text-3xl font-bold text-blue-600">{preparingOrders.length}</p>
        </Card>
        <Card className="p-4 border-2 border-green-200/50 bg-green-50/30">
          <p className="text-sm text-muted-foreground">Ready to Serve</p>
          <p className="text-3xl font-bold text-green-600">{readyOrders.length}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b-2 border-yellow-200">
            <Clock className="w-5 h-5 text-yellow-600" />
            <h2 className="font-bold text-foreground">Pending Orders</h2>
            <Badge variant="secondary" className="ml-auto">
              {pendingOrders.length}
            </Badge>
          </div>
          {pendingOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No pending orders</p>
          ) : (
            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <KOTCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b-2 border-blue-200">
            <Clock className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-foreground">Preparing</h2>
            <Badge variant="secondary" className="ml-auto">
              {preparingOrders.length}
            </Badge>
          </div>
          {preparingOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No orders being prepared</p>
          ) : (
            <div className="space-y-3">
              {preparingOrders.map((order) => (
                <KOTCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b-2 border-green-200">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h2 className="font-bold text-foreground">Ready to Serve</h2>
            <Badge variant="secondary" className="ml-auto">
              {readyOrders.length}
            </Badge>
          </div>
          {readyOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No orders ready</p>
          ) : (
            <div className="space-y-3">
              {readyOrders.map((order) => (
                <KOTCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
