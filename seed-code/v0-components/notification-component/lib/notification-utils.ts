// Utility functions for notification handling

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}m ago`
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}h ago`
  }
  if (diffInSeconds < 172800) return "Yesterday"

  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
  return date.toLocaleDateString("en-US", options)
}

export function getNotificationIcon(type: string) {
  const iconMap: Record<string, { emoji: string; bgColor: string; textColor: string }> = {
    alert: { emoji: "✓", bgColor: "bg-green-100", textColor: "text-green-600" },
    warning: { emoji: "⚠️", bgColor: "bg-orange-100", textColor: "text-orange-600" },
    system: { emoji: "ℹ️", bgColor: "bg-blue-100", textColor: "text-blue-600" },
    upgrade: { emoji: "⭐", bgColor: "bg-purple-100", textColor: "text-purple-600" },
    billing: { emoji: "⏰", bgColor: "bg-yellow-100", textColor: "text-yellow-600" },
  }
  return iconMap[type] || iconMap.system
}
