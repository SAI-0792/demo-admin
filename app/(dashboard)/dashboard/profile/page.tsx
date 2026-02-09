"use client"

import { useState } from "react"
import { useAuthStore } from "@/core/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Save } from "lucide-react"

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "(555) 123-4567",
  })

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  const [isSaved, setIsSaved] = useState(false)

  if (!user) return null

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setIsSaved(false)
  }

  const handleSaveProfile = () => {
    if (user) {
      setUser({ ...user, ...formData })
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    }
  }

  const handlePasswordChange = () => {
    if (passwordForm.new === passwordForm.confirm) {
      setPasswordForm({ current: "", new: "", confirm: "" })
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="outlets">Outlets</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="p-6 space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Upload className="w-4 h-4" />
                Upload Photo
              </Button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            {/* Save Section */}
            <div className="flex items-center gap-2 pt-4 border-t">
              <Button onClick={handleSaveProfile} className="gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
              {isSaved && <span className="text-sm text-green-600 font-medium">✓ Changes saved</span>}
            </div>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password">
          <Card className="p-6 space-y-6">
            <p className="text-sm text-muted-foreground">Update your password to keep your account secure</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Current Password</label>
                <Input
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <Input
                  type="password"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <Input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>

              {passwordForm.new && passwordForm.confirm && passwordForm.new !== passwordForm.confirm && (
                <p className="text-sm text-destructive">Passwords do not match</p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-4 border-t">
              <Button onClick={handlePasswordChange} className="gap-2">
                <Save className="w-4 h-4" />
                Update Password
              </Button>
              {isSaved && <span className="text-sm text-green-600 font-medium">✓ Password updated</span>}
            </div>
          </Card>
        </TabsContent>

        {/* Outlets Tab */}
        <TabsContent value="outlets">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Your Outlets</h3>
            <div className="space-y-3">
              {user.outlets.map((outlet) => (
                <div
                  key={outlet.id}
                  className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-border"
                >
                  <div>
                    <p className="font-medium text-foreground">{outlet.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{outlet.type}</p>
                  </div>
                  {outlet.id === user.currentOutletId && (
                    <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                      Current
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
