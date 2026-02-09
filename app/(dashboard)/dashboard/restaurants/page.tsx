"use client"

import { useState } from "react"
import { useAuthStore } from "@/core/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit2, Trash2 } from "lucide-react"

const MOCK_MENU_ITEMS = [
  { id: "1", name: "Margherita Pizza", category: "Pizza", price: "$12.99" },
  { id: "2", name: "Spaghetti Carbonara", category: "Pasta", price: "$14.99" },
  { id: "3", name: "Caesar Salad", category: "Salad", price: "$8.99" },
]

const MOCK_ORDERS = [
  { id: "O1", tableNo: "5", status: "Pending", total: "$45.50", time: "2 min ago" },
  { id: "O2", tableNo: "8", status: "Served", total: "$32.00", time: "15 min ago" },
]

export default function RestaurantsPage() {
  const user = useAuthStore((state) => state.user)
  const [menuItems] = useState(MOCK_MENU_ITEMS)
  const [orders] = useState(MOCK_ORDERS)

  if (!user || !user.modules.includes("restaurant")) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Access denied</p>
      </div>
    )
  }

  const currentRestaurant = user.outlets.find((o) => o.type === "restaurant" && o.id === user.currentOutletId)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Restaurant Management</h1>
        <p className="text-muted-foreground">
          Manage your restaurant: <span className="font-medium">{currentRestaurant?.name}</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Menu Items</p>
          <p className="text-3xl font-bold text-primary">{menuItems.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Active Orders</p>
          <p className="text-3xl font-bold text-primary">3</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Today Revenue</p>
          <p className="text-3xl font-bold text-primary">$234.50</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Categories</p>
          <p className="text-3xl font-bold text-primary">5</p>
        </Card>
      </div>

      <Tabs defaultValue="menu" className="space-y-4">
        <TabsList>
          <TabsTrigger value="menu">Menu Items</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="kot">KOT</TabsTrigger>
        </TabsList>

        <TabsContent value="menu">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Menu Items</h2>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menuItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.price}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Orders</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.tableNo}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          order.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>{order.total}</TableCell>
                    <TableCell className="text-muted-foreground">{order.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="kot">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Kitchen Order Ticket (KOT)</h2>
            <p className="text-muted-foreground">Kitchen order management - Coming soon</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
