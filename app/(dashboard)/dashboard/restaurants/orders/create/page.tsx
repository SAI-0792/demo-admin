"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore, useRestaurantStore } from "@/core/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateOrderPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const { restaurantData, addOrder } = useRestaurantStore()
  const [formData, setFormData] = useState({
    customerName: "",
    selectedItems: new Set<string>(),
    quantities: new Map<string, number>(),
  })

  if (!user || !user.modules.includes("restaurant")) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Access denied</p>
      </div>
    )
  }

  const generateOrderNumber = () => {
    return `ORD${String(restaurantData.orders.length + 1).padStart(3, "0")}`
  }

  const toggleItem = (itemId: string) => {
    const newSelected = new Set(formData.selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
      if (!formData.quantities.has(itemId)) {
        const newQty = new Map(formData.quantities)
        newQty.set(itemId, 1)
        setFormData({ ...formData, quantities: newQty })
      }
    }
    setFormData({ ...formData, selectedItems: newSelected })
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    const newQty = new Map(formData.quantities)
    newQty.set(itemId, Math.max(1, quantity))
    setFormData({ ...formData, quantities: newQty })
  }

  const calculateTotal = () => {
    let total = 0
    formData.selectedItems.forEach((itemId) => {
      const item = restaurantData.menuItems.find((m) => m.id === itemId)
      const qty = formData.quantities.get(itemId) || 1
      if (item) total += item.price * qty
    })
    return total
  }

  const handleSubmit = () => {
    if (!formData.customerName || formData.selectedItems.size === 0) {
      alert("Please enter customer name and select items")
      return
    }

    const items = Array.from(formData.selectedItems).map((itemId) => ({
      itemId,
      quantity: formData.quantities.get(itemId) || 1,
    }))

    const newOrder = {
      id: `order-${Date.now()}`,
      orderNumber: generateOrderNumber(),
      items,
      totalPrice: calculateTotal(),
      status: "pending" as const,
      customerName: formData.customerName,
      createdAt: new Date().toISOString().split("T")[0],
    }

    addOrder(newOrder)
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
        <h1 className="text-3xl font-bold text-foreground">Create New Order</h1>
        <p className="text-muted-foreground">Add items and customer details</p>
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
                placeholder="Enter customer name"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="mt-2"
              />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Select Items</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {restaurantData.menuItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/30">
                  <Checkbox
                    id={item.id}
                    checked={formData.selectedItems.has(item.id)}
                    onCheckedChange={() => toggleItem(item.id)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={item.id} className="text-sm font-medium cursor-pointer">
                      {item.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{item.price.toFixed(2)}</p>
                    {formData.selectedItems.has(item.id) && (
                      <Input
                        type="number"
                        min="1"
                        value={formData.quantities.get(item.id) || 1}
                        onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value))}
                        className="w-16 mt-1"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6 space-y-4 sticky top-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Array.from(formData.selectedItems).map((itemId) => {
                  const item = restaurantData.menuItems.find((m) => m.id === itemId)
                  const qty = formData.quantities.get(itemId) || 1
                  return (
                    <div key={itemId} className="flex justify-between text-sm">
                      <span>
                        {item?.name} x{qty}
                      </span>
                      <span>₹{(item ? item.price * qty : 0).toFixed(2)}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <Button onClick={handleSubmit} className="w-full" size="lg">
              Create Order
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
