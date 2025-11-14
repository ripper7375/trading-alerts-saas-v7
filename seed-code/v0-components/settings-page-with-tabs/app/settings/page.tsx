"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import {
  User,
  Lock,
  Bell,
  CreditCard,
  Palette,
  Globe,
  HelpCircle,
  Camera,
  CheckCircle,
  Save,
  ExternalLink,
  MessageCircle,
  Mail,
  Bug,
  Book,
  Smartphone,
  Monitor,
  Laptop,
  MapPin,
  Clock,
  Shield,
  QrCode,
} from "lucide-react"

type TabType = "profile" | "security" | "notifications" | "billing" | "appearance" | "language" | "help"

interface SettingsPageProps {
  initialTab?: TabType
}

interface FormData {
  fullName: string
  email: string
  username: string
  bio: string
  company: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  tradingTips: boolean
  productUpdates: boolean
  promotionalOffers: boolean
  notificationFrequency: string
  twoFactorEnabled: boolean
  theme: "light" | "dark" | "system"
  colorScheme: string
  language: string
  timezone: string
  dateFormat: string
  timeFormat: string
  currency: string
}

export default function SettingsPage({ initialTab = "profile" }: SettingsPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [showUnsavedModal, setShowUnsavedModal] = useState(false)
  const [pendingTab, setPendingTab] = useState<TabType | null>(null)
  const [avatarUrl, setAvatarUrl] = useState("/diverse-user-avatars.png")

  const [formData, setFormData] = useState<FormData>({
    fullName: "John Doe",
    email: "john.doe@example.com",
    username: "johndoe",
    bio: "Passionate trader and market enthusiast",
    company: "Trading Corp",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    tradingTips: true,
    productUpdates: true,
    promotionalOffers: false,
    notificationFrequency: "instant",
    twoFactorEnabled: false,
    theme: "light",
    colorScheme: "blue",
    language: "en-US",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12-hour",
    currency: "USD",
  })

  const [originalFormData, setOriginalFormData] = useState<FormData>(formData)
  const [passwordStrength, setPasswordStrength] = useState(0)

  useEffect(() => {
    const tab = searchParams?.get("tab") as TabType
    if (tab && ["profile", "security", "notifications", "billing", "appearance", "language", "help"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    const isDirty = JSON.stringify(formData) !== JSON.stringify(originalFormData)
    setUnsavedChanges(isDirty)
  }, [formData, originalFormData])

  useEffect(() => {
    if (formData.newPassword) {
      let strength = 0
      if (formData.newPassword.length >= 8) strength += 25
      if (/[a-z]/.test(formData.newPassword)) strength += 25
      if (/[A-Z]/.test(formData.newPassword)) strength += 25
      if (/[0-9]/.test(formData.newPassword)) strength += 25
      setPasswordStrength(strength)
    } else {
      setPasswordStrength(0)
    }
  }, [formData.newPassword])

  const handleTabChange = (tab: TabType) => {
    if (unsavedChanges && tab !== activeTab) {
      setPendingTab(tab)
      setShowUnsavedModal(true)
    } else {
      changeTab(tab)
    }
  }

  const changeTab = (tab: TabType) => {
    setActiveTab(tab)
    router.push(`/settings?tab=${tab}`)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSaveAndContinue = () => {
    handleSave()
    setShowUnsavedModal(false)
    if (pendingTab) {
      changeTab(pendingTab)
      setPendingTab(null)
    }
  }

  const handleDiscardChanges = () => {
    setFormData(originalFormData)
    setUnsavedChanges(false)
    setShowUnsavedModal(false)
    if (pendingTab) {
      changeTab(pendingTab)
      setPendingTab(null)
    }
  }

  const handleSave = () => {
    // Mock save function
    setOriginalFormData(formData)
    setUnsavedChanges(false)
    toast({
      title: "✓ Settings saved successfully",
      className: "bg-green-500 text-white",
    })
  }

  const handleCancel = () => {
    setFormData(originalFormData)
    setUnsavedChanges(false)
  }

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const tabs = [
    { id: "profile" as TabType, icon: User, label: "Profile", description: "Personal information" },
    { id: "security" as TabType, icon: Lock, label: "Security", description: "Password and authentication" },
    { id: "notifications" as TabType, icon: Bell, label: "Notifications", description: "Email and push preferences" },
    { id: "billing" as TabType, icon: CreditCard, label: "Billing", description: "Subscription and payment" },
    { id: "appearance" as TabType, icon: Palette, label: "Appearance", description: "Theme and display settings" },
    { id: "language" as TabType, icon: Globe, label: "Language", description: "Language preferences" },
    { id: "help" as TabType, icon: HelpCircle, label: "Help & Support", description: "FAQs and contact" },
  ]

  const activeSessions = [
    { device: "MacBook Pro", location: "New York, USA", lastActive: "2 minutes ago", current: true },
    { device: "iPhone 14", location: "New York, USA", lastActive: "1 hour ago", current: false },
    { device: "Chrome Browser", location: "Boston, USA", lastActive: "2 days ago", current: false },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-4">Dashboard &gt; Settings</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">⚙️ Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Mobile Tabs - Horizontal Scrollable */}
        <div className="lg:hidden overflow-x-auto pb-4 mb-6">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className={activeTab === tab.id ? "font-semibold" : ""}>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Desktop Layout - Two Column */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Desktop Only */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md p-4 sticky top-4">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                        activeTab === tab.id
                          ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-semibold"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <div className="flex-1">
                        <div className="font-medium">{tab.label}</div>
                        <div className="text-xs text-gray-500">{tab.description}</div>
                      </div>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-md p-6 md:p-8 min-h-[600px]">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
                  <div className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <Avatar className="w-24 h-24">
                          <AvatarImage src={avatarUrl || "/placeholder.svg"} />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <button className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm">
                          <Camera className="w-6 h-6" />
                        </button>
                      </div>
                      <div>
                        <Button variant="outline" size="sm">
                          <Camera className="w-4 h-4 mr-2" />
                          Change Photo
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF (max. 2MB)</p>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => updateFormData({ fullName: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <div className="relative mt-1">
                          <Input
                            id="email"
                            value={formData.email}
                            onChange={(e) => updateFormData({ email: e.target.value })}
                          />
                          <Badge className="absolute right-2 top-2 bg-green-500 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => updateFormData({ username: e.target.value })}
                        className="mt-1"
                      />
                      <p className="text-xs text-green-600 mt-1">✓ Available</p>
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio (Optional)</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => updateFormData({ bio: e.target.value })}
                        className="mt-1"
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="company">Company/Organization (Optional)</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => updateFormData({ company: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold mb-6">Security Settings</h2>
                  <div className="space-y-8">
                    {/* Change Password */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            value={formData.currentPassword}
                            onChange={(e) => updateFormData({ currentPassword: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => updateFormData({ newPassword: e.target.value })}
                            className="mt-1"
                          />
                          {formData.newPassword && (
                            <div className="mt-2">
                              <div className="flex gap-1 mb-1">
                                {[25, 50, 75, 100].map((threshold) => (
                                  <div
                                    key={threshold}
                                    className={`h-1 flex-1 rounded ${
                                      passwordStrength >= threshold
                                        ? passwordStrength === 100
                                          ? "bg-green-500"
                                          : passwordStrength >= 75
                                            ? "bg-yellow-500"
                                            : "bg-red-500"
                                        : "bg-gray-200"
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-xs text-gray-600">
                                Strength:{" "}
                                {passwordStrength === 100
                                  ? "Strong"
                                  : passwordStrength >= 75
                                    ? "Good"
                                    : passwordStrength >= 50
                                      ? "Fair"
                                      : "Weak"}
                              </p>
                            </div>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => updateFormData({ confirmPassword: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700">Update Password</Button>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Shield className="w-8 h-8 text-blue-600" />
                              <div>
                                <p className="font-medium">
                                  Status: {formData.twoFactorEnabled ? "Enabled" : "Disabled"}
                                </p>
                                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                              </div>
                            </div>
                            <Switch
                              checked={formData.twoFactorEnabled}
                              onCheckedChange={(checked) => updateFormData({ twoFactorEnabled: checked })}
                            />
                          </div>
                          {formData.twoFactorEnabled && (
                            <div className="mt-4 pt-4 border-t">
                              <div className="flex items-center gap-4">
                                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <QrCode className="w-16 h-16 text-gray-400" />
                                </div>
                                <div>
                                  <p className="font-medium mb-2">Scan this QR code with your authenticator app</p>
                                  <p className="text-sm text-gray-600 mb-2">Or enter this code manually:</p>
                                  <code className="text-xs bg-gray-100 px-3 py-1 rounded">ABCD-EFGH-IJKL-MNOP</code>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Active Sessions */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
                      <div className="space-y-3">
                        {activeSessions.map((session, index) => (
                          <Card key={index}>
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {session.device.includes("MacBook") && <Laptop className="w-5 h-5 text-gray-600" />}
                                  {session.device.includes("iPhone") && (
                                    <Smartphone className="w-5 h-5 text-gray-600" />
                                  )}
                                  {session.device.includes("Chrome") && <Monitor className="w-5 h-5 text-gray-600" />}
                                  <div>
                                    <p className="font-medium">
                                      {session.device}
                                      {session.current && (
                                        <Badge className="ml-2 bg-green-500 text-white text-xs">Current</Badge>
                                      )}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {session.location}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {session.lastActive}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {!session.current && (
                                  <Button variant="ghost" size="sm" className="text-red-600">
                                    Sign Out
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        className="mt-4 text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                      >
                        Sign Out All Devices
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold mb-6">Notification Preferences</h2>
                  <div className="space-y-8">
                    {/* Alert Notifications */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Alert Notifications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Email notifications</p>
                            <p className="text-sm text-gray-600">Receive alerts via email</p>
                          </div>
                          <Switch
                            checked={formData.emailNotifications}
                            onCheckedChange={(checked) => updateFormData({ emailNotifications: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Push notifications</p>
                            <p className="text-sm text-gray-600">Receive alerts on your device</p>
                          </div>
                          <Switch
                            checked={formData.pushNotifications}
                            onCheckedChange={(checked) => updateFormData({ pushNotifications: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between opacity-50">
                          <div>
                            <p className="font-medium">SMS notifications</p>
                            <p className="text-sm text-gray-600">
                              PRO only <Lock className="inline w-3 h-3" />
                            </p>
                          </div>
                          <Switch disabled checked={formData.smsNotifications} />
                        </div>
                      </div>
                    </div>

                    {/* Newsletter */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Trading tips & market insights</p>
                            <p className="text-sm text-gray-600">Stay informed about market trends</p>
                          </div>
                          <Switch
                            checked={formData.tradingTips}
                            onCheckedChange={(checked) => updateFormData({ tradingTips: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Product updates</p>
                            <p className="text-sm text-gray-600">New features and improvements</p>
                          </div>
                          <Switch
                            checked={formData.productUpdates}
                            onCheckedChange={(checked) => updateFormData({ productUpdates: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Promotional offers</p>
                            <p className="text-sm text-gray-600">Special deals and discounts</p>
                          </div>
                          <Switch
                            checked={formData.promotionalOffers}
                            onCheckedChange={(checked) => updateFormData({ promotionalOffers: checked })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Frequency */}
                    <div>
                      <Label htmlFor="frequency">Notification Frequency</Label>
                      <Select
                        value={formData.notificationFrequency}
                        onValueChange={(value) => updateFormData({ notificationFrequency: value })}
                      >
                        <SelectTrigger id="frequency" className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instant">Instant</SelectItem>
                          <SelectItem value="daily">Daily digest</SelectItem>
                          <SelectItem value="weekly">Weekly summary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end pt-4">
                      <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                        Save Preferences
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === "billing" && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold mb-6">Billing & Subscription</h2>
                  <div className="space-y-6">
                    {/* Current Plan */}
                    <Card className="border-2 border-blue-600">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Pro Plan</CardTitle>
                            <CardDescription>For serious traders</CardDescription>
                          </div>
                          <Badge className="bg-blue-600 text-white">Current Plan</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold">$29</span>
                            <span className="text-gray-600">/month</span>
                          </div>
                          <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              Unlimited alerts
                            </li>
                            <li className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              Advanced analytics
                            </li>
                            <li className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              Priority support
                            </li>
                          </ul>
                          <p className="text-sm text-gray-600">Next billing date: January 15, 2025</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Payment Method */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
                                VISA
                              </div>
                              <div>
                                <p className="font-medium">•••• •••• •••• 4242</p>
                                <p className="text-sm text-gray-600">Expires 12/2026</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              Update
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Usage Statistics */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Usage This Month</h3>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between mb-2">
                                <span className="text-sm">API Calls</span>
                                <span className="text-sm font-medium">8,456 / 10,000</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "84.56%" }} />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between mb-2">
                                <span className="text-sm">Alerts Sent</span>
                                <span className="text-sm font-medium">234 / Unlimited</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: "23%" }} />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Billing History */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Billing History</h3>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            {[
                              { date: "Dec 15, 2024", amount: "$29.00", status: "Paid" },
                              { date: "Nov 15, 2024", amount: "$29.00", status: "Paid" },
                              { date: "Oct 15, 2024", amount: "$29.00", status: "Paid" },
                            ].map((invoice, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between py-2 border-b last:border-0"
                              >
                                <div>
                                  <p className="font-medium">{invoice.date}</p>
                                  <p className="text-sm text-gray-600">Pro Plan</p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="font-medium">{invoice.amount}</span>
                                  <Badge className="bg-green-500 text-white">{invoice.status}</Badge>
                                  <Button variant="ghost" size="sm">
                                    Download
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Button className="bg-blue-600 hover:bg-blue-700">Manage Subscription</Button>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === "appearance" && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold mb-6">Appearance Settings</h2>
                  <div className="space-y-8">
                    {/* Theme Selector */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Theme</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        {[
                          { id: "light", label: "Light", icon: "☀️" },
                          { id: "dark", label: "Dark", icon: "🌙" },
                          { id: "system", label: "System", icon: "💻" },
                        ].map((theme) => (
                          <Card
                            key={theme.id}
                            className={`cursor-pointer transition-all ${
                              formData.theme === theme.id
                                ? "border-2 border-blue-600 bg-blue-50"
                                : "border-2 border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => updateFormData({ theme: theme.id as "light" | "dark" | "system" })}
                          >
                            <CardContent className="pt-6 text-center">
                              <div className="text-4xl mb-2">{theme.icon}</div>
                              <p className="font-medium">{theme.label}</p>
                              <input
                                type="radio"
                                checked={formData.theme === theme.id}
                                onChange={() => updateFormData({ theme: theme.id as "light" | "dark" | "system" })}
                                className="mt-2"
                              />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Color Scheme */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Color Scheme</h3>
                      <div className="flex gap-4">
                        {[
                          { id: "blue", color: "bg-blue-600" },
                          { id: "purple", color: "bg-purple-600" },
                          { id: "green", color: "bg-green-600" },
                          { id: "orange", color: "bg-orange-600" },
                        ].map((scheme) => (
                          <button
                            key={scheme.id}
                            onClick={() => updateFormData({ colorScheme: scheme.id })}
                            className={`w-16 h-16 rounded-lg ${scheme.color} ${
                              formData.colorScheme === scheme.id ? "ring-4 ring-offset-2 ring-gray-400" : ""
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Chart Preferences */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Chart Preferences</h3>
                      <div className="space-y-6">
                        <div>
                          <Label>Grid Line Opacity</Label>
                          <div className="flex items-center gap-4 mt-2">
                            <Slider defaultValue={[50]} max={100} step={1} className="flex-1" />
                            <span className="text-sm font-medium w-12">50%</span>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Bullish Candle Color</Label>
                            <Input type="color" defaultValue="#10b981" className="mt-1 h-10" />
                          </div>
                          <div>
                            <Label>Bearish Candle Color</Label>
                            <Input type="color" defaultValue="#ef4444" className="mt-1 h-10" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                        Apply Changes
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Language Tab */}
              {activeTab === "language" && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold mb-6">Language & Region</h2>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select value={formData.language} onValueChange={(value) => updateFormData({ language: value })}>
                        <SelectTrigger id="language" className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en-US">🇺🇸 English (US)</SelectItem>
                          <SelectItem value="en-GB">🇬🇧 English (UK)</SelectItem>
                          <SelectItem value="es">🇪🇸 Español</SelectItem>
                          <SelectItem value="fr">🇫🇷 Français</SelectItem>
                          <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                          <SelectItem value="ja">🇯🇵 日本語</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={formData.timezone} onValueChange={(value) => updateFormData({ timezone: value })}>
                        <SelectTrigger id="timezone" className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                          <SelectItem value="Europe/London">London (GMT)</SelectItem>
                          <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                          <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-600 mt-1">Auto-detected based on your location</p>
                    </div>

                    <div>
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select
                        value={formData.dateFormat}
                        onValueChange={(value) => updateFormData({ dateFormat: value })}
                      >
                        <SelectTrigger id="dateFormat" className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="timeFormat">Time Format</Label>
                      <Select
                        value={formData.timeFormat}
                        onValueChange={(value) => updateFormData({ timeFormat: value })}
                      >
                        <SelectTrigger id="timeFormat" className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12-hour">12-hour (3:00 PM)</SelectItem>
                          <SelectItem value="24-hour">24-hour (15:00)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="currency">Currency Display</Label>
                      <Select value={formData.currency} onValueChange={(value) => updateFormData({ currency: value })}>
                        <SelectTrigger id="currency" className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="JPY">JPY (¥)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                        Save Settings
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Help & Support Tab */}
              {activeTab === "help" && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold mb-6">Help & Support</h2>
                  <div className="space-y-8">
                    {/* Quick Links */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                              <Book className="w-8 h-8 text-blue-600" />
                              <div>
                                <p className="font-medium">Documentation</p>
                                <p className="text-sm text-gray-600">Browse our guides</p>
                              </div>
                              <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                              <MessageCircle className="w-8 h-8 text-green-600" />
                              <div>
                                <p className="font-medium">Live Chat</p>
                                <p className="text-sm text-gray-600">Chat with support</p>
                              </div>
                              <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                              <Mail className="w-8 h-8 text-purple-600" />
                              <div>
                                <p className="font-medium">Email Support</p>
                                <p className="text-sm text-gray-600">Send us an email</p>
                              </div>
                              <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                              <Bug className="w-8 h-8 text-red-600" />
                              <div>
                                <p className="font-medium">Report a Bug</p>
                                <p className="text-sm text-gray-600">Help us improve</p>
                              </div>
                              <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* FAQ */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                          <AccordionTrigger>How do I upgrade to PRO?</AccordionTrigger>
                          <AccordionContent>
                            To upgrade to PRO, go to the Billing tab and click on "Manage Subscription". You'll be able
                            to select the PRO plan and complete the payment process. Your account will be upgraded
                            immediately after successful payment.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                          <AccordionTrigger>How do alerts work?</AccordionTrigger>
                          <AccordionContent>
                            Alerts notify you when specific market conditions are met. You can set up alerts based on
                            price movements, volume changes, or technical indicators. Notifications can be received via
                            email, push notifications, or SMS (PRO only).
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                          <AccordionTrigger>Can I change my email?</AccordionTrigger>
                          <AccordionContent>
                            Yes, you can change your email in the Profile tab. After changing your email, we'll send a
                            verification link to your new email address. Click the link to verify and complete the
                            change.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                          <AccordionTrigger>How do I cancel my subscription?</AccordionTrigger>
                          <AccordionContent>
                            To cancel your subscription, go to the Billing tab and click "Manage Subscription". You'll
                            find the option to cancel your subscription there. Your access will continue until the end
                            of your current billing period.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>

                    {/* Contact Form */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="subject">Subject</Label>
                              <Select>
                                <SelectTrigger id="subject" className="mt-1">
                                  <SelectValue placeholder="Select a subject" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="billing">Billing Question</SelectItem>
                                  <SelectItem value="technical">Technical Support</SelectItem>
                                  <SelectItem value="feature">Feature Request</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="message">Message</Label>
                              <Textarea
                                id="message"
                                className="mt-1"
                                rows={6}
                                placeholder="Describe your question or issue..."
                              />
                            </div>
                            <Button className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">Send Message</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Modal */}
      {showUnsavedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Unsaved Changes</CardTitle>
              <CardDescription>You have unsaved changes. Do you want to save them before leaving?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleSaveAndContinue} className="bg-blue-600 hover:bg-blue-700 flex-1">
                  Save & Continue
                </Button>
                <Button onClick={handleDiscardChanges} variant="destructive" className="flex-1">
                  Discard Changes
                </Button>
                <Button
                  onClick={() => {
                    setShowUnsavedModal(false)
                    setPendingTab(null)
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
