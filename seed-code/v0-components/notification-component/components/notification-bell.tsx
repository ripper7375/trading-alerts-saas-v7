"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Notification, NotificationTab } from "@/types/notification"
import { formatRelativeTime, getNotificationIcon } from "@/lib/notification-utils"
import { useToast } from "@/hooks/use-toast"

interface NotificationBellProps {
  notifications: Notification[]
  unreadCount: number
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDelete: (id: string) => void
  onNotificationClick: (notification: Notification) => void
}

export default function NotificationBell({
  notifications: initialNotifications,
  unreadCount: initialUnreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onNotificationClick,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<NotificationTab>("All")
  const [notifications, setNotifications] = useState(initialNotifications)
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [contextMenuId, setContextMenuId] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setContextMenuId(null)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Real-time polling for new notifications
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      // In production, this would fetch from: GET /api/notifications
      // For now, we'll simulate checking for new notifications
      // Uncomment below for real API integration
      /*
      try {
        const response = await fetch('/api/notifications');
        const data = await response.json();
        
        if (data.notifications.length > notifications.length) {
          const newNotification = data.notifications[0];
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
          
          // Show toast for new notification
          toast({
            title: '🔔 New notification',
            description: newNotification.title,
          });
        }
      } catch (error) {
        console.error('[v0] Failed to fetch notifications:', error);
      }
      */
    }, 30000) // Poll every 30 seconds

    return () => clearInterval(pollInterval)
  }, [notifications, toast])

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === "All") return true
    if (activeTab === "Alerts") return notif.type === "alert" || notif.type === "warning"
    if (activeTab === "System") return notif.type === "system"
    if (activeTab === "Unread") return !notif.read
    return true
  })

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
    onNotificationClick(notification)
    setIsOpen(false)
  }

  const handleMarkAllAsRead = () => {
    onMarkAllAsRead()
    setUnreadCount(0)
  }

  const handleToggleRead = (id: string, currentReadStatus: boolean) => {
    if (currentReadStatus) {
      // Mark as unread
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: false } : n)))
      setUnreadCount((prev) => prev + 1)
    } else {
      onMarkAsRead(id)
    }
    setContextMenuId(null)
  }

  const handleDeleteNotification = (id: string) => {
    onDelete(id)
    setNotifications(notifications.filter((n) => n.id !== id))
    setContextMenuId(null)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "relative rounded-full p-2 transition-colors hover:bg-gray-100",
          isOpen && "bg-blue-50 border-2 border-blue-500",
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications, ${unreadCount} unread`}
      >
        <Bell className="h-6 w-6 text-gray-700" />

        {/* Notification Badge */}
        {unreadCount > 0 && (
          <Badge
            className={cn(
              "absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center p-0 border-2 border-white",
              unreadCount > 0 && "animate-pulse",
            )}
            aria-label={`${unreadCount} unread notifications`}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className={cn(
            "absolute top-full right-0 mt-2 w-96 max-w-md bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-50 overflow-hidden",
            "animate-in slide-in-from-top-2 fade-in duration-200",
            "md:w-96 max-[768px]:w-screen max-[768px]:right-0 max-[768px]:left-0 max-[768px]:mx-auto",
          )}
          role="menu"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-1">Notifications</h2>
                <p className="text-sm opacity-90">{unreadCount} unread</p>
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg h-auto"
                  onClick={handleMarkAllAsRead}
                >
                  ✓ Mark all read
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white border-b-2 border-gray-200 px-4">
            <div className="flex gap-4">
              {(["All", "Alerts", "System", "Unread"] as NotificationTab[]).map((tab) => (
                <button
                  key={tab}
                  className={cn(
                    "py-3 border-b-2 transition-colors text-sm cursor-pointer",
                    activeTab === tab
                      ? "text-blue-600 border-blue-600 font-semibold"
                      : "text-gray-600 border-transparent hover:text-blue-600",
                  )}
                  onClick={() => setActiveTab(tab)}
                  role="tab"
                  aria-selected={activeTab === tab}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <ScrollArea className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="text-6xl opacity-30 mb-4">🔔</div>
                <p className="text-lg text-gray-500 text-center mb-2">No notifications yet</p>
                <p className="text-sm text-gray-400 text-center">We'll notify you about alerts and important updates</p>
              </div>
            ) : (
              <div>
                {filteredNotifications.map((notification) => {
                  const iconConfig = getNotificationIcon(notification.type)

                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex items-start gap-4 p-4 border-b border-gray-100 cursor-pointer transition-colors relative group",
                        !notification.read && "bg-blue-50/50 border-l-4 border-l-blue-500",
                        notification.read && "bg-white hover:bg-blue-50",
                      )}
                      onClick={() => handleNotificationClick(notification)}
                      role="menuitem"
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                          iconConfig.bgColor,
                          iconConfig.textColor,
                        )}
                      >
                        <span className="text-lg">{iconConfig.emoji}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          {!notification.read && <span className="text-blue-500 font-bold">•</span>}
                          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{notification.title}</h3>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-2">{notification.message}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{formatRelativeTime(notification.timestamp)}</span>
                          {notification.metadata?.category && (
                            <span className="bg-gray-100 px-2 py-0.5 rounded">{notification.metadata.category}</span>
                          )}
                        </div>
                      </div>

                      {/* Action Menu */}
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            setContextMenuId(contextMenuId === notification.id ? null : notification.id)
                          }}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>

                        {/* Context Menu */}
                        {contextMenuId === notification.id && (
                          <div
                            className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border-2 border-gray-200 p-2 z-10 min-w-[180px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                              onClick={() => handleToggleRead(notification.id, notification.read)}
                            >
                              {notification.read ? "Mark as unread" : "Mark as read"}
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer text-red-600"
                              onClick={() => handleDeleteNotification(notification.id)}
                            >
                              Delete notification
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Unread Indicator (Alternative to menu) */}
                      {!notification.read && !contextMenuId && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t-2 border-gray-200 bg-gray-50 p-4">
              <a href="/notifications" className="block text-center font-semibold text-blue-600 hover:underline">
                View All Notifications
              </a>
              <a
                href="/settings/notifications"
                className="block text-center text-sm text-gray-600 hover:text-blue-600 mt-2"
              >
                Notification Settings
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
