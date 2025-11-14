"use client"

import { useState } from "react"
import NotificationBell from "@/components/notification-bell"
import type { Notification } from "@/types/notification"
import { useToast } from "@/hooks/use-toast"

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "alert",
    title: "Alert Triggered: Gold H1 Support",
    message: "XAUUSD has reached $2,645.00 (B-B1 Support). Current price: $2,645.80",
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    read: false,
    metadata: {
      symbol: "XAUUSD",
      timeframe: "H1",
      category: "Alert",
    },
    action: {
      label: "View Chart",
      url: "/dashboard/charts?symbol=XAUUSD&timeframe=H1",
    },
  },
  {
    id: "2",
    type: "warning",
    title: "Price Approaching Target",
    message: "EURUSD is $0.0012 away from your alert at $1.0850 (P-P2 Resistance)",
    timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    read: false,
    metadata: {
      symbol: "EURUSD",
      timeframe: "M15",
      category: "Alert",
    },
    action: {
      label: "View Chart",
      url: "/dashboard/charts?symbol=EURUSD&timeframe=M15",
    },
  },
  {
    id: "3",
    type: "system",
    title: "New Feature Available",
    message: "Advanced chart tools are now available for PRO users. Check them out!",
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    read: false,
    metadata: {
      category: "System",
    },
    action: {
      label: "Learn More",
      url: "/features",
    },
  },
  {
    id: "4",
    type: "upgrade",
    title: "Upgrade to PRO",
    message: "You've used 4/5 FREE alerts. Upgrade to PRO for 20 alerts and more features.",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    read: true,
    metadata: {
      category: "Upgrade",
    },
    action: {
      label: "See Plans",
      url: "/pricing",
    },
  },
  {
    id: "5",
    type: "billing",
    title: "Trial Ending Soon",
    message: "Your 7-day PRO trial ends in 2 days. Update your payment method to continue.",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    metadata: {
      category: "Billing",
    },
    action: {
      label: "Manage Subscription",
      url: "/dashboard/settings/billing",
    },
  },
  {
    id: "6",
    type: "alert",
    title: "Stop Loss Hit: GBPUSD",
    message: "Your stop loss at $1.2750 has been triggered. Position closed with -2.5% loss.",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    read: true,
    metadata: {
      symbol: "GBPUSD",
      timeframe: "H4",
      category: "Alert",
    },
  },
  {
    id: "7",
    type: "system",
    title: "Scheduled Maintenance",
    message: "We will be performing scheduled maintenance on Sunday, 2:00 AM - 4:00 AM UTC.",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    read: true,
    metadata: {
      category: "System",
    },
  },
]

export default function Home() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const { toast } = useToast()

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    toast({
      title: "All notifications marked as read",
      description: "You have no unread notifications.",
    })
  }

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
    toast({
      title: "Notification deleted",
      description: "The notification has been removed.",
    })
  }

  const handleNotificationClick = (notification: Notification) => {
    console.log("[v0] Notification clicked:", notification)

    if (notification.action) {
      // In production, navigate to the action URL
      console.log("[v0] Navigating to:", notification.action.url)
      // window.location.href = notification.action.url;

      toast({
        title: "Navigation",
        description: `Would navigate to: ${notification.action.url}`,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Trading Alerts</h1>
            </div>

            {/* Right side - Notification Bell */}
            <div className="flex items-center gap-4">
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onDelete={handleDelete}
                onNotificationClick={handleNotificationClick}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Your Trading Dashboard</h2>
          <p className="text-gray-600 mb-6">
            Click the notification bell in the top right to see your alerts and notifications.
          </p>

          {/* Demo Actions */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Demo Actions:</h3>
            <div className="flex flex-wrap gap-4">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => {
                  const newNotification: Notification = {
                    id: Date.now().toString(),
                    type: "alert",
                    title: "New Alert Triggered!",
                    message: "BTCUSD has broken through resistance at $45,000",
                    timestamp: new Date(),
                    read: false,
                    metadata: {
                      symbol: "BTCUSD",
                      category: "Alert",
                    },
                  }
                  setNotifications((prev) => [newNotification, ...prev])
                  toast({
                    title: "🔔 New notification",
                    description: newNotification.title,
                  })
                }}
              >
                Simulate New Alert
              </button>

              <button
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                onClick={handleMarkAllAsRead}
              >
                Mark All as Read
              </button>
            </div>
          </div>

          {/* Features List */}
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Features Included:</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Real-time notification updates",
                "Multiple notification types (Alert, Warning, System, Upgrade, Billing)",
                "Unread badge with count",
                "Filter tabs (All, Alerts, System, Unread)",
                "Mark as read/unread functionality",
                "Delete notifications",
                "Context menu for actions",
                "Empty state design",
                "Responsive mobile layout",
                "Keyboard navigation support",
                "Smooth animations and transitions",
                "Relative time formatting",
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
